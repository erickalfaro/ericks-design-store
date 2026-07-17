// Environment-agnostic avatar generation core — the single source of truth for the
// avatar domain (analogous to sets.mjs for icons). Works in BOTH Node (the CLI +
// gallery build) and the browser (bundled into gallery/avatars.html by esbuild), so
// the same seed produces the same avatar everywhere.
//
// Every generator is REUSED from an upstream library (never hand-rolled) — mirroring
// how the icon layer reuses @iconify/utils. A style declares metadata here and a
// `gen(seed, size)` that calls its library and returns a normalized result:
//
//   { output: 'svg'|'png'|'html', markup, dataUri }
//
//   - svg  : markup = <svg> text,  dataUri = data:image/svg+xml,…
//   - png  : markup = null,        dataUri = data:image/png;base64,…
//   - html : markup = HTML text,   dataUri = null   (renders inline; not an <img> source)
//
// Heavy libraries (React ones) are lazy-imported per call and cached, so `--list` /
// `--search` never pay for them.

/* ------------------------------------------------------------------ helpers */

// FNV-1a → uint32. Deterministic, dependency-free, identical in Node and browsers.
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Deterministic hex string of at least `len` chars (identicon.js needs hex ≥ 15).
export function hashHex(seed, len = 32) {
  let out = '';
  let h = fnv1a(seed);
  while (out.length < len) {
    out += h.toString(16).padStart(8, '0');
    h = fnv1a(out + seed);
  }
  return out.slice(0, len);
}

const svgToDataUri = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
const b64ToStr = (b64) =>
  typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');

