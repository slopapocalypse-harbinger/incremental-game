import { describe, expect, it } from "vitest";

import { PLAN_CAPS, PROJECTS } from "../src/game/content";
import {
  activeBoosts,
  calculateRates,
  createInitialState,
  getCapacity,
  getStorage,
  planChip,
  previewProject,
  projectForecast,
} from "../src/game/engine";
import { formatAmount } from "../src/game/number";
import type { GameState } from "../src/game/types";

const CHIPS: Record<string, string> = {
  "seed-cache": "Unlock",
  "first-nest": "Unlock",
  survey: "Unlock",
  roost: "Unlock",
  council: "Unlock",
  accord: "Unlock",
  nest: "Building · 0/8",
  archive: "Building · 0/3",
  beacon: "Building · 0/5",
  granary: "Building · 0/3",
  academy: "Building · 0/3",
  eyrie: "Building · 0/3",
  solar: "Building · 0/3",
  ark: "Building · 0/8",
  corridor: "Building · 0/6",
  scan: "Building · 0/4",
  seedfall: "Boost · 75s",
  treaty: "Boost · 90s",
  brood: "Instant",
  murmur: "Finale",
};

function housed(state: GameState): GameState {
  return {
    ...state,
    resources: { seeds: 400, twigs: 80, knowledge: 20, influence: 0, starlight: 0 },
    flock: 8,
    roles: { ...state.roles, foragers: 3, weavers: 1 },
  };
}

describe("plan chips", () => {
  it("uses one vocabulary for every plan", () => {
    const state = createInitialState(0);
    expect(PROJECTS.map((project) => project.id).sort()).toEqual(Object.keys(CHIPS).sort());
    for (const project of PROJECTS) {
      expect(planChip(state, project.id), project.id).toBe(CHIPS[project.id]);
    }
    const built = {
      ...state,
      counts: { nest: 2, archive: 1, granary: 1, academy: 1 },
    };
    expect(planChip(built, "nest")).toBe(`Building · 2/${PLAN_CAPS.nest}`);
    expect(planChip(built, "archive")).toBe(`Building · 1/${PLAN_CAPS.archive}`);
    expect(planChip(built, "granary")).toBe(`Building · 2/${PLAN_CAPS.civic}`);
    expect(planChip(built, "eyrie")).toBe(`Building · 2/${PLAN_CAPS.civic}`);
  });
});

describe("plan forecasts", () => {
  it("matches the engine's next-build deltas", () => {
    const state = housed({
      ...createInitialState(0),
      flags: ["seed-cache", "first-nest", "survey"],
      counts: { nest: 2 },
      routes: 2,
    });
    expectForecast(state, "nest");
    expectForecast(state, "archive");
    expectForecast(state, "seedfall");
    expectForecast(state, "brood");

    const later = housed({
      ...state,
      act: 3,
      flags: [...state.flags, "roost", "council"],
      doctrine: "stewardship",
      counts: { ...state.counts, archive: 1 },
      flock: 16,
    });
    expectForecast(later, "beacon");
    expectForecast(later, "granary");
    expectForecast(later, "eyrie");
    expectForecast(later, "treaty");

    const crossing = housed({
      ...later,
      act: 4,
      flags: [...later.flags, "accord"],
      systems: 1,
      resources: { ...later.resources, starlight: 10, influence: 20 },
    });
    expectForecast(crossing, "solar");
    expectForecast(crossing, "ark");
    expectForecast(crossing, "scan");
    expect(projectForecast(crossing, "murmur")).toBe("Ends the expedition.");
    expect(projectForecast(state, "seedfall")).toMatch(/\+1 route \(permanent\)/);
    expect(projectForecast(state, "seedfall")).toMatch(/gather \+\d+% seeds/);
    expect(projectForecast(state, "seedfall")).toMatch(/for 75s/);
  });

  it("shows a running boost's remaining time", () => {
    const state = {
      ...createInitialState(0),
      elapsed: 10,
      effects: [{ id: "seedfall", until: 85 }],
    };
    const [boost] = activeBoosts(state);
    expect(boost?.label).toBe("Seedfall");
    expect(boost?.remaining).toBe(75);
  });
});

function expectForecast(state: GameState, id: string): void {
  const after = previewProject(state, id);
  const lasting = { ...after, effects: state.effects };
  const text = projectForecast(state, id);
  expect(text.length, id).toBeGreaterThan(0);
  const cap = getCapacity(lasting) - getCapacity(state);
  if (cap) expect(text, id).toContain(`+${formatAmount(cap, 0)} flock cap`);
  const birds = after.flock - state.flock;
  if (birds > 0.05) expect(text, id).toContain(`+${formatAmount(birds, 0)} birds`);
  const routes = lasting.routes - state.routes;
  if (routes > 0) expect(text, id).toContain(`+${routes} route`);
  const systems = lasting.systems - state.systems;
  if (systems > 0) expect(text, id).toContain(`+${systems} system`);
  for (const key of ["seeds", "twigs", "knowledge", "influence", "starlight"] as const) {
    const store = Math.round(getStorage(lasting)[key] - getStorage(state)[key]);
    if (Math.abs(store) >= 1) expect(text, `${id} ${key} store`).toContain(formatAmount(Math.abs(store), 0));
    const grant = Math.round(after.resources[key] - state.resources[key]);
    if (grant >= 1) expect(text, `${id} ${key} grant`).toContain(`+${formatAmount(grant, 0)} ${key}`);
  }
  if (id !== "brood" && id !== "murmur") {
    const beforeRates = calculateRates(ready(state));
    const afterRates = calculateRates(ready(lasting));
    for (const key of ["seeds", "twigs", "knowledge", "influence", "starlight", "population"] as const) {
      const delta = afterRates[key] - beforeRates[key];
      if (Math.abs(delta) < 0.0005) continue;
      const digits = Math.abs(delta) < 0.1 ? 3 : 2;
      expect(text, `${id} ${key} rate`).toContain(formatAmount(Math.abs(delta), digits));
    }
  }
}

function ready(state: GameState): GameState {
  const room = Math.min(getCapacity(state) - 1, Math.max(state.flock, 1));
  const flock = Math.max(0, room);
  return {
    ...state,
    flock,
    resources: { ...state.resources, seeds: Math.max(state.resources.seeds, flock * 5 + 50) },
  };
}
