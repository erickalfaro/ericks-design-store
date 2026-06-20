# Material Symbols

> Google's official system icons (successor to Material Icons). Outlined / Rounded / Sharp; fill, weight, grade, optical-size axes.

| | |
|---|---|
| **Iconify prefix** | `material-symbols` |
| **Icons (offline)** | 16,322 (+2,362 aliases) |
| **License** | Apache-2.0 |
| **Home** | https://fonts.google.com/icons |
| **npm** | `material-symbols (variable font) / @material-symbols/*` |

**When to use:** Android, Google-ecosystem, or Material Design 3 products, or when you need an enormous, official, system-grade catalog.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs material-symbols:<name>                 # raw SVG
node scripts/icon.mjs material-symbols:<name> --format jsx    # React component
node scripts/icon.mjs material-symbols:<name> --format vue    # Vue SFC
node scripts/icon.mjs material-symbols:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set material-symbols  # find a name
```

Browse visually: [gallery/material-symbols.html](../gallery/material-symbols.html)

## Use the upstream package directly

Install `material-symbols (variable font)` (see options above) or reference via Iconify with the name `material-symbols:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="material-symbols:<name>" />
```

---
_Data vendored from `@iconify-json/material-symbols` via `npm run fetch`. License: Apache-2.0 — attribution belongs to the original authors (https://fonts.google.com/icons)._
