# Birds vs. Everything

A field notebook about a flock that learns to leave. Staff the birds, spend the stores, and decide what the route is for.

The design, including the critique of the previous game and the pacing targets, is in [docs/DESIGN.md](docs/DESIGN.md).

## Play

The live game stays at the site root until the rebuild is merged:

[Birds vs. Everything](https://slopapocalypse-harbinger.github.io/incremental-game/)

The playtest build is published from `cursor/birds-rebuild-233d`. GitHub Pages only accepts deploys from branches allowed on the `github-pages` environment, and this branch is not one of them, so `/next/` is not on the live site yet.

Until that environment allows the branch, the same build is committed under `playtest/` and can be opened here:

[Playtest](https://htmlpreview.github.io/?https://raw.githubusercontent.com/slopapocalypse-harbinger/incremental-game/cursor/birds-rebuild-233d/playtest/index.html)

GitHub Pages rejected a deploy from this branch (the `github-pages` environment only allows selected branches), so the live game is untouched. The link above is the playtest. Scripts and styles load from jsDelivr, which sends the right file types; the page itself is the `playtest/` build on this branch.

## Run locally

```bash
pnpm install
pnpm dev
```

The dev server opens at `http://localhost:5173/`. Progress is stored in this browser under `bve.campaign`.

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm build` writes the Pages site to `dist-pages/` and does not include `playtest/`. `pnpm playtest:check` rebuilds the phone bundle and fails if the committed copy drifted. Remove `playtest/` before or when this branch merges.

## Saves

This campaign does not read the previous game's save (`birds-vs-everything-v3`). That key is left in place. Export from the notebook before you clear browser data; import asks you to confirm before it replaces the run.
