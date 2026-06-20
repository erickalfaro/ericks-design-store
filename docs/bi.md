# Bootstrap Icons

> Official Bootstrap set. Mostly solid/filled forms on a 16px grid; many have outline+fill pairs.

| | |
|---|---|
| **Iconify prefix** | `bi` |
| **Icons (offline)** | 2,084 (+6 aliases) |
| **License** | MIT |
| **Home** | https://icons.getbootstrap.com |
| **npm** | `bootstrap-icons` |

**When to use:** Bootstrap-based projects, or when you want filled glyphs that read well at small sizes.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs bi:<name>                 # raw SVG
node scripts/icon.mjs bi:<name> --format jsx    # React component
node scripts/icon.mjs bi:<name> --format vue    # Vue SFC
node scripts/icon.mjs bi:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set bi  # find a name
```

Browse visually: [gallery/bi.html](../gallery/bi.html)

## Use the upstream package directly

Install `bootstrap-icons` (see options above) or reference via Iconify with the name `bi:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="bi:<name>" />
```

---
_Data vendored from `@iconify-json/bi` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://icons.getbootstrap.com)._
