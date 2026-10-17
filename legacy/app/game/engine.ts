export const SAVE_VERSION = 3;

export type Act = 1 | 2 | 3 | 4 | 5;
export type ResourceId =
  | "seeds"
  | "twigs"
  | "knowledge"
  | "influence"
  | "starlight";
export type RoleId =
  | "foragers"
  | "weavers"
  | "scouts"
  | "broodkeepers"
  | "scholars"
  | "envoys"
  | "navigators";
export type DoctrineId = "stewardship" | "ingenuity" | "wanderlust";
export type TimedEffectId = "seedfall" | "diplomatic-tailwind";

export interface Resources {
  seeds: number;
  twigs: number;
  knowledge: number;
  influence: number;
  starlight: number;
}

export interface ActiveCommitment {
  id: string;
  remaining: number;
  duration: number;
  birds: number;
}

export interface TimedEffect {
  id: TimedEffectId;
  until: number;
}

export interface GameLog {
  id: number;
  at: number;
  text: string;
  tone?: "good" | "warning" | "story";
}

export interface GameState {
  version: number;
  act: Act;
  elapsed: number;
  lastSavedAt: number;
  resources: Resources;
  flock: number;
  roles: Record<RoleId, number>;
  nests: number;
  roosts: number;
  archives: number;
  beacons: number;
  solarNests: number;
  systems: number;
  surveyedRoutes: number;
  morale: number;
  doctrine: DoctrineId | null;
  techs: string[];
  completed: string[];
  effects: TimedEffect[];
  active: ActiveCommitment | null;
  pendingEvent: string | null;
  eventsSeen: number;
  paused: boolean;
  speed: 2;
  won: boolean;
  logs: GameLog[];
}

export interface Rates extends Resources {
  population: number;
  seedConsumption: number;
}

export interface CommitmentDefinition {
  id: string;
  act: Act;
  name: string;
  category: string;
  description: string;
  forecast: string;
  duration: number;
  birds: number;
  costs: Partial<Resources>;
  visible: (state: GameState) => boolean;
}

export interface Objective {
  title: string;
  detail: string;
  progress: number;
  next: string;
}

export interface EventOption {
  id: string;
  name: string;
  effect: string;
}

export interface EventDefinition {
  id: string;
  act: Act;
  eyebrow: string;
  title: string;
  text: string;
  options: EventOption[];
}

export interface TechDefinition {
  id: string;
  act: Act;
  name: string;
  description: string;
  cost: Partial<Resources>;
}

export interface OnboardingStep {
  id: "seed-cache" | "first-nest";
  title: string;
  description: string;
  result: string;
  action: string;
  costs: Partial<Resources>;
}

export const ACT_NAMES: Record<Act, string> = {
  1: "The Flock",
  2: "The Aerie",
  3: "Dominion",
  4: "The Great Migration",
  5: "Eternal Flight",
};

export const ROLE_DEFS: Array<{
  id: RoleId;
  name: string;
  act: Act;
  description: string;
  color: string;
}> = [
  {
    id: "foragers",
    name: "Foragers",
    act: 1,
    description: "Gather seeds and sustain the flock",
    color: "leaf",
  },
  {
    id: "weavers",
    name: "Weavers",
    act: 1,
    description: "Shape twigs into lasting structures",
    color: "twig",
  },
  {
    id: "scouts",
    name: "Scouts",
    act: 1,
    description: "Turn field observations into knowledge",
    color: "sky",
  },
  {
    id: "broodkeepers",
    name: "Broodkeepers",
    act: 2,
    description: "Grow the flock while seed stores are healthy",
    color: "sun",
  },
  {
    id: "scholars",
    name: "Scholars",
    act: 2,
    description: "Turn observations into knowledge",
    color: "ink",
  },
  {
    id: "envoys",
    name: "Envoys",
    act: 3,
    description: "Build influence without exhausting stores",
    color: "rose",
  },
  {
    id: "navigators",
    name: "Navigators",
    act: 4,
    description: "Harvest starlight and guide the arks",
    color: "violet",
  },
];

export const DOCTRINES: Array<{
  id: DoctrineId;
  name: string;
  description: string;
  tradeoff: string;
}> = [
  {
    id: "stewardship",
    name: "Stewardship",
    description: "Deep reserves, happier birds, resilient habitats.",
    tradeoff: "Stores +25% · basic output +10% · commitments +6% slower",
  },
  {
    id: "ingenuity",
    name: "Ingenuity",
    description: "Fast projects and compounding scholarship.",
    tradeoff: "Knowledge +35% · commitments 12% faster · consumption +8%",
  },
  {
    id: "wanderlust",
    name: "Wanderlust",
    description: "Better routes, expeditions, and stellar reach.",
    tradeoff: "Scouting +40% · starlight +25% · steady output −5%",
  },
];

export const TECHS: TechDefinition[] = [
  {
    id: "woven-baskets",
    act: 1,
    name: "Woven Baskets",
    description: "Weavers produce 25% more twigs.",
    cost: { seeds: 90, twigs: 36 },
  },
  {
    id: "seed-ledgers",
    act: 1,
    name: "Seed Ledgers",
    description: "Foragers produce 18% more seeds and forecasts become exact.",
    cost: { seeds: 150, twigs: 52 },
  },
  {
    id: "collective-memory",
    act: 2,
    name: "Collective Memory",
    description: "Scholars produce 35% more knowledge.",
    cost: { knowledge: 70, seeds: 220 },
  },
  {
    id: "roost-logistics",
    act: 2,
    name: "Roost Logistics",
    description: "All commitments complete 12% faster.",
    cost: { knowledge: 115, twigs: 260 },
  },
  {
    id: "communal-hatcheries",
    act: 2,
    name: "Communal Hatcheries",
    description: "Broodkeepers grow the flock 50% faster.",
    cost: { knowledge: 150, seeds: 480 },
  },
  {
    id: "civic-murmuration",
    act: 3,
    name: "Civic Murmuration",
    description: "Envoys and beacons produce 40% more influence.",
    cost: { knowledge: 260, seeds: 720 },
  },
  {
    id: "reserve-granaries",
    act: 3,
    name: "Reserve Granaries",
    description: "Seed and twig storage increase by 50%.",
    cost: { knowledge: 340, twigs: 840 },
  },
  {
    id: "heliography",
    act: 4,
    name: "Heliography",
    description: "Navigators gather 60% more starlight.",
    cost: { knowledge: 720, starlight: 60 },
  },
  {
    id: "autonomous-wings",
    act: 4,
    name: "Autonomous Wings",
    description: "Established star systems expand 50% faster.",
    cost: { knowledge: 1200, starlight: 150 },
  },
];

