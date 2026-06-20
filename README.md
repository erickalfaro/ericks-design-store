# Erick's Design Store

**The one offline design compendium for every project — web apps & IoT.** A single source for
the design decisions that otherwise get re-made from scratch each time: icons today; color,
typography, spacing, components, motion, and IoT/device UI patterns next — all behind the same
repeatable pattern (offline data → tooling → docs → a Claude skill).

> **This is a growing compendium, not an icon dump.** Icons are simply **domain one**. The whole
> point of the structure is that new design domains plug in the same way without restructuring —
> see **[docs/compendium.md](docs/compendium.md)** for the model and the planned domains.

## Domain one — Icons

**44,000+ icons across 11 open-source sets** are vendored locally as compact Iconify JSON, plus a
CLI and a Claude skill that render any icon to **SVG / React / Vue / Svelte / Iconify name** on
demand. No per-project icon dependency, no network, no hundreds of thousands of loose SVG files.

## Why this exists (the architecture)

Instead of either downloading every raw `.svg` (hundreds of thousands of files, goes stale) or
keeping link-only references (rot, need network), this repo takes a **hybrid** approach:

- **`data/`** — the official Iconify JSON for each set (1 file per set, ~19 MB total). The
  authors' own structured data: every icon's paths, viewBox, metadata. Offline source of truth.
- **`scripts/icon.mjs`** — renders any icon from that data into the format you need, using
  `@iconify/utils` (no hand-rolled SVG parsing).
- **`gallery/`** — a browsable HTML gallery (search + click-to-copy) for finding icons visually.
- **`docs/`** — per-set reference (license, links, install snippets, when-to-use).
- **`.claude/skills/design-icons/`** — a Claude skill so any project can pull icons through me.

## Quickstart

```bash
npm install            # one-time: @iconify/utils + @svgr (dev tooling only)
npm run build          # = npm run fetch && npm run gallery
```

Then:

```bash
# Find an icon
node scripts/icon.mjs --search arrow-right --set tabler

# Render it
node scripts/icon.mjs lucide:home                  # raw SVG
node scripts/icon.mjs ph:heart-fill --format jsx   # React
node scripts/icon.mjs tabler:bell --format vue      # Vue
node scripts/icon.mjs heroicons:user --format svelte
node scripts/icon.mjs material-symbols:settings --format iconify

# Browse visually
open gallery/index.html      # (xdg-open on Linux)
```

Options: `--size N`, `--color CSS`, `--stroke W`, `--name CompName`.

## The sets

| Prefix | Set | License | | Prefix | Set | License |
|---|---|---|---|---|---|---|
| `lucide` | Lucide | ISC | | `material-symbols` | Material Symbols | Apache-2.0 |
| `ph` | Phosphor | MIT | | `ri` | Remix Icon | Apache-2.0 |
| `tabler` | Tabler | MIT | | `bi` | Bootstrap Icons | MIT |
| `heroicons` | Heroicons | MIT | | `iconoir` | Iconoir | MIT |
| `radix-icons` | Radix Icons | MIT | | `bx` | Boxicons | MIT |
| `feather` | Feather | MIT | | *(special)* | [Lucide Animated](docs/lucide-animated.md) | MIT |

Per-set details: [`docs/`](docs/). Live registry: [`data/meta.json`](data/meta.json).
Aggregators & the full 200k-icon catalog: [`docs/aggregators.md`](docs/aggregators.md).

## Layout

```
data/        vendored Iconify JSON (1 per set) + meta.json registry  — source of truth
scripts/     fetch-icons · icon (render/search) · build-gallery · fetch-full-iconify
gallery/     generated browsable HTML (index + per-set, search + click-to-copy)
docs/        per-set reference + lucide-animated + aggregators
vendor/      lucide-animated reference component
.claude/     the design-icons skill
```

## Updating

```bash
npm run fetch      # re-pull latest icons from @iconify-json/* (jsDelivr)
npm run gallery    # regenerate gallery + per-set docs
```

## License

Original code/docs/config in this repo: **MIT** — see [LICENSE](LICENSE). Each bundled icon set
keeps its **own** license (MIT / ISC / Apache-2.0 — all commercial-friendly); attribution belongs
to the original authors. Full per-set attribution: [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)
(and each `docs/<prefix>.md`). This repo only vendors their published data and adds tooling on top.

## A growing compendium (this is the point)

Icons are **domain one**. The repo is deliberately structured so every other design concern plugs
in the **same four-layer way** — and the icon system never has to change:

| Layer | What it is | Icons (today) |
|---|---|---|
| **Data** | vendored, offline source of truth | `data/<prefix>.json` |
| **Tooling** | turns data into usable output | `scripts/icon.mjs` |
| **Docs** | reference + when-to-use judgment | `docs/<prefix>.md` |
| **Skill** | how Claude pulls it into any project | `.claude/skills/design-icons/` |

**Planned domains** (blueprint, not yet built): **Color** · **Typography** · **Spacing & layout**
· **Components** · **Motion** · **IoT / device UI** · **Imagery**. Each becomes a self-contained
folder + `design-<domain>` skill — no restructuring.

→ Full model, the repeatable pattern, and per-domain plans: **[docs/compendium.md](docs/compendium.md)**.

The payoff compounds: every project pulls from one consistent, offline, version-pinned design
source instead of re-deciding icons, color, type, and spacing from scratch each time.
