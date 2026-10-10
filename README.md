# ik0zy.github.io — v6 "TRAINING RUN"

Live training-run portfolio of Mohammad Saidul Islam — UIU data-science undergrad,
**Kaggle Competitions Expert (40/1,564, top 3%)**, IEEE ICCIT'25 published, 2× Kaggle 1st place.

The page trains in front of you: loss canvas drops 1.00 → 0.21, rank counter
climbs 1,564 → 40, EXPERT stamp unlocks. No frameworks, no build step.

## What's inside

- **Hero live run** — `<canvas>` loss curve + rank ticker, animated on first view
  (3-second Twitter hook, screen-recordable with zero scroll)
- **Epoch 01 · Runs** — interactive ablation lab: toggle TTA / Ensemble / Transfer,
  leaderboard rank + bell curve recompute live. Auto-demos once on scroll.
- **Epoch 02 · Paper** — BnSFD YOLOv12 detector demo (pure CSS boxes + scanline),
  links to IEEE Xplore `11490261`
- **Epoch 03 · Builds** — UIU-Calendar terminal typing demo + project card
- **Epoch 04 · Log** — experience / education timeline
- **Epoch 05 · Stack** — honestly-graded skill bars
- **Epoch 06 · Contact** — big email CTA, copy-link, `Post this run on 𝕏` intent
- **Systems** — ⌘K command palette, konami easter egg, tmux status bar
  (progress + live section + clock), boot overlay, `prefers-reduced-motion` everywhere

## Design history

| Version | Concept | Branch |
|---|---|---|
| v1 | Analytics report (light editorial) | `design-v1-analytics` |
| v2 | Telemetry (dark instrument panel) | `design-v2-telemetry` |
| v3 | Benchmark suite (runnable evaluation) | `design-v3-benchmark` |
| v4 | Disco Elysium CRPG character sheet | `design-v5` parent work |
| v5 | Field Survey — topographic map | `archive/v5-field-survey` + tag `v5-field-survey-final` |
| v6 | **Training Run — live lab (current)** | `design-v6-training-run` → `master` |

## Stack

- Plain HTML + CSS + vanilla JS. One `<canvas>`, zero external requests.
- Fonts self-hosted: Fraunces, IBM Plex Mono, Archivo (`assets/fonts/`).
- OG card generated with PIL: `assets/og-image.png` (1200×630, ~70KB).

## Editing

Content lives in `index.html`; behaviour in `js/main.js`. Preview:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Commit and push — GitHub Pages redeploys automatically (branch: `master`, root).

## Structure

```
index.html          all content
css/style.css       v6 dark-lab design system
js/main.js          loss canvas, lab sim, detector, terminal, palette, sbar
assets/og-image.png twitter/og share card (1200×630)
assets/favicon.svg  loss-curve mark
assets/cv.pdf       downloadable résumé
assets/fonts/       self-hosted woff2
```