export const EVENTS: EventDefinition[] = [
  {
    id: "summer-gale",
    act: 1,
    eyebrow: "A change in the weather",
    title: "A warm gale bends the western boughs",
    text: "The route is fast, but exposed. The flock can ride it or reinforce the young nests.",
    options: [
      {
        id: "ride",
        name: "Ride the gale",
        effect: "+2 surveyed routes · −35 seeds",
      },
      {
        id: "brace",
        name: "Brace the nests",
        effect: "+15% morale · −24 twigs",
      },
    ],
  },
  {
    id: "garden-treaty",
    act: 2,
    eyebrow: "Someone has noticed",
    title: "A gardener leaves grain beneath the council tree",
    text: "Accepting makes the flock visible. Refusing preserves distance, but wastes an opening.",
    options: [
      {
        id: "accept",
        name: "Accept openly",
        effect: "+250 seed storage · Foragers +15% · +8 influence",
      },
      {
        id: "study",
        name: "Observe from cover",
        effect: "+70 knowledge · +1 surveyed route",
      },
    ],
  },
  {
    id: "civic-doubt",
    act: 3,
    eyebrow: "A question of legitimacy",
    title: "The outer roosts dispute the council’s pace",
    text: "A patient congress builds trust. A dazzling construction demonstrates momentum.",
    options: [
      {
        id: "congress",
        name: "Call a congress",
        effect: "+18 influence · −160 knowledge",
      },
      {
        id: "monument",
        name: "Raise a sky monument",
        effect: "+12 influence · −300 twigs · +10% morale",
      },
    ],
  },
  {
    id: "quiet-signal",
    act: 4,
    eyebrow: "From beyond the mapped dark",
    title: "A repeating signal answers the first ark",
    text: "The pattern could guide expansion—or become the archive’s most important unanswered question.",
    options: [
      {
        id: "follow",
        name: "Follow the signal",
        effect: "+2 star systems · −90 starlight",
      },
      {
        id: "archive",
        name: "Archive the pattern",
        effect: "+420 knowledge · +45 starlight",
      },
    ],
  },
];

export const COMMITMENTS: CommitmentDefinition[] = [
  {
    id: "survey-canopy",
    act: 1,
    name: "Survey the Canopy",
    category: "Exploration",
    description: "Map reliable gathering routes before the flock expands.",
    forecast: "+2 routes · unlocks Knowledge and Scouts",
    duration: 20,
    birds: 2,
    costs: { seeds: 55, twigs: 18 },
    visible: (state) =>
      state.completed.includes("first-nest") &&
      !state.completed.includes("survey-canopy"),
  },
  {
    id: "build-nest",
    act: 1,
    name: "Build a Nest",
    category: "Infrastructure",
    description: "Commit two birds to sheltered flock capacity and deeper stores.",
    forecast: "+4 flock capacity · larger stores",
    duration: 22,
    birds: 2,
    costs: { seeds: 120, twigs: 55 },
    visible: (state) =>
      state.completed.includes("first-nest") && state.nests < 12,
  },
  {
    id: "seasonal-flight",
    act: 1,
    name: "Follow the Great Seedfall",
    category: "Seasonal strategy",
    description: "Coordinate every gathering route around a brief, abundant migration.",
    forecast: "+1 permanent route · production surge for 90 seconds",
    duration: 20,
    birds: 3,
    costs: { seeds: 90, twigs: 45 },
    visible: (state) => state.surveyedRoutes > 0,
  },
  {
    id: "found-roost",
    act: 1,
    name: "Establish the First Roost",
    category: "Era project",
    description: "Bind the scattered nests into a permanent home.",
    forecast: "Begins Act II · unlocks scholarship and doctrine",
    duration: 32,
    birds: 4,
    costs: { seeds: 280, twigs: 170 },
    visible: (state) =>
      state.nests >= 2 &&
      state.completed.includes("survey-canopy") &&
      !state.completed.includes("found-roost"),
  },
  {
    id: "raise-archive",
    act: 2,
    name: "Raise an Aerie Archive",
    category: "Knowledge",
    description: "Build a wind-sheltered memory house for the scholars.",
    forecast: "+250 knowledge storage · +12% knowledge",
    duration: 82,
    birds: 4,
    costs: { seeds: 260, twigs: 190, knowledge: 30 },
    visible: (state) => state.archives < 3,
  },
  {
    id: "welcome-brood",
    act: 2,
    name: "Welcome a New Brood",
    category: "Population",
    description: "Prepare stores and shelter for four new birds.",
    forecast: "+4 flock · immediate staffing flexibility",
    duration: 72,
    birds: 3,
    costs: { seeds: 330, twigs: 90 },
    visible: (state) => state.flock + 4 <= getCapacity(state),
  },
  {
    id: "river-expedition",
    act: 2,
    name: "Chart the River Corridor",
    category: "Exploration",
    description: "Send scouts beyond the hedgerow to find trade and new routes.",
    forecast: "+2 routes · +8 influence · uncertain stores",
    duration: 88,
    birds: 4,
    costs: { seeds: 180, knowledge: 45 },
    visible: (state) => state.surveyedRoutes < 10,
  },
  {
    id: "found-council",
    act: 2,
    name: "Convene the Sky Council",
    category: "Era project",
    description: "Turn a thriving aerie into an organized civilization.",
    forecast: "Begins Act III · unlocks influence and envoys",
    duration: 145,
    birds: 6,
    costs: { seeds: 640, twigs: 440, knowledge: 150 },
    visible: (state) =>
      state.archives >= 1 &&
      state.flock >= 18 &&
      !state.completed.includes("found-council"),
  },
  {
    id: "raise-beacon",
    act: 3,
    name: "Raise a Chorus Beacon",
    category: "Civic infrastructure",
    description: "Carry council songs to distant roosts without coercion.",
    forecast: "+12 influence · passive civic reach",
    duration: 118,
    birds: 6,
    costs: { seeds: 820, twigs: 620, knowledge: 170 },
    visible: (state) => state.beacons < 5,
  },
  {
    id: "treaty-flight",
    act: 3,
    name: "Send a Treaty Flight",
    category: "Diplomacy",
    description: "Commit senior envoys to a slow, credible accord.",
    forecast: "+10 influence · Envoys +75% for 2 minutes",
    duration: 108,
    birds: 5,
    costs: { seeds: 520, knowledge: 250 },
    visible: (state) => state.resources.influence < 100,
  },
  {
    id: "civic-roost",
    act: 3,
    name: "Build a Civic Roost",
    category: "Infrastructure",
    description: "Expand capacity while making the council locally useful.",
    forecast: "+8 capacity · +8 influence · production harmony",
    duration: 136,
    birds: 7,
    costs: { seeds: 920, twigs: 740 },
    visible: (state) => state.roosts < 5,
  },
  {
    id: "unite-world",
    act: 3,
    name: "Ratify the Open-Sky Accord",
    category: "Era project",
    description: "Unite the world’s roosts around migration, knowledge, and mutual shelter.",
    forecast: "Begins Act IV · turns the living atlas toward the stars",
    duration: 195,
    birds: 10,
    costs: { seeds: 2200, twigs: 1450, knowledge: 620, influence: 100 },
    visible: (state) =>
      state.beacons >= 2 &&
      state.flock >= 30 &&
      state.resources.influence >= 100 &&
      !state.completed.includes("unite-world"),
  },
  {
    id: "launch-ark",
    act: 4,
    name: "Launch a Seed Ark",
    category: "Stellar expansion",
    description: "Send a self-sufficient habitat beyond the home system.",
    forecast: "+3 star systems · permanent starlight network",
    duration: 164,
    birds: 12,
    costs: { seeds: 3400, twigs: 2200, knowledge: 980, starlight: 75 },
    visible: (state) => state.systems < 8,
  },
  {
    id: "deep-scan",
    act: 4,
    name: "Read the Deep Sky",
    category: "Exploration",
    description: "Let navigators trade speed for certainty in the dark.",
    forecast: "+2 star systems · +1 surveyed route",
    duration: 116,
    birds: 8,
    costs: { knowledge: 760, starlight: 45 },
    visible: (state) => state.systems < 10,
  },
  {
    id: "solar-nest",
    act: 4,
    name: "Weave the Solar Nursery",
    category: "Infrastructure",
    description: "Turn sunlight and dust into a permanent migratory harbor.",
    forecast: "+24 flock capacity · major seed, twig, and starlight stores",
    duration: 142,
    birds: 10,
    costs: { seeds: 2700, twigs: 1800, starlight: 110 },
    visible: (state) => state.solarNests < 4,
  },
  {
    id: "seed-galaxy",
    act: 4,
    name: "Begin the Great Murmuration",
    category: "Final project",
    description: "Commit the mature civilization to a galaxy-wide living network.",
    forecast: "Completes the campaign · the ending reflects your doctrine",
    duration: 280,
    birds: 20,
    costs: {
      seeds: 7200,
      twigs: 4800,
      knowledge: 2900,
      starlight: 300,
    },
    visible: (state) =>
      state.systems >= 8 &&
      state.flock >= 50 &&
      !state.completed.includes("seed-galaxy"),
  },
];

