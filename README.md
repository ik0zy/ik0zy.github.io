# ik0zy.github.io

Personal portfolio of Mohammad Saidul Islam — **v3 "MSI//BENCHMARK"**: the portfolio
as a runnable evaluation suite. Visitors don't read about the work; they run it:

- **Test 01 · Vision** — drop any image → real Error Level Analysis heatmap, computed entirely in the browser (canvas re-encode + per-pixel diff, ~zero dependencies)
- **Test 02 · Prediction** — guess his finishing rank in a 1,564-team Kaggle competition, watch the reveal
- **Test 03 · Automation** — UIU-Calendar's PDF-chaos → clean-CSV trick, demonstrated live

Completing tests fills an **Evaluation Report** scorecard (persisted in localStorage,
copy-paste line for sharing). Full documentation sections (record, publication,
projects, skills, contact) stay in the DOM for recruiters and ATS.

**Live:** https://ik0zy.github.io

## Design history

| Version | Concept | Branch |
|---|---|---|
| v1 | Analytics report (light editorial) | `design-v1-analytics` |
| v2 | Telemetry (dark instrument panel) | `design-v2-telemetry` |
| v3 | **Benchmark suite (current)** | `master` |

## Stack

- Plain HTML + CSS + vanilla JS. No frameworks, no build step, no external requests.
- Fonts self-hosted in `assets/fonts/` (Archivo variable, IBM Plex Mono 400/500/600).
- ELA forgery analysis is hand-rolled canvas code — no ML model, honestly labeled as a technique demo.
- Animations respect `prefers-reduced-motion`.

## Editing

Content lives in `index.html`. Preview locally:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Commit and push — GitHub Pages redeploys automatically (branch: `master`, root).

## Structure

```
index.html        all content + test markup
css/style.css     design system + layout
js/main.js        scroll reveals
js/tests.js       ELA engine, rank game, CSV typing, scorecard
assets/cv.pdf     downloadable résumé
assets/fonts/     self-hosted woff2 files
```
