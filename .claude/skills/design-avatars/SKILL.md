---
name: design-avatars
description: Erick's offline avatar compendium — 45 generated-avatar styles from one seed string across 6 families (pixel, identicons, illustrated characters, abstract, initials, robots), reusing DiceBear, jdenticon, minidenticons, Multiavatar, Boring Avatars, Blockies, Big Heads, and more. Use whenever a web-app or IoT UI needs a profile picture / user avatar / identicon / placeholder from a name, email, id, or hash. Works fully offline via a local CLI — render as SVG / data-URI / PNG, no network, no hosted API, no per-project avatar dependency. Also answers "which avatars animate" (none do — see animation.md).
---

# Design Avatars

A single offline source for **generated avatars** across all of Erick's projects. Avatars are made
from a *seed* (any string — a name, email, user id, hash), deterministically: same `<style>:<seed>`
always yields the same image. 45 styles are vendored locally; one CLI renders any of them.

**Store location:** `/home/erick/Documents/ericks_design_store` (referred to below as `$STORE`).
All commands use that absolute path so they work from any project directory.

## The fastest path

1. **Pick a style** (if you don't already know it):
   ```bash
   node $STORE/scripts/avatar.mjs --list                 # all 45, grouped by family + license
   node $STORE/scripts/avatar.mjs --list --family illustrated
   node $STORE/scripts/avatar.mjs --search doodle
   ```
2. **Generate it** in the format the project needs:
   ```bash
   node $STORE/scripts/avatar.mjs <style>:<seed>                    # raw SVG (default)
   node $STORE/scripts/avatar.mjs <style>:<seed> --format datauri   # data: URI for <img src>
   node $STORE/scripts/avatar.mjs <style>:<seed> --size 128         # pixel size
   node $STORE/scripts/avatar.mjs blockies:<seed> --out a.png       # PNG styles → decode to file
   node $STORE/scripts/avatar.mjs nice-avatar:<seed> --format html  # nice-avatar is HTML/CSS+SVG
   ```
   The seed may contain `:` (e.g. `bottts:team@acme.com`) — only the first `:` splits style from seed.

Then paste the output into the project. Match the project's existing approach: if it already imports
`@dicebear/*`, `boring-avatars`, `react-nice-avatar`, etc., prefer using that package directly (see the
per-style `library` in the registry) over pasting SVG; otherwise inline the SVG / data-URI.

## The 6 families

| Family | Example styles | Use for |
|---|---|---|
| **Pixel & retro** | `pixel-art`, `dither`, `boring-pixel` | Playful 8-bit / mosaic looks. |
| **Identicons** | `minidenticons`, `jdenticon`, `identicon-js`, `blockies`, `identicon` | Unique-but-anonymous marks from a hash/id — no PII, no face. |
| **Illustrated** | `lorelei`, `notionists`, `open-peeps`, `avataaars`, `micah`, `bigheads`, `multiavatar`, `nice-avatar` | Friendly human faces — profiles, teams, onboarding. |
| **Abstract & minimal** | `boring-beam`, `boring-marble`, `glass`, `shapes`, `rings` | Clean, face-free, on-brand marks. |
| **Initials** | `initials` | Name-initials fallback (offline UI Avatars). |
| **Robots & novelty** | `bottts`, `bottts-neutral`, `fun-emoji` | Bots / service accounts (offline Robohash). |

`*-neutral` variants crop to the face only — steadier in small circular avatars.

Full details, per-style licenses, and the reference-only landscape: `$STORE/docs/avatars/styles.md`.
When-to-use judgment: `$STORE/docs/avatars/index.md`. Registry data: `$STORE/data/avatars/registry.json`.
Visual browse with a live seed: open `$STORE/gallery/avatars.html`.

## Choosing a style

- **Anonymous & deterministic** (no identity leak) → an **identicon**. Tiniest: `minidenticons`.
  Web3/wallet feel: `blockies`. GitHub feel: `jdenticon` / `identicon-js`.
- **Human & friendly** → **illustrated**. Safe CC0 defaults: `lorelei`, `notionists`. Classic look:
  `avataaars`, `open-peeps`. Exaggerated fun: `bigheads`.
- **Brand-neutral, no face** → **abstract** — `boring-beam` or `glass`/`shapes`.
- **Just a name** → `initials`.
- Don't mix styles within one surface — one family, one style, everywhere (same rule as icons).

## Licensing (more varied than the icon sets — check before shipping)

- **CC0** (use freely, no attribution): `pixel-art*`, `identicon`, `initials`, `lorelei*`, `notionists*`,
  `open-peeps`, `glass`, `rings`, `shapes`, `thumbs`. **Prefer these when unsure.**
- **CC BY 4.0** (attribution required): `adventurer*`, `big-ears*`, `big-smile`, `croodles*`, `dylan`,
  `fun-emoji`, `micah`, `miniavs`, `personas`, `toon-head`.
- **Free personal & commercial** (Pablo Stanley): `avataaars*`, `bottts*`.
- **⚠ `multiavatar`** — custom Multiavatar License: free to *use*, but you may **not** re-package/re-brand
  its design set. Fine for putting avatars in a project; not for re-shipping the set.

`--list` prints each style's license; `$STORE/docs/avatars/styles.md` has links.

## Animation

**No avatar generator animates natively** — the whole ecosystem outputs static SVG/PNG. If a project
needs motion, generate a static avatar here and wrap it in CSS/Motion yourself (exactly how Lucide
Animated wraps static Lucide icons). Full finding + copy-paste snippets: `$STORE/docs/avatars/animation.md`.
The only self-animating options are two out-of-scope Avataaars forks (`@gschoppe/avataaars`,
`@vierweb/avataaars`), documented there.

## Beyond the offline styles

Some options are reference-only (hosted APIs like Robohash/UI Avatars, other-language libs, browser-only
web components). They're documented in `$STORE/docs/avatars/styles.md`, each with its offline equivalent
(e.g. Robohash → `bottts`, UI Avatars → `initials`).

## Maintenance

```bash
cd $STORE && npm run avatars      # rebuild gallery + registry + styles.md from scripts/avatars-core.mjs
```

Add/change a style in `$STORE/scripts/avatars-core.mjs` (single source of truth), then rebuild. The
gallery, `registry.json`, and `styles.md` are generated — edit the core, not the outputs.