export function createInitialState(): GameState {
  return {
    version: SAVE_VERSION,
    act: 1,
    elapsed: 0,
    lastSavedAt: Date.now(),
    resources: {
      seeds: 18,
      twigs: 0,
      knowledge: 0,
      influence: 0,
      starlight: 0,
    },
    flock: 6,
    roles: {
      foragers: 3,
      weavers: 0,
      scouts: 0,
      broodkeepers: 0,
      scholars: 0,
      envoys: 0,
      navigators: 0,
    },
    nests: 0,
    roosts: 0,
    archives: 0,
    beacons: 0,
    solarNests: 0,
    systems: 0,
    surveyedRoutes: 0,
    morale: 0.82,
    doctrine: null,
    techs: [],
    completed: [],
    effects: [],
    active: null,
    pendingEvent: null,
    eventsSeen: 0,
    paused: false,
    speed: 2,
    won: false,
    logs: [
      {
        id: 1,
        at: 0,
        text: "Six birds gather in the Sunward Canopy. Three begin collecting seed; three watch and learn.",
        tone: "story",
      },
    ],
  };
}

export function hydrateState(value: unknown): GameState {
  const initial = createInitialState();
  if (!value || typeof value !== "object") return initial;
  const saved = value as Partial<GameState>;
  if (saved.version !== SAVE_VERSION) return initial;
  return {
    ...initial,
    ...saved,
    resources: { ...initial.resources, ...(saved.resources ?? {}) },
    roles: { ...initial.roles, ...(saved.roles ?? {}) },
    logs: Array.isArray(saved.logs) ? saved.logs.slice(-80) : initial.logs,
    completed: Array.isArray(saved.completed) ? saved.completed : [],
    techs: Array.isArray(saved.techs) ? saved.techs : [],
    effects: Array.isArray(saved.effects) ? saved.effects : [],
    speed: 2,
    lastSavedAt: Date.now(),
  };
}

export function isRoleUnlocked(state: GameState, roleId: RoleId): boolean {
  if (roleId === "foragers") return true;
  if (roleId === "weavers") return state.completed.includes("seed-cache");
  if (roleId === "scouts") {
    return state.completed.includes("survey-canopy");
  }
  const definition = ROLE_DEFS.find((role) => role.id === roleId);
  return Boolean(definition && definition.act <= state.act);
}

export function isResourceUnlocked(
  state: GameState,
  resource: ResourceId,
): boolean {
  if (resource === "seeds") return true;
  if (resource === "twigs") return state.completed.includes("seed-cache");
  if (resource === "knowledge") {
    return state.completed.includes("survey-canopy") || state.act >= 2;
  }
  if (resource === "influence") return state.act >= 3;
  return state.act >= 4;
}

export function isResearchUnlocked(state: GameState): boolean {
  return state.completed.includes("first-nest");
}

