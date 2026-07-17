#!/usr/bin/env node
// Generate an avatar from any vendored generator, or list/search the styles.
//
//   node scripts/avatar.mjs lorelei:erick                     # SVG (default)
//   node scripts/avatar.mjs bottts:team@acme.com --size 128   # seed can contain ':' etc.
//   node scripts/avatar.mjs pixel-art --seed Ada --format datauri
//   node scripts/avatar.mjs blockies:0xabc --out avatar.png   # PNG styles decode to a file
//   node scripts/avatar.mjs --list                            # all styles, grouped by family
//   node scripts/avatar.mjs --list --family illustrated
//   node scripts/avatar.mjs --search doodle
//
// Formats: svg | datauri | png | html  (default = the style's native output).
// Avatars are DETERMINISTIC: the same <style>:<seed> always yields the same image.
//
// Generation reuses each upstream library (DiceBear, jdenticon, boring-avatars, …) via
// scripts/avatars-core.mjs — the same core the browser gallery is bundled from.

import { writeFile } from 'node:fs/promises';
import { STYLES, STYLE_BY_ID, FAMILIES, REFERENCE, generate } from './avatars-core.mjs';

function parseArgs(argv) {
  const opts = { positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format' || a === '-f') opts.format = argv[++i];
    else if (a === '--size' || a === '-s') opts.size = Number(argv[++i]);
    else if (a === '--seed') opts.seed = argv[++i];
    else if (a === '--out' || a === '-o') opts.out = argv[++i];
    else if (a === '--list' || a === '-l') opts.list = true;
    else if (a === '--search') opts.search = argv[++i];
    else if (a === '--family') opts.family = argv[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else opts.positional.push(a);
  }
  return opts;
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const lic = (s) => s.license.name + (s.license.attribution ? ' (attribution)' : '') + (s.license.restricted ? ' ⚠ restricted' : '');

function listStyles(family) {
  const fams = family ? [family] : Object.keys(FAMILIES);
  for (const fam of fams) {
    const styles = STYLES.filter((s) => s.family === fam);
    if (!styles.length) continue;
    console.log(`\n${FAMILIES[fam].label}  —  ${FAMILIES[fam].blurb}`);
    for (const s of styles) {
      const flags = [s.output !== 'svg' ? s.output : null].filter(Boolean).join(' ');
      console.log(`  ${s.id.padEnd(20)} ${lic(s).padEnd(34)} ${flags.padEnd(5)} ${s.blurb}`);
    }
  }
  console.log(`\n${STYLES.length} offline styles · every one is STATIC (none animate natively — see docs/avatars/animation.md).`);
  console.log(`Reference-only (not offline-CLI): ${REFERENCE.map((r) => r.id).join(', ')}.`);
  console.log(`Generate one:  node scripts/avatar.mjs <style>:<seed>`);
}

function search(query) {
  const q = query.toLowerCase();
  const hits = STYLES.filter((s) =>
    [s.id, s.name, s.family, s.provider, s.blurb].join(' ').toLowerCase().includes(q),
  );
  const refHits = REFERENCE.filter((r) => [r.id, r.name, r.category, r.note].join(' ').toLowerCase().includes(q));
  if (!hits.length && !refHits.length) {
    console.log(`No avatar styles match "${query}". Try: node scripts/avatar.mjs --list`);
    return;
  }
  for (const s of hits) console.log(`${s.id.padEnd(20)} ${FAMILIES[s.family].label.padEnd(24)} ${lic(s).padEnd(30)} ${s.blurb}`);
  for (const r of refHits) console.log(`${(r.id + ' *').padEnd(20)} ${('ref: ' + r.offline).padEnd(24)} ${String(r.license).padEnd(30)} ${r.note}`);
  console.log(`\n${hits.length} generatable · ${refHits.length} reference-only (*) match "${query}".`);
}

async function emit(id, seed, opts) {
  const size = opts.size;
  const r = await generate(id, seed, size);
  const fmt = opts.format || (r.output === 'png' ? 'datauri' : r.output);

  // Resolve the payload to print / write.
  let text, binary;
  if (fmt === 'datauri') text = r.dataUri;
  else if (fmt === 'svg') {
    if (r.output === 'png') throw new Error(`"${id}" is a PNG style — use --format datauri (or --out file.png).`);
    text = r.markup; // svg text, or (html style) its HTML markup
  } else if (fmt === 'html') {
    text = r.output === 'svg' ? r.markup : r.output === 'html' ? r.markup : `<img src="${r.dataUri}" width="${size || 120}" alt="${id}">`;
  } else if (fmt === 'png') {
    if (r.output !== 'png') throw new Error(`"${id}" is not a PNG style. Use --format svg or datauri.`);
    text = r.dataUri;
    binary = Buffer.from(r.dataUri.split(',')[1], 'base64');
  } else throw new Error(`Unknown format "${fmt}". Use: svg | datauri | png | html`);

  if (opts.out) {
    if (opts.out.endsWith('.png') && r.output === 'png') await writeFile(opts.out, Buffer.from(r.dataUri.split(',')[1], 'base64'));
    else if (binary) await writeFile(opts.out, binary);
    else await writeFile(opts.out, text);
    console.error(`Wrote ${opts.out}  (${id} · seed "${seed}"${size ? ` · ${size}px` : ''})`);
    return;
  }
  process.stdout.write(text.endsWith('\n') ? text : text + '\n');
}

const HELP = `Generate an avatar from any vendored generator, or list/search styles.

Generate:  node scripts/avatar.mjs <style>:<seed> [--format svg|datauri|png|html]
                                                  [--size N] [--out FILE]
           node scripts/avatar.mjs <style> --seed <seed> ...
List:      node scripts/avatar.mjs --list [--family <name>]
Search:    node scripts/avatar.mjs --search <query>

Examples:
  node scripts/avatar.mjs lorelei:erick
  node scripts/avatar.mjs bottts:acme --size 128 --out logo.svg
  node scripts/avatar.mjs blockies:0xF00 --out ident.png
  node scripts/avatar.mjs --search pixel

Families: ${Object.keys(FAMILIES).join(' · ')}
${STYLES.length} offline styles. Seeds are deterministic. None animate natively (docs/avatars/animation.md).`;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return void console.log(HELP);
  if (opts.list) return void listStyles(opts.family);
  if (opts.search) return void search(opts.search);
  if (!opts.positional.length) return void console.log(HELP);

  const ref = opts.positional[0];
  const idx = ref.indexOf(':');
  const id = idx === -1 ? ref : ref.slice(0, idx);
  const seed = idx === -1 ? (opts.seed ?? 'preview') : ref.slice(idx + 1);
  if (idx === -1 && opts.seed === undefined) console.error(`(no seed given — using "preview"; pass <style>:<seed> or --seed)`);

  if (!STYLE_BY_ID[id]) {
    const stem = id.slice(0, 5);
    const near = STYLES.map((s) => s.id).filter((x) => x.includes(id) || id.includes(x) || x.includes(stem)).slice(0, 6);
    throw new Error(`Unknown style "${id}".${near.length ? ` Did you mean: ${near.join(', ')}?` : ''} Try --list.`);
  }
  await emit(id, seed, opts);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
