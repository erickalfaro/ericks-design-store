# Remix Icon

> Neutral system icons on a 24px grid, each available in Line and Fill variants. Strong brand/logo coverage.

| | |
|---|---|
| **Iconify prefix** | `ri` |
| **Icons (offline)** | 3,229 (+15 aliases) |
| **License** | Apache-2.0 |
| **Home** | https://remixicon.com |
| **npm** | `remixicon / @remixicon/react / @remixicon/vue` |

**When to use:** When you want paired line+fill variants (e.g. active/inactive tab states) and good logo/brand glyph coverage.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs ri:<name>                 # raw SVG
node scripts/icon.mjs ri:<name> --format jsx    # React component
node scripts/icon.mjs ri:<name> --format vue    # Vue SFC
node scripts/icon.mjs ri:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set ri  # find a name
```

Browse visually: [gallery/ri.html](../gallery/ri.html)

## Use the upstream package directly

Install `remixicon` (see options above) or reference via Iconify with the name `ri:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="ri:<name>" />
```

---
_Data vendored from `@iconify-json/ri` via `npm run fetch`. License: Apache-2.0 — attribution belongs to the original authors (https://remixicon.com)._
