#!/usr/bin/env node
// OPT-IN: pull the FULL Iconify catalog (@iconify/json — ~418 MB unpacked, 200k+ icons
// across 150+ open-source sets) into data/_full-iconify/ (gitignored, never committed).
//
//   npm run fetch:full
//
// Use this when you need a set beyond the 12 curated ones. After it lands, the same
// `node scripts/icon.mjs <prefix>:<name>` workflow can be pointed at any set in the
// bundle (the JSON files live in data/_full-iconify/node_modules/@iconify/json/json/).
// Discover what's available at https://icon-sets.iconify.design or in that json/ folder.

import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'data', '_full-iconify');

async function main() {
  await mkdir(DEST, { recursive: true });
  console.log('Downloading @iconify/json (~418 MB) into data/_full-iconify/ …');
  console.log('This is gitignored — it will not be committed.\n');

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(
    npm,
    ['install', '@iconify/json', '--prefix', DEST, '--no-save', '--no-audit', '--no-fund'],
    { stdio: 'inherit' },
  );

  child.on('exit', (code) => {
    if (code === 0) {
      console.log('\nDone. Icon set JSON files are in:');
      console.log('  data/_full-iconify/node_modules/@iconify/json/json/<prefix>.json');
      console.log('Browse sets: https://icon-sets.iconify.design');
    } else {
      console.error(`\nnpm install exited with code ${code}.`);
      process.exit(code ?? 1);
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
