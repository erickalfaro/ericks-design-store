# CLAUDE.md

This repo is **Erick's Design Store** — an offline icon compendium for use across all his projects.

## What you do here

When any project needs an icon, use the **`design-icons`** skill (`.claude/skills/design-icons/`).
The core workflow:

```bash
node scripts/icon.mjs --search <term> [--set <prefix>]     # find a name
node scripts/icon.mjs <prefix>:<name> [--format svg|jsx|vue|svelte|iconify] [--size N] [--color C] [--stroke W]
```

From another project, use the absolute path:
`node /home/erick/Documents/ericks_design_store/scripts/icon.mjs ...`

- **Source of truth:** `data/<prefix>.json` (vendored Iconify JSON) + `data/meta.json` (registry).
- **Don't hand-roll SVG assembly** — `scripts/icon.mjs` already does it via `@iconify/utils`.
- **Match the project:** if it already uses `lucide-react`, `@iconify/react`, Heroicons, etc.,
  stay in that family/approach rather than introducing a new one.
- **Lucide Animated** is React/Motion components — not in `data/`, not via the CLI. See
  `docs/lucide-animated.md`.

## Editing this repo

- Add/remove sets in `scripts/sets.mjs`, then `npm run fetch && npm run gallery`.
- `gallery/` and `docs/<prefix>.md` are **generated** by `build-gallery.mjs` — edit the script
  or `sets.mjs`, not the output. (`docs/lucide-animated.md` and `docs/aggregators.md` are
  hand-written and not generated.)
- `data/_full-iconify/` is gitignored (opt-in 418 MB full bundle via `npm run fetch:full`).

## Using the skill globally

To make `design-icons` available in every project, symlink or copy it into your personal skills:
`ln -s /home/erick/Documents/ericks_design_store/.claude/skills/design-icons ~/.claude/skills/design-icons`

## Extending beyond icons — the core intent

**This repo is a design *compendium*; icons are only domain one.** Its reason for existing is to
grow into the single offline source for color, typography, spacing, components, motion, and
IoT/device-UI patterns. Treat that extensibility as a first-class goal, not a footnote.

Every new domain repeats the **same four-layer pattern** icons already use — read
**[docs/compendium.md](docs/compendium.md)** first, then:

1. **Data** — vendor an offline source of truth under `data/<domain>/` (tokens/scales/specs JSON).
2. **Tooling** — add `scripts/<domain>.mjs`; reuse a proven library rather than hand-rolling
   (icons reuse `@iconify/utils` — find the equivalent for the new domain, e.g. Style Dictionary
   for design tokens).
3. **Docs** — author `docs/<domain>/…` carrying the "when to use" judgment.
4. **Skill** — add `.claude/skills/design-<domain>/` so any project can reach it.

Nothing about the icon system should need to change when a domain is added. If a proposed change
would force restructuring the existing layers, reconsider — the pattern is meant to be additive.
