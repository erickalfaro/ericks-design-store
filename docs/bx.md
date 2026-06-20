# Boxicons

> Broad set in three families: Regular (line, bx-), Solid (filled, bxs-) and Logos (brands, bxl-).

| | |
|---|---|
| **Iconify prefix** | `bx` |
| **Icons (offline)** | 1,609 (+814 aliases) |
| **License** | MIT |
| **Home** | https://boxicons.com |
| **npm** | `boxicons` |

**When to use:** When you need both line and solid versions plus a big library of brand/social logos in one set.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs bx:<name>                 # raw SVG
node scripts/icon.mjs bx:<name> --format jsx    # React component
node scripts/icon.mjs bx:<name> --format vue    # Vue SFC
node scripts/icon.mjs bx:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set bx  # find a name
```

Browse visually: [gallery/bx.html](../gallery/bx.html)

## Use the upstream package directly

Install `boxicons` (see options above) or reference via Iconify with the name `bx:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="bx:<name>" />
```

---
_Data vendored from `@iconify-json/bx` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://boxicons.com)._
