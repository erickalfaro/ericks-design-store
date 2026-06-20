#!/usr/bin/env node
// Generate the human-browsable gallery (gallery/index.html + gallery/<prefix>.html)
// and per-set reference docs (docs/<prefix>.md) from the vendored data/ + meta.json.
//
//   npm run gallery
//
// Each per-set page inlines every icon as an SVG tile with a live name filter and
// click-to-copy. content-visibility keeps scrolling smooth even for 16k-icon sets.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from '@iconify/utils';
import { SETS } from './sets.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'data');
const GALLERY_DIR = join(ROOT, 'gallery');
const DOCS_DIR = join(ROOT, 'docs');

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const PAGE_CSS = `
:root{color-scheme:light dark;--bg:#0d1117;--card:#161b22;--fg:#e6edf3;--muted:#8b949e;--accent:#58a6ff;--border:#30363d}
@media (prefers-color-scheme:light){:root{--bg:#fff;--card:#f6f8fa;--fg:#1f2328;--muted:#656d76;--accent:#0969da;--border:#d0d7de}}
*{box-sizing:border-box}
body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--fg)}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
header{padding:24px 28px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:5}
h1{margin:0 0 4px;font-size:20px}.sub{color:var(--muted);font-size:13px}
.wrap{padding:20px 28px;max-width:1400px;margin:0 auto}
input[type=search]{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--fg);font-size:15px;margin-bottom:18px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.card{display:block;padding:16px;border:1px solid var(--border);border-radius:10px;background:var(--card)}
.card:hover{border-color:var(--accent)}.card h3{margin:0 0 6px;font-size:16px}.card .meta{color:var(--muted);font-size:13px}
.badge{display:inline-block;font-size:11px;padding:2px 7px;border:1px solid var(--border);border-radius:20px;color:var(--muted);margin-top:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
.tile{content-visibility:auto;contain-intrinsic-size:96px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px 6px;border:1px solid var(--border);border-radius:8px;background:var(--card);cursor:pointer;text-align:center}
.tile:hover{border-color:var(--accent)}
.tile svg{width:28px;height:28px;color:var(--fg)}
.tile .nm{font-size:10px;color:var(--muted);word-break:break-word;line-height:1.2}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:10px 18px;border-radius:8px;opacity:0;transition:opacity .2s;pointer-events:none}
.toast.show{opacity:1}
.count{color:var(--muted);font-size:13px;margin:0 0 12px}
`;

async function loadSet(prefix) {
  return JSON.parse(await readFile(join(DATA_DIR, `${prefix}.json`), 'utf8'));
}

function svgFor(set, name) {
  const data = getIconData(set, name);
  if (!data) return null;
  const built = iconToSVG(data, { width: 28, height: 28 });
  return iconToHTML(replaceIDs(built.body), built.attributes);
}

async function buildSetPage(meta, entry) {
  const set = await loadSet(entry.prefix);
  const names = Object.keys(set.icons ?? {}).sort();
  const tiles = names
    .map((name) => {
      const svg = svgFor(set, name);
      if (!svg) return '';
      return `<button class="tile" data-n="${esc(name)}" data-ref="${esc(entry.prefix + ':' + name)}" title="${esc(entry.prefix + ':' + name)}">${svg}<span class="nm">${esc(name)}</span></button>`;
    })
    .join('');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(entry.name)} — Design Store</title><style>${PAGE_CSS}</style></head>
<body><header><h1>${esc(entry.name)} <span class="sub">${entry.iconCount.toLocaleString('en-US')} icons · ${esc(entry.license)} · <a href="${esc(entry.home)}" target="_blank" rel="noopener">${esc(entry.home)}</a> · <a href="index.html">← all sets</a></span></h1>
<div class="sub">${esc(entry.style)}</div></header>
<div class="wrap"><input type="search" id="q" placeholder="Filter ${esc(entry.name)} icons by name…" autofocus>
<p class="count" id="count"></p><div class="grid" id="grid">${tiles}</div></div>
<div class="toast" id="toast"></div>
<script>
const grid=document.getElementById('grid'),q=document.getElementById('q'),count=document.getElementById('count'),toast=document.getElementById('toast');
const tiles=[...grid.children];
function refresh(){const v=q.value.trim().toLowerCase();let n=0;for(const t of tiles){const show=!v||t.dataset.n.includes(v);t.style.display=show?'':'none';if(show)n++;}count.textContent=n.toLocaleString()+' shown';}
q.addEventListener('input',refresh);refresh();
let t;grid.addEventListener('click',async e=>{const tile=e.target.closest('.tile');if(!tile)return;const svg=tile.querySelector('svg').outerHTML;try{await navigator.clipboard.writeText(svg);toast.textContent='Copied SVG: '+tile.dataset.ref;}catch{toast.textContent='Copy failed (clipboard blocked)';}toast.classList.add('show');clearTimeout(t);t=setTimeout(()=>toast.classList.remove('show'),1400);});
</script></body></html>`;
  await writeFile(join(GALLERY_DIR, `${entry.prefix}.html`), html);
  return names.length;
}

function buildIndex(meta) {
  const cards = meta.sets
    .map(
      (e) => `<a class="card" href="${esc(e.prefix)}.html"><h3>${esc(e.name)}</h3>
