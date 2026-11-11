# The Society Atlas

A browser research adventure across eighteen university encounters. Start with the recommended hands-on tutorial, explore the campuses, investigate the research problems, and build a proposal for Bellwether.

[Play the game](https://cantayus.github.io/society-atlas/)

The game runs entirely from `dist/`, with local artwork, photographs and music. It needs no server, account, model API, dependency installation or build step.

## Publishing updates

Keep GitHub Pages configured to **GitHub Actions**. Open **Actions → Publish browser game → Run workflow** to publish the current `main` branch. This workflow runs manually, so a source commit alone does not publish an update.

## Saves

Export your journey from the Field Notebook before moving from another host, then import it here. Saves belong to their browser origin and do not move automatically between the original preview, GitHub Pages and a future custom domain.

## Sources and verification

Media credits, individual license notices, architectural references and quotation sources are included in `dist/assets/` and the in-game notebook. The deployment guide retains the portrait redistribution notes. `Verification.txt` records checks on the approved build before this GitHub publication.

Run `node --test tests/*.test.cjs` and `node tools/check-research.cjs` for the included checks. Deployment and future custom-domain instructions are in `DEPLOYMENT.txt`.