export function getOnboardingStep(state: GameState): OnboardingStep | null {
  if (!state.completed.includes("seed-cache")) {
    return {
      id: "seed-cache",
      title: "Set Aside a Seed Cache",
      description:
        "Before the flock plans expeditions, it needs somewhere safe to keep what the foragers find.",
      result: "Unlocks twigs, Weavers, and larger seed storage",
      action: "Build the seed cache",
      costs: { seeds: 45 },
    };
  }
  if (!state.completed.includes("first-nest")) {
    return {
      id: "first-nest",
      title: "Weave the First Nest",
      description:
        "Assign a Weaver, gather flexible twigs, and turn loose materials into the flock’s first permanent structure.",
      result: "Unlocks field plans and Research",
      action: "Build the first nest",
      costs: { seeds: 85, twigs: 20 },
    };
  }
  return null;
}

export function canCompleteOnboardingStep(
  state: GameState,
  step: OnboardingStep,
): { ok: boolean; reason: string } {
  if (!hasCosts(state, step.costs)) {
    return { ok: false, reason: formatMissingCosts(state, step.costs) };
  }
  return { ok: true, reason: "Ready to build." };
}

export function completeOnboardingStep(
  state: GameState,
  stepId: OnboardingStep["id"],
): GameState {
  const step = getOnboardingStep(state);
  if (!step || step.id !== stepId || !canCompleteOnboardingStep(state, step).ok) {
    return state;
  }
  const next: GameState = {
    ...state,
    resources: spendCosts(state.resources, step.costs),
    completed: [...state.completed, step.id],
  };
  if (step.id === "first-nest") {
    next.nests += 1;
  }
  return pushLog(
    next,
    step.id === "seed-cache"
      ? "The flock lines a hollow with dry grass. Seeds can finally be stored without scattering."
      : "The first nest settles into the tree. With shelter secured, the flock can think beyond the next meal.",
    "story",
  );
}

export function getCapacity(state: GameState): number {
  return (
    10 +
    state.nests * 4 +
    state.roosts * 8 +
    state.solarNests * 12 +
    state.systems * 2
  );
}

export function getIdleBirds(state: GameState): number {
  const assigned = Object.values(state.roles).reduce(
    (total, value) => total + value,
    0,
  );
  return Math.max(0, state.flock - assigned - (state.active?.birds ?? 0));
}

export function getStorage(state: GameState): Resources {
  const doctrineStore = state.doctrine === "stewardship" ? 1.25 : 1;
  const techStore = state.techs.includes("reserve-granaries") ? 1.5 : 1;
  return {
    seeds:
      ((state.completed.includes("seed-cache") ? 420 : 180) +
        (state.completed.includes("event:garden-treaty:accept") ? 250 : 0) +
        state.nests * 180 +
        state.roosts * 420 +
        state.solarNests * 600 +
        state.systems * 280) *
      doctrineStore *
      techStore,
    twigs:
      (200 +
        state.nests * 120 +
        state.roosts * 260 +
        state.solarNests * 650 +
        state.systems * 260) *
      doctrineStore *
      techStore,
    knowledge: 90 + state.archives * 270 + state.beacons * 80 + state.systems * 320,
    influence: 100,
    starlight: 180 + state.solarNests * 160 + state.systems * 90,
  };
}

export function getCondition(state: GameState): {
  name: string;
  detail: string;
  seed: number;
  twig: number;
} {
  const phase = Math.floor(state.elapsed / 70) % 3;
  if (phase === 0) {
    return {
      name: "Sunlit",
      detail: "Seedfall is abundant",
      seed: 1.12,
      twig: 0.94,
    };
  }
  if (phase === 1) {
    return {
      name: "Crosswind",
      detail: "Loose twigs are easy to find",
      seed: 0.96,
      twig: 1.2,
    };
  }
  return {
    name: "Soft rain",
    detail: "Stores grow slowly; morale recovers",
    seed: 0.82,
    twig: 1.08,
  };
}

export function calculateRates(state: GameState): Rates {
  const condition = getCondition(state);
  const harmony = 1 + state.roosts * 0.08;
  const routeSeed = 1 + state.surveyedRoutes * 0.035;
  const routeTwig = 1 + state.surveyedRoutes * 0.045;
  const steady =
    state.doctrine === "wanderlust" ? 0.95 : state.doctrine ? 1.1 : 1;
  const seedTech = state.techs.includes("seed-ledgers") ? 1.18 : 1;
  const twigTech = state.techs.includes("woven-baskets") ? 1.25 : 1;
  const knowledgeTech = state.techs.includes("collective-memory") ? 1.35 : 1;
  const influenceTech = state.techs.includes("civic-murmuration") ? 1.4 : 1;
  const starTech = state.techs.includes("heliography") ? 1.6 : 1;
  const doctrineKnowledge = state.doctrine === "ingenuity" ? 1.35 : 1;
  const doctrineExplore = state.doctrine === "wanderlust" ? 1.4 : 1;
  const doctrineStar = state.doctrine === "wanderlust" ? 1.25 : 1;
  const seedfall = state.effects.some(
    (effect) => effect.id === "seedfall" && effect.until > state.elapsed,
  );
  const diplomaticTailwind = state.effects.some(
    (effect) =>
      effect.id === "diplomatic-tailwind" && effect.until > state.elapsed,
  );
  const gardenAccess = state.completed.includes(
    "event:garden-treaty:accept",
  );
  const seedConsumption =
    state.flock * 0.08 * (state.doctrine === "ingenuity" ? 1.08 : 1);

  const seeds =
    state.roles.foragers *
      0.68 *
      condition.seed *
      routeSeed *
      harmony *
      steady *
      seedTech *
      (seedfall ? 1.45 : 1) *
      (gardenAccess ? 1.15 : 1) -
    seedConsumption;
  const twigs =
    state.roles.weavers *
    0.38 *
    condition.twig *
    routeTwig *
    harmony *
    steady *
    twigTech *
    (seedfall ? 1.25 : 1);
  const knowledge =
    (state.roles.scholars * 0.16 +
      state.roles.scouts * 0.025 * doctrineExplore +
      state.archives * 0.055) *
    harmony *
    knowledgeTech *
    doctrineKnowledge;
  const influence =
    (state.roles.envoys * 0.08 + state.beacons * 0.025) *
    influenceTech *
    (diplomaticTailwind ? 1.75 : 1) *
    Math.max(0.7, state.morale);
  const starlight =
    (state.roles.navigators * 0.05 + state.systems * 0.025) *
    starTech *
    doctrineStar;
  const population =
    state.flock < getCapacity(state) && state.resources.seeds > state.flock * 3
      ? (state.roles.broodkeepers * 0.008 + state.nests * 0.001) *
        (state.techs.includes("communal-hatcheries") ? 1.5 : 1) *
        state.morale
      : 0;

  return {
    seeds,
    twigs,
    knowledge,
    influence,
    starlight,
    population,
    seedConsumption,
  };
}

