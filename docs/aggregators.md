# Aggregators & the full catalog

The 11 static sets vendored in `data/` cover the vast majority of UI needs. When you need
something beyond them, use these aggregators to discover icons — then either pull the full
Iconify bundle locally or reference the icon by its Iconify name.

## Iconify — https://iconify.design

The universal icon framework behind this repo's data. One syntax (`<prefix>:<name>`) for
**200k+ icons across 150+ open-source sets**.

- **Browse:** https://icon-sets.iconify.design
- **Use without copying** (auto-loads from the Iconify API, with offline bundles available):
  ```jsx
  import { Icon } from "@iconify/react";   // or @iconify/vue, or <iconify-icon> web component
  <Icon icon="mdi:home" />
  ```
- **All our 11 sets are Iconify sets**, so anything you grab here is consistent with the rest.

### Pull the entire catalog offline (opt-in)

```bash
npm run fetch:full
```

Downloads `@iconify/json` (~418 MB, all 200k+ icons) into `data/_full-iconify/`
(**gitignored — never committed**). Set JSON files land at
`data/_full-iconify/node_modules/@iconify/json/json/<prefix>.json`. From there you can point
the same `scripts/icon.mjs` workflow at any set in the bundle.

## Icônes — https://icones.js.org

A fast visual explorer built on Iconify data. Best for **searching across every set at once**,
previewing, and copying an icon as SVG / JSX / Vue / Iconify name. Great for finding the right
`<prefix>:<name>` to then use here or via `@iconify/*` components.

## shadcn/ui icon libraries — https://www.shadcn.io/icons/libraries

Curated guidance on which open-source icon sets pair well with shadcn/ui (Lucide is the
default). Useful when matching an icon set to a component library's aesthetic.

## Picking a set

See the per-set docs for "when to use" guidance, or the registry in
[`data/meta.json`](../data/meta.json). Quick heuristic:

- **Clean line UI / shadcn:** Lucide (then Tabler for breadth, Iconoir for a lighter stroke)
- **Need weight variation:** Phosphor (6 weights)
- **Google / Android / Material 3:** Material Symbols
- **Tailwind UI:** Heroicons
- **Radix UI / dense chrome:** Radix Icons
- **Need line + fill pairs:** Remix Icon or Boxicons
- **Bootstrap projects:** Bootstrap Icons
- **Micro-interactions:** [Lucide Animated](lucide-animated.md)
