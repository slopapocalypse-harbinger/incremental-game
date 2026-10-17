# Birds vs. Everything

A field notebook about a flock that learns to leave.

This is the design for the rebuild. The live game on `main` stays where it is until this replaces it. The critique below was checked against the source, not taken on faith.

## Critique of the current game

The current game wants to be a finite, strategic incremental: staff a flock, spend birds on commitments, pick a doctrine, and fly from a canopy to a galaxy. The tone, the five resources, the doctrines, and the living atlas are worth keeping. The campaign around them does not hold together.

**Time is not the time on screen.** `tickGame` multiplies every step by 2 (`dt = min(seconds, 10) * 2` in `app/game/engine.ts`). The resource chips show `calculateRates`, which does not include that factor, so every “/s” is half the real rate. The UI then caps each interval at 2 seconds. A background tab throttles or suspends `setInterval`, and the extra seconds are thrown away. Catch-up exists only when the page loads, and only for 4 hours. There is no visibility handler. Leave the tab open and switch away, and the flock simply loses the time.

**Repeatable work cannot be repeated.** `build-nest`, archives, beacons, roosts, arks, and the seedfall all have `visible()` limits (`nests < 12`, `archives < 3`, and so on). `getAvailableCommitments` also requires `!completed.includes(id)`, and finishing any of them writes that id into `completed`. The second nest is impossible. The tests even lock this in. The `visible()` ceilings are dead.

**The ending can be unreachable.** With those one-shot buildings, a run that does everything the UI allows ends around 2 nests, 2 roosts, 1 archive, 2 beacons, 2 solar nests, and a handful of systems. Seed storage in that shape is about 5,060, or 7,590 with Reserve Granaries. The Great Murmuration costs 7,200 seeds and 4,800 twigs. Without the granary tech, the seeds do not fit. Without it, the twigs do not fit either until systems have drifted upward. Nests cannot be built after Act I, so a player who founds the roost on schedule cannot go back and fix storage. Doctrine is permanent. There is no prestige escape. PR #5 (“Add prestige system…”) was closed unmerged on 7 Feb 2026 and targeted an older static build, not this one.

**The rest of the shape is thin.** Four events. One project at a time, then a dead end. Influence is hard-capped at 100 and the Act III goal requires exactly that cap. Saves wipe themselves: a version mismatch in `hydrateState` returns a fresh game, and a parse error deletes the key. The stack is Next 16, vinext, a Cloudflare Worker, and ChatGPT hosting leftovers, while the only deploy is a static Vite build. The Pages workflow deploys on `main` and on the stale branch `agent/modern-incremental-game-overhaul`, and it does not run tests or lint.

None of that is a theme problem. The theme is good. The game underneath it does not respect the player’s time, and it can brick a finished run.

## What stays, and why

- **Birds, not a skin.** A flock is a workforce with an opinion. Staffing is the click.
- **The climb in scale.** Canopy, aerie, dominion, migration, a living network. The fantasy is range.
- **Five resources.** Seeds, twigs, knowledge, influence, starlight. Each one is a new verb, not a new color of the same counter.
- **Doctrines.** One identity choice with a real tradeoff, and an ending that remembers it.
- **Commitments that pull birds off the job.** The interesting cost is not the seeds. It is the foragers who are not foraging.
- **Seasons.** Weather that changes the next few minutes is more birdlike than a random crit.
- **A finite campaign.** This is not a live-service mine. It ends. Coming back is a second flight, not a treadmill.
- **The field-notebook tone.** Specific, dry, a little fond. No candy-clicker chrome.

Wanderlust’s old “steady output −5%” and Ingenuity’s hunger stay, because a doctrine that is only upside is not a choice.

## The new expedition

You keep a notebook for a flock that is trying to outgrow the sky. Early on, that means not starving. Later it means building a route so long that “home” is a heading.

The campaign is one expedition. It is winnable without any particular tech and without over-building. Optional structures, research, and seasons change the shape and the speed. They are not keys hidden under the doormat. When the murmuration is complete, you may migrate: the run resets, the route leaves a mark, and the next flock starts a little less ignorant.