export function getRoleYield(state: GameState, roleId: RoleId): string {
  const before = calculateRates(state);
  const after = calculateRates({
    ...state,
    roles: {
      ...state.roles,
      [roleId]: state.roles[roleId] + 1,
    },
  });
  const descriptions: Record<RoleId, [keyof Rates, string]> = {
    foragers: ["seeds", "seeds"],
    weavers: ["twigs", "twigs"],
    scouts: ["knowledge", "knowledge"],
    broodkeepers: ["population", "birds"],
    scholars: ["knowledge", "knowledge"],
    envoys: ["influence", "influence"],
    navigators: ["starlight", "starlight"],
  };
  const [rateKey, label] = descriptions[roleId];
  const gain = Math.max(0, after[rateKey] - before[rateKey]);
  const digits = gain < 0.1 ? 3 : 2;
  return `+${formatNumber(gain, digits)} ${label}/s per bird`;
}

function pushLog(
  state: GameState,
  text: string,
  tone: GameLog["tone"] = "good",
): GameState {
  const nextLog: GameLog = {
    id: (state.logs.at(-1)?.id ?? 0) + 1,
    at: state.elapsed,
    text,
    tone,
  };
  return { ...state, logs: [...state.logs.slice(-79), nextLog] };
}

function hasCosts(state: GameState, costs: Partial<Resources>): boolean {
  return (Object.entries(costs) as Array<[ResourceId, number]>).every(
    ([key, value]) => state.resources[key] >= value,
  );
}

function spendCosts(
  resources: Resources,
  costs: Partial<Resources>,
): Resources {
  const next = { ...resources };
  (Object.entries(costs) as Array<[ResourceId, number]>).forEach(
    ([key, value]) => {
      next[key] = Math.max(0, next[key] - value);
    },
  );
  return next;
}

export function getCommitmentDuration(
  state: GameState,
  commitment: CommitmentDefinition,
): number {
  let multiplier = 1;
  if (state.doctrine === "stewardship") multiplier *= 1.06;
  if (state.doctrine === "ingenuity") multiplier *= 0.88;
  if (state.techs.includes("roost-logistics")) multiplier *= 0.88;
  return commitment.duration * multiplier;
}

export function getAvailableCommitments(
  state: GameState,
): CommitmentDefinition[] {
  if (state.won || getOnboardingStep(state)) return [];
  const currentAct = state.act as Act;
  return COMMITMENTS.filter(
    (commitment) =>
      commitment.act === currentAct &&
      commitment.visible(state) &&
      !state.completed.includes(commitment.id),
  ).slice(0, 4);
}

export function canStartCommitment(
  state: GameState,
  commitment: CommitmentDefinition,
): { ok: boolean; reason: string } {
  if (state.active) return { ok: false, reason: "Another plan is already underway." };
  if (!hasCosts(state, commitment.costs)) {
    return {
      ok: false,
      reason: formatMissingCosts(state, commitment.costs),
    };
  }
  const availableBirds = Math.floor(getIdleBirds(state) + 1e-6);
  if (availableBirds < commitment.birds) {
    const missingBirds = commitment.birds - availableBirds;
    return {
      ok: false,
      reason: `Free ${missingBirds} more bird${missingBirds === 1 ? "" : "s"} from their roles.`,
    };
  }
  return { ok: true, reason: "Ready to commit." };
}

export function startCommitment(
  state: GameState,
  commitmentId: string,
): GameState {
  const definition = COMMITMENTS.find((item) => item.id === commitmentId);
  if (
    !definition ||
    state.completed.includes(definition.id) ||
    !definition.visible(state)
  ) {
    return state;
  }
  const readiness = canStartCommitment(state, definition);
  if (!readiness.ok) return state;
  const duration = getCommitmentDuration(state, definition);
  return pushLog(
    {
      ...state,
      resources: spendCosts(state.resources, definition.costs),
      active: {
        id: definition.id,
        remaining: duration,
        duration,
        birds: definition.birds,
      },
    },
    `${definition.name} begins. ${definition.birds} birds leave their ordinary work.`,
    "story",
  );
}

export function recallCommitment(state: GameState): GameState {
  if (!state.active) return state;
  const definition = COMMITMENTS.find((item) => item.id === state.active?.id);
  return pushLog(
    { ...state, active: null },
    `${definition?.name ?? "The plan"} is recalled. Spent stores cannot be recovered.`,
    "warning",
  );
}

