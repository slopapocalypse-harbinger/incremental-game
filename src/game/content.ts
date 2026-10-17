import type {
  Act,
  DoctrineId,
  GameState,
  ResourceId,
  Resources,
  RoleId,
  SeasonId,
} from "./types";

export const TUNE = {
  forager: 0.32,
  weaver: 0.18,
  scout: 0.05,
  scholar: 0.08,
  brood: 0.0065,
  envoy: 0.004,
  navigator: 0.007,
  upkeep: 0.048,
  nestSeed: 0.015,
  nestTwig: 0.01,
  archiveKnowledge: 0.02,
  beaconInfluence: 0.0012,
  systemStar: 0.0035,
  systemKnowledge: 0.008,
  solarSeed: 0.03,
  solarStar: 0.015,
  granarySeed: 0.04,
  academyKnowledge: 0.035,
  eyrieGrowth: 0.0025,
  routeBonus: 0.032,
  maxRoutes: 14,
  seasonAct1: 70,
  seasonAct2: 120,
  seasonLater: 180,
  offlineHours: 8,
  resourceCeilingNote: 1e12,
  /** Passive knowledge after the canopy survey, so the number moves before anyone is a scholar. */
  fieldNotes: 0.02,
  /** Flat rest after Welcome a brood. The card shows this and the time left. */
  broodRest: 120,
  ingenuityGift: 40,
  wanderlustGift: 2,
  /** Below one worker of that resource, the Now line names the role. */
  stallSeed: 0.05,
  stallTwig: 0.04,
  stallKnowledge: 0.07,
  stallInfluence: 0.002,
  stallStarlight: 0.004,
};

export const ACT_NAMES: Record<Act, string> = {
  1: "The Flock",
  2: "The Aerie",
  3: "Dominion",
  4: "The Crossing",
  5: "The Murmuration",
};

export const RESOURCE_LABEL: Record<ResourceId, string> = {
  seeds: "Seeds",
  twigs: "Twigs",
  knowledge: "Knowledge",
  influence: "Influence",
  starlight: "Starlight",
};

export const ROLE_DEFS: Array<{
  id: RoleId;
  name: string;
  blurb: string;
  resource: "seeds" | "twigs" | "knowledge" | "influence" | "starlight" | "population";
}> = [
  {
    id: "foragers",
    name: "Foragers",
    blurb: "Gather seeds.",
    resource: "seeds",
  },
  {
    id: "weavers",
    name: "Weavers",
    blurb: "Gather twigs.",
    resource: "twigs",
  },
  {
    id: "scouts",
    name: "Scouts",
    blurb: "Gather knowledge.",
    resource: "knowledge",
  },
  {
    id: "broodkeepers",
    name: "Broodkeepers",
    blurb: "Grow the flock.",
    resource: "population",
  },
  {
    id: "scholars",
    name: "Scholars",
    blurb: "Gather knowledge, faster.",
    resource: "knowledge",
  },
  {
    id: "envoys",
    name: "Envoys",
    blurb: "Gather influence.",
    resource: "influence",
  },
  {
    id: "navigators",
    name: "Navigators",
    blurb: "Gather starlight.",
    resource: "starlight",
  },
];

export const DOCTRINES: Array<{
  id: DoctrineId;
  name: string;
  summary: string;
  tradeoff: string;
}> = [
  {
    id: "stewardship",
    name: "Stewardship",
    summary: "Gather more, spend less, fly a bit slower.",
    tradeoff: "Felt now: gathering +8%, upkeep −8%, stores +25%. Expeditions −6%. Offline +25%.",
  },
  {
    id: "ingenuity",
    name: "Ingenuity",
    summary: "Learn faster, and eat a little more.",
    tradeoff: `Felt now: a scholar joins and +${TUNE.ingenuityGift} knowledge. Knowledge +30%. Expeditions +15%. Upkeep +10%.`,
  },
  {
    id: "wanderlust",
    name: "Wanderlust",
    summary: "More routes and scouts. Less gathering.",
    tradeoff: `Felt now: +${TUNE.wanderlustGift} routes. Routes +40%. Scouts +40%. Starlight +30%. Expeditions +10%. Gathering −6%.`,
  },
];

