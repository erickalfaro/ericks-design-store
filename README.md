# Erick's Design Store

**The one offline design compendium for every project — web apps & IoT.** A single source for
the design decisions that otherwise get re-made from scratch each time: icons and avatars today;
color, typography, spacing, components, motion, and IoT/device UI patterns next — all behind the
same repeatable pattern (offline data → tooling → docs → a Claude skill).

> **This is a growing compendium, not an icon dump.** Icons are simply **domain one**; **avatars**
> are domain two. New design domains plug in the same way without restructuring — see
> **[docs/compendium.md](docs/compendium.md)** for the model and the planned domains.

## Domain one — Icons

**44,000+ icons across 11 open-source sets** are vendored locally as compact Iconify JSON, plus a
CLI and a Claude skill that render any icon to **SVG / React / Vue / Svelte / Iconify name** on
demand. No per-project icon dependency, no network, no hundreds of thousands of loose SVG files.

## Domain two — Avatars

**45 generated-avatar styles** across 6 families (pixel, identicons, illustrated characters,
abstract, initials, robots), reusing proven libraries (DiceBear, jdenticon, Minidenticons,
Multiavatar, Boring Avatars, Blockies, Big Heads, react-nice-avatar). Feed any **seed** (name,
email, id, hash) and get a **deterministic** avatar as **SVG / data-URI / PNG** — fully offline, no
hosted API. The same generator core powers both the CLI and a **live seed-driven browser**.

```bash
node scripts/avatar.mjs --list                       # all 45, grouped by family + license
node scripts/avatar.mjs lorelei:erick                # SVG (default)
node scripts/avatar.mjs bottts:acme --size 128 --format datauri
open gallery/avatars.html                            # type a seed → everything re-renders live
```

Details: [`docs/avatars/`](docs/avatars/) · registry: [`data/avatars/registry.json`](data/avatars/registry.json).
**Native animation?** None of them — the whole ecosystem is static; animate one yourself
(CSS/Motion). Full finding: [`docs/avatars/animation.md`](docs/avatars/animation.md).

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
data/        icons: Iconify JSON (1 per set) + meta.json  ·  avatars/registry.json  — source of truth
scripts/     icons: fetch-icons · icon · build-gallery · fetch-full-iconify
             avatars: avatars-core (shared generators) · avatar (CLI) · avatars-browser · build-avatar-gallery
gallery/     generated HTML — index + per-set icon pages; avatars.html (live seed-driven)
docs/        icons: per-set + lucide-animated + aggregators  ·  avatars/ (index · animation · styles)
vendor/      lucide-animated reference component
.claude/     the design-icons + design-avatars skills
```

## Updating

```bash
npm run fetch      # re-pull latest icons from @iconify-json/* (jsDelivr)
npm run gallery    # regenerate icon gallery + per-set docs
npm run avatars    # regenerate avatar gallery + registry + styles.md
npm run build      # all of the above
```

## License

Original code/docs/config in this repo: **MIT** — see [LICENSE](LICENSE). Each bundled icon set
keeps its **own** license (MIT / ISC / Apache-2.0 — all commercial-friendly); attribution belongs
to the original authors. Full per-set attribution: [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)
(and each `docs/<prefix>.md`). This repo only vendors their published data and adds tooling on top.

## A growing compendium (this is the point)

Icons are **domain one**, avatars **domain two**. The repo is deliberately structured so every
other design concern plugs in the **same four-layer way** — and existing domains never have to change:

| Layer | What it is | Icons | Avatars |
|---|---|---|---|
| **Data** | vendored, offline source of truth | `data/<prefix>.json` | `data/avatars/registry.json` + `scripts/avatars-core.mjs` |
| **Tooling** | turns data into usable output | `scripts/icon.mjs` | `scripts/avatar.mjs` |
| **Docs** | reference + when-to-use judgment | `docs/<prefix>.md` | `docs/avatars/` |
| **Skill** | how Claude pulls it into any project | `.claude/skills/design-icons/` | `.claude/skills/design-avatars/` |

**Planned domains** (blueprint, not yet built): **Color** · **Typography** · **Spacing & layout**
· **Components** · **Motion** · **IoT / device UI** · **Imagery**. Each becomes a self-contained
folder + `design-<domain>` skill — no restructuring.

→ Full model, the repeatable pattern, and per-domain plans: **[docs/compendium.md](docs/compendium.md)**.

The payoff compounds: every project pulls from one consistent, offline, version-pinned design
source instead of re-deciding icons, color, type, and spacing from scratch each time.
