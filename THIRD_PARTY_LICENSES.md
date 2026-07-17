# Third-Party Licenses & Attribution

This repository vendors icon **data** from the open-source icon sets listed below, redistributed
via the [Iconify](https://iconify.design) project's `@iconify-json/*` packages. Each set remains
under its own license, and all attribution belongs to its original authors. None of these projects
endorse this repository.

All sets below are redistributable under permissive licenses (MIT / ISC / Apache-2.0). The
`data/<prefix>.json` files are unmodified Iconify exports of each set.

| Set | Prefix | License | Source |
|---|---|---|---|
| Lucide | `lucide` | ISC | https://lucide.dev |
| Phosphor | `ph` | MIT | https://phosphoricons.com |
| Tabler Icons | `tabler` | MIT | https://tabler.io/icons |
| Heroicons | `heroicons` | MIT | https://heroicons.com |
| Radix Icons | `radix-icons` | MIT | https://www.radix-ui.com/icons |
| Feather | `feather` | MIT | https://feathericons.com |
| Material Symbols | `material-symbols` | Apache-2.0 | https://fonts.google.com/icons |
| Remix Icon | `ri` | Apache-2.0 | https://remixicon.com |
| Bootstrap Icons | `bi` | MIT | https://icons.getbootstrap.com |
| Iconoir | `iconoir` | MIT | https://iconoir.com |
| Boxicons | `bx` | MIT | https://boxicons.com |
| Lucide Animated | — | MIT | https://lucide-animated.com · https://icons.pqoqubbw.dev |

Aggregation/redistribution tooling: [Iconify](https://github.com/iconify/iconify) (MIT) and the
`@iconify-json/*` / `@iconify/utils` packages (MIT).

## Apache-2.0 notice (Material Symbols, Remix Icon)

These sets are licensed under the Apache License, Version 2.0
(https://www.apache.org/licenses/LICENSE-2.0). You may obtain a copy of the License at that URL.
The data is redistributed unmodified; this notice preserves the required attribution. Unless
required by applicable law or agreed to in writing, the software is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.

## Using the icons in your own projects

Each set's license is permissive and commercial-friendly. When you ship icons from a given set,
keep that set's attribution/license as its terms require (notably the Apache-2.0 sets). See each
set's source link above for the authoritative license text.

---

# Avatars (domain two)

The avatar domain does **not** vendor avatar assets — it depends on avatar *generator libraries* (npm)
and produces images from a seed at runtime. Each library keeps its own license; the **generated
avatars** additionally carry the license of the specific *style* used. Per-style detail and links:
[`docs/avatars/styles.md`](docs/avatars/styles.md).

## Generator libraries

| Library | npm | License | Source |
|---|---|---|---|
| DiceBear (core + collection) | `@dicebear/core`, `@dicebear/collection` | MIT (core); **each style varies — see below** | https://www.dicebear.com |
| Jdenticon | `jdenticon` | MIT | https://jdenticon.com |
| Minidenticons | `minidenticons` | MIT | https://github.com/laurentpayot/minidenticons |
| Multiavatar | `@multiavatar/multiavatar` | **Multiavatar License v1.0** (custom — see below) | https://multiavatar.com |
| identicon.js | `identicon.js` | BSD-2-Clause | https://github.com/stewartlord/identicon.js |
| Ethereum Blockies | `ethereum-blockies-base64` | MIT | https://github.com/MyEtherWallet/blockies |
| dither-avatar | `dither-avatar` | MIT | https://github.com/maartenkeizer/dither-avatar |
| Boring Avatars | `boring-avatars` | MIT | https://github.com/boringdesigners/boring-avatars |
| react-nice-avatar | `react-nice-avatar` | MIT | https://github.com/dapi-labs/react-nice-avatar |
| Big Heads / Bean Heads | `@bigheads/core` | MIT | https://bigheads.io |

## DiceBear per-style licenses

The DiceBear **core** is MIT, but each art *style* carries its author's license. Honor attribution for
the CC-BY styles when you ship them.

- **CC0 1.0** (public domain): `pixel-art*`, `identicon`, `initials`, `lorelei*`, `notionists*`,
  `open-peeps`, `glass`, `rings`, `shapes`, `thumbs`.
- **CC BY 4.0** (attribution required): `adventurer*`, `big-ears*`, `big-smile`, `croodles*`, `dylan`,
  `fun-emoji`, `micah`, `miniavs`, `personas`, `toon-head`.
- **Free for personal & commercial use** (Pablo Stanley): `avataaars*`, `bottts*`.
- **MIT**: `icons` (Bootstrap Icons).

## Multiavatar license notice

`@multiavatar/multiavatar` is distributed under the **Multiavatar License v1.0** (not an OSI license).
It is free to use — including commercially — to generate avatars for your product. It **prohibits**
re-packaging or re-branding the Multiavatar design set as a similar/competing product. This repo does
**not** vendor or redistribute Multiavatar's assets; it depends on the npm package and generates
avatars at runtime. Authoritative text: https://github.com/multiavatar/Multiavatar/blob/master/LICENSE

## Reference-only options

Robohash, UI Avatars, python_avatars, pixelated-avatar-generator, Playful Avatars, pixel-avatar-lib,
Squareicon, and the Avataaars animation forks are documented in [`docs/avatars/styles.md`](docs/avatars/styles.md)
but **not** bundled or redistributed here — each keeps its own license at its source.

## Build tooling

The avatar gallery is bundled for the browser with [esbuild](https://esbuild.github.io) (MIT).