export interface TechDef {
  id: string;
  act: Act;
  name: string;
  summary: string;
  cost: Partial<Resources>;
}

export const TECHS: TechDef[] = [
  {
    id: "woven-baskets",
    act: 1,
    name: "Woven Baskets",
    summary: "Weavers bring home 25% more twigs.",
    cost: { seeds: 70, twigs: 24 },
  },
  {
    id: "seed-ledgers",
    act: 1,
    name: "Seed Ledgers",
    summary: "Foragers bring home 18% more seed. The cache holds 10% more.",
    cost: { seeds: 90, twigs: 30 },
  },
  {
    id: "collective-memory",
    act: 2,
    name: "Collective Memory",
    summary: "Scholars produce 30% more knowledge.",
    cost: { knowledge: 50, seeds: 140 },
  },
  {
    id: "roost-logistics",
    act: 2,
    name: "Roost Logistics",
    summary: "Expeditions resolve 12% faster.",
    cost: { knowledge: 60, twigs: 110 },
  },
  {
    id: "communal-hatcheries",
    act: 2,
    name: "Communal Hatcheries",
    summary: "Broodkeepers grow the flock 40% faster.",
    cost: { knowledge: 70, seeds: 180 },
  },
  {
    id: "civic-murmuration",
    act: 3,
    name: "Civic Murmuration",
    summary: "Envoys and beacons carry 35% more influence.",
    cost: { knowledge: 110, seeds: 240 },
  },
  {
    id: "reserve-granaries",
    act: 3,
    name: "Reserve Granaries",
    summary: "Seed and twig stores grow by 35%.",
    cost: { knowledge: 120, twigs: 260 },
  },
  {
    id: "heliography",
    act: 4,
    name: "Heliography",
    summary: "Navigators gather 50% more starlight.",
    cost: { knowledge: 160, starlight: 40 },
  },
  {
    id: "range-equation",
    act: 4,
    name: "Range Equation",
    summary: "Expeditions take 12% less time.",
    cost: { knowledge: 180, starlight: 50 },
  },
  {
    id: "fat-stores",
    act: 4,
    name: "Fat Stores",
    summary: "The flock eats 15% less.",
    cost: { knowledge: 140, seeds: 400 },
  },
];

export interface UpgradeDef {
  id: string;
  name: string;
  summary: string;
  costs: number[];
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: "fledgling",
    name: "Fledgling memory",
    summary: "The next flight starts with one more bird.",
    costs: [1, 2, 3],
  },
  {
    id: "headings",
    name: "Inherited headings",
    summary: "The next flight starts with a route.",
    costs: [1, 2],
  },
  {
    id: "twilight",
    name: "Longer twilight",
    summary: "Offline progress lasts two more hours.",
    costs: [2, 3],
  },
  {
    id: "airframe",
    name: "Cleaner airframe",
    summary: "Future flights resolve 5% faster.",
    costs: [1, 2, 3],
  },
  {
    id: "second-look",
    name: "Second look",
    summary: "A later flight can change doctrine once.",
    costs: [3],
  },
  {
    id: "charts",
    name: "Star charts",
    summary: "Knowledge and starlight arrive 10% faster.",
    costs: [2, 3, 4],
  },
  {
    id: "crops",
    name: "Deeper crops",
    summary: "Every store holds 10% more.",
    costs: [2, 3],
  },
];

export interface ProjectDef {
  id: string;
  name: string;
  act: Act;
  /** Available from this act onward. Era goals are only available in their act. */
  era: boolean;
  category: string;
  summary: string;
  forecast: string;
  duration: (state: GameState) => number;
  birds: number;
  costs: (state: GameState) => Partial<Resources>;
  repeatable: boolean;
  goal: boolean;
  visible: (state: GameState) => boolean;
  blocked?: (state: GameState) => string | null;
}

function scaled(base: number, built: number, growth: number, cap: number): number {
  return Math.round(base * Math.min(cap, Math.pow(growth, built)));
}

function allyDiscount(state: GameState): number {
  return state.flags.includes("ally") ? 0.85 : 1;
}

