# Heroicons

> Small, polished, curated set by the Tailwind team. Outline (24px), Solid (24px), Mini (20px), Micro (16px).

| | |
|---|---|
| **Iconify prefix** | `heroicons` |
| **Icons (offline)** | 1,288 (+9 aliases) |
| **License** | MIT |
| **Home** | https://heroicons.com |
| **npm** | `@heroicons/react / @heroicons/vue` |

**When to use:** Tailwind / Tailwind UI projects, or when you want a tight, opinionated, beautifully balanced set over sheer count.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs heroicons:<name>                 # raw SVG
node scripts/icon.mjs heroicons:<name> --format jsx    # React component
node scripts/icon.mjs heroicons:<name> --format vue    # Vue SFC
node scripts/icon.mjs heroicons:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set heroicons  # find a name
```

Browse visually: [gallery/heroicons.html](../gallery/heroicons.html)

## Use the upstream package directly

Install `@heroicons/react` (see options above) or reference via Iconify with the name `heroicons:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="heroicons:<name>" />
```

---
_Data vendored from `@iconify-json/heroicons` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://heroicons.com)._
