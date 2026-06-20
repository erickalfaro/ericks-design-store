# vendor/lucide-animated

A single, self-authored **reference component** (`bell.tsx`) that demonstrates the pattern
behind animated Lucide icons: a Lucide SVG whose elements are animated with **Motion**
(`motion/react`) on hover.

This is here so you (and Claude) can see the shape of one of these components without a
network round-trip. **It is not the real catalog.** For production icons, pull tuned
components from the upstream registry:

```bash
npx shadcn@latest add "https://lucide-animated.com/r/<icon-name>.json"
```

- Catalog: https://lucide-animated.com  ·  Original: https://icons.pqoqubbw.dev (pqoqubbw/icons)
- License: MIT (both the upstream project and this example)
- Requires: `react`, `motion` (`npm i motion`)

See [../../docs/lucide-animated.md](../../docs/lucide-animated.md) for full usage.