export const PROJECTS: ProjectDef[] = [
  {
    id: "seed-cache",
    name: "Line a seed cache",
    act: 1,
    era: true,
    category: "Foundation",
    summary: "Store seeds so they stop blowing away.",
    forecast: "Unlocks twigs, Weavers, and a store that can hold a plan.",
    duration: () => 0,
    birds: 0,
    costs: () => ({ seeds: 58 }),
    repeatable: false,
    goal: true,
    visible: (state) => !state.flags.includes("seed-cache"),
  },
  {
    id: "first-nest",
    name: "Weave the first nest",
    act: 1,
    era: true,
    category: "Foundation",
    summary: "A twig cup. Unlocks plans and research.",
    forecast: "Unlocks field plans and research. +5 flock capacity.",
    duration: () => 0,
    birds: 0,
    costs: () => ({ seeds: 48, twigs: 16 }),
    repeatable: false,
    goal: true,
    visible: (state) =>
      state.flags.includes("seed-cache") && !state.flags.includes("first-nest"),
  },
  {
    id: "survey",
    name: "Survey the canopy",
    act: 1,
    era: true,
    category: "Expedition",
    summary: "Mark the branches worth flying again.",
    forecast: "+2 routes. Unlocks knowledge and Scouts.",
    duration: () => 28,
    birds: 2,
    costs: () => ({ seeds: 36, twigs: 12 }),
    repeatable: false,
    goal: true,
    visible: (state) =>
      state.flags.includes("first-nest") && !state.flags.includes("survey"),
  },
  {
    id: "nest",
    name: "Raise a nest",
    act: 1,
    era: false,
    category: "Structure",
    summary: "More housing, and bigger stores.",
    forecast: "+5 flock capacity · larger seed and twig stores.",
    duration: (state) => 24 + count(state, "nest") * 4,
    birds: 2,
    costs: (state) => ({
      seeds: scaled(36, Math.max(0, count(state, "nest") - 1), 1.45, 3.2),
      twigs: scaled(14, Math.max(0, count(state, "nest") - 1), 1.45, 3.2),
    }),
    repeatable: true,
    goal: false,
    visible: (state) => state.flags.includes("first-nest") && count(state, "nest") < 8,
  },
  {
    id: "seedfall",
    name: "Follow the seedfall",
    act: 1,
    era: false,
    category: "Season",
    summary: "A short burst of gathering.",
    forecast: "+1 route · gathering surges for 75 seconds.",
    duration: () => 22,
    birds: 3,
    costs: () => ({ seeds: 30, twigs: 12 }),
    repeatable: true,
    goal: false,
    visible: (state) => state.flags.includes("survey") && state.routes < TUNE.maxRoutes,
    blocked: (state) => {
      const readyAt = state.cooldowns.seedfall ?? 0;
      if (state.elapsed + 0.01 < readyAt) {
        return `The seedfall needs ${Math.ceil(readyAt - state.elapsed)}s to come around again.`;
      }
      return null;
    },
  },
  {
    id: "roost",
    name: "Establish the first roost",
    act: 1,
    era: true,
    category: "Era",
    summary: "Turn the nests into a roost.",
    forecast: "Begins the aerie. Unlocks doctrine, scholarship, and brood.",
    duration: () => 42,
    birds: 3,
    costs: () => ({ seeds: 170, twigs: 95, knowledge: 8 }),
    repeatable: false,
    goal: true,
    visible: (state) =>
      state.flags.includes("survey") &&
      count(state, "nest") >= 2 &&
      !state.flags.includes("roost"),
  },
  {
    id: "archive",
    name: "Raise an archive",
    act: 2,
    era: false,
    category: "Knowledge",
    summary: "A bigger knowledge store.",
    forecast: "A larger knowledge store, and a little scholarship even when no one is reading.",
    duration: (state) => 36 + count(state, "archive") * 8,
    birds: 3,
    costs: (state) => ({
      seeds: scaled(80, count(state, "archive"), 1.55, 3),
      twigs: scaled(40, count(state, "archive"), 1.55, 3),
      knowledge: scaled(18, count(state, "archive"), 1.55, 3),
    }),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 2 && count(state, "archive") < 3,
  },
  {
    id: "brood",
    name: "Welcome a brood",
    act: 2,
    era: false,
    category: "Flock",
    summary: "Three birds now, then the nursery rests.",
    forecast: `+3 birds, if there is room. The nursery then rests ${TUNE.broodRest}s.`,
    duration: () => 30,
    birds: 2,
    costs: () => ({ seeds: 70, twigs: 24 }),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 2 && count(state, "brood") < 8,
    blocked: (state) => {
      const readyAt = state.cooldowns.brood ?? 0;
      if (state.elapsed + 0.01 < readyAt) {
        const left = Math.ceil(readyAt - state.elapsed);
        return `Nursery rests ${TUNE.broodRest}s after a brood. ${left}s left.`;
      }
      if (state.flock + 3 > capacityPreview(state) + 0.01) {
        return "The branches are full. Raise capacity before another brood.";
      }
      return null;
    },
  },
  {
    id: "corridor",
    name: "Chart a corridor",
    act: 2,
    era: false,
    category: "Expedition",
    summary: "Scouts bring back one route.",
    forecast: "+1 route.",
    duration: () => 34,
    birds: 3,
    costs: (state) => ({
      seeds: scaled(40, count(state, "corridor"), 1.3, 2.5),
      knowledge: scaled(16, count(state, "corridor"), 1.3, 2.5),
    }),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 2 && state.routes < TUNE.maxRoutes && count(state, "corridor") < 6,
  },
  {
    id: "council",
    name: "Convene the Sky Council",
    act: 2,
    era: true,
    category: "Era",
    summary: "A promise bigger than one tree.",
    forecast: "Begins dominion. Unlocks influence and Envoys.",
    duration: () => 80,
    birds: 5,
    costs: () => ({ seeds: 520, twigs: 280, knowledge: 300 }),
    repeatable: false,
    goal: true,
    visible: (state) =>
      state.act === 2 &&
      count(state, "archive") >= 1 &&
      state.flock >= 16 &&
      !state.flags.includes("council"),
    blocked: (state) =>
      state.doctrine ? null : "Choose a doctrine in Study before the council will sit.",
  },
  {
    id: "beacon",
    name: "Raise a chorus beacon",
    act: 3,
    era: false,
    category: "Civic",
    summary: "Passive influence the roosts can see.",
    forecast: "Passive influence, and a taller store of it.",
    duration: (state) => 48 + count(state, "beacon") * 6,
    birds: 4,
    costs: (state) => {
      const discount = allyDiscount(state);
      const built = count(state, "beacon");
      return {
        seeds: Math.round(scaled(280, built, 1.5, 3) * discount),
        twigs: Math.round(scaled(160, built, 1.5, 3) * discount),
        knowledge: scaled(36, built, 1.4, 2.6),
      };
    },
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 3 && count(state, "beacon") < 5,
  },
  {
    id: "treaty",
    name: "Send a treaty flight",
    act: 3,
    era: false,
    category: "Diplomacy",
    summary: "A visit that brings influence.",
    forecast: "+14 influence · Envoys work faster for 90 seconds.",
    duration: () => 36,
    birds: 3,
    costs: () => ({ seeds: 120, knowledge: 40 }),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 3 && count(state, "treaty") < 6,
    blocked: (state) => {
      const readyAt = state.cooldowns.treaty ?? 0;
      if (state.elapsed + 0.01 < readyAt) {
        return `The next flight can leave in ${Math.ceil(readyAt - state.elapsed)}s.`;
      }
      return null;
    },
  },
  {
    id: "granary",
    name: "Raise a granary roost",
    act: 3,
    era: false,
    category: "Civic roost",
    summary: "A roost that stores seed.",
    forecast: "A deep seed store and a trickle of seed that does not need a beak.",
    duration: () => 50,
    birds: 4,
    costs: (state) => roostCost(state),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 3 && civicRoosts(state) < 3,
  },
  {
    id: "academy",
    name: "Raise an academy roost",
    act: 3,
    era: false,
    category: "Civic roost",
    summary: "A roost that stores knowledge.",
    forecast: "A deep knowledge store and passive scholarship.",
    duration: () => 50,
    birds: 4,
    costs: (state) => roostCost(state),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 3 && civicRoosts(state) < 3,
  },
  {
    id: "eyrie",
    name: "Raise an eyrie roost",
    act: 3,
    era: false,
    category: "Civic roost",
    summary: "A roost with more housing.",
    forecast: "+6 flock capacity and a faster brood.",
    duration: () => 50,
    birds: 4,
    costs: (state) => roostCost(state),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 3 && civicRoosts(state) < 3,
  },
  {
    id: "accord",
    name: "Ratify the Open-Sky Accord",
    act: 3,
    era: true,
    category: "Era",
    summary: "Name the route and leave the tree.",
    forecast: "Begins the crossing. Unlocks starlight, Navigators, and a home star.",
    duration: () => 110,
    birds: 8,
    costs: () => ({ seeds: 1100, twigs: 640, knowledge: 280, influence: 150 }),
    repeatable: false,
    goal: true,
    visible: (state) =>
      state.act === 3 &&
      count(state, "beacon") >= 2 &&
      state.flock >= 24 &&
      !state.flags.includes("accord"),
  },
  {
    id: "solar",
    name: "Weave a solar nursery",
    act: 4,
    era: false,
    category: "Harbor",
    summary: "Housing and a thread of starlight.",
    forecast: "Capacity, stores, and a thread of starlight.",
    duration: (state) => 55 + count(state, "solar") * 8,
    birds: 5,
    costs: (state) => ({
      seeds: scaled(320, count(state, "solar"), 1.4, 2.8),
      twigs: scaled(180, count(state, "solar"), 1.4, 2.8),
      starlight: scaled(28, count(state, "solar"), 1.35, 2.4),
    }),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 4 && count(state, "solar") < 3,
  },
  {
    id: "ark",
    name: "Launch a seed ark",
    act: 4,
    era: false,
    category: "Crossing",
    summary: "A roost that becomes a star system.",
    forecast: "+1 star system. The store grows with the route.",
    duration: (state) => 70 + count(state, "ark") * 6,
    birds: 6,
    costs: (state) => {
      const built = count(state, "ark");
      return {
        seeds: scaled(280, built, 1.38, 4),
        twigs: scaled(160, built, 1.38, 4),
        knowledge: scaled(48, built, 1.32, 3),
        starlight: scaled(16, built, 1.28, 2.6),
      };
    },
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 4 && count(state, "ark") < 8,
  },
  {
    id: "scan",
    name: "Read the deep sky",
    act: 4,
    era: false,
    category: "Crossing",
    summary: "A cheaper star, and one route.",
    forecast: "+1 star system · +1 route.",
    duration: () => 48,
    birds: 4,
    costs: () => ({ knowledge: 70, starlight: 22 }),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 4 && count(state, "scan") < 4 && state.systems < 12,
  },
  {
    id: "murmur",
    name: "Begin the Great Murmuration",
    act: 4,
    era: true,
    category: "Era",
    summary: "Finish the route and end the flight.",
    forecast: "Completes the expedition. The ending remembers your doctrine.",
    duration: () => 150,
    birds: 10,
    costs: () => ({ seeds: 1680, twigs: 980, knowledge: 640, starlight: 340 }),
    repeatable: false,
    goal: true,
    visible: (state) =>
      state.act === 4 &&
      state.systems >= 6 &&
      state.flock >= 32 &&
      !state.flags.includes("murmur"),
  },
];

