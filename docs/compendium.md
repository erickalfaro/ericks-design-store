# The Compendium Model — how this grows beyond icons

**Icons are the first domain, not the purpose.** This repo is built to become the single offline
source for *every* design decision across Erick's web apps and IoT projects. The icon system you
see today is one instance of a repeatable pattern; every future domain plugs in the same way.

**Avatars are domain two — the pattern's first repeat.** They proved the model works for a *different
shape* of problem: icons are a fixed catalog, avatars are **generators** (seed → image). Nothing about
the icon layers changed. See [docs/avatars/index.md](avatars/index.md) — data is
`scripts/avatars-core.mjs` → `data/avatars/registry.json`, tooling is `scripts/avatar.mjs`, docs are
`docs/avatars/`, and the skill is `.claude/skills/design-avatars/`.

## The repeatable domain pattern

Each design domain follows the same four-layer shape that icons already use:

| Layer | Icons (today) | Any new domain |
|---|---|---|
| **1. Offline data** — source of truth | `data/<prefix>.json` (Iconify JSON) | `data/<domain>/…` (tokens JSON, scales, specs) |
| **2. Tooling** — turn data into output | `scripts/icon.mjs` (render/search) | `scripts/<domain>.mjs` (generate/lookup/convert) |
| **3. Docs** — reference + when-to-use | `docs/<prefix>.md` | `docs/<domain>/…` |
| **4. Skill** — how Claude uses it | `.claude/skills/design-icons/` | `.claude/skills/design-<domain>/` |

**Rule of thumb:** data is vendored and offline; tooling never hand-rolls what a library already
does well (icons reuse `@iconify/utils`); docs carry the "when to use" judgment; a skill makes it
reachable from any project. Add a domain by repeating those four layers — nothing about the icon
system needs to change.

## Planned domains

These are the natural next layers of the compendium. Each is additive — same pattern, new folder.

| Domain | What it would hold | Likely data / tooling |
|---|---|---|
| **Color** | Palettes, semantic tokens, light/dark + theme ramps, contrast (WCAG) checks | token JSON → CSS vars / Tailwind theme / Style Dictionary output |
| **Typography** | Type scales, font pairings, fluid clamp() ramps, line-height/measure rules | scale JSON → CSS / Tailwind / design tokens |
| **Spacing & layout** | Spacing scale, radii, shadows, breakpoints, grid presets | token JSON → CSS vars / Tailwind |
| **Components** | Reusable UI patterns (buttons, forms, cards, nav) as copy-paste snippets | shadcn-style registry refs + vendored examples |
| **Motion** | Easing curves, duration scales, transition presets (pairs with Lucide Animated) | token JSON + example components |
| **IoT / device UI** | Patterns for small screens, e-ink, dashboards, status/telemetry, offline-first states | docs + component snippets + device-aware tokens |
| **Imagery & illustration** | Sources, license-clean illustration/3D/pattern libraries, usage guidance | docs + (optionally) vendored assets |

> **Built so far:** Icons (domain one) · Avatars (domain two). The domains above are the remaining
> blueprint — none built yet. When a project needs one, stand it up using the four-layer pattern above
> and surface it through a `design-<domain>` skill.

## Why this matters

Because the structure is fixed and the pattern is proven, the compendium can absorb new design
concerns **without restructuring** — each addition is a self-contained folder + skill. The payoff
compounds: every project Erick builds pulls from one consistent, offline, version-pinned design
source instead of re-deciding colors, type, spacing, and icons from scratch each time.
