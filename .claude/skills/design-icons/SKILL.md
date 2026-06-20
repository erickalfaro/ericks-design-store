---
name: design-icons
description: Erick's offline icon compendium — 44,000+ icons across 11 vendored open-source sets (Lucide, Phosphor, Tabler, Heroicons, Radix, Feather, Material Symbols, Remix, Bootstrap, Iconoir, Boxicons) plus animated Lucide. Use whenever a web-app or IoT UI needs an icon: finding the right glyph, picking an icon set that fits a project's aesthetic, or outputting an icon as SVG / React (JSX) / Vue / Svelte / Iconify name. Works fully offline via a local CLI — no network, no per-project icon dependency.
---

# Design Icons

A single offline source for icons across all of Erick's projects. Icon data for 11 sets is
vendored locally; one CLI renders any icon into the format the current project needs.

**Store location:** `/home/erick/Documents/ericks_design_store` (referred to below as `$STORE`).
All commands use that absolute path so they work from any project directory.

## The fastest path

1. **Find the icon name** (if you don't already know it):
   ```bash
   node $STORE/scripts/icon.mjs --search <term>            # search all sets
   node $STORE/scripts/icon.mjs --search <term> --set lucide
   ```
2. **Render it** in the format the project uses:
   ```bash
   node $STORE/scripts/icon.mjs <prefix>:<name>                  # raw SVG (default)
   node $STORE/scripts/icon.mjs <prefix>:<name> --format jsx     # React component
   node $STORE/scripts/icon.mjs <prefix>:<name> --format vue     # Vue SFC
   node $STORE/scripts/icon.mjs <prefix>:<name> --format svelte  # Svelte component
   node $STORE/scripts/icon.mjs <prefix>:<name> --format iconify # <prefix>:<name> + @iconify usage
   ```
   Options: `--size N`, `--color CSS`, `--stroke W` (line sets), `--name CompName` (jsx/vue).

Then paste the output into the project. Match the project's existing icon approach: if it
already uses `@iconify/react` or a package like `lucide-react`, prefer that over pasting SVG;
otherwise inline the SVG/component.

## The 11 static sets

| Prefix | Set | License | Style / when to use |
|---|---|---|---|
| `lucide` | Lucide | ISC | Clean 2px line, shadcn default. **Default pick.** |
| `tabler` | Tabler | MIT | Largest line set — use for breadth when Lucide lacks a glyph. |
| `iconoir` | Iconoir | MIT | Lighter 1.5px line, editorial feel. |
| `feather` | Feather | MIT | Minimalist original Lucide forked from. |
| `ph` | Phosphor | MIT | 6 weights (thin→duotone) — vary visual tone. |
| `heroicons` | Heroicons | MIT | Tight, polished; Tailwind UI. |
| `radix-icons` | Radix | MIT | 15px UI glyphs; Radix UI / dense chrome. |
| `material-symbols` | Material Symbols | Apache-2.0 | Google/Android/Material 3; huge official catalog. |
| `ri` | Remix | Apache-2.0 | Line+fill pairs; strong brand/logo coverage. |
| `bi` | Bootstrap | MIT | Bootstrap projects; reads well filled at small size. |
| `bx` | Boxicons | MIT | Regular/Solid/Logos families. |

Full details + install snippets per set: `$STORE/docs/<prefix>.md`. Registry data (counts,
defaults, "when to use"): `$STORE/data/meta.json`. Visual browse: open
`$STORE/gallery/index.html`.

## Choosing a set

- Honor what the project already uses. If it's on Lucide/Tailwind/Radix/Bootstrap/Material,
  stay in that family for consistency.
- Greenfield clean UI → **Lucide** (fall back to Tabler for missing glyphs — same look).
- Need weight/tone variation → **Phosphor**. Lighter stroke → **Iconoir**.
- Google/Android/Material 3 → **Material Symbols**. Tailwind UI → **Heroicons**.
- Need line+fill state pairs → **Remix** or **Boxicons**.
- Don't mix line sets within one UI — pick one family and stay in it.

## Animated icons

For micro-interactions (hover/click), use **Lucide Animated** (React + Motion), not the CLI:
```bash
npx shadcn@latest add "https://lucide-animated.com/r/<icon-name>.json"
```
See `$STORE/docs/lucide-animated.md` and `$STORE/vendor/lucide-animated/` for the pattern.

## Beyond the 11 sets

Need something rarer? See `$STORE/docs/aggregators.md`:
- Browse 200k+ icons at https://icon-sets.iconify.design or https://icones.js.org, then
  reference by Iconify name `<prefix>:<name>` via `@iconify/react|vue` / `<iconify-icon>`.
- Or pull the full offline catalog: `cd $STORE && npm run fetch:full` (~418 MB, gitignored).

## Maintenance

Refresh vendored data to the latest upstream icons:
```bash
cd $STORE && npm run fetch && npm run gallery
```

## License note

All sets are MIT / ISC / Apache-2.0 — free for commercial use. Attribution belongs to the
original authors (links in each `docs/<prefix>.md`). Keep upstream license/attribution when a
set requires it (notably Apache-2.0: Material Symbols, Remix).
