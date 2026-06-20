# Tabler Icons

> Huge 2px-stroke line set on a 24px grid. Largest of the line families here. Very consistent.

| | |
|---|---|
| **Iconify prefix** | `tabler` |
| **Icons (offline)** | 6,194 (+184 aliases) |
| **License** | MIT |
| **Home** | https://tabler.io/icons |
| **npm** | `@tabler/icons / @tabler/icons-react / @tabler/icons-vue` |

**When to use:** When you need breadth (5,900+ icons) in a clean line style and Lucide is missing a glyph. Matches Lucide visually.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs tabler:<name>                 # raw SVG
node scripts/icon.mjs tabler:<name> --format jsx    # React component
node scripts/icon.mjs tabler:<name> --format vue    # Vue SFC
node scripts/icon.mjs tabler:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set tabler  # find a name
```

Browse visually: [gallery/tabler.html](../gallery/tabler.html)

## Use the upstream package directly

Install `@tabler/icons` (see options above) or reference via Iconify with the name `tabler:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="tabler:<name>" />
```

---
_Data vendored from `@iconify-json/tabler` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://tabler.io/icons)._