<div class="meta">${e.iconCount.toLocaleString('en-US')} icons · <code>${esc(e.prefix)}:</code></div>
<div class="meta" style="margin-top:6px">${esc(e.style)}</div><span class="badge">${esc(e.license)}</span></a>`,
    )
    .join('');
  const animatedCard = `<a class="card" href="../docs/lucide-animated.md"><h3>Lucide Animated</h3>
<div class="meta">350+ animated React icons</div>
<div class="meta" style="margin-top:6px">Motion-based animated components (not static SVG) — see the doc.</div><span class="badge">MIT</span></a>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Erick's Design Store — Icon Gallery</title><style>${PAGE_CSS}</style></head>
<body><header><h1>Erick's Design Store</h1>
<div class="sub">${meta.totalSets} static sets · ${meta.totalIcons.toLocaleString('en-US')} icons offline · click a set to browse. Grab any icon: <code>node scripts/icon.mjs &lt;prefix&gt;:&lt;name&gt;</code></div></header>
<div class="wrap"><div class="cards">${cards}${animatedCard}</div></div></body></html>`;
}

function buildDoc(entry) {
  return `# ${entry.name}

> ${entry.style}

| | |
|---|---|
| **Iconify prefix** | \`${entry.prefix}\` |
| **Icons (offline)** | ${entry.iconCount.toLocaleString('en-US')}${entry.aliasCount ? ` (+${entry.aliasCount.toLocaleString('en-US')} aliases)` : ''} |
| **License** | ${entry.license} |
| **Home** | ${entry.home} |
| **npm** | \`${entry.npm}\` |

**When to use:** ${entry.whenToUse}

## Grab an icon from this repo (no install needed)

\`\`\`bash
node scripts/icon.mjs ${entry.prefix}:<name>                 # raw SVG
node scripts/icon.mjs ${entry.prefix}:<name> --format jsx    # React component
node scripts/icon.mjs ${entry.prefix}:<name> --format vue    # Vue SFC
node scripts/icon.mjs ${entry.prefix}:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set ${entry.prefix}  # find a name
\`\`\`

Browse visually: [gallery/${entry.prefix}.html](../gallery/${entry.prefix}.html)

## Use the upstream package directly

Install \`${entry.npm.split(' / ')[0]}\` (see options above) or reference via Iconify with the name \`${entry.prefix}:<name>\`:

\`\`\`jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="${entry.prefix}:<name>" />
\`\`\`

---
_Data vendored from \`@iconify-json/${entry.prefix}\` via \`npm run fetch\`. License: ${entry.license} — attribution belongs to the original authors (${entry.home})._
`;
}

async function main() {
  await mkdir(GALLERY_DIR, { recursive: true });
  await mkdir(DOCS_DIR, { recursive: true });
  const meta = JSON.parse(await readFile(join(DATA_DIR, 'meta.json'), 'utf8'));

  await writeFile(join(GALLERY_DIR, 'index.html'), buildIndex(meta));
  console.log('  wrote gallery/index.html');

  for (const entry of meta.sets) {
    const n = await buildSetPage(meta, entry);
    await writeFile(join(DOCS_DIR, `${entry.prefix}.md`), buildDoc(entry));
    console.log(`  wrote gallery/${entry.prefix}.html + docs/${entry.prefix}.md (${n.toLocaleString('en-US')} tiles)`);
  }
  console.log('\nGallery + docs built. Open gallery/index.html in a browser.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
