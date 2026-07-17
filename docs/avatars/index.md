# Avatars

> The compendium's **second domain** (after icons). One offline source for generated avatars —
> 45 styles from a single seed string, rendered locally as SVG / data-URI / PNG. No network, no
> hosted API, no per-project avatar dependency.

Avatars differ from icons in one important way: they aren't a fixed catalog, they're **generators**.
You don't pick "avatar #123" — you feed a *seed* (a name, email, user id, anything) to a style and
it deterministically produces an image. Same seed + same style → the same avatar, every time,
everywhere (CLI and browser share one generator core).

This domain still follows the compendium's four-layer pattern:

| Layer | Here |
|---|---|
| **Data** | `scripts/avatars-core.mjs` (source of truth) → `data/avatars/registry.json` (metadata) + vendored generator libraries as deps |
| **Tooling** | `scripts/avatar.mjs` (CLI) · `scripts/build-avatar-gallery.mjs` (gallery/registry/docs builder) |
| **Docs** | this folder — `index.md` (judgment), [animation.md](animation.md), [styles.md](styles.md) (generated table) |
| **Skill** | `.claude/skills/design-avatars/` |

## Fastest path

```bash
# Find a style
node scripts/avatar.mjs --list                      # all 45, grouped by family
node scripts/avatar.mjs --search doodle

# Generate one (seed is anything; determinism guaranteed)
node scripts/avatar.mjs lorelei:erick                        # SVG (default)
node scripts/avatar.mjs bottts:team@acme.com --size 128      # seed may contain ':'
node scripts/avatar.mjs pixel-art --seed Ada --format datauri
node scripts/avatar.mjs blockies:0xF00 --out ident.png       # PNG styles decode to a file
```

Formats: `svg` · `datauri` · `png` (PNG styles) · `html` (the `nice-avatar` style is HTML/CSS+SVG).
Visual browse with a live seed: open [`gallery/avatars.html`](../../gallery/avatars.html).

## The six families — when to use which

| Family | Styles | Reach for it when… |
|---|---|---|
| **Pixel & retro** | `pixel-art`, `dither`, `boring-pixel` | You want a playful 8-bit / mosaic look; gaming, retro, fun brands. |
| **Identicons** | `identicon`, `jdenticon`, `minidenticons`, `identicon-js`, `blockies` | You need a **unique-but-anonymous** mark per user/hash with zero PII — commit authors, wallets, API keys, "unknown user" states. No face. |
| **Illustrated characters** | `lorelei`, `notionists`, `open-peeps`, `adventurer`, `micah`, `avataaars`, `big-smile`, `croodles`, `miniavs`, `personas`, `multiavatar`, `nice-avatar`, `bigheads`, … | You want friendly human-ish faces — profiles, team pages, onboarding, comment threads. Pick one style and stay in it. |
| **Abstract & minimal** | `boring-marble`, `boring-beam`, `boring-sunset`, `boring-ring`, `boring-bauhaus`, `glass`, `rings`, `shapes`, `icons`, `thumbs` | You want a clean, face-free, on-brand mark. Great default when illustrated feels too much. |
| **Initials** | `initials` | Classic name-initials fallback (the Gravatar/Google pattern). Offline replacement for UI Avatars. |
| **Robots & novelty** | `bottts`, `bottts-neutral`, `fun-emoji` | Bots, service accounts, playful products. Offline replacement for Robohash. |

**Neutral variants** (`*-neutral`) crop to the face only — steadier for small circular avatars where
shoulders/backgrounds add noise.

### Choosing, in practice
- **Anonymous & deterministic** (no identity leak): an **identicon**. Smallest footprint: `minidenticons`
  (<1 KB). Wallet/web3 feel: `blockies`. GitHub feel: `identicon-js` or `jdenticon`.
- **Human & friendly**: an **illustrated** style. `lorelei` / `notionists` (CC0, soft) are safe defaults;
  `avataaars` / `open-peeps` for the classic Pablo-Stanley look; `bigheads` for exaggerated fun.
- **Brand-neutral, no face**: **abstract** — `boring-beam` (signature) or `glass`/`shapes`.
- **Just a name**: `initials`.
- Don't mix styles within one surface — one family, one style, consistent everywhere (same rule as icons).

## Licensing — read before you ship

Avatars carry **more license variety than the icon sets**. The CLI prints each style's license in
`--list`; the authoritative table is [styles.md](styles.md). Summary:

- **CC0 1.0** (public domain, no attribution): `pixel-art*`, `identicon`, `initials`, `lorelei*`,
  `notionists*`, `open-peeps`, `glass`, `rings`, `shapes`, `thumbs`. **Safest — use freely.**
- **CC BY 4.0** (free commercial, **attribution required**): `adventurer*`, `big-ears*`, `big-smile`,
  `croodles*`, `dylan`, `fun-emoji`, `micah`, `miniavs`, `personas`, `toon-head`. Credit the style
  author (link in [styles.md](styles.md)) if you ship these.
- **Free for personal & commercial use** (Pablo Stanley): `avataaars*`, `bottts*`.
- **MIT / BSD / ISC** (the library code): `jdenticon`, `minidenticons`, `identicon-js`, `blockies`,
  `dither`, `boring-*`, `nice-avatar`, `bigheads`.
- **⚠ Multiavatar License v1.0** — `multiavatar` is **not** open-source. Free to *use* its avatars
  (incl. commercial), but you may **not** re-package/re-brand its design set as a competing product.
  Fine for putting avatars in a project; not fine for re-shipping the set. It's an npm dependency here
  (its assets are **not** vendored into this repo).

When in doubt, prefer a **CC0** style — no attribution, no restrictions.

## What's NOT here (and why)

Some avatar options the landscape offers can't be offline-generated in Node, so they're **reference-only**
(documented in [styles.md](styles.md) and the gallery, not wired into the CLI):

- **Hosted APIs** — [Robohash](https://robohash.org), [UI Avatars](https://ui-avatars.com). Offline
  equivalents: `bottts` and `initials`.
- **Other languages** — `python_avatars` (Python), `pixelated-avatar-generator` (Haskell).
- **Browser-only runtimes** — Playful Avatars (web component), pixel-avatar-lib (React canvas),
  Personas by Draftbit (unpublished app → use DiceBear `personas`).
- **Native-canvas** — Squareicon (dropped to keep the toolchain pure-JS).

## Animation

**None of the 45 generators — nor any of the reference-only options — animate natively.** The whole
avatar-generator ecosystem outputs static SVG/PNG. If you need motion, you animate a static avatar
yourself (the same way Lucide Animated wraps static Lucide icons). Full finding + how-to:
[animation.md](animation.md).

## Maintenance

```bash
npm run avatars       # rebuild gallery/avatars.html + data/avatars/registry.json + docs/avatars/styles.md
npm run avatar -- --list
```

Add or change a style in `scripts/avatars-core.mjs` (the single source of truth), then `npm run avatars`.
`styles.md`, `registry.json`, and `gallery/avatars.html` are **generated** — don't hand-edit them.