function roostCost(state: GameState): Partial<Resources> {
  const built = civicRoosts(state);
  return {
    seeds: scaled(360, built, 1.45, 2.6),
    twigs: scaled(220, built, 1.45, 2.6),
    knowledge: scaled(50, built, 1.35, 2.2),
  };
}

export function count(state: GameState, id: string): number {
  return state.counts[id] ?? 0;
}

export function civicRoosts(state: GameState): number {
  return count(state, "granary") + count(state, "academy") + count(state, "eyrie");
}

/** Capacity ignoring fractional flock. Used by content before engine bootstraps. */
export function capacityPreview(state: GameState): number {
  const fledgling = state.ranks.fledgling ?? 0;
  return (
    8 +
    fledgling +
    count(state, "nest") * 5 +
    (state.flags.includes("roost") ? 8 : 0) +
    count(state, "eyrie") * 6 +
    count(state, "solar") * 8 +
    state.systems * 2
  );
}

export function projectById(id: string): ProjectDef | undefined {
  return PROJECTS.find((project) => project.id === id);
}

/** Repeatable archives share one card. The title says which tier is next. */
export function projectTitle(state: GameState, project: ProjectDef): string {
  if (project.id !== "archive") return project.name;
  const next = count(state, "archive") + 1;
  if (next <= 1) return "Raise an archive";
  if (next === 2) return "Raise a second archive";
  return "Raise the last archive";
}

