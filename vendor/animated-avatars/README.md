# vendor/animated-avatars

A single, self-authored **reference component** (`AnimatedAvatar.tsx`) that demonstrates how to
animate a generated avatar with **Motion** (`motion/react`) — the same static-source + motion-wrapper
pattern as [`../lucide-animated/`](../lucide-animated/).

**Why this exists:** no avatar *generator* animates natively (see
[../../docs/avatars/animation.md](../../docs/avatars/animation.md)). The avatar is generated **once**
as static SVG; the wrapper animates. This file shows the shape of that in React.

```tsx
import { AnimatedAvatar } from "@/vendor/animated-avatars/AnimatedAvatar";

// svg from:  node scripts/avatar.mjs lorelei:erick
//        or: createAvatar(lorelei, { seed: "erick" }).toString()
<AnimatedAvatar svg={svg} motionType="hover" size={96} />   // enter | idle | hover
```

Also exports `ShufflingAvatar` — a "rolling identity / generating…" effect that leans on generation
being instant and deterministic (swap the seed on a decelerating timer, then settle).

- Requires: `react`, `motion` (`npm i motion`)
- License: MIT (this example). Each generated avatar keeps its **style's** license — see
  [../../docs/avatars/styles.md](../../docs/avatars/styles.md).

**No-build version:** for plain HTML (CSS animations, no React), open the runnable mini demo at
[`../../gallery/avatars-animated.html`](../../gallery/avatars-animated.html) — every pattern there is
copy-paste CSS. Full guidance: [../../docs/avatars/animation.md](../../docs/avatars/animation.md).