function completeCommitment(state: GameState, id: string): GameState {
  let next: GameState = {
    ...state,
    active: null,
    completed: state.completed.includes(id)
      ? state.completed
      : [...state.completed, id],
  };
  switch (id) {
    case "survey-canopy":
      next.surveyedRoutes += 2;
      next = pushLog(
        next,
        "The canopy survey returns with two reliable routes and a map scratched into bark.",
      );
      break;
    case "build-nest":
      next.nests += 1;
      next = pushLog(next, "A sheltered nest joins the living atlas.");
      break;
    case "seasonal-flight":
      next.surveyedRoutes += 1;
      next.effects = [
        ...next.effects.filter((effect) => effect.id !== "seedfall"),
        { id: "seedfall", until: next.elapsed + 90 },
      ];
      next = pushLog(
        next,
        "The flock synchronizes with the seedfall, permanently marking a new route while gathering surges for ninety seconds.",
      );
      break;
    case "found-roost":
      next.act = 2;
      next.roosts += 1;
      next.resources.knowledge += 24;
      next = pushLog(
        next,
        "The First Roost holds through the night. At dawn, the flock begins keeping history.",
        "story",
      );
      break;
    case "raise-archive":
      next.archives += 1;
      next = pushLog(next, "An archive opens beneath a roof of woven leaves.");
      break;
    case "welcome-brood":
      next.flock = Math.min(getCapacity(next), next.flock + 4);
      next = pushLog(next, "Four young birds join the planning circle.");
      break;
    case "river-expedition":
      next.surveyedRoutes += 2;
      next.resources.influence = Math.min(100, next.resources.influence + 8);
      next = pushLog(
        next,
        "The river corridor permanently strengthens the route network and reveals a distant roost.",
      );
      break;
    case "found-council":
      next.act = 3;
      next.beacons += 1;
      next.resources.influence = Math.max(12, next.resources.influence);
      next = pushLog(
        next,
        "The Sky Council convenes. No bird is quite sure who wrote the seating chart.",
        "story",
      );
      break;
    case "raise-beacon":
      next.beacons += 1;
      next.resources.influence = Math.min(100, next.resources.influence + 12);
      next = pushLog(next, "A new chorus beacon carries the accord beyond the horizon.");
      break;
    case "treaty-flight":
      next.resources.influence = Math.min(100, next.resources.influence + 10);
      next.effects = [
        ...next.effects.filter(
          (effect) => effect.id !== "diplomatic-tailwind",
        ),
        { id: "diplomatic-tailwind", until: next.elapsed + 120 },
      ];
      next = pushLog(
        next,
        "The treaty flight returns with allied couriers. Envoys carry their momentum for two minutes.",
      );
      break;
    case "civic-roost":
      next.roosts += 1;
      next.resources.influence = Math.min(100, next.resources.influence + 8);
      next = pushLog(next, "A civic roost makes the council useful at street level.");
      break;
    case "unite-world":
      next.act = 4;
      next.systems = 1;
      next.resources.starlight = 40;
      next = pushLog(
        next,
        "The Open-Sky Accord is ratified. The atlas turns outward; the sun becomes a destination.",
        "story",
      );
      break;
    case "launch-ark":
      next.systems += 3;
      next = pushLog(next, "A Seed Ark roots itself beneath an unfamiliar star.");
      break;
    case "deep-scan":
      next.systems += 2;
      next.surveyedRoutes += 1;
      next = pushLog(next, "The deep scan finds a quiet star and a safe line through the dark.");
      break;
    case "solar-nest":
      next.solarNests += 2;
      next = pushLog(next, "The solar nursery opens two mirrored habitats.");
      break;
    case "seed-galaxy":
      next.act = 5;
      next.won = true;
      next = pushLog(
        next,
        endingForDoctrine(next.doctrine),
        "story",
      );
      break;
    default:
      break;
  }
  return next;
}

function endingForDoctrine(doctrine: DoctrineId | null): string {
  if (doctrine === "stewardship") {
    return "The Great Murmuration spreads as a chain of gardens. Every world is left wilder than it was found.";
  }
  if (doctrine === "ingenuity") {
    return "The Great Murmuration becomes a library written across suns. The universe learns to remember itself.";
  }
  return "The Great Murmuration never settles. A galaxy of routes becomes the flock’s final, endless home.";
}

function maybeQueueEvent(state: GameState): GameState {
  if (
    state.pendingEvent ||
    state.won ||
    !state.completed.includes("first-nest")
  ) {
    return state;
  }
  const threshold = (state.eventsSeen + 1) * 190;
  if (state.elapsed < threshold) return state;
  const event =
    EVENTS.find(
      (candidate) =>
        candidate.act === state.act && !state.completed.includes(`event:${candidate.id}`),
    ) ??
    EVENTS.find(
      (candidate) =>
        candidate.act <= state.act &&
        !state.completed.includes(`event:${candidate.id}`),
    );
  return {
    ...state,
    eventsSeen: state.eventsSeen + 1,
    pendingEvent: event?.id ?? null,
  };
}

export function resolveEvent(
  state: GameState,
  eventId: string,
  optionId: string,
): GameState {
  if (state.pendingEvent !== eventId) return state;
  const next: GameState = {
    ...state,
    pendingEvent: null,
    completed: [
      ...state.completed,
      `event:${eventId}`,
      `event:${eventId}:${optionId}`,
    ],
  };
  const key = `${eventId}:${optionId}`;
  switch (key) {
    case "summer-gale:ride":
      next.surveyedRoutes += 2;
      next.resources.seeds = Math.max(0, next.resources.seeds - 35);
      break;
    case "summer-gale:brace":
      next.resources.twigs = Math.max(0, next.resources.twigs - 24);
      next.morale = Math.min(1, next.morale + 0.15);
      break;
    case "garden-treaty:accept":
      next.resources.influence = Math.min(100, next.resources.influence + 8);
      break;
    case "garden-treaty:study":
      next.resources.knowledge += 70;
      next.surveyedRoutes += 1;
      break;
    case "civic-doubt:congress":
      next.resources.knowledge = Math.max(0, next.resources.knowledge - 160);
      next.resources.influence = Math.min(100, next.resources.influence + 18);
      break;
    case "civic-doubt:monument":
      next.resources.twigs = Math.max(0, next.resources.twigs - 300);
      next.resources.influence = Math.min(100, next.resources.influence + 12);
      next.morale = Math.min(1, next.morale + 0.1);
      break;
    case "quiet-signal:follow":
      next.resources.starlight = Math.max(0, next.resources.starlight - 90);
      next.systems += 2;
      break;
    case "quiet-signal:archive":
      next.resources.knowledge += 420;
      next.resources.starlight += 45;
      break;
    default:
      break;
  }
  const event = EVENTS.find((item) => item.id === eventId);
  const option = event?.options.find((item) => item.id === optionId);
  return pushLog(
    next,
    `${event?.title ?? "The moment passes"} — ${option?.name ?? "the flock decides"}.`,
    "story",
  );
}

export function assignRole(
  state: GameState,
  roleId: RoleId,
  delta: -1 | 1,
): GameState {
  const definition = ROLE_DEFS.find((role) => role.id === roleId);
  if (
    !definition ||
    definition.act > state.act ||
    !isRoleUnlocked(state, roleId)
  ) {
    return state;
  }
  if (delta === 1 && Math.floor(getIdleBirds(state) + 1e-6) < 1) return state;
  if (delta === -1 && state.roles[roleId] < 1) return state;
  return {
    ...state,
    roles: {
      ...state.roles,
      [roleId]: state.roles[roleId] + delta,
    },
  };
}

