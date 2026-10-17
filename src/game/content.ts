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
    blurb: "Work the seed heads. The flock eats whether or not they do.",
    resource: "seeds",
  },
  {
    id: "weavers",
    name: "Weavers",
    blurb: "Turn fallen wood into anything that has to last the night.",
    resource: "twigs",
  },
  {
    id: "scouts",
    name: "Scouts",
    blurb: "A route is just a branch someone trusted twice.",
    resource: "knowledge",
  },
  {
    id: "broodkeepers",
    name: "Broodkeepers",
    blurb: "Grow the flock while the seed reserve holds.",
    resource: "population",
  },
  {
    id: "scholars",
    name: "Scholars",
    blurb: "Slower than a scout, and then much faster.",
    resource: "knowledge",
  },
  {
    id: "envoys",
    name: "Envoys",
    blurb: "Carry a decision farther than a song will travel.",
    resource: "influence",
  },
  {
    id: "navigators",
    name: "Navigators",
    blurb: "Starlight is a fix, not a feeling. They bring it home.",
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
    summary: "Keep more than you spend. The flock flies heavy and lands soft.",
    tradeoff:
      "Stores +25% · gathering +8% · upkeep −8% · expeditions −6% · offline twilight +25%",
  },
  {
    id: "ingenuity",
    name: "Ingenuity",
    summary: "Write it down, then do it faster than is comfortable.",
    tradeoff: "Knowledge +30% · expeditions +15% · upkeep +10%",
  },
  {
    id: "wanderlust",
    name: "Wanderlust",
    summary: "The route is the point. A nest is how you rest.",
    tradeoff:
      "Route bonus +40% · starlight +30% · scouting +40% · expeditions +10% · gathering −6%",
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
    summary: "Foragers bring home 18% more seed, and the cache holds 10% more.",
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
    summary: "Expeditions resolve 12% faster. Someone finally wrote the order down.",
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
    summary: "Seed and twig stores grow by 35%. Useful, and not required to finish.",
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
    summary: "An expedition is a fuel problem. Better fixes, 12% less time in the wind.",
    cost: { knowledge: 180, starlight: 50 },
  },
  {
    id: "fat-stores",
    act: 4,
    name: "Fat Stores",
    summary: "Migrants fuel on fat, not hope. The flock eats 15% less.",
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
    summary: "The next expedition starts with one more bird, already housed. They begin idle.",
    costs: [1, 2, 3],
  },
  {
    id: "headings",
    name: "Inherited headings",
    summary: "The next expedition starts with a surveyed route.",
    costs: [1, 2],
  },
  {
    id: "twilight",
    name: "Longer twilight",
    summary: "Offline progress counts for two more hours.",
    costs: [2, 3],
  },
  {
    id: "airframe",
    name: "Cleaner airframe",
    summary: "Expeditions resolve 5% faster on every future flight.",
    costs: [1, 2, 3],
  },
  {
    id: "second-look",
    name: "Second look",
    summary: "On a later expedition, the doctrine can be changed once.",
    costs: [3],
  },
  {
    id: "charts",
    name: "Star charts",
    summary: "Knowledge and starlight come in 10% faster.",
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
    summary: "Line a hollow with dry grass so the seed stops blowing away.",
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
    summary: "A cup of twigs, and somewhere the next bird can stand.",
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
    summary: "Walk the branches until the good ones are obvious.",
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
    summary: "Another cup in the tree. Capacity, and a little more room in the stores.",
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
    summary: "Point every free beak at a brief, stupid abundance.",
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
    summary: "Bind the nests into a place that is still there tomorrow.",
    forecast: "Begins the aerie. Unlocks doctrine, scholarship, and brood.",
    duration: () => 55,
    birds: 4,
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
    summary: "A wind-sheltered room where a note can outlive the bird who wrote it.",
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
    summary: "Spend stores to bring three young birds up now, instead of waiting on the keepers.",
    forecast: "+3 birds, if there is room on the branches.",
    duration: () => 30,
    birds: 2,
    costs: () => ({ seeds: 70, twigs: 24 }),
    repeatable: true,
    goal: false,
    visible: (state) => state.act >= 2 && count(state, "brood") < 8,
    blocked: (state) => {
      const readyAt = state.cooldowns.brood ?? 0;
      if (state.elapsed + 0.01 < readyAt) {
        return `The nursery needs ${Math.ceil(readyAt - state.elapsed)}s.`;
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
    summary: "Send scouts past the hedgerow and bring back a line someone else can fly.",
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
    summary: "A flock that can argue can make a promise larger than one tree.",
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
    summary: "A post the outer roosts can see, so the accord is not only a rumor.",
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
    summary: "A slow pass over a roost that has not decided about you yet.",
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
    summary: "A roost that exists to be full. Specialization is permanent.",
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
    summary: "A roost that keeps the arguments, not the grain.",
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
    summary: "A roost built as a ledge. More birds, sooner.",
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
    summary: "Turn a cluster of roosts into a route with a name.",
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
    summary: "A bright ledge between legs of the route. Optional, and hungry.",
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
    summary: "A self-sufficient roost with enough range to make the next star a stop.",
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
    summary: "Trade speed for a cheaper star. It does not build you a harbor.",
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
    summary: "Commit the route. After this, home is a heading.",
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
    eyebrow: "A change in the weather",
    title: "A warm gale bends the western boughs",
    text: "The route is fast and exposed. Ride it, or keep the young nests from learning bad habits.",
    options: [
      {
        id: "ride",
        name: "Ride the gale",
        effect: "+2 routes, and 28 seeds blown out of the cache.",
        cost: { seeds: 28 },
      },
      {
        id: "brace",
        name: "Brace and let it pass",
        effect: "Morale recovers. The route can wait.",
      },
    ],
    when: (state) => state.flags.includes("survey"),
  },
  {
    id: "night-frost",
    act: 1,
    eyebrow: "A cold night",
    title: "Frost walks the windward twigs",
    text: "You can spend wood to keep the cups warm, or huddle and write down which branches failed.",
    options: [
      {
        id: "burn",
        name: "Burn a little wood",
        effect: "Spend 16 twigs. The flock sleeps.",
        cost: { twigs: 16 },
      },
      {
        id: "huddle",
        name: "Huddle and watch",
        effect: "Gathering slows for two minutes. The scouts learn something.",
      },
    ],
    when: (state) => count(state, "nest") >= 2 && state.seenEvents.includes("summer-gale"),
  },
  {
    id: "garden-treaty",
    act: 2,
    eyebrow: "Someone has noticed",
    title: "Grain under the council tree",
    text: "A gardener is leaving seed where the flock can see it. Taking it means being seen back.",
    options: [
      {
        id: "accept",
        name: "Accept, in the open",
        effect: "A larger seed store and busier foragers. You are no longer a secret.",
      },
      {
        id: "study",
        name: "Watch from cover",
        effect: "+45 knowledge and a route. The grain stays where it was.",
      },
    ],
    when: (state) => state.flags.includes("roost") && state.elapsed > state.actStartedAt + 50,
  },
  {
    id: "cuckoo",
    act: 2,
    eyebrow: "A guest",
    title: "Something else is using the hedge",
    text: "Drive it off and keep the brood's pace, or tolerate it and learn how it hides.",
    options: [
      {
        id: "drive",
        name: "Drive it off",
        effect: "Spend 24 knowledge. The brood keeps its pace.",
        cost: { knowledge: 24 },
      },
      {
        id: "tolerate",
        name: "Let it stay the week",
        effect: "+35 knowledge. Growth slows for a few minutes.",
      },
    ],
    when: (state) => count(state, "archive") >= 1,
  },
  {
    id: "song-school",
    act: 2,
    eyebrow: "What gets taught",
    title: "The young birds will learn one song properly",
    text: "There is time to teach a hunting song or a building song. Not both, not well.",
    options: [
      {
        id: "hunt",
        name: "Teach the hunting song",
        effect: "Foragers permanently a little quicker.",
      },
      {
        id: "build",
        name: "Teach the building song",
        effect: "Weavers permanently a little quicker.",
      },
    ],
    when: (state) =>
      state.seenEvents.includes("cuckoo") && state.flock >= 12 && count(state, "archive") >= 1,
  },
  {
    id: "civic-doubt",
    act: 3,
    eyebrow: "A question of pace",
    title: "The outer roosts say the council is in a hurry",
    text: "You can spend scholarship to answer them, or let the complaint stand and lose a little nerve.",
    options: [
      {
        id: "congress",
        name: "Call a congress",
        effect: "Spend 50 knowledge. Influence jumps.",
        cost: { knowledge: 50 },
      },
      {
        id: "leave",
        name: "Let the complaint stand",
        effect: "A little influence. Morale dips. No stores spent.",
      },
    ],
    when: (state) => state.flags.includes("council") && state.elapsed > state.actStartedAt + 40,
  },
  {
    id: "storm-year",
    act: 3,
    eyebrow: "A hard season",
    title: "The seed heads close early",
    text: "Open the stores for the outer roosts, or keep what you have and be disliked for it.",
    options: [
      {
        id: "open",
        name: "Open the granaries",
        effect: "Lose about 12% of your seeds. Morale and influence rise.",
      },
      {
        id: "hold",
        name: "Keep the reserve",
        effect: "The stores stay. The outer roosts remember.",
      },
    ],
    when: (state) => count(state, "beacon") >= 1,
  },
  {
    id: "rival-aerie",
    act: 3,
    eyebrow: "Another flock",
    title: "A rival aerie is flying the same corridor",
    text: "Contest the route, or trade a little pride for a cheaper beacon.",
    options: [
      {
        id: "contest",
        name: "Contest the corridor",
        effect: "+1 route and influence. Spend seeds and twigs.",
        cost: { seeds: 160, twigs: 80 },
      },
      {
        id: "ally",
        name: "Offer the next beacon",
        effect: "A small gain of influence. Your next beacons cost less.",
      },
    ],
    when: (state) => count(state, "beacon") >= 2,
  },
  {
    id: "quiet-signal",
    act: 4,
    eyebrow: "From past the mapped dark",
    title: "A repeating signal answers the first ark",
    text: "Follow it and spend the fix you have, or copy the pattern and leave the question in the archive.",
    options: [
      {
        id: "follow",
        name: "Follow the signal",
        effect: "+1 system. Spend 24 starlight.",
        cost: { starlight: 24 },
      },
      {
        id: "archive",
        name: "Archive the pattern",
        effect: "+90 knowledge and +24 starlight.",
      },
    ],
    when: (state) => state.flags.includes("accord") && state.elapsed > state.actStartedAt + 40,
  },
  {
    id: "headwind",
    act: 4,
    eyebrow: "Range",
    title: "The next leg is longer than the fix",
    text: "Burn starlight to punch through, or wait for a cleaner window and study the error.",
    options: [
      {
        id: "burn",
        name: "Burn reserve starlight",
        effect: "Spend 30 starlight. The active expedition, or the next one, runs hot for a minute.",
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
    title: "One ground still grows something you did not plant",
    text: "Leave it as a sanctuary, or take the seed and the twigs and do not pretend otherwise.",
    options: [
      {
        id: "sanctuary",
        name: "Leave it wild",
        effect: "Gathering is permanently a little poorer. The ending will say so.",
      },
      {
        id: "harvest",
        name: "Take the seed",
        effect: "+180 seeds and +70 twigs. The ending will say so.",
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
  expedition: number;
}> = [
  {
    id: "sunlit",
    name: "Sunlit",
    detail: "Seed heads are open. A launch leaves with the wind on the tail.",
    seed: 1.16,
    twig: 0.92,
    knowledge: 1,
    expedition: 1.1,
  },
  {
    id: "crosswind",
    name: "Crosswind",
    detail: "Twigs come down easy. Launching means fighting the wind.",
    seed: 0.94,
    twig: 1.22,
    knowledge: 1,
    expedition: 0.88,
  },
  {
    id: "rain",
    name: "Soft rain",
    detail: "The flock preens and writes. Gathering slows; morale recovers.",
    seed: 0.9,
    twig: 1.04,
    knowledge: 1.18,
    expedition: 1,
  },
  {
    id: "dearth",
    name: "Dearth",
    detail: "The heads are closed. Live on what you stored.",
    seed: 0.68,
    twig: 1.02,
    knowledge: 0.95,
    expedition: 0.95,
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