### Core loop

1. Birds produce. Unassigned birds produce nothing. The flock eats seeds whether or not anyone is working.
2. You staff roles. The mix is the minute-to-minute decision.
3. Stores fill toward a cap. A full store is a nudge to spend, and it is how offline time stays bounded.
4. You start one project. It spends stores immediately and borrows birds until it finishes. Recall is allowed, and the stores stay spent.
5. Finished projects become nests, routes, archives, beacons, arks, or the next act.
6. Research spends knowledge to bend a rate, a store, or the clock.
7. Seasons rotate on a visible timer and change gathering. They do not change how fast a launch finishes.
8. Milestone events open a real choice. They never hard-lock the run: every event has an option that does not ask for a resource you might not have.

While you watch, something on screen should ask for a decision every few minutes in the opening, and every quarter hour later. The long waits are banks of a resource, and those banks may run while the phone is in a pocket.

### First five minutes

The player lands on the plan, not on a diagram.

- Six birds. Three foragers, three idle. Seeds tick. Twigs, knowledge, and the later resources are not shown yet.
- The objective is one sentence: store the first harvest. The only project is **Line a seed cache** (about 60 seeds, instant). Assigning the idle birds is the first decision, and it is worth roughly double the seed rate. A player who never opens the Flock tab still finishes the cache; they just wait longer.
- The cache unlocks twigs and Weavers. The objective becomes the first nest. If no weaver is assigned, twigs do not move, and the card says so.
- **Weave the first nest** is instant. It unlocks research and the field plans.
- **Survey the canopy** borrows two birds for a short expedition, opens knowledge and Scouts, and adds routes. Routes are a permanent, modest bonus to seeds and twigs.
- By about minute five a human is choosing between a second nest, Woven Baskets or Seed Ledgers, and the season, which has changed at least once. The objective already names the roost: two nests, the survey, then bind them.

No zero-speed “tutorial lock” past those two instant builds. The instant work is only the first two, so the game answers the first taps immediately and then starts taking time.

### Mid-game

**Act II, the aerie.** Founding the roost opens the doctrine, Broodkeepers, and Scholars. Broodkeepers grow the flock only while a seed reserve exists, so a growth push can stall a project and a project can stall a generation. Welcome a Brood is the impatient version: birds now, stores and time spent. Archives raise the knowledge cap and add a little passive scholarship. The Sky Council asks for an archive, a flock in the high teens, a doctrine, and a real bank of all three early resources.

**Act III, dominion.** Envoys and beacons make influence. Influence is a resource you spend, not a meter glued to 100. Two beacons and a larger flock open the Open-Sky Accord. Civic roosts are optional specializations, and the choice is on the card before you pay:

- Granary roost: seed store and a little passive seed.
- Academy roost: knowledge store and passive scholarship.
- Eyrie roost: more capacity and faster growth.

Three civic roosts, in any mix. The mix is the build.

**Act IV, the crossing.** The accord lights a home star and opens starlight and Navigators. Systems come from Seed Arks and from Reading the Deep Sky. Arks are expensive and leave infrastructure. Scans are cheaper and mostly just add a system and a route. You need six systems. Scans cap at four, so a pure scan route still builds one ark. A pure ark route never requires the granary tech, and no single ark costs more than a minimum-infrastructure store can hold. The Great Murmuration spends a heavy bank of seeds, twigs, knowledge, and starlight once the flock and the route are large enough. It is a banking problem, not a storage trap.

Seasons run under all of this.

| Season | Gathering | Expeditions |
| --- | --- | --- |
| Sunlit | Seeds up, twigs a little down | No change |
| Crosswind | Twigs up, seeds a little down | No change |
| Soft rain | Both down a little, knowledge up, morale recovers | No change |
| Dearth | Seeds down hard | No change. Stores are what you live on |

Act I seasons are short enough to meet all four inside the opening. Later seasons stretch.

### Long-term: migration

The campaign ends. The ending text follows the doctrine, and it remembers a few choices (the garden, the signal, whether the last ground was left wild).

**Migrate** starts another expedition.