export function chooseDoctrine(
  state: GameState,
  doctrine: DoctrineId,
): GameState {
  if (state.act < 2 || state.doctrine) return state;
  const definition = DOCTRINES.find((item) => item.id === doctrine);
  return pushLog(
    { ...state, doctrine },
    `${definition?.name ?? "A doctrine"} becomes the flock’s guiding habit.`,
    "story",
  );
}

export function purchaseTech(state: GameState, techId: string): GameState {
  const tech = TECHS.find((item) => item.id === techId);
  if (
    !tech ||
    !isResearchUnlocked(state) ||
    tech.act > state.act ||
    state.techs.includes(techId) ||
    !hasCosts(state, tech.cost)
  ) {
    return state;
  }
  return pushLog(
    {
      ...state,
      resources: spendCosts(state.resources, tech.cost),
      techs: [...state.techs, techId],
    },
    `Research completed: ${tech.name}.`,
  );
}

export function canPurchaseTech(
  state: GameState,
  tech: TechDefinition,
): boolean {
  return (
    isResearchUnlocked(state) &&
    tech.act <= state.act &&
    !state.techs.includes(tech.id) &&
    hasCosts(state, tech.cost)
  );
}

export function tickGame(state: GameState, seconds: number): GameState {
  if (state.paused || state.won || seconds <= 0) return state;
  const dt = Math.min(seconds, 10) * 2;
  const rates = calculateRates(state);
  const storage = getStorage(state);
  const resources = { ...state.resources };
  (Object.keys(resources) as ResourceId[]).forEach((key) => {
    resources[key] = Math.max(
      0,
      Math.min(storage[key], resources[key] + rates[key] * dt),
    );
  });
  const flock = Math.min(
    getCapacity(state),
    state.flock + rates.population * dt,
  );
  const condition = getCondition(state);
  const moraleTarget =
    rates.seeds >= 0 ? (condition.name === "Soft rain" ? 0.96 : 0.88) : 0.58;
  const morale =
    state.morale + (moraleTarget - state.morale) * Math.min(1, dt / 90);

  let next: GameState = {
    ...state,
    elapsed: state.elapsed + dt,
    resources,
    flock,
    morale,
    effects: state.effects.filter(
      (effect) => effect.until > state.elapsed + dt,
    ),
    speed: 2,
    lastSavedAt: Date.now(),
    active: state.active
      ? { ...state.active, remaining: state.active.remaining - dt }
      : null,
  };

  if (state.act >= 4 && state.systems > 0) {
    const expansionRate =
      state.systems *
      0.0008 *
      (state.techs.includes("autonomous-wings") ? 1.5 : 1);
    next.systems = Math.min(10, next.systems + expansionRate * dt);
  }

  if (next.active && next.active.remaining <= 0) {
    next = completeCommitment(next, next.active.id);
  }
  return maybeQueueEvent(next);
}

export function advanceGame(state: GameState, seconds: number): GameState {
  let next = state;
  let remaining = Math.max(0, Math.min(seconds, 4 * 60 * 60));
  while (remaining > 0) {
    const step = Math.min(5, remaining);
    next = tickGame(next, step);
    remaining -= step;
  }
  return next;
}

export function getObjective(state: GameState): Objective {
  if (state.act === 1) {
    const onboarding = getOnboardingStep(state);
    if (onboarding?.id === "seed-cache") {
      return {
        title: "Store the First Harvest",
        detail:
          "Let the Foragers gather enough seed to create the flock’s first dependable reserve.",
        progress: Math.min(1, state.resources.seeds / 45) * 0.18,
        next:
          state.resources.seeds >= 45
            ? "Build the seed cache"
            : `Gather ${formatNumber(45 - state.resources.seeds, 0)} more seeds`,
      };
    }
    if (onboarding?.id === "first-nest") {
      const seedReady = Math.min(1, state.resources.seeds / 85);
      const twigReady = Math.min(1, state.resources.twigs / 20);
      return {
        title: "Weave the First Nest",
        detail:
          "Assign a Weaver and gather the materials for a permanent home.",
        progress: 0.18 + (seedReady + twigReady) * 0.16,
        next:
          state.resources.twigs < 20
            ? `Gather ${formatNumber(20 - state.resources.twigs, 0)} more twigs`
            : state.resources.seeds < 85
              ? `Gather ${formatNumber(85 - state.resources.seeds, 0)} more seeds`
              : "Build the first nest",
      };
    }
    const progress =
      Math.min(1, state.nests / 2) * 0.45 +
      (state.completed.includes("survey-canopy") ? 0.25 : 0) +
      (state.active?.id === "found-roost"
        ? (1 - state.active.remaining / state.active.duration) * 0.3
        : state.completed.includes("found-roost")
          ? 0.3
          : 0);
    return {
      title: "Establish the First Roost",
      detail: "Map the canopy, shelter the flock, then bind the nests together.",
      progress,
      next:
        state.nests < 2
          ? `Build ${2 - state.nests} more nest${2 - state.nests === 1 ? "" : "s"}`
          : !state.completed.includes("survey-canopy")
            ? "Complete the canopy survey"
            : "Commit to the First Roost",
    };
  }
  if (state.act === 2) {
    const progress =
      Math.min(1, state.archives) * 0.35 +
      Math.min(1, state.flock / 18) * 0.35 +
      Math.min(1, state.resources.knowledge / 150) * 0.3;
    return {
      title: "Convene the Sky Council",
      detail: "Grow an educated aerie capable of making collective commitments.",
      progress,
      next:
        state.archives < 1
          ? "Raise an Aerie Archive"
          : state.flock < 18
            ? `Grow the flock to 18 (${formatBirds(state.flock)}/18)`
            : "Prepare the council stores",
    };
  }
  if (state.act === 3) {
    const progress =
      Math.min(1, state.beacons / 2) * 0.35 +
      Math.min(1, state.flock / 30) * 0.2 +
      Math.min(1, state.resources.influence / 100) * 0.45;
    return {
      title: "Ratify the Open-Sky Accord",
      detail: "Build trust and infrastructure across every reachable roost.",
      progress,
      next:
        state.beacons < 2
          ? "Raise two chorus beacons"
          : state.resources.influence < 100
            ? `Build influence (${Math.floor(state.resources.influence)}/100)`
            : "Commit to the global accord",
    };
  }
  if (state.act === 4) {
    const progress =
      Math.min(1, state.systems / 8) * 0.65 +
      Math.min(1, state.flock / 50) * 0.2 +
      Math.min(1, state.resources.starlight / 300) * 0.15;
    return {
      title: "Begin the Great Murmuration",
      detail: "Weave habitats, routes, and memory into a living stellar network.",
      progress,
      next:
        state.systems < 8
          ? `Reach eight star systems (${Math.floor(state.systems)}/8)`
          : state.flock < 50
            ? `Grow the flock to 50 (${formatBirds(state.flock)}/50)`
            : "Prepare the final migration",
    };
  }
  return {
    title: "The Galaxy Is Alive",
    detail: endingForDoctrine(state.doctrine),
    progress: 1,
    next: "The campaign is complete",
  };
}

