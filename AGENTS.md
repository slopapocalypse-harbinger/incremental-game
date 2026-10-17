# Agents

Design, pacing, and Tom's open questions: [docs/DESIGN.md](docs/DESIGN.md). Do not change balance or design while those questions are open.

## Commands

Node `>=22.13` and pnpm `11.16.0` (`packageManager` in `package.json`).

```bash
pnpm install
pnpm dev          # http://localhost:5173/
pnpm build        # typecheck, then the GitHub Pages site in dist-pages/
pnpm test
pnpm lint
pnpm typecheck
pnpm test:layout    # Playwright: no document scroll at 390×844 and 412×915
pnpm build:playtest
pnpm playtest:check
```

## Map

- `src/game/` — pure simulation. `engine.ts` ticks, projects, doctrines, and objectives. `content.ts` holds roles, techs, projects, events, seasons, and every balance number. `guide.ts` is the opening, the tab gates, and the one-time tips. `save.ts` encodes, migrates, and loads. `types.ts` and `number.ts` are the shared shapes and formatting.
- `src/ui/` — React notebook. It calls the engine; it does not reimplement rules.
- `e2e/` — Playwright layout checks. They need Chromium (`pnpm exec playwright install chromium`).
- `src/main.tsx`, `index.html`, `public/` — the shell, manifest, and service worker.
- `tests/` — Vitest. `campaign.test.ts` is the campaign, saves, and pacing. `policy.ts` is the scripted player.
- `playtest/` — generated phone bundle. Do not edit it by hand.
- `docs/DESIGN.md` — the design.

## Conventions

- `engine.ts` stays pure and deterministic. Same state and same duration, same result. No `Date.now()`, no DOM, no randomness.
- Every balance number lives in `content.ts` (`TUNE`, costs, durations, event effects). The engine reads those values; it does not invent new ones.
- A save-format change bumps `SAVE_VERSION`, migrates older payloads in `save.ts`, and adds a test that a previous envelope still loads. A bad checksum or a damaged payload is quarantined, not deleted and not applied. The notebook (opening and tips) lives on the save. Do not make it change rates, costs, or the clock.
- Phone layout: at 390×844 and 412×915 the document must not scroll. Long lists scroll inside `.stage`. Keep tap targets at 44px and body copy at least 14px. Do not collapse the desktop three-column layout.
- On startup, delete `birds-vs-everything-v3` and `birdGameSave`. Do not read them, import them, or show a notice about them.

## Off limits

- Balance, act pacing, and the open questions in `docs/DESIGN.md`.
- Hand-edited files under `playtest/`.
- Shipping `playtest/` inside `dist-pages/` or the Pages artifact.

## Playtest and preview

`pnpm build` writes the Pages site to `dist-pages/` with base `/incremental-game/`. That build does not read `playtest/`. The deploy workflow rejects an artifact that contains a `playtest` directory or the playtest CDN URL.

`pnpm build:playtest` rebuilds `playtest/` for Tom's phone. `scripts/rewrite-playtest.mjs` points stylesheets and icons at jsDelivr and leaves the script relative, so [htmlpreview](https://htmlpreview.github.io/?https://raw.githubusercontent.com/slopapocalypse-harbinger/incremental-game/cursor/birds-rebuild-233d/playtest/index.html) can run it. `pnpm playtest:check` rebuilds and fails if `playtest/` differs. CI runs that check.

`vite build --mode preview` writes only the new game to `dist-pages/next/` with base `/incremental-game/next/`. It is not what Pages publishes today. The `github-pages` environment rejects this branch, so the phone URL above is the live preview.

Remove `playtest/`, `pnpm playtest:check`, and the htmlpreview link before or when this branch merges. The Pages site is `pnpm build` alone.