- A finished run pays 8 marks, +2 if it was quick (under 8 hours of simulated time), +2 the first time you win with that doctrine.
- Leaving early is allowed from Act II, for `act - 1` marks. Act I has nothing to carry. Early leaving is an escape from a doctrine you hate, not a faster farm: winning pays more.
- Marks buy permanent ranks. Unspent marks persist. Spent ranks persist. The run’s nests, techs, doctrine, and stores do not.

| Upgrade | Ranks | What a rank does |
| --- | --- | --- |
| Fledgling memory | 3 | +1 starting bird, and the room to assign them. They start idle. |
| Inherited headings | 2 | +1 surveyed route from the first minute. |
| Longer twilight | 2 | +2 hours of offline progress. |
| Cleaner airframe | 3 | Expeditions resolve 5% faster. |
| Second look | 1 | Once per later run, change doctrine. |
| Star charts | 3 | Knowledge and starlight +10%. |
| Deeper crops | 2 | Stores +10%. |

The tree costs 37 marks if you buy every rank. Three careful wins (different doctrines, at least one of them quick) fill it. A player who repeats one doctrine needs a fourth flight. There is no infinite multiplier and no number past what an ordinary float can say exactly. Resources are hard-capped at 1e12, far above anything this tree can produce, and the campaign stays in the thousands and low hundred-thousands. The cap is a seatbelt, not a goal.

Second Look is bought between runs and spent during a later one. The first run lives with its doctrine, or leaves early for a scrap of a mark.

### Decisions that should hurt a little

- **Who is idle, and who is eating.** Six roles by the end, never enough birds. Pulling the last foragers onto an ark is how a dearth becomes a morale problem. Morale slows influence and growth. It does not delete birds and it cannot fall low enough to freeze the economy.
- **What the one active project is.** A beacon now, or a granary before the next bank. The era goal is pinned to the top of the list so it is never hidden behind four other cards.
- **Doctrine.** Stewardship keeps stores, trims upkeep, lengthens offline twilight, and makes projects slower. Ingenuity speeds projects and scholarship and eats more. Wanderlust pays routes, scouts, and starlight, and gathers a little worse. All three can finish.
- **Research order.** Everything can be bought eventually. The early pair (baskets vs ledgers) and the Act II pair (hatcheries vs logistics vs memory) change which resource is annoying for the next half hour.
- **Ark or scan.** Infrastructure versus a cheaper star.
- **Events.** Eleven of them, tied to milestones (the survey, the second nest, the first archive, the first beacon, the fourth system) so a locked phone does not skip the story and a fast player does not outrun it. The costly option is disabled, with the reason on the button, when you cannot pay. The other option is always available.

### Pacing targets

Simulated time, not wall-clock reading time. A scripted attentive player (instant decisions, Ingenuity, buys techs when they will not bankrupt the next goal) is the ruler. A human who reads and mis-assigns birds is slower. Offline time counts, up to the twilight cap.

| Milestone | Script (Ingenuity) | What a human should feel |
| --- | --- | --- |
| Seed cache | about 40 seconds | The first minute |
| First nest | about 1–2 minutes | Still in the opening |
| Canopy surveyed | a few minutes | Roles and a season have both mattered |
| First roost, Act II | about 8–12 minutes | End of a coffee |
| Sky Council, Act III | about 25–45 minutes | End of a sitting. Longer if research eats the knowledge bank |
| Open-Sky Accord, Act IV | about 2–3 hours | Next session, with offline in between |
| The Murmuration | about 4–7 hours | A long day of checking in, or a few evenings |

Measured on the attentive Ingenuity script after seasons stopped changing launch speed: cache 40s, first nest 1m 20s, survey 2m 40s, roost 8m 20s, council 27m, accord 2h 03m, murmuration 4h 01m. Stewardship finishes in about 4h 10m. Wanderlust finishes in about 3h 36m, because the crossing is what that doctrine is for. A run that buys no tech still finishes in about 4h. The playthrough test locks these bands.

The measured script times from the playthrough test are recorded in the test output and should stay inside those bands. If a balance change pushes them out, change the numbers or change this table in the same commit. Do not leave the table as a wish.

