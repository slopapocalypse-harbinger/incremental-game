# Birds vs. Everything

A field notebook about a flock that learns to leave. Staff the birds, spend the stores, and decide what the route is for.

The design, including the critique of the previous game and the pacing targets, is in [docs/DESIGN.md](docs/DESIGN.md).

## Play

The live game stays at the site root until the rebuild is merged:

[Birds vs. Everything](https://slopapocalypse-harbinger.github.io/incremental-game/)

The playtest build is published from `cursor/birds-rebuild-233d` at:

[Playtest](https://slopapocalypse-harbinger.github.io/incremental-game/next/)

That playtest keeps the previous game at the root and serves this one from `/next/`. After the playtest branch is merged, remove it from `.github/workflows/deploy-pages.yml`. A later push to that branch would put the old game back at the root.

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

`pnpm build:preview` builds the previous game at the site root and this one under `dist-pages/next/`.

## Saves

This campaign does not read the previous game's save (`birds-vs-everything-v3`). That key is left in place. Export from the notebook before you clear browser data; import asks you to confirm before it replaces the run.