export interface EventOptionDef {
  id: string;
  name: string;
  effect: string;
  cost?: Partial<Resources>;
}

export interface EventDef {
  id: string;
  act: Act;
  eyebrow: string;
  title: string;
  text: string;
  options: EventOptionDef[];
  when: (state: GameState) => boolean;
}

export const EVENTS: EventDef[] = [
  {
    id: "summer-gale",
    act: 1,
    eyebrow: "Weather",
    title: "A warm gale",
    text: "Ride the wind, or hold the nests still.",
    options: [
      {
        id: "ride",
        name: "Ride the gale",
        effect: "+2 routes. Costs 28 seeds.",
        cost: { seeds: 28 },
      },
      {
        id: "brace",
        name: "Brace and let it pass",
        effect: "Morale rises. Influence and growth speed up. No stores spent.",
      },
    ],
    when: (state) => state.flags.includes("survey"),
  },
  {
    id: "night-frost",
    act: 1,
    eyebrow: "A cold night",
    title: "Night frost",
    text: "Burn twigs for warmth, or huddle and learn.",
    options: [
      {
        id: "burn",
        name: "Burn a little wood",
        effect: "Costs 16 twigs. Morale rises. The flock sleeps.",
        cost: { twigs: 16 },
      },
      {
        id: "huddle",
        name: "Huddle and watch",
        effect: "+8 knowledge. Gathering −15% for 2 min.",
      },
    ],
    when: (state) => count(state, "nest") >= 2 && state.seenEvents.includes("summer-gale"),
  },
  {
    id: "garden-treaty",
    act: 2,
    eyebrow: "Someone noticed",
    title: "Seed under the council tree",
    text: "Take the seed and be seen, or just watch.",
    options: [
      {
        id: "accept",
        name: "Accept, in the open",
        effect: "Seed store +220. Foragers +10%. +6 influence.",
      },
      {
        id: "study",
        name: "Watch from cover",
        effect: "+45 knowledge. +1 route.",
      },
    ],
    when: (state) => state.flags.includes("roost") && state.elapsed > state.actStartedAt + 50,
  },
  {
    id: "cuckoo",
    act: 2,
    eyebrow: "A guest",
    title: "A guest in the hedge",
    text: "Drive it off, or learn how it hides.",
    options: [
      {
        id: "drive",
        name: "Drive it off",
        effect: "Costs 24 knowledge. Brood pace stays the same.",
        cost: { knowledge: 24 },
      },
      {
        id: "tolerate",
        name: "Let it stay the week",
        effect: "+35 knowledge. Growth −20% for 3 min.",
      },
    ],
    when: (state) => count(state, "archive") >= 1,
  },
  {
    id: "song-school",
    act: 2,
    eyebrow: "What gets taught",
    title: "One song for the young",
    text: "Teach hunting or building. Not both.",
    options: [
      {
        id: "hunt",
        name: "Teach the hunting song",
        effect: "Foragers +6% from now on.",
      },
      {
        id: "build",
        name: "Teach the building song",
        effect: "Weavers +6% from now on.",
      },
    ],
    when: (state) =>
      state.seenEvents.includes("cuckoo") && state.flock >= 12 && count(state, "archive") >= 1,
  },
  {
    id: "civic-doubt",
    act: 3,
    eyebrow: "Pace",
    title: "The outer roosts are impatient",
    text: "Answer them, or let the complaint stand.",
    options: [
      {
        id: "congress",
        name: "Call a congress",
        effect: "Costs 50 knowledge. +18 influence.",
        cost: { knowledge: 50 },
      },
      {
        id: "leave",
        name: "Let the complaint stand",
        effect: "+4 influence. Morale dips. No stores spent.",
      },
    ],
    when: (state) => state.flags.includes("council") && state.elapsed > state.actStartedAt + 40,
  },
  {
    id: "storm-year",
    act: 3,
    eyebrow: "A hard season",
    title: "The seed heads close early",
    text: "Share the stores, or keep them and be disliked.",
    options: [
      {
        id: "open",
        name: "Open the granaries",
        effect: "Lose 12% of your seeds. +12 influence. Morale rises.",
      },
      {
        id: "hold",
        name: "Keep the reserve",
        effect: "Stores stay. Morale dips.",
      },
    ],
    when: (state) => count(state, "beacon") >= 1,
  },
  {
    id: "rival-aerie",
    act: 3,
    eyebrow: "Another flock",
    title: "Another flock on your route",
    text: "Contest the corridor, or share a beacon.",
    options: [
      {
        id: "contest",
        name: "Contest the corridor",
        effect: "Costs 160 seeds and 80 twigs. +1 route. +10 influence.",
        cost: { seeds: 160, twigs: 80 },
      },
      {
        id: "ally",
        name: "Offer the next beacon",
        effect: "+4 influence. Later beacons cost 15% less.",
      },
    ],
    when: (state) => count(state, "beacon") >= 2,
  },
  {
    id: "quiet-signal",
    act: 4,
    eyebrow: "A signal",
    title: "A signal answers the first ark",
    text: "Follow it, or copy it and stay.",
    options: [
      {
        id: "follow",
        name: "Follow the signal",
        effect: "Costs 24 starlight. +1 system.",
        cost: { starlight: 24 },
      },
      {
        id: "archive",
        name: "Archive the pattern",
        effect: "+90 knowledge. +24 starlight.",
      },
    ],
    when: (state) => state.flags.includes("accord") && state.elapsed > state.actStartedAt + 40,
  },
  {
    id: "headwind",
    act: 4,
    eyebrow: "Range",
    title: "The next leg is too long",
    text: "Burn starlight, or wait and study.",
    options: [
      {
        id: "burn",
        name: "Burn reserve starlight",
        effect: "Costs 30 starlight. Launches +35% for about a minute.",
        cost: { starlight: 30 },
      },
      {
        id: "wait",
        name: "Wait for a window",
        effect: "+20 knowledge. No starlight spent.",
      },
    ],
    when: (state) => count(state, "ark") + count(state, "scan") >= 1,
  },
  {
    id: "last-ground",
    act: 4,
    eyebrow: "The last soil",
    title: "One wild ground left",
    text: "Leave it, or take the seed and twigs.",
    options: [
      {
        id: "sanctuary",
        name: "Leave it wild",
        effect: "Gathering −4% from now on. The ending remembers.",
      },
      {
        id: "harvest",
        name: "Take the seed",
        effect: "+180 seeds. +70 twigs. The ending remembers.",
      },
    ],
    when: (state) => state.systems >= 4,
  },
];