export function getBottleneck(state: GameState): {
  resource: ResourceId | "idle";
  label: string;
  detail: string;
} {
  if (getIdleBirds(state) < 2) {
    return {
      resource: "idle",
      label: "Idle birds",
      detail: "Free workers to begin larger commitments.",
    };
  }
  const rates = calculateRates(state);
  const candidates: Array<[ResourceId, number]> = [
    ["seeds", rates.seeds],
    ["twigs", rates.twigs],
  ];
  if (state.act >= 2) candidates.push(["knowledge", rates.knowledge]);
  if (state.act >= 3) candidates.push(["influence", rates.influence]);
  if (state.act >= 4) candidates.push(["starlight", rates.starlight]);
  candidates.sort((a, b) => a[1] - b[1]);
  const resource = candidates[0][0];
  return {
    resource,
    label: resource[0].toUpperCase() + resource.slice(1),
    detail: `Current net rate: ${candidates[0][1].toFixed(2)}/s`,
  };
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }
  if (Math.abs(value) >= 10_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return value.toFixed(digits);
}

export function formatBirds(value: number): string {
  const floored = Math.floor(Math.max(0, value) * 10 + 1e-6) / 10;
  return Number.isInteger(floored) ? floored.toFixed(0) : floored.toFixed(1);
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return minutes > 0
    ? `${minutes}:${remainder.toString().padStart(2, "0")}`
    : `${remainder}s`;
}

export function formatCosts(costs: Partial<Resources>): string {
  return (Object.entries(costs) as Array<[ResourceId, number]>)
    .map(([key, value]) => `${formatNumber(value)} ${key}`)
    .join(" · ");
}

export function formatMissingCosts(
  state: GameState,
  costs: Partial<Resources>,
): string {
  const missing = (Object.entries(costs) as Array<[ResourceId, number]>)
    .map(([resource, cost]) => {
      const amount = Math.max(0, cost - state.resources[resource]);
      return [resource, Math.ceil(amount * 10) / 10] as const;
    })
    .filter(([, amount]) => amount > 0);
  if (missing.length === 0) return "Ready.";
  return `Need ${missing
    .map(
      ([resource, amount]) =>
        `${formatNumber(amount, Number.isInteger(amount) ? 0 : 1)} ${resource}`,
    )
    .join(" and ")}.`;
}

export function getCapSources(
  state: GameState,
  id: ResourceId | "flock",
): string[] {
  if (id === "flock") {
    return [
      "Canopy shelter: 10",
      ...(state.nests ? [`${state.nests} nests: +${state.nests * 4}`] : []),
      ...(state.roosts ? [`${state.roosts} roosts: +${state.roosts * 8}`] : []),
      ...(state.solarNests
        ? [`${state.solarNests} solar nests: +${state.solarNests * 12}`]
        : []),
      ...(state.systems ? [`Linked systems: +${state.systems * 2}`] : []),
      `Total capacity: ${formatNumber(getCapacity(state), 0)}`,
    ];
  }
  const multiplierNotes = [
    ...(state.doctrine === "stewardship" &&
    (id === "seeds" || id === "twigs")
      ? ["Stewardship: ×1.25"]
      : []),
    ...(state.techs.includes("reserve-granaries") &&
    (id === "seeds" || id === "twigs")
      ? ["Reserve Granaries: ×1.5"]
      : []),
  ];
  if (id === "seeds") {
    return [
      "Canopy stores: 180",
      ...(state.completed.includes("seed-cache") ? ["Seed cache: +240"] : []),
      ...(state.completed.includes("event:garden-treaty:accept")
        ? ["Garden access: +250"]
        : []),
      ...(state.nests ? [`Nests: +${state.nests * 180}`] : []),
      ...(state.roosts ? [`Roosts: +${state.roosts * 420}`] : []),
      ...(state.solarNests
        ? [`Solar nests: +${state.solarNests * 600}`]
        : []),
      ...(state.systems ? [`Systems: +${state.systems * 280}`] : []),
      ...multiplierNotes,
      `Total cap: ${formatNumber(getStorage(state).seeds, 0)}`,
    ];
  }
  if (id === "twigs") {
    return [
      "Canopy stores: 200",
      ...(state.nests ? [`Nests: +${state.nests * 120}`] : []),
      ...(state.roosts ? [`Roosts: +${state.roosts * 260}`] : []),
      ...(state.solarNests
        ? [`Solar nests: +${state.solarNests * 650}`]
        : []),
      ...(state.systems ? [`Systems: +${state.systems * 260}`] : []),
      ...multiplierNotes,
      `Total cap: ${formatNumber(getStorage(state).twigs, 0)}`,
    ];
  }
  if (id === "knowledge") {
    return [
      "Shared memory: 90",
      ...(state.archives ? [`Archives: +${state.archives * 270}`] : []),
      ...(state.beacons ? [`Beacons: +${state.beacons * 80}`] : []),
      ...(state.systems ? [`Systems: +${state.systems * 320}`] : []),
      `Total cap: ${formatNumber(getStorage(state).knowledge, 0)}`,
    ];
  }
  if (id === "influence") {
    return ["Council consensus fixes influence at a 100-point cap."];
  }
  return [
    "Home system: 180",
    ...(state.solarNests
      ? [`Solar nests: +${state.solarNests * 160}`]
      : []),
    ...(state.systems ? [`Systems: +${state.systems * 90}`] : []),
    `Total cap: ${formatNumber(getStorage(state).starlight, 0)}`,
  ];
}
