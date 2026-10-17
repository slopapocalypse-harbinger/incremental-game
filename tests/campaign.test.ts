import { describe, expect, it } from "vitest";

import { projectById } from "../src/game/content";
import {
  assignRole,
  calculateRates,
  canStart,
  catchUp,
  createInitialState,
  expeditionSpeed,
  getIdleBirds,
  getStorage,
  listProjects,
  migrate,
  pauseGame,
  recallProject,
  resolveEvent,
  roleYield,
  startProject,
  tick,
} from "../src/game/engine";
import { RESOURCE_CEILING, clampResource } from "../src/game/number";
import {
  BACKUP_KEY,
  LEGACY_SAVE_KEY,
  QUARANTINE_KEY,
  SAVE_KEY,
  checksumOf,
  decodeSave,
  describeImport,
  encodeSave,
  loadGame,
  saveGame,
} from "../src/game/save";
import type { GameState } from "../src/game/types";
import { describe as describeState, play, step } from "./policy";

class MemoryStore {
  readonly map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function afford(state: GameState, projectId: string): GameState {
  const project = projectById(projectId);
  if (!project) throw new Error(projectId);
  return {
    ...state,
    resources: {
      seeds: 100_000,
      twigs: 100_000,
      knowledge: 100_000,
      influence: 100_000,
      starlight: 100_000,
    },
    flock: Math.max(state.flock, 80),
    roles: {
      foragers: 0,
      weavers: 0,
      scouts: 0,
      broodkeepers: 0,
      scholars: 0,
      envoys: 0,
      navigators: 0,
    },
  };
}

describe("time and rates", () => {
  it("applies the displayed rate with no hidden multiplier", () => {
    const state = {
      ...createInitialState(1_000),
      roles: {
        foragers: 4,
        weavers: 2,
        scouts: 0,
        broodkeepers: 0,
        scholars: 0,
        envoys: 0,
        navigators: 0,
      },
    };
    const rate = calculateRates(state).seeds;
    const next = tick(state, 10);
    expect(next.resources.seeds).toBeCloseTo(state.resources.seeds + rate * 10, 6);
    expect(next.elapsed).toBeCloseTo(10, 6);
  });

  it("catches up a background gap from timestamps, including past the old 2 second cap", () => {
    const now = 1_700_000_000_000;
    const state = createInitialState(now - 3600_000);
    const next = catchUp(state, now);
    expect(next.elapsed).toBeCloseTo(3600, 0);
    expect(next.lastTickAt).toBe(now);
    expect(next.offlineReport?.seconds).toBeCloseTo(3600, 0);
    expect(next.offlineReport?.capped).toBe(false);
  });

  it("does not bank time while paused, and clips at the twilight cap", () => {
    const now = 1_700_000_000_000;
    const paused = pauseGame(createInitialState(now - 10_000_000), true, now - 10_000_000);
    const still = catchUp(paused, now);
    expect(still.elapsed).toBe(0);
    expect(still.lastTickAt).toBe(now);

    const away = createInitialState(now - 20 * 3600 * 1000);
    const capped = catchUp(away, now);
    expect(capped.elapsed).toBeCloseTo(8 * 3600, 0);
    expect(capped.offlineReport?.capped).toBe(true);
  });

  it("does not apply the same instant twice", () => {
    const now = 5_000_000;
    const once = catchUp(createInitialState(now - 120_000), now);
    const twice = catchUp(once, now);
    expect(twice.elapsed).toBeCloseTo(once.elapsed, 5);
  });
});

describe("projects and storage", () => {
  it("lets nests be raised more than once", () => {
    let state = createInitialState(0);
    state = startProject(afford(state, "seed-cache"), "seed-cache");
    state = startProject(afford(state, "first-nest"), "first-nest");
    expect(state.counts.nest).toBe(1);
    state = tick(startProject(afford(state, "nest"), "nest"), 200);
    expect(state.counts.nest).toBe(2);
    expect(state.active).toBeNull();
    expect(listProjects(state).some((project) => project.id === "nest")).toBe(true);
    expect(canStart(afford(state, "nest"), "nest").ok).toBe(true);
  });

  it("holds the finale without Reserve Granaries on a minimum route", () => {
    const state: GameState = {
      ...createInitialState(0),
      act: 4,
      flags: ["seed-cache", "first-nest", "survey", "roost", "council", "accord"],
      counts: { nest: 2, archive: 1, beacon: 2 },
      systems: 6,
      flock: 32,
      doctrine: "ingenuity",
      techs: [],
    };
    const storage = getStorage(state);
    const cost = projectById("murmur")!.costs(state);
    expect(storage.seeds).toBeGreaterThanOrEqual(cost.seeds ?? 0);
    expect(storage.twigs).toBeGreaterThanOrEqual(cost.twigs ?? 0);
    expect(storage.knowledge).toBeGreaterThanOrEqual(cost.knowledge ?? 0);
    expect(storage.starlight).toBeGreaterThanOrEqual(cost.starlight ?? 0);
  });

  it("keeps every seed ark inside the store a minimum route can hold", () => {
    for (let built = 0; built < 5; built += 1) {
      const systems = 1 + built;
      const state: GameState = {
        ...createInitialState(0),
        act: 4,
        flags: ["seed-cache", "first-nest", "survey", "roost", "council", "accord"],
        counts: { nest: 2, archive: 1, beacon: 2, ark: built },
        systems,
        doctrine: "wanderlust",
      };
      const storage = getStorage(state);
      const cost = projectById("ark")!.costs(state);
      for (const key of ["seeds", "twigs", "knowledge", "starlight"] as const) {
        expect(storage[key], `ark ${built + 1} ${key}`).toBeGreaterThanOrEqual(cost[key] ?? 0);
      }
    }
  });

  it("shows the same per-bird yield the rates use", () => {
    const state = startProject(afford(createInitialState(0), "seed-cache"), "seed-cache");
    expect(roleYield(state, "foragers")).toMatch(/seeds\/s each$/);
    expect(roleYield(state, "weavers")).toMatch(/twigs\/s each$/);
  });

  it("returns birds when an expedition is recalled and does not refund stores", () => {
    let state = createInitialState(0);
    state = startProject(afford(state, "seed-cache"), "seed-cache");
    state = startProject(afford(state, "first-nest"), "first-nest");
    state = afford(state, "survey");
    state = { ...state, flock: 6, roles: { ...state.roles, foragers: 4 } };
    const before = state.resources.seeds;
    state = startProject(state, "survey");
    expect(state.active?.birds).toBe(2);
    expect(getIdleBirds(state)).toBe(0);
    expect(state.resources.seeds).toBeLessThan(before);
    const spent = state.resources.seeds;
    state = recallProject(state);
    expect(state.active).toBeNull();
    expect(state.resources.seeds).toBe(spent);
    expect(getIdleBirds(state)).toBe(2);
  });

  it("changes expedition speed with the season", () => {
    const calm = createInitialState(0);
    const wind = { ...calm, elapsed: 70 };
    expect(expeditionSpeed(calm)).not.toBeCloseTo(expeditionSpeed(wind), 5);
  });
});

describe("saves", () => {
  it("round-trips, migrates a v1 notebook, and leaves the legacy key alone", () => {
    const store = new MemoryStore();
    store.setItem(LEGACY_SAVE_KEY, "{\"version\":3,\"secrets\":true}");
    const now = 50_000_000;
    const played = tick(createInitialState(now - 30_000), 30);
    saveGame(store, played, now);
    const loaded = loadGame(store, now + 10_000);
    expect(loaded.legacyPresent).toBe(true);
    expect(loaded.state.elapsed).toBeGreaterThan(30);
    expect(store.getItem(LEGACY_SAVE_KEY)).toContain("secrets");
    expect(store.getItem(BACKUP_KEY)).toBeNull();

    saveGame(store, loaded.state, now + 10_000);
    expect(store.getItem(BACKUP_KEY)).toBeTruthy();

    const fresh = createInitialState(now);
    const v1State = {
      ...fresh,
      version: 1,
      resources: { ...fresh.resources, seeds: 40 },
      upgrades: [{ id: "fledgling", rank: 2 }],
    };
    const envelope = {
      version: 1,
      checksum: checksumOf(v1State),
      savedAt: now,
      state: v1State,
    };
    const migrated = decodeSave(JSON.stringify(envelope), now);
    expect(migrated.ok).toBe(true);
    if (migrated.ok) {
      expect(migrated.migrated).toBe(true);
      expect(migrated.state.ranks.fledgling).toBe(2);
      expect(migrated.state.resources.seeds).toBe(40);
      expect(migrated.state.eventQueue).toEqual([]);
    }
  });

  it("quarantines a broken primary and restores the backup", () => {
    const store = new MemoryStore();
    const now = 80_000_000;
    const good = createInitialState(now);
    good.resources.seeds = 33;
    saveGame(store, good, now);
    const backup = store.getItem(SAVE_KEY)!;
    store.setItem(BACKUP_KEY, backup);
    store.setItem(SAVE_KEY, "{not json");
    const loaded = loadGame(store, now);
    expect(loaded.quarantined).toBe(true);
    expect(loaded.state.resources.seeds).toBe(33);
    expect(store.getItem(QUARANTINE_KEY)).toContain("not json");
    expect(store.getItem(BACKUP_KEY)).toBe(backup);
  });

  it("rejects a tampered checksum and a future version without applying them", () => {
    const now = 1;
    const encoded = encodeSave(createInitialState(now), now);
    const tampered = encoded.replace('"seeds": 12', '"seeds": 99');
    expect(decodeSave(tampered, now).ok).toBe(false);
    const future = JSON.parse(encoded) as { version: number; state: unknown; checksum: string };
    future.version = 99;
    expect(decodeSave(JSON.stringify(future), now).ok).toBe(false);
    const bad = decodeSave(JSON.stringify(future), now);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toMatch(/version 99/);
  });

  it("describes an import before it replaces anything", () => {
    const state = { ...createInitialState(0), act: 3 as const, flock: 22, marks: 4, wins: 1, elapsed: 5400 };
    expect(describeImport(state)).toContain("Act 3");
    expect(describeImport(state)).toContain("22 birds");
  });
});

describe("migration", () => {
  it("pays for a win, refuses to leave during act 1, and keeps ranks", () => {
    const now = 9_000;
    const early = migrate(createInitialState(now), now, {});
    expect(early.ok).toBe(false);

    let act2 = createInitialState(now);
    act2 = { ...act2, act: 2, flags: ["roost"] };
    const left = migrate(act2, now, { fledgling: 1 });
    expect(left.ok).toBe(true);
    if (left.ok) {
      expect(left.state.marks).toBe(0);
      expect(left.state.ranks.fledgling).toBe(1);
      expect(left.state.flock).toBe(7);
      expect(left.state.resources.seeds).toBe(12);
      expect(left.state.act).toBe(1);
    }

    const won = {
      ...createInitialState(now),
      won: true,
      act: 5 as const,
      doctrine: "ingenuity" as const,
      elapsed: 3 * 3600,
    };
    const again = migrate(won, now, {});
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.state.marks).toBe(12);
      expect(again.state.wins).toBe(1);
      expect(again.state.doctrinesWon).toEqual(["ingenuity"]);
    }
  });
});

