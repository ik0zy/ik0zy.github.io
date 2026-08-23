# ik0zy.github.io

Personal portfolio of Mohammad Saidul Islam — **v2 "Telemetry"**: a dark instrument-panel
take on the same data. Monospace-led, phosphor-amber accent, live Dhaka clock,
hand-drawn SVG event timeline.

The previous light "analytics report" design is preserved on the
[`design-v1-analytics`](https://github.com/ik0zy/ik0zy.github.io/tree/design-v1-analytics)
branch (tag: `v1-analytics-report`).

**Live:** https://ik0zy.github.io

## Stack

- Plain HTML + CSS + vanilla JS. No frameworks, no build step, no external requests.
- Fonts self-hosted in `assets/fonts/` (Archivo variable, IBM Plex Mono 400/500/600).
- Charts are inline SVG drawn by hand, not a chart library.
- Auto dark mode via `prefers-color-scheme`; animations respect `prefers-reduced-motion`.

## Editing

Content lives directly in `index.html`. After editing:

```sh
# preview locally
python3 -m http.server 8000
# then open http://localhost:8000
```

Commit and push — GitHub Pages redeploys automatically (branch: `master`, root).

## Structure

```
index.html        all content
css/style.css     design system + layout
js/main.js        scroll reveals + stat count-ups (~80 lines)
assets/cv.pdf     downloadable résumé
assets/fonts/     self-hosted woff2 files
```
