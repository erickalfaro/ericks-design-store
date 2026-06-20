# Iconoir

> Large hand-crafted 1.5px-stroke line set with a slightly softer, editorial feel than Lucide/Tabler.

| | |
|---|---|
| **Iconify prefix** | `iconoir` |
| **Icons (offline)** | 1,682 (+338 aliases) |
| **License** | MIT |
| **Home** | https://iconoir.com |
| **npm** | `iconoir / iconoir-react / @iconoir/vue` |

**When to use:** Marketing sites and products wanting a refined, lighter-stroke line aesthetic distinct from the 2px crowd.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs iconoir:<name>                 # raw SVG
node scripts/icon.mjs iconoir:<name> --format jsx    # React component
node scripts/icon.mjs iconoir:<name> --format vue    # Vue SFC
node scripts/icon.mjs iconoir:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set iconoir  # find a name
```

Browse visually: [gallery/iconoir.html](../gallery/iconoir.html)

## Use the upstream package directly

Install `iconoir` (see options above) or reference via Iconify with the name `iconoir:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="iconoir:<name>" />
```

---
_Data vendored from `@iconify-json/iconoir` via `npm run fetch`. License: MIT — attribution belongs to the original authors (https://iconoir.com)._