describe("campaign", () => {
  it("finishes an attentive Ingenuity expedition inside the pacing bands", () => {
    const result = play(createInitialState(0), "attentive", "ingenuity");
    expect(result.state.won, describeState(result.state)).toBe(true);
    const { times } = result;
    console.info("ingenuity pacing", times, "events", result.state.seenEvents.length, "techs", result.state.techs);
    expect(times.cache).toBeGreaterThan(12);
    expect(times.cache).toBeLessThan(70);
    expect(times.nest).toBeGreaterThan(40);
    expect(times.nest).toBeLessThan(180);
    expect(times.survey).toBeGreaterThan(90);
    expect(times.survey).toBeLessThan(8 * 60);
    expect(times.roost).toBeGreaterThan(5 * 60);
    expect(times.roost).toBeLessThan(20 * 60);
    expect(times.council).toBeGreaterThan(22 * 60);
    expect(times.council).toBeLessThan(45 * 60);
    expect(times.accord).toBeGreaterThan(100 * 60);
    expect(times.accord).toBeLessThan(3 * 3600);
    expect(times.win).toBeGreaterThan(3.6 * 3600);
    expect(times.win).toBeLessThan(6 * 3600);
    expect(result.state.seenEvents.length).toBeGreaterThanOrEqual(6);
  }, 30_000);

  it("also finishes under Stewardship, Wanderlust, and a no-tech route", () => {
    for (const doctrine of ["stewardship", "wanderlust"] as const) {
      const result = play(createInitialState(0), "attentive", doctrine);
      expect(result.state.won, `${doctrine}\n${describeState(result.state)}`).toBe(true);
      console.info(doctrine, result.times);
    }
    const stingy = play(createInitialState(0), "stingy", "stewardship");
    expect(stingy.state.won, describeState(stingy.state)).toBe(true);
    expect(stingy.state.techs).toEqual([]);
    console.info("stingy", stingy.times);
  }, 60_000);

  it("reaches the roost faster on a second flight", () => {
    const first = play(createInitialState(0), "stingy", "stewardship", 30 * 60);
    expect(first.times.roost).toBeGreaterThan(0);
    const migrated = migrate(
      { ...first.state, won: true, act: 5, doctrine: "stewardship", elapsed: 5 * 3600 },
      0,
      { fledgling: 3, headings: 2, airframe: 2 },
    );
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) return;
    const second = play(migrated.state, "stingy", "stewardship", 30 * 60);
    console.info("roost first", first.times.roost, "second", second.times.roost);
    expect(second.times.roost).toBeLessThan(first.times.roost * 0.85);
  }, 30_000);

  it("stays inside the safe numeric range with a full flyway tree", () => {
    expect(clampResource(1e20)).toBe(RESOURCE_CEILING);
    let state = createInitialState(0, {
      marks: 0,
      ranks: {
        fledgling: 3,
        headings: 2,
        twilight: 2,
        airframe: 3,
        "second-look": 1,
        charts: 3,
        crops: 2,
      },
      migrations: 3,
      wins: 3,
      doctrinesWon: ["stewardship", "ingenuity", "wanderlust"],
      bestTime: 10_000,
    });
    state = {
      ...state,
      act: 4,
      flags: ["seed-cache", "first-nest", "survey", "roost", "council", "accord"],
      counts: { nest: 8, archive: 3, beacon: 5, solar: 3, granary: 3 },
      systems: 10,
      flock: 80,
      roles: { ...state.roles, foragers: 40, navigators: 10, scholars: 10 },
      resources: { seeds: 1_000, twigs: 1_000, knowledge: 1_000, influence: 1_000, starlight: 1_000 },
    };
    const after = tick(state, 2 * 3600);
    for (const value of Object.values(after.resources)) {
      expect(value).toBeLessThan(1e9);
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("resolves an event without trapping a poor flock", () => {
    let state = createInitialState(0);
    state = {
      ...state,
      flags: ["seed-cache", "first-nest", "survey"],
      counts: { nest: 2 },
      pendingEvent: "summer-gale",
      resources: { ...state.resources, seeds: 0, twigs: 0 },
    };
    expect(step(state, "attentive", "ingenuity").pendingEvent).toBeNull();
    const resolved = resolveEvent(
      { ...state, resources: { ...state.resources, seeds: 40 } },
      "summer-gale",
      "ride",
    );
    expect(resolved.routes).toBeGreaterThan(state.routes);
    expect(resolved.resources.seeds).toBeLessThan(40);
  });

  it("does not assign a fractional nestling", () => {
    const state = {
      ...createInitialState(0),
      flags: ["seed-cache"],
      flock: 6.4,
      roles: {
        foragers: 6,
        weavers: 0,
        scouts: 0,
        broodkeepers: 0,
        scholars: 0,
        envoys: 0,
        navigators: 0,
      },
    };
    expect(getIdleBirds(state)).toBe(0);
    expect(assignRole(state, "weavers", 1)).toBe(state);
  });
});
