# Radix Icons

> Crisp 15×15 UI glyphs designed for dense interface chrome (menus, toolbars, controls).

| | |
|---|---|
| **Iconify prefix** | `radix-icons` |
| **Icons (offline)** | 342 (+3 aliases) |
| **License** | MIT |
| **Home** | https://www.radix-ui.com/icons |
| **npm** | `@radix-ui/react-icons` |

**When to use:** Radix UI / Radix Themes projects and compact application chrome where icons sit at small fixed sizes.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs radix-icons:<name>                 # raw SVG
node scripts/icon.mjs radix-icons:<name> --format jsx    # React component
node scripts/icon.mjs radix-icons:<name> --format vue    # Vue SFC
node scripts/icon.mjs radix-icons:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set radix-icons  # find a name
```

Browse visually: [gallery/radix-icons.html](../gallery/radix-icons.html)

## Use the upstream package directly

Install `@radix-ui/react-icons` (see options above) or reference via Iconify with the name `radix-icons:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="radix-icons:<name>" />
```

---
_Data vendored from `@iconify-json/radix-icons` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://www.radix-ui.com/icons)._
