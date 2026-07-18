# Doom status face archive

`gallery/doom-faces.html` is a zero-dependency viewer for the original Doom PC status-face
states. It works when opened directly from disk: no build step, server, web font, CDN, or package
install is required.

The companion `gallery/doom-context.html` is a satirical animated chat visualization. It stages a
seven-turn conversation, fills a fake 128K context meter, and uses the progressively bloodier face
tiers as both agent telemetry and the per-turn loading animation.

## Open the viewer

```bash
xdg-open gallery/doom-faces.html
xdg-open gallery/doom-context.html
```

Each card can be paused and exported as GIF89a. The face-plate control determines whether exports
include Doom's green player background or retain transparent pixels. Exports always use original
35 Hz timing even if the preview speed is changed.

## Re-extract from another WAD

The checked-in PNGs came from the freely distributable Doom shareware v1.9 `DOOM1.WAD`. Its
SHA-256 is `1d7d43be501e67d927e415e0b8f3e29c3bf33075e859721816f652a526cac771`.

To use a legally owned retail WAD instead:

```bash
node scripts/extract-doom-faces.mjs /path/to/DOOM.WAD
```

The extractor reads every `STF*` lump, decodes Doom's patch-column format, applies the first
`PLAYPAL` palette, and writes both JSON and classic-script manifests. It deliberately uses only
Node built-ins.

## What is faithful to vanilla

- Doom's widget clock runs at 35 tics per second.
- Idle direction is `M_Random() % 3` and holds for `TICRATE / 2` (17 tics).
- Turns, pain, and OUCH hold for 35 tics.
- A new-weapon evil grin holds for 70 tics.
- Sustained firing waits 70 tics before selecting `STFKILL*`.
- Health uses five pain tiers: 80+, 60–79, 40–59, 20–39, and 1–19.
- Patch left/top offsets are honored inside the original 35×31 face plate, avoiding frame jitter.
- The original OUCH sign bug is shown separately from the intended/fixed heavy-damage reaction.

Original PC Doom does **not** have a dedicated blink sprite or blink branch. `STFST*0`, `*1`, and
`*2` are three eye directions. The viewer does not fabricate a blink frame.

## Project layout

```text
data/doom-faces/animations.js       State sequences and 35 Hz timing
data/doom-faces/assets/             Extracted PNGs and generated manifests
gallery/doom-faces.html             Offline entry point
gallery/doom-faces/app.js           Playback, compositing, and GIF encoder
gallery/doom-faces/styles.css        Viewer presentation
gallery/doom-context.html            Animated context-pressure demo
gallery/doom-context/                Demo presentation and playback
scripts/extract-doom-faces.mjs      Reproducible WAD extractor
```

## Sources and rights

Timing and priority rules are transcribed from id Software's GPL-released
[`st_stuff.c`](https://github.com/id-Software/DOOM/blob/master/linuxdoom-1.10/st_stuff.c), and the
idle preview uses the released [`m_random.c`](https://github.com/id-Software/DOOM/blob/master/linuxdoom-1.10/m_random.c)
table. The source code and the WAD artwork have separate rights.

Viewer/extractor code in this repository is MIT. Doom artwork is © id Software / ZeniMax. The
shareware WAD's distribution clarification is preserved by
[Debian's `doom-wad-shareware` package](https://sources.debian.org/src/doom-wad-shareware/1.9.fixed-2/debian/copyright/).
