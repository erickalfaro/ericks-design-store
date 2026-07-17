#!/usr/bin/env node

/**
 * Extract Doom status-face patches from an IWAD as palette-preserving PNGs.
 *
 * Usage:
 *   node scripts/extract-doom-faces.mjs /path/to/DOOM.WAD
 *   node scripts/extract-doom-faces.mjs /path/to/DOOM2.WAD data/doom-faces/assets
 *
 * No third-party packages are required. The decoder follows Doom's original
 * picture/patch column format and takes RGB values from the WAD's PLAYPAL.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import zlib from 'node:zlib';

const sourcePath = process.argv[2];
const outputDir = path.resolve(process.argv[3] || 'data/doom-faces/assets');

if (!sourcePath) {
  console.error('Usage: node scripts/extract-doom-faces.mjs /path/to/DOOM.WAD [output-dir]');
  process.exit(1);
}

const wad = fs.readFileSync(path.resolve(sourcePath));
const kind = wad.toString('ascii', 0, 4);
if (kind !== 'IWAD' && kind !== 'PWAD') throw new Error(`Not a WAD file: ${kind}`);

const lumpCount = wad.readInt32LE(4);
const directoryOffset = wad.readInt32LE(8);
const lumps = [];

for (let index = 0; index < lumpCount; index += 1) {
  const entry = directoryOffset + index * 16;
  const offset = wad.readInt32LE(entry);
  const size = wad.readInt32LE(entry + 4);
  const name = wad.toString('ascii', entry + 8, entry + 16).replace(/\0+$/, '');
  lumps.push({ name, offset, size });
}

const paletteLump = lumps.find((lump) => lump.name === 'PLAYPAL');
if (!paletteLump || paletteLump.size < 768) throw new Error('PLAYPAL was not found in this WAD');
const palette = wad.subarray(paletteLump.offset, paletteLump.offset + 768);
const faces = lumps.filter((lump) => lump.name.startsWith('STF'));
if (!faces.length) throw new Error('No STF* status-face lumps were found in this WAD');

fs.mkdirSync(outputDir, { recursive: true });

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y += 1) {
    const target = y * (1 + width * 4);
    scanlines[target] = 0;
    rgba.copy(scanlines, target + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function decodePatch(lump) {
  const start = lump.offset;
  const end = start + lump.size;
  const width = wad.readUInt16LE(start);
  const height = wad.readUInt16LE(start + 2);
  const leftOffset = wad.readInt16LE(start + 4);
  const topOffset = wad.readInt16LE(start + 6);
  const rgba = Buffer.alloc(width * height * 4);
  const usedIndices = new Set();

  for (let x = 0; x < width; x += 1) {
    let cursor = start + wad.readUInt32LE(start + 8 + x * 4);
    while (cursor < end) {
      const top = wad[cursor];
      if (top === 0xff) break;
      const length = wad[cursor + 1];
      cursor += 3;
      for (let row = 0; row < length; row += 1) {
        const y = top + row;
        const paletteIndex = wad[cursor + row];
        if (y >= height) continue;
        const pixel = (y * width + x) * 4;
        rgba[pixel] = palette[paletteIndex * 3];
        rgba[pixel + 1] = palette[paletteIndex * 3 + 1];
        rgba[pixel + 2] = palette[paletteIndex * 3 + 2];
        rgba[pixel + 3] = 255;
        usedIndices.add(paletteIndex);
      }
      cursor += length + 1;
    }
  }

  return { width, height, leftOffset, topOffset, rgba, usedIndices };
}

const metadata = [];
const allUsedIndices = new Set();
for (const lump of faces) {
  const decoded = decodePatch(lump);
  const file = `${lump.name}.png`;
  fs.writeFileSync(path.join(outputDir, file), encodePng(decoded.width, decoded.height, decoded.rgba));
  for (const index of decoded.usedIndices) allUsedIndices.add(index);
  metadata.push({
    name: lump.name,
    file,
    width: decoded.width,
    height: decoded.height,
    leftOffset: decoded.leftOffset,
    topOffset: decoded.topOffset,
  });
}

const transparentIndex = Array.from({ length: 256 }, (_, index) => index)
  .find((index) => !allUsedIndices.has(index));
if (transparentIndex === undefined) throw new Error('All 256 palette entries are used; no GIF transparency index is available');

const manifest = {
  format: 'doom-status-faces-v1',
  source: path.basename(sourcePath),
  count: metadata.length,
  transparentIndex,
  palette: Array.from(palette),
  sprites: metadata,
};
fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(
  path.join(outputDir, 'manifest.js'),
  `/* Generated by scripts/extract-doom-faces.mjs */\nwindow.DOOM_FACE_ASSETS = ${JSON.stringify(manifest)};\n`,
);

console.log(`Extracted ${faces.length} STF* sprites to ${outputDir}`);
console.log(`GIF transparency uses unused Doom palette index ${transparentIndex}`);
