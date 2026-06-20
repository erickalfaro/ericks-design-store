# Feather

> The original minimalist 24px line set that Lucide forked from. Small and stable.

| | |
|---|---|
| **Iconify prefix** | `feather` |
| **Icons (offline)** | 286 |
| **License** | MIT |
| **Home** | https://feathericons.com |
| **npm** | `feather-icons / react-feather` |

**When to use:** Legacy or minimalist projects already on Feather. For new work prefer Lucide (actively maintained superset).

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs feather:<name>                 # raw SVG
node scripts/icon.mjs feather:<name> --format jsx    # React component
node scripts/icon.mjs feather:<name> --format vue    # Vue SFC
node scripts/icon.mjs feather:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set feather  # find a name
```

Browse visually: [gallery/feather.html](../gallery/feather.html)

## Use the upstream package directly

Install `feather-icons` (see options above) or reference via Iconify with the name `feather:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="feather:<name>" />
```

---
_Data vendored from `@iconify-json/feather` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://feathericons.com)._
