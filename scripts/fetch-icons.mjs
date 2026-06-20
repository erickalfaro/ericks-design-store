#!/usr/bin/env node
// Download the official Iconify JSON for each curated set into data/<prefix>.json,
// then write a merged data/meta.json registry (set metadata + version + icon count).
//
// Source: jsDelivr-served @iconify-json/<prefix> packages — the same data the icon
// authors publish. Re-run anytime to update; the committed JSON keeps the repo offline.
//
//   node scripts/fetch-icons.mjs            # fetch all sets
//   node scripts/fetch-icons.mjs lucide ph  # fetch only the named prefixes

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SETS } from './sets.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'data');

const CDN = (prefix) =>
  `https://cdn.jsdelivr.net/npm/@iconify-json/${prefix}@latest/icons.json`;

// Count icons, excluding aliases (which live under `aliases`, not `icons`).
const countIcons = (json) => Object.keys(json.icons ?? {}).length;

async function fetchSet(set) {
  const url = CDN(set.prefix);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const json = await res.json();
  const count = countIcons(json);
  await writeFile(join(DATA_DIR, `${set.prefix}.json`), JSON.stringify(json));
  return {
    prefix: set.prefix,
    name: set.name,
    license: set.license,
    home: set.home,
    docs: set.docs,
    npm: set.npm,
    defaults: set.defaults,
    style: set.style,
    whenToUse: set.whenToUse,
    iconCount: count,
    aliasCount: Object.keys(json.aliases ?? {}).length,
    version: json.info?.version ?? null,
    file: `data/${set.prefix}.json`,
  };
}

async function main() {
  const wanted = process.argv.slice(2);
  const sets = wanted.length
    ? SETS.filter((s) => wanted.includes(s.prefix))
    : SETS;
  if (!sets.length) {
    console.error(`No matching sets for: ${wanted.join(', ')}`);
    process.exit(1);
  }

  await mkdir(DATA_DIR, { recursive: true });

  const meta = [];
  for (const set of sets) {
    process.stdout.write(`  fetching ${set.prefix} … `);
    try {
      const entry = await fetchSet(set);
      meta.push(entry);
      console.log(`${entry.iconCount} icons (v${entry.version ?? '?'})`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  // Merge into meta.json: preserve entries for sets we did not fetch this run.
  let existing = [];
  try {
    const prev = await import('node:fs/promises').then((fs) =>
      fs.readFile(join(DATA_DIR, 'meta.json'), 'utf8'),
    );
    existing = JSON.parse(prev).sets ?? [];
  } catch {
    /* no prior meta.json */
  }
  const byPrefix = new Map(existing.map((e) => [e.prefix, e]));
  for (const entry of meta) byPrefix.set(entry.prefix, entry);
  // Keep SETS order.
  const ordered = SETS.map((s) => byPrefix.get(s.prefix)).filter(Boolean);

  const totalIcons = ordered.reduce((n, e) => n + (e.iconCount ?? 0), 0);
  await writeFile(
    join(DATA_DIR, 'meta.json'),
    JSON.stringify(
      {
        generatedBy: 'scripts/fetch-icons.mjs',
        totalSets: ordered.length,
        totalIcons,
        sets: ordered,
      },
      null,
      2,
    ) + '\n',
  );

  console.log(
    `\nWrote data/meta.json — ${ordered.length} sets, ${totalIcons.toLocaleString('en-US')} icons total.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