export const SEASONS: Array<{
  id: SeasonId;
  name: string;
  detail: string;
  seed: number;
  twig: number;
  knowledge: number;
}> = [
  {
    id: "sunlit",
    name: "Sunlit",
    detail: "Seed heads are open.",
    seed: 1.16,
    twig: 0.92,
    knowledge: 1,
  },
  {
    id: "crosswind",
    name: "Crosswind",
    detail: "Twigs come down easy.",
    seed: 0.94,
    twig: 1.22,
    knowledge: 1,
  },
  {
    id: "rain",
    name: "Soft rain",
    detail: "Gathering slows. Morale recovers.",
    seed: 0.9,
    twig: 1.04,
    knowledge: 1.18,
  },
  {
    id: "dearth",
    name: "Dearth",
    detail: "Seed heads are closed. Use the cache.",
    seed: 0.68,
    twig: 1.02,
    knowledge: 0.95,
  },
];

export function emptyRoles(): Record<RoleId, number> {
  return {
    foragers: 0,
    weavers: 0,
    scouts: 0,
    broodkeepers: 0,
    scholars: 0,
    envoys: 0,
    navigators: 0,
  };
}

export function emptyResources(): Resources {
  return { seeds: 0, twigs: 0, knowledge: 0, influence: 0, starlight: 0 };
}