// Force width/height on the root <svg> so every style honors --size uniformly.
function setSvgSize(svg, size) {
  if (!size) return svg;
  return svg.replace(/<svg([^>]*)>/, (_m, attrs) => {
    const a = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${a} width="${size}" height="${size}">`;
  });
}

// Make an SVG's internal ids globally unique. Generators (DiceBear, Boring, …) reuse fixed
// ids like `viewboxMask` across every avatar; inlined together in one document their
// `url(#id)` refs all resolve to the FIRST match, clipping later avatars. Suffix every id
// (definition + reference) with a hash of the markup — deterministic, and unique per avatar.
// This is the generation-side analogue of @iconify/utils `replaceIDs` used by the icon layer.
function uniquifyIds(markup) {
  const ids = [...new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))];
  if (!ids.length) return markup;
  const suffix = '_' + fnv1a(markup).toString(36);
  for (const id of ids) {
    const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    markup = markup
      .replace(new RegExp('id="' + e + '"', 'g'), `id="${id}${suffix}"`)
      .replace(new RegExp('url\\(#' + e + '\\)', 'g'), `url(#${id}${suffix})`)
      .replace(new RegExp('(href|xlink:href)="#' + e + '"', 'g'), `$1="#${id}${suffix}"`);
  }
  return markup;
}

const svgResult = (svg, size) => {
  const sized = uniquifyIds(setSvgSize(svg, size));
  return { output: 'svg', markup: sized, dataUri: svgToDataUri(sized) };
};

/* ------------------------------------------------- cached library loaders */

const cache = {};
const once = (key, loader) => (cache[key] ??= loader());

// React SSR shared by boring-avatars / react-nice-avatar / big-heads.
async function react() {
  return once('react', async () => {
    const [{ default: React }, { renderToStaticMarkup }] = await Promise.all([
      import('react'),
      import('react-dom/server'),
    ]);
    return { React, renderToStaticMarkup };
  });
}

const loadDicebear = () =>
  once('dicebear', async () => {
    const [{ createAvatar }, collection] = await Promise.all([
      import('@dicebear/core'),
      import('@dicebear/collection'),
    ]);
    return { createAvatar, collection };
  });

/* --------------------------------------------------------- DiceBear styles */

// license map is authoritative — read from each style's `.meta.license` (verified).
const CC0 = { name: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/', attribution: false };
const CCBY = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/', attribution: true };
const FREE = { name: 'Free for personal & commercial use', url: 'https://www.dicebear.com/licenses/', attribution: false };
const MIT_BS = { name: 'MIT', url: 'https://github.com/twbs/icons/blob/main/LICENSE', attribution: false };

// [collectionKey, id, family, license, blurb]
const DICEBEAR = [
  ['pixelArt', 'pixel-art', 'pixel', CC0, 'Retro 8-bit pixel-sprite people — the classic low-res look.'],
  ['pixelArtNeutral', 'pixel-art-neutral', 'pixel', CC0, 'Pixel-art faces only, neutral crop (no shoulders).'],
  ['bottts', 'bottts', 'robot', FREE, 'Friendly generated robots (Bottts by Pablo Stanley).'],
  ['botttsNeutral', 'bottts-neutral', 'robot', FREE, 'Bottts robot heads, tight neutral crop.'],
  ['identicon', 'identicon', 'identicon', CC0, 'Symmetric hash-based geometric identicon.'],
  ['initials', 'initials', 'initials', CC0, 'Initials on a colored background (Gravatar-style fallback).'],
  ['glass', 'glass', 'abstract', CC0, 'Frosted-glass gradient blobs — abstract, no face.'],
  ['rings', 'rings', 'abstract', CC0, 'Concentric colored rings from the seed.'],
  ['shapes', 'shapes', 'abstract', CC0, 'Layered geometric shapes — clean abstract mark.'],
  ['icons', 'icons', 'abstract', MIT_BS, 'A Bootstrap icon on a colored tile.'],
  ['thumbs', 'thumbs', 'abstract', CC0, 'Rounded “thumb” characters with a simple face.'],
  ['lorelei', 'lorelei', 'illustrated', CC0, 'Soft, elegant line-drawn portraits.'],
  ['loreleiNeutral', 'lorelei-neutral', 'illustrated', CC0, 'Lorelei faces only, neutral crop.'],
  ['notionists', 'notionists', 'illustrated', CC0, 'Notion-style hand-drawn people.'],
  ['notionistsNeutral', 'notionists-neutral', 'illustrated', CC0, 'Notionists faces only, neutral crop.'],
  ['openPeeps', 'open-peeps', 'illustrated', CC0, 'Pablo Stanley’s Open Peeps hand-drawn characters.'],
  ['adventurer', 'adventurer', 'illustrated', CCBY, 'Hand-drawn adventurer characters.'],
  ['adventurerNeutral', 'adventurer-neutral', 'illustrated', CCBY, 'Adventurer faces only, neutral crop.'],
  ['avataaars', 'avataaars', 'illustrated', FREE, 'The original Avataaars cartoon look (Pablo Stanley).'],
  ['avataaarsNeutral', 'avataaars-neutral', 'illustrated', FREE, 'Avataaars faces only, neutral crop.'],
  ['bigEars', 'big-ears', 'illustrated', CCBY, 'Big-eared minimalist cartoon people.'],
  ['bigEarsNeutral', 'big-ears-neutral', 'illustrated', CCBY, 'Big Ears faces only, neutral crop.'],
  ['bigSmile', 'big-smile', 'illustrated', CCBY, 'Cheerful, bold big-smile characters.'],
  ['croodles', 'croodles', 'illustrated', CCBY, 'Loose doodle-style hand-drawn characters.'],
  ['croodlesNeutral', 'croodles-neutral', 'illustrated', CCBY, 'Croodles faces only, neutral crop.'],
  ['dylan', 'dylan', 'illustrated', CCBY, 'Bold, blocky modern cartoon heads.'],
  ['funEmoji', 'fun-emoji', 'illustrated', CCBY, 'Playful emoji-style round faces.'],
  ['micah', 'micah', 'illustrated', CCBY, 'Clean vector portraits (Micah by Zeph Colombatto).'],
  ['miniavs', 'miniavs', 'illustrated', CCBY, 'Minimal flat mini-avatars.'],
  ['personas', 'personas', 'illustrated', CCBY, 'Draftbit Personas — flat illustrated people.'],
  ['toonHead', 'toon-head', 'illustrated', CCBY, 'Chunky animated-series “toon” heads.'],
];

function dicebearStyle([collectionKey, id, family, license, blurb]) {
  return {
    id,
    name: id.replace(/(^|-)([a-z])/g, (_m, s, c) => (s ? ' ' : '') + c.toUpperCase()),
    provider: 'DiceBear',
    library: '@dicebear/collection',
    family,
    license,
    animated: false,
    offline: true,
    output: 'svg',
    blurb,
    home: 'https://www.dicebear.com/styles/' + id + '/',
    async gen(seed, size) {
      const { createAvatar, collection } = await loadDicebear();
      const svg = createAvatar(collection[collectionKey], { seed, size: size || 120 }).toString();
      return svgResult(svg, size);
    },
  };
}

/* ---------------------------------------------------- standalone generators */

const STANDALONE = [
  {
    id: 'jdenticon',
    name: 'Jdenticon',
    provider: 'Jdenticon',
    library: 'jdenticon',
    family: 'identicon',
    license: { name: 'MIT', url: 'https://github.com/dmester/jdenticon/blob/master/LICENSE', attribution: false },
    animated: false,
    offline: true,
    output: 'svg',
    blurb: 'Hash → symmetric SVG identicon (browser + Node, CDN-friendly).',
    home: 'https://jdenticon.com',
    async gen(seed, size) {
      const jd = await import('jdenticon');
      return svgResult((jd.toSvg || jd.default.toSvg)(seed, size || 120), size);
    },
  },
  {
    id: 'minidenticons',
    name: 'Minidenticons',
    provider: 'Minidenticons',
    library: 'minidenticons',
    family: 'identicon',
    license: { name: 'MIT', url: 'https://github.com/laurentpayot/minidenticons/blob/main/LICENSE', attribution: false },
    animated: false,
    offline: true,
    output: 'svg',
    blurb: 'The tiniest option — <1 KB, colored 5×5 pixel-grid SVG from a string.',
    home: 'https://github.com/laurentpayot/minidenticons',
    async gen(seed, size) {
      const { minidenticon } = await import('minidenticons');
      return svgResult(minidenticon(seed), size);
    },
  },
  {
    id: 'multiavatar',
    name: 'Multiavatar',
    provider: 'Multiavatar',
    library: '@multiavatar/multiavatar',
    family: 'illustrated',
    // NOT MIT — custom license: free to USE (incl. commercial) as avatars, but you may
    // not re-package/re-brand the design set as a competing product. See docs + LICENSE.
    license: { name: 'Multiavatar License v1.0', url: 'https://github.com/multiavatar/Multiavatar/blob/master/LICENSE', attribution: false, restricted: true },
    animated: false,
    offline: true,
    output: 'svg',
    blurb: 'Diverse, multicultural characters — ~12 billion combinations.',
    home: 'https://multiavatar.com',
    async gen(seed, size) {
      const mod = await import('@multiavatar/multiavatar');
      const multiavatar = mod.default || mod;
      return svgResult(multiavatar(seed), size);
    },
  },
  {
    id: 'dither',
    name: 'Dither Avatar',
    provider: 'dither-avatar',
    library: 'dither-avatar',
    family: 'pixel',
    license: { name: 'MIT', url: 'https://github.com/maartenkeizer/dither-avatar', attribution: false },
    animated: false,
    offline: true,
    output: 'svg',
    blurb: 'Bayer 4×4 ordered-dither pixel grid; hue from a deterministic seed hash.',
    home: 'https://github.com/maartenkeizer/dither-avatar',
    async gen(seed, size) {
      const d = await import('dither-avatar');
      return svgResult(d.generateDitherAvatar(seed), size);
    },
  },
  {
    id: 'identicon-js',
    name: 'Identicon.js',
    provider: 'identicon.js',
    library: 'identicon.js',
    family: 'identicon',
    license: { name: 'BSD-2-Clause', url: 'https://github.com/stewartlord/identicon.js/blob/master/license.txt', attribution: false },
    animated: false,
    offline: true,
    output: 'svg',
    blurb: 'The classic GitHub-style geometric identicon (own PNG/SVG encoder).',
    home: 'https://github.com/stewartlord/identicon.js',
    async gen(seed, size) {
      const mod = await import('identicon.js');
      const Identicon = mod.default || mod;
      const b64 = new Identicon(hashHex(seed, 32), { format: 'svg', size: size || 120, margin: 0.1 }).toString();
      return svgResult(b64ToStr(b64), size);
    },
  },
  {
    id: 'blockies',
    name: 'Blockies',
    provider: 'Ethereum Blockies',
    library: 'ethereum-blockies-base64',
    family: 'identicon',
    license: { name: 'MIT', url: 'https://github.com/MyEtherWallet/blockies', attribution: false },
    animated: false,
    offline: true,
    output: 'png',
    blurb: 'The blocky pixel identicon from Ethereum/MetaMask (PNG data-URI).',
    home: 'https://github.com/MyEtherWallet/blockies',
    async gen(seed /* size: fixed-scale PNG, scaled via CSS */) {
      const mod = await import('ethereum-blockies-base64');
      const makeBlockie = mod.default || mod;
      return { output: 'png', markup: null, dataUri: makeBlockie(seed) };
    },
  },
];

/* --------------------------------------------------------- boring-avatars */

const BORING_VARIANTS = [
  ['beam', 'boring-beam', 'abstract', 'Smiling “beam” face — the Boring Avatars signature look.'],
  ['marble', 'boring-marble', 'abstract', 'Flowing marbled gradient blobs.'],
  ['pixel', 'boring-pixel', 'pixel', 'Mosaic pixel-grid of seed-derived colors.'],
  ['sunset', 'boring-sunset', 'abstract', 'Layered sunset gradient bands.'],
  ['ring', 'boring-ring', 'abstract', 'Concentric rings of color.'],
  ['bauhaus', 'boring-bauhaus', 'abstract', 'Bauhaus-style geometric composition.'],
];

function boringStyle([variant, id, family, blurb]) {
  return {
    id,
    name: 'Boring ' + variant[0].toUpperCase() + variant.slice(1),
    provider: 'Boring Avatars',
    library: 'boring-avatars',
    family,
    license: { name: 'MIT', url: 'https://github.com/boringdesigners/boring-avatars/blob/master/LICENSE', attribution: false },
    animated: false,
    offline: true,
    output: 'svg',
    blurb,
    home: 'https://boringavatars.com',
    async gen(seed, size) {
      const { React, renderToStaticMarkup } = await react();
      const Avatar = (await import('boring-avatars')).default;
      const svg = renderToStaticMarkup(React.createElement(Avatar, { name: seed, variant, size: size || 120 }));
      return svgResult(svg, size);
    },
  };
}

/* ----------------------------------------------- react-nice-avatar + bigheads */

const NICE_AVATAR = {
  id: 'nice-avatar',
  name: 'Nice Avatar',
  provider: 'react-nice-avatar',
  library: 'react-nice-avatar',
  family: 'illustrated',
  license: { name: 'MIT', url: 'https://github.com/dapi-labs/react-nice-avatar/blob/main/LICENSE', attribution: false },
  animated: false,
  offline: true,
  output: 'html', // HTML/CSS + inline SVG, not a single <svg> root
  blurb: 'Clean flat portraits with fine per-feature control (hair, eyes, glasses…).',
  home: 'https://github.com/dapi-labs/react-nice-avatar',
  async gen(seed, size) {
    const { React, renderToStaticMarkup } = await react();
    const rna = await import('react-nice-avatar');
    const Avatar = rna.default?.default || rna.default;
    const genConfig = rna.genConfig || rna.default?.genConfig;
    const px = (size || 120) + 'px';
    const html = uniquifyIds(renderToStaticMarkup(
      React.createElement(Avatar, { style: { width: px, height: px }, ...genConfig(seed) }),
    ));
    return { output: 'html', markup: html, dataUri: null };
  },
};

// Deterministic seed → BigHead config (the lib ships no seeded randomizer).
async function bigheadsConfig(seed) {
  const big = await import('@bigheads/core');
  const { colors } = big.theme;
  const k = (o) => Object.keys(o);
  const pick = (salt, arr) => arr[fnv1a(seed + '|' + salt) % arr.length];
  return {
    _big: big,
    eyes: pick('eyes', k(big.eyesMap)),
    eyebrows: pick('eyebrows', k(big.eyebrowsMap)),
    mouth: pick('mouth', k(big.mouthsMap)),
    hair: pick('hair', k(big.hairMap)),
    facialHair: pick('facialHair', k(big.facialHairMap)),
    clothing: pick('clothing', k(big.clothingMap)),
    accessory: pick('accessory', k(big.accessoryMap)),
    graphic: pick('graphic', k(big.graphicsMap)),
    hat: pick('hat', k(big.hatMap)),
    body: pick('body', k(big.bodyMap)),
    skinTone: pick('skin', k(colors.skin)),
    hairColor: pick('hairColor', k(colors.hair)),
    clothingColor: pick('clothingColor', k(colors.clothing)),
    circleColor: pick('circle', k(colors.bgColors)),
    lipColor: pick('lip', k(colors.lipColors)),
    hatColor: pick('hatColor', k(colors.clothing)),
    lashes: fnv1a(seed + '|lashes') % 2 === 0,
  };
}

const BIGHEADS = {
  id: 'bigheads',
  name: 'Big Heads',
  provider: 'Big Heads / Bean Heads',
  library: '@bigheads/core',
  family: 'illustrated',
  license: { name: 'MIT', url: 'https://github.com/RobertBroersma/bigheads/blob/master/LICENSE', attribution: false },
  animated: false,
  offline: true,
  output: 'svg',
  blurb: 'Exaggerated-head cartoon avatars, billions of composable combinations.',
  home: 'https://bigheads.io',
  async gen(seed, size) {
    const { React, renderToStaticMarkup } = await react();
    const { _big, ...cfg } = await bigheadsConfig(seed);
    const svg = renderToStaticMarkup(React.createElement(_big.BigHead, cfg));
    return svgResult(svg, size);
  },
};

/* ---------------------------------------------------------- assembled set */

export const STYLES = [
  ...DICEBEAR.map(dicebearStyle),
  ...STANDALONE,
  ...BORING_VARIANTS.map(boringStyle),
  NICE_AVATAR,
  BIGHEADS,
];

export const STYLE_BY_ID = Object.fromEntries(STYLES.map((s) => [s.id, s]));

export const FAMILIES = {
  pixel: { label: 'Pixel & retro', blurb: 'Low-res 8-bit / dithered pixel-grid looks.' },
  identicon: { label: 'Identicons', blurb: 'Hash-based geometric / pixel-grid marks (no face).' },
  illustrated: { label: 'Illustrated characters', blurb: 'Cartoon faces & figures generated from a seed.' },
  abstract: { label: 'Abstract & minimal', blurb: 'Gradient / geometric marks with no face.' },
  initials: { label: 'Initials', blurb: 'Letter-based avatars from a name.' },
  robot: { label: 'Robots & novelty', blurb: 'Robots and other fun non-human characters.' },
};

export const PREVIEW_SEEDS = ['Erick', 'Ada Lovelace', 'octocat', 'design-store', 'sunny-42', 'Café Noir'];

// Reference-only options: real, notable avatar generators the user asked about that are
// NOT wired into the offline CLI — because they're an HTTP API, another language, a
// browser-only runtime, or (the animation forks) intentionally out of scope. Documented
// so the compendium stays honest about the whole landscape, not just what it ships.
export const REFERENCE = [
  {
    id: 'avataaars-original', name: 'Avataaars (original)', category: 'illustrated',
    license: 'MIT / free commercial', animated: false, offline: 'needs-react',
    home: 'https://github.com/fangpenlin/avataaars',
    reach: 'React: `avataaars` (React 17). Vanilla SVG: `Avataaars.create(opts)` via HB0N0/AvataaarsJs (GitHub-only).',
    note: 'The original Pablo Stanley cartoon library. Offline SVG here is covered by DiceBear ' +
      '`avataaars` / `avataaars-neutral` — use those unless you need the original React options.',
  },
  {
    id: 'avataaars-animated', name: 'Avataaars — animated forks', category: 'illustrated',
    license: 'MIT', animated: true, offline: 'needs-react',
    home: 'https://github.com/gschoppe/avataaars',
    reach: '`@gschoppe/avataaars` (opt-in idle CSS `@keyframes` — import dist/animations.css) · ' +
      '`@vierweb/avataaars` (React state expression-cycling + on-hover sequences).',
    note: 'THE only avatar generators found with native animation. Both are lightly-maintained ' +
      'React forks of Avataaars, not canonical packages. See docs/avatars/animation.md.',
  },
  {
    id: 'playful-avatars', name: 'Playful Avatars', category: 'abstract',
    license: 'MIT', animated: false, offline: 'browser-only',
    home: 'https://github.com/cmaas/playful-avatars',
    reach: 'Web component: `<playful-avatar name="x">`. Needs a DOM (customElements) — browser, not Node.',
    note: 'A framework-free rewrite of Boring Avatars; identical SVG output, no React. ' +
      'For offline generation here use the `boring-*` styles.',
  },
  {
    id: 'pixel-avatar-lib', name: 'pixel-avatar-lib', category: 'pixel',
    license: 'Apache-2.0', animated: false, offline: 'browser-only',
    home: 'https://github.com/snjyor/pixel-avatar-lib',
    reach: 'React + `<canvas>`; a "DNA" string encodes hair/face/clothing/accessories.',
    note: 'Canvas-based, so it renders in a browser, not to an offline SVG string. ' +
      'For 8-bit avatars here use `pixel-art` or `dither`.',
  },
  {
    id: 'squareicon', name: 'Squareicon', category: 'identicon',
    license: 'MIT', animated: false, offline: 'needs-canvas',
    home: 'https://github.com/mistic100/squareicon',
    reach: 'Node, but depends on the native `canvas` module and outputs PNG.',
    note: 'Dropped from the offline toolchain to keep it pure-JS (no native build). ' +
      '`identicon-js` and `blockies` cover GitHub-style / blocky identicons.',
  },
  {
    id: 'robohash', name: 'Robohash', category: 'robot',
    license: 'Free (attribution appreciated)', animated: false, offline: 'http-api',
    home: 'https://robohash.org',
    reach: 'HTTP: `https://robohash.org/<text>?set=set1..set5&bgset=bg1|bg2&size=200x200`. ' +
      'Sets: robots / monsters / robot-heads / kittens / human heads.',
    note: 'Hosted only — no offline lib. For offline robots use DiceBear `bottts`. ' +
      'The `.gif` output is a single static frame, not animation.',
  },
  {
    id: 'ui-avatars', name: 'UI Avatars', category: 'initials',
    license: 'Free', animated: false, offline: 'http-api',
    home: 'https://ui-avatars.com',
    reach: 'HTTP: `https://ui-avatars.com/api/?name=Erick&background=random&format=svg`.',
    note: 'Hosted initials avatars. Offline equivalent here: DiceBear `initials`.',
  },
  {
    id: 'python-avatars', name: 'python_avatars', category: 'illustrated',
    license: 'MIT', animated: false, offline: 'other-language',
    home: 'https://github.com/ibonn/python_avatars',
    reach: 'PyPI `python-avatars` (Python). Pure-SVG, add your own clothes/hair/eyes.',
    note: 'Python, not JS — use in Python projects. Cartoon SVG in the Avataaars lineage.',
  },
  {
    id: 'pixelated-avatar-generator', name: 'pixelated-avatar-generator', category: 'pixel',
    license: 'MIT', animated: false, offline: 'other-language',
    home: 'https://hackage.haskell.org/package/pixelated-avatar-generator',
    reach: 'Haskell library/CLI; PNG output from a 32-char hex (MD5) seed.',
    note: 'Haskell, not JS. For offline pixel PNGs here use `blockies`.',
  },
  {
    id: 'personas-draftbit', name: 'Personas by Draftbit', category: 'illustrated',
    license: 'MIT (repo)', animated: false, offline: 'browser-only',
    home: 'https://github.com/draftbit/avatar-generator',
    reach: 'Unpublished React + ReScript + html2canvas app (repo is `private`).',
    note: 'Not on npm. The style ships offline here as DiceBear `personas`.',
  },
];

// Convenience for the CLI/gallery: one call, normalized result + the style meta.
export async function generate(id, seed, size) {
  const style = STYLE_BY_ID[id];
  if (!style) throw new Error(`Unknown avatar style "${id}".`);
  const result = await style.gen(seed, size);
  return { style, seed, size, ...result };
}
