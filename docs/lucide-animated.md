# Lucide Animated

> 350+ animated React icons built on **Lucide** + **Motion** (Framer Motion). MIT licensed.

**This set is different from the other 11.** It ships as **React/TypeScript components with motion**, not static SVG files — so it does **not** go through `data/` or `scripts/icon.mjs`. There is nothing to "render to SVG"; the value is the animation. Use the upstream registry instead.

| | |
|---|---|
| **Home** | https://lucide-animated.com |
| **Original project** | pqoqubbw/icons — https://icons.pqoqubbw.dev |
| **Stack** | React + TypeScript + `motion` |
| **License** | MIT |

## Install one icon (shadcn CLI — recommended)

```bash
npx shadcn@latest add "https://lucide-animated.com/r/<icon-name>.json"
```

This drops a single component into `components/icons/<icon-name>.tsx` and adds `motion` to your deps if missing. Then:

```tsx
import { Activity } from "@/components/icons/activity";

export function Demo() {
  return <Activity className="size-6" />;
}
```

Standard SVG props (`className`, `onClick`, `aria-label`, …) work on every component. Browse the catalog at https://lucide-animated.com to find `<icon-name>` values.

## Copy-paste (no CLI)

Every icon is copy-paste ready — open the icon on the site and copy its component source directly into your project.

## Reference pattern in this repo

[vendor/lucide-animated/](../vendor/lucide-animated/) contains a small, self-authored **example** component (`bell.tsx`) showing the structure these animated icons follow (a Lucide SVG whose strokes/groups are driven by `motion` on hover). It's a teaching reference, not a replacement for the upstream catalog — for real icons, use the CLI/copy-paste above so you get the authors' tuned animations.

## When to use

Micro-interactions on interactive affordances — buttons, nav items, toggles, empty states, onboarding. For static UI chrome, prefer plain [Lucide](lucide.md) (same visual language, zero animation cost).
