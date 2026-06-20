# Phosphor

> Flexible family with six weights: thin, light, regular, bold, fill, duotone. Friendly, rounded geometry.

| | |
|---|---|
| **Iconify prefix** | `ph` |
| **Icons (offline)** | 9,161 (+37 aliases) |
| **License** | MIT |
| **Home** | https://phosphoricons.com |
| **npm** | `@phosphor-icons/react / @phosphor-icons/vue / @phosphor-icons/web` |

**When to use:** When you want one icon vocabulary but need to vary visual weight/tone (e.g. thin for elegant, bold for emphasis, duotone for accents).

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs ph:<name>                 # raw SVG
node scripts/icon.mjs ph:<name> --format jsx    # React component
node scripts/icon.mjs ph:<name> --format vue    # Vue SFC
node scripts/icon.mjs ph:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set ph  # find a name
```

Browse visually: [gallery/ph.html](../gallery/ph.html)

## Use the upstream package directly

Install `@phosphor-icons/react` (see options above) or reference via Iconify with the name `ph:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="ph:<name>" />
```

---
_Data vendored from `@iconify-json/ph` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://phosphoricons.com)._
