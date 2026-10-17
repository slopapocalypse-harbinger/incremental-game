import { describe, expect, it } from "vitest";

import { DOCTRINES, EVENTS, TUNE, projectById, projectTitle } from "../src/game/content";
import {
  borrowImpact,
  calculateRates,
  canStart,
  chooseDoctrine,
  createInitialState,
  getObjective,
  getSeason,
  getStorage,
  respecDoctrine,
  startProject,
  tick,
  timeToAfford,
  wallTime,
} from "../src/game/engine";
import { formatAmount } from "../src/game/number";
import type { GameState } from "../src/game/types";


function surveyed(): GameState {
  return {
    ...createInitialState(0),
    flags: ["seed-cache", "first-nest", "survey"],
    counts: { nest: 2 },
    routes: 2,
    resources: { seeds: 40, twigs: 20, knowledge: 0, influence: 0, starlight: 0 },
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
}

function councilReady(): GameState {
  return {
    ...surveyed(),
    act: 2,
    flags: ["seed-cache", "first-nest", "survey", "roost"],
    counts: { nest: 2, archive: 1 },
    doctrine: "stewardship",
    flock: 16,
    resources: { seeds: 100, twigs: 40, knowledge: 12, influence: 0, starlight: 0 },
    roles: {
      foragers: 10,
      weavers: 4,
      scouts: 0,
      broodkeepers: 2,
      scholars: 0,
      envoys: 0,
      navigators: 0,
    },
  };
}

describe("playtest regressions", () => {
  it("keeps the knowledge cap stable through dearth", () => {
    let state = councilReady();
    state = { ...state, elapsed: 0 };
    expect(getSeason(state).id).toBe("sunlit");
    const sunlit = getStorage(state).knowledge;
    expect(sunlit).toBe(350);
    expect(formatAmount(sunlit, 0)).toBe("350");
    const dearthAt = 3 * (state.act === 2 ? TUNE.seasonAct2 : TUNE.seasonAct1);
    state = { ...state, elapsed: dearthAt + 5 };
    expect(getSeason(state).id).toBe("dearth");
    expect(getStorage(state).knowledge).toBe(sunlit);
    expect(formatAmount(getStorage(state).knowledge, 0)).toBe("350");
  });

  it("names the role when the Now goal waits on a stalled resource", () => {
    const roost = {
      ...surveyed(),
      resources: { seeds: 200, twigs: 120, knowledge: 0, influence: 0, starlight: 0 },
      roles: {
        foragers: 3,
        weavers: 2,
        scouts: 0,
        broodkeepers: 0,
        scholars: 0,
        envoys: 0,
        navigators: 0,
      },
    };
    expect(calculateRates(roost).knowledge).toBeLessThan(TUNE.stallKnowledge);
    expect(getObjective(roost).next).toMatch(/Scout/);

    const council = councilReady();
    expect(calculateRates(council).knowledge).toBeLessThan(TUNE.stallKnowledge);
    expect(getObjective(council).next).toMatch(/barely coming in/);
    expect(getObjective(council).next).toMatch(/Scholar/);
    expect(timeToAfford(council, { knowledge: 300 })).toMatch(/About/);
    expect(timeToAfford(council, { knowledge: 300 })).toMatch(/Scholar/);
    const dry = {
      ...council,
      flags: ["seed-cache", "first-nest", "roost"],
      counts: { nest: 2 },
    };
    expect(calculateRates(dry).knowledge).toBe(0);
    expect(getObjective(dry).next).toMatch(/not increasing/);

    const staffed = {
      ...council,
      roles: { ...council.roles, scholars: 2, foragers: 8 },
    };
    expect(calculateRates(staffed).knowledge).toBeGreaterThan(TUNE.stallKnowledge);
    expect(getObjective(staffed).next).not.toMatch(/Scholar/);
  });

  it("states a concrete effect on every event option", () => {
    for (const event of EVENTS) {
      for (const option of event.options) {
        expect(option.effect.length, `${event.id}:${option.id}`).toBeGreaterThan(8);
        expect(option.effect, `${event.id}:${option.id}`).toMatch(/\d|Morale/);
      }
    }
    const frost = EVENTS.find((event) => event.id === "night-frost");
    expect(frost?.options.find((option) => option.id === "huddle")?.effect).toMatch(/\+8 knowledge/);
    const gale = EVENTS.find((event) => event.id === "summer-gale");
    expect(gale?.options.find((option) => option.id === "ride")?.effect).toMatch(/2 routes/);
    expect(gale?.options.find((option) => option.id === "brace")?.effect).toMatch(/Morale/);
  });

  it("explains a disabled launch and the birds it would pull", () => {
    const state = {
      ...createInitialState(0),
      flags: ["seed-cache", "first-nest"],
      counts: { nest: 1 },
      resources: { seeds: 80, twigs: 40, knowledge: 0, influence: 0, starlight: 0 },
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
    const survey = projectById("survey");
    expect(survey).toBeTruthy();
    if (!survey) return;
    const readiness = canStart(state, "survey");
    expect(readiness.ok).toBe(false);
    expect(readiness.reason).toMatch(/Free 2 more birds/);
    expect(readiness.reason).toMatch(/Pulls 2 foragers/);
    expect(readiness.reason).toMatch(/seeds/);
    expect(readiness.reason).toMatch(/for \d+s/);
    const impact = borrowImpact(state, survey.birds, wallTime(state, survey));
    expect(impact).toMatch(/1\.|0\./);
    const idle = {
      ...state,
      roles: { ...state.roles, foragers: 4 },
    };
    expect(borrowImpact(idle, 2, 28)).toBe("");
    expect(canStart(idle, "survey").ok).toBe(true);
  });

  it("names archive tiers and explains the nursery rest", () => {
    const state = councilReady();
    const archive = projectById("archive");
    expect(archive).toBeTruthy();
    if (!archive) return;
    expect(projectTitle({ ...state, counts: { archive: 0 } }, archive)).toBe("Raise an archive");
    expect(projectTitle({ ...state, counts: { archive: 1 } }, archive)).toBe("Raise a second archive");
    expect(projectTitle({ ...state, counts: { archive: 2 } }, archive)).toBe("Raise the last archive");

    const brood = projectById("brood");
    expect(brood?.blocked?.({ ...state, elapsed: 10, cooldowns: { brood: 67 } })).toBe(
      `Nursery rests ${TUNE.broodRest}s after a brood. 57s left.`,
    );
    expect(brood?.forecast).toContain(String(TUNE.broodRest));
  });

  it("gives each doctrine an immediate, distinct payoff", () => {
    const base = {
      ...surveyed(),
      act: 2 as const,
      flags: ["seed-cache", "first-nest", "survey", "roost"],
      resources: { seeds: 80, twigs: 40, knowledge: 0, influence: 0, starlight: 0 },
    };
    const before = calculateRates(base);
    const stew = chooseDoctrine(base, "stewardship");
    expect(calculateRates(stew).seeds).toBeGreaterThan(before.seeds);
    expect(getStorage(stew).seeds).toBeGreaterThan(getStorage(base).seeds);
    expect(stew.roles.scholars).toBe(0);
    expect(stew.routes).toBe(base.routes);

    const ing = chooseDoctrine(base, "ingenuity");
    expect(ing.flock).toBe(base.flock + 1);
    expect(ing.roles.scholars).toBe(1);
    expect(ing.resources.knowledge).toBeGreaterThanOrEqual(TUNE.ingenuityGift - 0.01);
    expect(calculateRates(ing).knowledge).toBeGreaterThan(before.knowledge + 0.05);

    const wan = chooseDoctrine(base, "wanderlust");
    expect(wan.routes).toBe(base.routes + TUNE.wanderlustGift);
    expect(wan.roles.scholars).toBe(0);
    expect(calculateRates(wan).seeds).toBeGreaterThan(before.seeds * 0.95);

    for (const doctrine of DOCTRINES) {
      expect(doctrine.tradeoff.toLowerCase()).toMatch(/felt now/);
    }
    expect(DOCTRINES.find((item) => item.id === "ingenuity")?.tradeoff).toContain(String(TUNE.ingenuityGift));
    expect(DOCTRINES.find((item) => item.id === "wanderlust")?.tradeoff).toContain(String(TUNE.wanderlustGift));

    const again = respecDoctrine(
      { ...ing, ranks: { "second-look": 1 }, doctrineChanges: 0 },
      "stewardship",
    );
    expect(again.roles.scholars).toBe(ing.roles.scholars);
    expect(again.flock).toBe(ing.flock);
  });

  it("lets the survey trickle knowledge before anyone is a scholar", () => {
    const state = surveyed();
    const gained = tick(state, 100).resources.knowledge - state.resources.knowledge;
    expect(gained).toBeGreaterThan(1);
    expect(gained).toBeLessThan(8);
    const launched = startProject(
      {
        ...state,
        resources: { seeds: 400, twigs: 200, knowledge: 20, influence: 0, starlight: 0 },
        roles: { ...state.roles, foragers: 3 },
      },
      "roost",
    );
    expect(launched.active?.birds).toBe(3);
    expect(launched.active?.duration).toBe(42);
  });
});