Checks that sit next to the clock:

- The same script wins with Stewardship and with Wanderlust.
- A stingy script that buys **no** tech, builds no civic roost and no solar nursery, and takes the cheap scan route still wins, and can hold every final cost in its stores.
- A second flight with a few ranks reaches the roost faster than the first.

### Time, rates, and offline progress

Displayed rate and applied rate are the same function. One second of `tick` adds `rate × 1`. There is no hidden speed multiplier.

Progress is timestamp-based.

- The save stores `lastTickAt`.
- On load, on a short timer while the tab is visible, and on `visibilitychange`, the game applies `min(now - lastTickAt, twilight cap)`.
- Paused time does not accumulate. Winning stops the clock.
- A gap of about a minute or more writes a return note: time counted, resources gained, anything that finished, and whether the twilight cap clipped the rest.
- Production and the one active project continue offline. The next project does not start itself. That start is the decision you came back for.
- Events that come due offline wait in a short queue (at most three). The rest are noted as weather the notebook skipped. Resolving them is a choice, not an autopilot.
- The base twilight cap is 8 hours. Stewardship multiplies it by 1.25. Longer Twilight adds 2 hours per rank.

Seasons, project completion, and effect expiry are sliced inside a long catch-up, so a dearth in the middle of an eight-hour absence actually happens.

### Saves

New key: `bve.campaign`. Rolling backup: `bve.campaign.backup`. Quarantine: `bve.campaign.quarantine`.

- The payload is versioned (currently 2), checksummed, and validated. Version 1 (ranks stored as an `upgrades` array, no event queue) migrates forward.
- A newer version, a bad checksum, or a damaged shape is quarantined. The loader then tries the backup. It does not delete the only copy, and it does not silently start over without a note.
- Import is a review step: the game shows act, flock, marks, and field time, and only replaces the run when you confirm. Export is the same envelope, pretty-printed so a phone can select it.
- Autosave runs every few seconds and on `pagehide`.

**Old saves are deleted.** On startup the notebook removes `birds-vs-everything-v3` and `birdGameSave` and does not read them, import them, or mention them. This campaign's own key is `bve.campaign`.

### Mobile first

Tom reads this on a phone. The layout is a column.

- Sticky header: act, season name, time remaining, and that season's multipliers for seeds, twigs, and knowledge. Launches are not on that line. The weather sentence lives on the World tab, where there is room for it. Pause and settings are at least 44px.
- Resource grid, two columns. Every chip is a button. The cap breakdown opens as a sheet. Nothing important is hover-only. Desktop uses the same button.
- The objective and its next action stay on screen.
- One panel at a time: Flock, Plans, Study, World, Log. The tab bar sits in the safe area. Targets are at least 44px, labels are words, and the active tab is not communicated by color alone.
- Plans start with one tap. The reason a plan is disabled is on the card, not behind a second selection.
- Events, migration, import review, and settings are sheets, not tooltips.
- The world is a tab, not a 600px illustration shoved above the controls. On a wide screen it becomes the center column, with the flock on the left and plans on the right. Study swaps into the right column. Log and settings stay sheets.
- Type is a serif for titles and the system UI face for everything else, so the game does not need a font download to be readable offline.
- `prefers-reduced-motion` drops the flying birds.
- The build is an installable PWA: manifest, maskable icons, standalone display, and a network-first service worker so a playtest still updates while it is online and still opens in a pocket.

### Out of scope

Sound, accounts, cloud sync, a species life-list, and an infinite third prestige layer. The migration tree is the long game.

## Decisions

Tom answered the open questions:

1. **Length.** A few evenings, plus two or three migrations, stays the campaign. No longer flyway in this version.
2. **Leaving in Act II.** Still allowed, and it still pays `act - 1` marks. The confirm control says how many marks that is, and that a win pays 8+.
3. **Species.** A life-list is out of scope. The flock stays a flock.
4. **Crosswind.** Seasons change gathering only. They do not slow or speed launches.
5. **Saves.** Clean slate. Pre-rebuild browser saves are deleted on startup and are not imported.
