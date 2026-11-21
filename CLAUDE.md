# The Society Atlas — notes for Claude Code

- Static site, no build step, no dependencies. `dist/` is what the "Publish browser game" workflow deploys. Do not run that workflow or push to `main` unless asked.
- `dist/legacy/` is the first edition, frozen. Never edit it. V2 loads eight of its modules at runtime (data, landmarks, architecture, challenge, research, quotes, campus-play, tutorial).
- V2 lives in `dist/index.html`, `dist/css/v2.css`, `dist/js/*.js`. Script order is in `index.html`; everything hangs off `window.SA`.
- Add a campus or an encounter in `dist/js/pack2.js` (it shows the whole pattern: plan, visit, encounter, sources, task, secrets, music, lab). Give a famous building a recipe in `dist/js/signature.js`, keyed by the building's name.
- Saves: V2 uses `society-atlas-v2`; the V1 key `society-atlas-v1` is read once for migration and never written.
- Checks: `node tests/v2-content.cjs`; `for f in tests/legacy/*.cjs; do node "$f"; done`; `node tools/check-research.cjs`. Dev pages: `tools/viewer.html?uni=oxford`, `tools/gallery.html`.
- People: scholars are real and their dialogue is labelled dramatization. Mentors, residents and all play data are invented. Keep sources real and linked, and keep `docs/NEW_ENCOUNTERS_REVIEW.md` current.
- State of the build: `docs/PROGRESS.md`.
