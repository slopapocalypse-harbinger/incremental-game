import assert from "node:assert/strict";
import test from "node:test";

import {
  COMMITMENTS,
  assignRole,
  calculateRates,
  canStartCommitment,
  chooseDoctrine,
  completeOnboardingStep,
  createInitialState,
  formatBirds,
  getAvailableCommitments,
  getCapSources,
  getIdleBirds,
  getOnboardingStep,
  getRoleYield,
  getStorage,
  isResearchUnlocked,
  isResourceUnlocked,
  isRoleUnlocked,
  startCommitment,
  tickGame,
} from "../app/game/engine.ts";

function stocked(state) {
  return {
    ...state,
    flock: 80,
    roles: Object.fromEntries(
      Object.keys(state.roles).map((role) => [role, 0]),
    ),
    resources: {
      seeds: 100_000,
      twigs: 100_000,
      knowledge: 100_000,
      influence: 100,
      starlight: 100_000,
    },
  };
}

function finish(state) {
  let next = state;
  let guard = 100;
  while (next.active && guard > 0) {
    next = tickGame(next, 10);
    guard -= 1;
  }
  assert.equal(next.active, null, "commitment should complete");
  return next;
}

test("the four-act campaign reaches its doctrine-specific ending", () => {
  let game = stocked(createInitialState());

  game = completeOnboardingStep(game, "seed-cache");
  game = completeOnboardingStep(stocked(game), "first-nest");
  game = finish(startCommitment(game, "survey-canopy"));
  assert.equal(game.surveyedRoutes, 2);

  game = stocked({ ...game, nests: 2 });
  game = finish(startCommitment(game, "found-roost"));
  assert.equal(game.act, 2);

  game = chooseDoctrine(game, "ingenuity");
  game = stocked({ ...game, archives: 1, flock: 24 });
  game = finish(startCommitment(game, "found-council"));
  assert.equal(game.act, 3);

  game = stocked({ ...game, beacons: 2, flock: 36 });
  game = finish(startCommitment(game, "unite-world"));
  assert.equal(game.act, 4);

  game = stocked({ ...game, systems: 8, flock: 60 });
  game = finish(startCommitment(game, "seed-galaxy"));
  assert.equal(game.act, 5);
  assert.equal(game.won, true);
  assert.match(game.logs.at(-1).text, /library written across suns/i);
});

test("the opening reveals one system at a time", () => {
  let game = createInitialState();
  assert.equal(getOnboardingStep(game).id, "seed-cache");
  assert.equal(isResourceUnlocked(game, "twigs"), false);
  assert.equal(isRoleUnlocked(game, "weavers"), false);
  assert.equal(isResearchUnlocked(game), false);
  assert.deepEqual(getAvailableCommitments(game), []);

  game = completeOnboardingStep(stocked(game), "seed-cache");
  assert.equal(isResourceUnlocked(game, "twigs"), true);
  assert.equal(isRoleUnlocked(game, "weavers"), true);
  assert.equal(isResearchUnlocked(game), false);
  assert.deepEqual(getAvailableCommitments(game), []);

  game = completeOnboardingStep(stocked(game), "first-nest");
  assert.equal(isRoleUnlocked(game, "scouts"), false);
  assert.equal(isResourceUnlocked(game, "knowledge"), false);
  assert.equal(isResearchUnlocked(game), true);
  assert.deepEqual(
    getAvailableCommitments(game).map((commitment) => commitment.id),
    ["survey-canopy", "build-nest"],
  );

  game = finish(startCommitment(stocked(game), "survey-canopy"));
  assert.equal(isRoleUnlocked(game, "scouts"), true);
  assert.equal(isResourceUnlocked(game, "knowledge"), true);
});

test("fractional flock growth never exposes fractional assignment controls", () => {
  const game = {
    ...createInitialState(),
    completed: ["seed-cache", "first-nest"],
    flock: 6.2,
    roles: {
      ...createInitialState().roles,
      foragers: 6,
    },
  };
  assert.equal(formatBirds(getIdleBirds(game)), "0.2");
  assert.deepEqual(assignRole(game, "weavers", 1), game);

  const survey = COMMITMENTS.find(
    (commitment) => commitment.id === "survey-canopy",
  );
  assert.equal(
    canStartCommitment(game, survey).reason,
    "Need 37 seeds and 18 twigs.",
  );

  const funded = {
    ...game,
    resources: { ...game.resources, seeds: 55, twigs: 18 },
  };
  assert.equal(
    canStartCommitment(funded, survey).reason,
    "Free 2 more birds from their roles.",
  );
});

test("cap explanations expose structural contributions", () => {
  const game = completeOnboardingStep(stocked(createInitialState()), "seed-cache");
  const sources = getCapSources(game, "seeds");
  assert.ok(sources.includes("Canopy stores: 180"));
  assert.ok(sources.includes("Seed cache: +240"));
  assert.ok(sources.some((source) => source.startsWith("Total cap:")));
});

test("seasonal field plans amplify role production instead of duplicating it", () => {
  const prepared = {
    ...stocked({
      ...createInitialState(),
      completed: ["seed-cache", "first-nest", "survey-canopy"],
      surveyedRoutes: 2,
    }),
    roles: {
      ...createInitialState().roles,
      foragers: 3,
      weavers: 1,
    },
  };
  const boosted = finish(startCommitment(prepared, "seasonal-flight"));
  const baseline = calculateRates({ ...boosted, effects: [] });
  const active = calculateRates(boosted);

  assert.equal(boosted.effects[0].id, "seedfall");
  assert.equal(boosted.surveyedRoutes, 3);
  assert.ok(active.seeds > baseline.seeds);
  assert.ok(active.twigs > baseline.twigs);
  assert.equal(
    getAvailableCommitments(boosted).some(
      (commitment) => commitment.id === "seasonal-flight",
    ),
    false,
  );
});

test("field plans are singular and opening expeditions resolve quickly", () => {
  const prepared = stocked({
    ...createInitialState(),
    completed: ["seed-cache", "first-nest"],
    nests: 1,
  });
  const openingPlans = COMMITMENTS.filter((commitment) =>
    ["survey-canopy", "build-nest", "seasonal-flight"].includes(commitment.id),
  );
  assert.ok(openingPlans.every((commitment) => commitment.duration <= 22));

  const completed = finish(startCommitment(prepared, "build-nest"));
  assert.equal(completed.nests, 2);
  assert.equal(
    getAvailableCommitments(completed).some(
      (commitment) => commitment.id === "build-nest",
    ),
    false,
  );
  assert.deepEqual(startCommitment(completed, "build-nest"), completed);
});

test("role readouts expose their current per-bird production", () => {
  const game = completeOnboardingStep(stocked(createInitialState()), "seed-cache");
  assert.match(getRoleYield(game, "foragers"), /seeds\/s per bird$/);
  assert.match(getRoleYield(game, "weavers"), /twigs\/s per bird$/);
});

test("late-game infrastructure can hold every final-project resource", () => {
  const game = {
    ...createInitialState(),
    act: 4,
    nests: 2,
    roosts: 2,
    archives: 1,
    beacons: 2,
    solarNests: 2,
    systems: 8,
    techs: ["reserve-granaries"],
    completed: ["seed-cache", "first-nest"],
  };
  const storage = getStorage(game);

  assert.ok(storage.seeds >= 7_200);
  assert.ok(storage.twigs >= 4_800);
  assert.ok(storage.knowledge >= 2_900);
  assert.ok(storage.starlight >= 300);
});
