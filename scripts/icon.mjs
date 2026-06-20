#!/usr/bin/env node
// Render any icon from the vendored sets, or search for one.
//
//   node scripts/icon.mjs lucide:home
//   node scripts/icon.mjs lucide:home --format jsx --size 20
//   node scripts/icon.mjs ph:heart-fill --format svelte
//   node scripts/icon.mjs --search arrow            # all sets
//   node scripts/icon.mjs --search arrow --set tabler
//
// Formats: svg (default) | jsx | vue | svelte | iconify
//
// SVG assembly uses @iconify/utils (getIconData + iconToSVG + iconToHTML) so output
// matches the icon authors' intent; aliases resolve automatically.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from '@iconify/utils';
import { transform as svgrTransform } from '@svgr/core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'data');

const setCache = new Map();
async function loadSet(prefix) {
  if (setCache.has(prefix)) return setCache.get(prefix);
  const file = join(DATA_DIR, `${prefix}.json`);
  if (!existsSync(file)) {
    throw new Error(
      `Unknown set "${prefix}". Run \`npm run fetch\` first, or check available prefixes in data/meta.json.`,
    );
  }
  const json = JSON.parse(await readFile(file, 'utf8'));
  setCache.set(prefix, json);
  return json;
}

function parseArgs(argv) {
  const opts = { format: 'svg', positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format' || a === '-f') opts.format = argv[++i];
    else if (a === '--size' || a === '-s') opts.size = Number(argv[++i]);
    else if (a === '--color' || a === '-c') opts.color = argv[++i];
    else if (a === '--stroke') opts.stroke = argv[++i];
    else if (a === '--search') opts.search = argv[++i];
    else if (a === '--set') opts.set = argv[++i];
    else if (a === '--name') opts.componentName = argv[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else opts.positional.push(a);
  }
  return opts;
}

function buildSvg(iconData, opts) {
  const customisations = {};
  if (opts.size) {
    customisations.width = opts.size;
    customisations.height = opts.size;
  }
  const built = iconToSVG(iconData, customisations);
  let body = replaceIDs(built.body); // dedupe gradient/clip IDs so multiple inlines don't collide
  const attributes = { ...built.attributes };

  if (opts.stroke) {
    body = body.replace(/stroke-width="[^"]*"/g, `stroke-width="${opts.stroke}"`);
  }
  if (opts.color) {
    attributes.style = `color:${opts.color}`;
  }
  return iconToHTML(body, attributes);
}

function toComponentName(prefix, name) {
  const camel = `${prefix}-${name}`
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
  return /^[A-Za-z]/.test(camel) ? camel : `Icon${camel}`;
}

async function toJsx(svg, componentName) {
  return svgrTransform(
    svg,
    { plugins: ['@svgr/plugin-jsx'], typescript: false, icon: true },
    { componentName },
  );
}

function toVue(svg, componentName) {
  // SVG markup is valid in a Vue template; expose props via v-bind="$attrs".
  const inner = svg.replace(/^<svg([^>]*)>/, '<svg$1 v-bind="$attrs">');
  return `<template>\n  ${inner}\n</template>\n\n<script>\nexport default { name: '${componentName}', inheritAttrs: false };\n</script>\n`;
}

function toSvelte(svg) {
  // SVG markup is valid Svelte; spread $$restProps onto the root so callers can pass class/style.
  // Use a function replacer so the literal "$$restProps" survives (a string arg would collapse $$ → $).
  return svg.replace(/^<svg([^>]*)>/, (_m, attrs) => `<svg${attrs} {...$$restProps}>`) + '\n';
}

async function renderOne(prefix, name, opts) {
  const set = await loadSet(prefix);
  const iconData = getIconData(set, name);
  if (!iconData) {
    throw new Error(
      `Icon "${prefix}:${name}" not found. Try: node scripts/icon.mjs --search ${name} --set ${prefix}`,
    );
  }
  const svg = buildSvg(iconData, opts);
  const componentName = opts.componentName || toComponentName(prefix, name);

  switch (opts.format) {
    case 'svg':
      return svg;
    case 'jsx':
    case 'react':
      return await toJsx(svg, componentName);
    case 'vue':
      return toVue(svg, componentName);
    case 'svelte':
      return toSvelte(svg);
    case 'iconify':
      return [
        `Iconify name: ${prefix}:${name}`,
        ``,
        `React:   <Icon icon="${prefix}:${name}" />            // npm i @iconify/react`,
        `Vue:     <Icon icon="${prefix}:${name}" />            // npm i @iconify/vue`,
        `Web:     <iconify-icon icon="${prefix}:${name}"></iconify-icon>  // npm i iconify-icon`,
      ].join('\n');
    default:
      throw new Error(`Unknown format "${opts.format}". Use: svg | jsx | vue | svelte | iconify`);
  }
}

async function search(query, onlyPrefix) {
  const { SETS } = await import('./sets.mjs');
  const prefixes = onlyPrefix ? [onlyPrefix] : SETS.map((s) => s.prefix);
  const q = query.toLowerCase();
  let total = 0;
  for (const prefix of prefixes) {
    let set;
    try {
      set = await loadSet(prefix);
    } catch {
      continue;
    }
    const names = [
      ...Object.keys(set.icons ?? {}),
      ...Object.keys(set.aliases ?? {}),
    ];
    const hits = names.filter((n) => n.toLowerCase().includes(q)).sort();
    if (!hits.length) continue;
    total += hits.length;
    console.log(`\n${prefix} (${hits.length}):`);
    const shown = hits.slice(0, 60);
    console.log('  ' + shown.map((n) => `${prefix}:${n}`).join('  '));
    if (hits.length > shown.length) console.log(`  … +${hits.length - shown.length} more`);
  }
  console.log(`\n${total} match${total === 1 ? '' : 'es'} for "${query}".`);
}

const HELP = `Render or search icons from the vendored sets.

Render:  node scripts/icon.mjs <prefix>:<name> [--format svg|jsx|vue|svelte|iconify]
                                              [--size N] [--color C] [--stroke W] [--name CompName]
Search:  node scripts/icon.mjs --search <query> [--set <prefix>]

Examples:
  node scripts/icon.mjs lucide:home
  node scripts/icon.mjs ph:heart-fill --format jsx --size 20
  node scripts/icon.mjs --search arrow --set tabler

Prefixes: lucide ph tabler heroicons radix-icons feather material-symbols ri bi iconoir bx
(Lucide Animated is React/Motion — see docs/lucide-animated.md, not this CLI.)`;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.search && !opts.positional.length)) {
    console.log(HELP);
    return;
  }
  if (opts.search) {
    await search(opts.search, opts.set);
    return;
  }
  const ref = opts.positional[0];
  const idx = ref.indexOf(':');
  if (idx === -1) {
    throw new Error(`Reference must be "<prefix>:<name>", e.g. lucide:home (got "${ref}").`);
  }
  const prefix = ref.slice(0, idx);
  const name = ref.slice(idx + 1);
  const out = await renderOne(prefix, name, opts);
  process.stdout.write(out.endsWith('\n') ? out : out + '\n');
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
