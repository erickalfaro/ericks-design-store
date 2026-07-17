# Animated avatars — the finding

> **Short answer: there are none.** Every avatar *generator* in this domain — and every reference-only
> option in the broader landscape — outputs a **static** image (SVG or PNG). None ship native
> animation. This page records what was checked, and how to add motion yourself when you need it.

## What "native animation" would mean

A generator with native animation would emit animated output *out of the box*: SMIL `<animate>` inside
the SVG, CSS `@keyframes` embedded in the markup, a canvas/JS animation loop, Lottie, or an animated
GIF/APNG. "It returns an SVG you *could* animate with your own CSS" does **not** count — by that measure
every SVG avatar qualifies, which is meaningless.

## The audit

Each candidate was checked two ways: its output was **generated and scanned** for animation markers
(`<animate>`, `@keyframes`, `requestAnimationFrame`, `<style>`), and its README/source was read.

| Generator | Native animation? | Reality |
|---|---|---|
| **dither-avatar** (a.k.a. "dither-kit") | **No** | Despite the "dithering" name, output is one static `<svg>`. No `dither-kit` package exists; the animated "dither" projects online are unrelated photo/shader tools. |
| **DiceBear** (all 31 vendored styles) | **No** | Verified empirically — zero styles emit any animation marker. `toon-head`'s "animated-series look" is a *cartoon aesthetic*, not motion. |
| **Boring Avatars** (all 6 variants) | **No** | Static SVG. "Playful/beam" describes the look, not movement. |
| **Multiavatar** | **No** | Fixed path groups concatenated into a static SVG. |
| **Jdenticon, Minidenticons, identicon.js, Blockies** | **No** | Static identicons by definition. |
| **Big Heads** | **No** | `wink` / `dizzy` / `leftTwitch` are static expression *states*, not looping/blinking animation. |
| **react-nice-avatar, Avataaars (original), Personas, python_avatars** | **No** | Static SVG. |
| **Robohash** (hosted) | **No** | Its `.gif` output is a **single static frame**, not animation. |
| **UI Avatars** (hosted) | **No** | Static initials. |

**Result: 0 of the generators animate.** This isn't a gap in what was vendored — it's the shape of the
whole ecosystem. Avatar generators are hash→image functions; motion isn't part of the problem they solve.

## The only exceptions found (out of scope, reference-only)

Two lightly-maintained **third-party forks of Avataaars** add motion. They're *not* canonical packages and
aren't wired into this domain, but they're the only offline path to a natively-animated avatar:

- **`@gschoppe/avataaars`** — ships opt-in idle **CSS `@keyframes`**. Import its `dist/animations.css` and
  parts of the avatar animate on an always-on idle loop. React, offline. Self-described work-in-progress.
- **`@vierweb/avataaars`** — React state-driven **expression cycling** (`animationSpeed`) plus **on-hover**
  sequences (`hoverSequence` / `hoverScale`). Animates via React re-render, not embedded SVG animation.

If natively-animated avatars are a hard requirement, start there — but weigh their low maintenance against
the alternative below.

## How to animate a static avatar (recommended)

This is the same move the icon layer already uses: **Lucide Animated** wraps *static* Lucide icons in
`motion` components. Do the same for an avatar — generate it here, animate it in your app.

**1. CSS — cheapest, framework-free.** Great for entrance, idle bob, hover, or "generating…" states.

```html
<img class="avatar-pop" src="data:image/svg+xml;utf8,…"><!-- from: avatar.mjs <style>:<seed> --format datauri -->
<style>
  .avatar-pop { animation: pop .35s ease-out; }
  @keyframes pop { from { transform: scale(.7); opacity: 0 } to { transform: none; opacity: 1 } }
  .avatar-idle { animation: bob 3s ease-in-out infinite; }
  @keyframes bob { 50% { transform: translateY(-4px) } }
</style>
```

**2. Motion (Framer Motion) in React** — matches the Lucide Animated pattern in this repo:

```tsx
import { motion } from "motion/react";
const svg = /* generated once: createAvatar(lorelei, { seed }).toString() */;

export function Avatar({ svg }: { svg: string }) {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ rotate: [0, -4, 4, 0] }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
```

**3. Animate the seed, not the pixels.** Because generation is deterministic and instant, you can
*re-generate* on an interval to get a "shuffling identity" effect (loading, randomizer, raffle):

```js
setInterval(() => { img.src = generate('bottts', String(Math.random()), 64).dataUri; }, 120);
```

## Reference pattern in this repo

Two self-authored examples, mirroring how [`vendor/lucide-animated/`](../../vendor/lucide-animated/)
demonstrates animated icons:

- **Runnable mini demo (no build):** [`gallery/avatars-animated.html`](../../gallery/avatars-animated.html)
  — open it in a browser. Five CSS patterns (enter pop, idle float, hover wiggle, seed-shuffle,
  presence pulse) running on real generated avatars, each with the copy-paste CSS shown inline.
  Rebuilt by `npm run avatars`.
- **React + Motion component:** [`vendor/animated-avatars/AnimatedAvatar.tsx`](../../vendor/animated-avatars/AnimatedAvatar.tsx)
  — `<AnimatedAvatar svg={svg} motionType="enter|idle|hover" />`, plus a `ShufflingAvatar` for the
  "generating…" effect. Feed it SVG straight from `node scripts/avatar.mjs <style>:<seed>`.

## Rule of thumb

- Static UI (profiles, lists, comments) → a plain generated avatar. Zero animation cost.
- Micro-interaction (hover, appear, "generating…") → wrap it in CSS/Motion (above).
- Hard requirement for a *self-animating* avatar component → an Avataaars animation fork, eyes open to
  its maintenance state.

_See also: [docs/lucide-animated.md](../lucide-animated.md) — the same static-source + motion-wrapper
pattern for icons._
