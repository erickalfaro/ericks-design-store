# Lucide

> Clean, consistent open-stroke line icons (a Feather fork). The shadcn/ui default. Best all-round pick for modern web apps.

| | |
|---|---|
| **Iconify prefix** | `lucide` |
| **Icons (offline)** | 1,803 (+216 aliases) |
| **License** | ISC |
| **Home** | https://lucide.dev |
| **npm** | `lucide / lucide-react / lucide-vue-next / lucide-svelte` |

**When to use:** Default choice for clean line UIs, dashboards, SaaS, shadcn-based projects. Adjustable stroke width.

## Grab an icon from this repo (no install needed)

```bash
node scripts/icon.mjs lucide:<name>                 # raw SVG
node scripts/icon.mjs lucide:<name> --format jsx    # React component
node scripts/icon.mjs lucide:<name> --format vue    # Vue SFC
node scripts/icon.mjs lucide:<name> --format svelte # Svelte component
node scripts/icon.mjs --search <term> --set lucide  # find a name
```

Browse visually: [gallery/lucide.html](../gallery/lucide.html)

## Use the upstream package directly

Install `lucide` (see options above) or reference via Iconify with the name `lucide:<name>`:

```jsx
// @iconify/react — no per-icon install, pulls from the Iconify API/offline bundle
import { Icon } from '@iconify/react';
<Icon icon="lucide:<name>" />
```

---
_Data vendored from `@iconify-json/lucide` via `npm run fetch`. License: ISC — attribution belongs to the original authors (https://lucide.dev)._
