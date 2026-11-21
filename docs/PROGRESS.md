# The Society Atlas V2 — state of the build

Branch `v2-upgrade`. The first edition is frozen at `dist/legacy/` and linked from the title page.

## Built and tested
- Isometric campus engine (Canvas 2D, no build step, no dependencies): 27 universities and the fictional city of Bellwether, each with its own hand-laid plan, seasons, day and night, traffic, boats, wildlife and crowds.
- 37 research encounters: the first edition's 18 (labs reused unchanged), 12 added scholars, and 7 visits outside the United States (Oxford, Cambridge, Zurich, Kyoto, Peking, Cape Town, Toronto) alongside Lund and Paris.
- Signature buildings (`dist/js/signature.js`): about fifty hand-written recipes for the buildings people recognise, with caricatured proportions.
- Play loop: directory, office, fieldwork on foot (one task per encounter), research problem, Gazette, travel with events on the way, Bellwether hub and the colloquium after eighteen methods.
- Three mentor characters (senior PhD students) with animated portraits and an event-driven, rate-limited line queue.
- Sound: synthesized effects and ambience; 29 original modal pieces (one per campus, the title page and Bellwether).
- Caricature portraits for the 27 scholars who had photographs in the first edition (`tools/make-caricatures.py`).
- Two campus secrets on every campus, five field sketches per visit, stamps, archive cards, achievements.
- Save migration from the first edition (read-only), export and import.
- Title screen: a board of menu plaques over a live campus. All text given a plain-language pass, including the first edition's encounter text as V2 shows it (`dist/js/voice.js`).

## Not built, or needs you
- Portraits for the 19 added scholars are monogram placeholders. Put a photograph of each in a folder and run `python3 tools/make-caricatures.py SRC OUT`.
- Sources for the added encounters need your eye: see `docs/NEW_ENCOUNTERS_REVIEW.md`.
- The licence ledger for the original portraits is unchanged from the first edition.
- No fog of exploration (removed so the campuses are visible), no rain, no shop or cosmetics.
- Not yet tried on phones or with a screen reader; frame rate was only measured in a software-rendered test browser.
- Nothing has been pushed to GitHub or deployed.

## Checks
- `node tests/v2-content.cjs` — every campus generates, buildings do not overlap, every point of interest is reachable, each campus has two secrets and a score whose phrases are exactly four bars, every encounter has a task, a lab, a visit and a source; save migration.
- `for f in tests/legacy/*.cjs; do node "$f"; done` and `node tools/check-research.cjs` — first-edition tests, unchanged.
- Browser playthrough of encounter 1 from title page to Gazette, and a smoke run of labs 19–37 (headless Chrome).
