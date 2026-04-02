const TICK_MS = 100;
const DELTA = TICK_MS / 1000;

const BIRDS_FOR_NESTS = 15;
const BIRDS_FOR_ROOSTS = 60;
const FEATHER_FOR_AVIARIES = 120;
const BIRDS_FOR_NEIGHBORHOOD = 260;
const NEIGHBORHOOD_TARGET = 100;
const TOWN_TARGET = 100;
const COUNTRY_TARGET = 100;
const STAR_TARGET = 140;

const COSTS = {
  birdBase: 12,
  birdMult: 1.14,
  nestBase: 180,
  nestMult: 1.15,
  nestTwigBase: 25,
  nestTwigMult: 1.17,
  roostBase: 1400,
  roostMult: 1.18,
  roostTwigBase: 220,
  roostTwigMult: 1.2,
  aviaryBase: 8000,
  aviaryMult: 1.2,
  aviaryScienceBase: 120,
  aviaryScienceMult: 1.22,
  starshipBase: 2_500_000,
  starshipMult: 1.32,
  starshipLoreBase: 60,
  starshipLoreMult: 1.25,
  expeditionSeedCost: 2500,
  expeditionTwigCost: 120,
  neighborhoodRallySeedCost: 4200,
  neighborhoodRallyTwigCost: 260,
  townSummitSeedCost: 18_000,
  townSummitEggCost: 45,
  countryCharterSeedCost: 85_000,
  countryCharterLoreCost: 18,
};

const BASE_RATES = {
  seedRatePerBird: 1,
  twigRatePerBird: 0.15,
  eggRatePerNest: 0.06,
  hatchRatePerNest: 0.03,
  featherScienceRatePerNest: 0.18,
  skyLoreRatePerAviary: 0.05,
  harmonyPerRoost: 0.02,
  neighborhoodInfluenceRateFactor: 2.3e-6,
  townInfluenceRateFactor: 1.6e-6,
  countryInfluenceRateFactor: 1.1e-6,
  worldControlRateFactor: 5.5e-7,
  starshipColonizeRate: 0.08,
  relicRatePerStarSystem: 0.002,
};

const MAX_OFFLINE_SECONDS = 6 * 60 * 60;
const AUTO_BUY_INTERVAL_SECONDS = 0.75;
const EVENT_CHECK_INTERVAL_SECONDS = 45;
const DOCTRINE_UNLOCK_BIRDS = 220;

const philosophyLines = [
  "A seed today, a galaxy tomorrow.",
  "Do birds dream of infinite worms?",
  "The coop is the mind, the sky is the body.",
  "We peck, therefore we are.",
  "The universe is a nest in progress.",
];

const birdChatterLines = [
  "Did you hear the wind? It approves of our nesting plans.",
  "If anyone asks, I was never here. Just fluttering.",
  "These twigs are premium grade. Smells like destiny.",
  "We should name this roost. Suggestions: Featherington.",
  "The seeds are plotting something. I can feel it.",
  "Sky lore tastes like cloudberries.",
];

const milestoneFlags = {
  neighborhood100: false,
  town100: false,
  country100: false,
  world25: false,
  world50: false,
  world75: false,
  world100: false,
  firstNest: false,
  firstRoost: false,
  firstAviary: false,
  firstStarship: false,
  firstStarSystem: false,
  firstRelic: false,
  win: false,
};

let game = null;
let tickTimer = null;
let saveTimer = null;

const elements = {
  seeds: document.getElementById("seeds"),
  seedRate: document.getElementById("seed-rate"),
  twigs: document.getElementById("twigs"),
  twigRate: document.getElementById("twig-rate"),
  eggs: document.getElementById("eggs"),
  eggRate: document.getElementById("egg-rate"),
  hatchRate: document.getElementById("hatch-rate"),
  birds: document.getElementById("birds"),
  birdRate: document.getElementById("bird-rate"),
  nests: document.getElementById("nests"),
  roosts: document.getElementById("roosts"),
  aviaries: document.getElementById("aviaries"),
  harmonyMultiplier: document.getElementById("harmony-multiplier"),
  worldControl: document.getElementById("world-control"),
  worldRate: document.getElementById("world-rate"),
  starSystems: document.getElementById("star-systems"),
  starRate: document.getElementById("star-rate"),
  featherScience: document.getElementById("feather-science"),
  featherScienceRate: document.getElementById("feather-science-rate"),
  neighborhoodInfluence: document.getElementById("neighborhood-influence"),
  neighborhoodRate: document.getElementById("neighborhood-rate"),
  townInfluence: document.getElementById("town-influence"),
  townRate: document.getElementById("town-rate"),
  countryInfluence: document.getElementById("country-influence"),
  countryRate: document.getElementById("country-rate"),
  skyLore: document.getElementById("sky-lore"),
  loreRate: document.getElementById("lore-rate"),
  relics: document.getElementById("relics"),
  nestsRow: document.getElementById("nests-row"),
  twigsRow: document.getElementById("twigs-row"),
  eggsRow: document.getElementById("eggs-row"),
  hatchControl: document.getElementById("hatch-control"),
  hatchSlider: document.getElementById("hatch-slider"),
  hatchUsage: document.getElementById("hatch-usage"),
  forageBurst: document.getElementById("forage-burst"),
  forageBurstGain: document.getElementById("forage-burst-gain"),
  forageBurstStatus: document.getElementById("forage-burst-status"),
  roostsRow: document.getElementById("roosts-row"),
  aviariesRow: document.getElementById("aviaries-row"),
  featherRow: document.getElementById("feather-row"),
  loreRow: document.getElementById("lore-row"),
  neighborhoodRow: document.getElementById("neighborhood-row"),
  townRow: document.getElementById("town-row"),
  countryRow: document.getElementById("country-row"),
  worldRow: document.getElementById("world-row"),
  spaceRow: document.getElementById("space-row"),
  relicRow: document.getElementById("relic-row"),
  ngRow: document.getElementById("ng-row"),
  ngPlus: document.getElementById("ng-plus"),
  ngMultiplier: document.getElementById("ng-multiplier"),
  expeditionButton: document.getElementById("expedition-button"),
  expeditionCost: document.getElementById("expedition-cost"),
  expeditionTwigCost: document.getElementById("expedition-twig-cost"),
  neighborhoodRally: document.getElementById("neighborhood-rally"),
  neighborhoodCost: document.getElementById("neighborhood-cost"),
  townSummit: document.getElementById("town-summit"),
  townCost: document.getElementById("town-cost"),
  countryCharter: document.getElementById("country-charter"),
  countryCost: document.getElementById("country-cost"),
  actionsPanel: document.getElementById("actions-panel"),
  heroBirds: document.getElementById("hero-birds"),
  heroUpgrades: document.getElementById("hero-upgrades"),
  resetGame: document.getElementById("reset-game"),
  buyBird: document.getElementById("buy-bird"),
  birdCost: document.getElementById("bird-cost"),
  buyNest: document.getElementById("buy-nest"),
  nestCost: document.getElementById("nest-cost"),
  nestTwigCost: document.getElementById("nest-twig-cost"),
  buyRoost: document.getElementById("buy-roost"),
  roostCost: document.getElementById("roost-cost"),
  roostTwigCost: document.getElementById("roost-twig-cost"),
  buyAviary: document.getElementById("buy-aviary"),
  aviaryCost: document.getElementById("aviary-cost"),
  aviaryScienceCost: document.getElementById("aviary-science-cost"),
  buyStarship: document.getElementById("buy-starship"),
  starshipCost: document.getElementById("starship-cost"),
  starshipLoreCost: document.getElementById("starship-lore-cost"),
  newGamePlus: document.getElementById("new-game-plus"),
  birdDesc: document.getElementById("bird-desc"),
  nestDesc: document.getElementById("nest-desc"),
  roostDesc: document.getElementById("roost-desc"),
  aviaryDesc: document.getElementById("aviary-desc"),
  starshipDesc: document.getElementById("starship-desc"),
  upgradesPanel: document.getElementById("upgrades-panel"),
  upgrades: document.getElementById("upgrades"),
  projectsPanel: document.getElementById("projects-panel"),
  projects: document.getElementById("projects"),
  achievementsPanel: document.getElementById("achievements-panel"),
  achievements: document.getElementById("achievements"),
  achievementCount: document.getElementById("achievement-count"),
  achievementTotal: document.getElementById("achievement-total"),
  achievementMultiplier: document.getElementById("achievement-multiplier"),
  automationPanel: document.getElementById("automation-panel"),
  autoBirds: document.getElementById("auto-birds"),
  autoNests: document.getElementById("auto-nests"),
  autoRoosts: document.getElementById("auto-roosts"),
  autoAviaries: document.getElementById("auto-aviaries"),
  autoStarships: document.getElementById("auto-starships"),
  autoActions: document.getElementById("auto-actions"),
  directivesPanel: document.getElementById("directives-panel"),
  directives: document.getElementById("directives"),
  commandPanel: document.getElementById("command-panel"),
  commandPoints: document.getElementById("command-points"),
  commandTalents: document.getElementById("command-talents"),
  eventPanel: document.getElementById("event-panel"),
  eventName: document.getElementById("event-name"),
  eventDetail: document.getElementById("event-detail"),
  eventTimer: document.getElementById("event-timer"),
  eventActions: document.getElementById("event-actions"),
  eventHarvest: document.getElementById("event-harvest"),
  eventStabilize: document.getElementById("event-stabilize"),
  eventIgnore: document.getElementById("event-ignore"),
  tacticsPanel: document.getElementById("tactics-panel"),
  flockFormation: document.getElementById("flock-formation"),
  flockFormationStatus: document.getElementById("flock-formation-status"),
  scoutRoute: document.getElementById("scout-route"),
  scoutRouteStatus: document.getElementById("scout-route-status"),
  specializationPanel: document.getElementById("specialization-panel"),
  specializationStatus: document.getElementById("specialization-status"),
  specializationOptions: document.getElementById("specialization-options"),
  relicLabPanel: document.getElementById("relic-lab-panel"),
  relicLabUpgrades: document.getElementById("relic-lab-upgrades"),
  log: document.getElementById("log"),
  ending: document.getElementById("ending"),
  nextTargetTitle: document.getElementById("next-target-title"),
  nextTargetDetail: document.getElementById("next-target-detail"),
  nextTargetProgressBar: document.getElementById("next-target-progress-bar"),
  nextTargetProgressText: document.getElementById("next-target-progress-text"),
  storyEra: document.getElementById("story-era"),
  storyText: document.getElementById("story-text"),
};

const heroArtState = {
  birdCount: 0,
  upgradesKey: "",
};

function createDefaultGame() {
  return {
    seeds: 0,
    twigs: 0,
    eggs: 0,
    birds: 1,
    nests: 0,
    roosts: 0,
    aviaries: 0,
    starships: 0,
    worldControl: 0,
    neighborhoodInfluence: 0,
    townInfluence: 0,
    countryInfluence: 0,
    starSystems: 0,
    featherScience: 0,
    skyLore: 0,
    relics: 0,
    birdFraction: 0,
    forageBurstCooldown: 0,
    doctrine: null,
    doctrineActionCooldown: 0,
    eventHeat: 0,
    currentRouteFocus: "balanced",
    scoutRouteTimer: 0,
    flockFormationTimer: 0,
    earlyActions: { flockFormationUsed: false, scoutRouteUsed: false },
    birdCost: COSTS.birdBase,
    nestCost: COSTS.nestBase,
    nestTwigCost: COSTS.nestTwigBase,
    roostCost: COSTS.roostBase,
    roostTwigCost: COSTS.roostTwigBase,
    aviaryCost: COSTS.aviaryBase,
    aviaryScienceCost: COSTS.aviaryScienceBase,
    starshipCost: COSTS.starshipBase,
    starshipLoreCost: COSTS.starshipLoreBase,
    peckPower: 1,
    foragePower: 1,
    seedRatePerBird: BASE_RATES.seedRatePerBird,
    twigRatePerBird: BASE_RATES.twigRatePerBird,
    eggRatePerNest: BASE_RATES.eggRatePerNest,
    hatchRatePerNest: BASE_RATES.hatchRatePerNest,
    hatchUsagePercent: 100,
    featherScienceRatePerNest: BASE_RATES.featherScienceRatePerNest,
    skyLoreRatePerAviary: BASE_RATES.skyLoreRatePerAviary,
    harmonyPerRoost: BASE_RATES.harmonyPerRoost,
    neighborhoodInfluenceRateFactor: BASE_RATES.neighborhoodInfluenceRateFactor,
    townInfluenceRateFactor: BASE_RATES.townInfluenceRateFactor,
    countryInfluenceRateFactor: BASE_RATES.countryInfluenceRateFactor,
    worldControlRateFactor: BASE_RATES.worldControlRateFactor,
    starshipColonizeRate: BASE_RATES.starshipColonizeRate,
    relicRatePerStarSystem: BASE_RATES.relicRatePerStarSystem,
    twigsUnlocked: false,
    nestsUnlocked: false,
    eggsUnlocked: false,
    roostsUnlocked: false,
    aviariesUnlocked: false,
    loreUnlocked: false,
    neighborhoodUnlocked: false,
    townUnlocked: false,
    countryUnlocked: false,
    worldUnlocked: false,
    spaceUnlocked: false,
    relicsUnlocked: false,
    expeditionsUnlocked: false,
    ngPlusCount: 0,
    ngMultiplier: 1,
    achievementBonus: 1,
    automation: {
      autoBirds: false,
      autoNests: false,
      autoRoosts: false,
      autoAviaries: false,
      autoStarships: false,
      autoActions: false,
    },
    autoBuyTimer: 0,
    achievements: {},
    commandPoints: 0,
    directives: {},
    commandTalents: {
      thrift: 0,
      broodcare: 0,
      diplomacy: 0,
      astro: 0,
    },
    relicLab: {
      efficiency: 0,
      weatherproofing: 0,
      archives: 0,
    },
    activeEvent: null,
    eventTimeRemaining: 0,
    eventCooldown: EVENT_CHECK_INTERVAL_SECONDS,
    upgrades: {},
    projects: {},
    log: [],
    won: false,
    lastSavedAt: Date.now(),
  };
}

const upgradesConfig = [
  {
    id: "gathering-calls",
    name: "Gathering Calls",
    desc: "Seed rate per bird increases by 50%. Squawk for success.",
    cost: 120,
    unlockCondition: () => game.birds >= 6,
    applyEffect: () => {
      game.seedRatePerBird *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.seedRatePerBird *= 1.5;
    },
  },
  {
    id: "cozy-nests",
    name: "Cozy Nests",
    desc: "Nest growth speeds up by 50%. Warm fluff, warm future.",
    cost: 600,
    unlockCondition: () => game.nests >= 1,
    applyEffect: () => {
      game.hatchRatePerNest *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.hatchRatePerNest *= 1.5;
    },
  },
  {
    id: "flock-discounts",
    name: "Flock Discounts",
    desc: "Birds and nests cost 20% less right now. Bulk seed ordering.",
    cost: 1500,
    unlockCondition: () => game.birds >= 25,
    applyEffect: () => {
      game.birdCost = Math.max(1, Math.ceil(game.birdCost * 0.8));
      game.nestCost = Math.max(1, Math.ceil(game.nestCost * 0.8));
    },
    reapplyEffectForLoad: () => {},
  },
  {
    id: "sharper-beaks",
    name: "Sharper Beaks",
    desc: "Twice the seed rate per bird. Natural selection, but spikier.",
    cost: 180,
    unlockCondition: () => game.birds >= 12,
    applyEffect: () => {
      game.seedRatePerBird *= 2;
    },
    reapplyEffectForLoad: () => {
      game.seedRatePerBird *= 2;
    },
  },
  {
    id: "bird-brains",
    name: "Bird Brains",
    desc: "Double seed rate and bird hatching rate. Genius is just organized pecking.",
    cost: 3500,
    unlockCondition: () => game.birds >= 80,
    applyEffect: () => {
      game.seedRatePerBird *= 2;
      game.hatchRatePerNest *= 2;
    },
    reapplyEffectForLoad: () => {
      game.seedRatePerBird *= 2;
      game.hatchRatePerNest *= 2;
    },
  },
  {
    id: "nest-weaving",
    name: "Nest Weaving",
    desc: "Egg production per nest +50%. The flock perfects woven warmth.",
    cost: 1600,
    unlockCondition: () => game.nests >= 3,
    applyEffect: () => {
      game.eggRatePerNest *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.eggRatePerNest *= 1.5;
    },
  },
  {
    id: "twig-weaving",
    name: "Twig Weaving",
    desc: "Twigs per bird +50%. The flock learns artisanal carpentry.",
    cost: 2200,
    unlockCondition: () => game.twigsUnlocked && game.birds >= 40,
    applyEffect: () => {
      game.twigRatePerBird *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.twigRatePerBird *= 1.5;
    },
  },
  {
    id: "incubator-fires",
    name: "Incubator Fires",
    desc: "Egg production and hatching +60%. Warmth with purpose.",
    cost: 4200,
    unlockCondition: () => game.eggsUnlocked && game.nests >= 6,
    applyEffect: () => {
      game.eggRatePerNest *= 1.6;
      game.hatchRatePerNest *= 1.6;
    },
    reapplyEffectForLoad: () => {
      game.eggRatePerNest *= 1.6;
      game.hatchRatePerNest *= 1.6;
    },
  },
  {
    id: "roost-harmony",
    name: "Roost Harmony",
    desc: "Roost harmony bonus +50%. Every landing is a chorus.",
    cost: 12_000,
    unlockCondition: () => game.roosts >= 2,
    applyEffect: () => {
      game.harmonyPerRoost *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.harmonyPerRoost *= 1.5;
    },
  },
  {
    id: "lorekeepers",
    name: "Lorekeepers",
    desc: "Sky Lore production +75%. Archivists with wings.",
    costFeatherScience: 600,
    unlockCondition: () => game.aviaries >= 1,
    applyEffect: () => {
      game.skyLoreRatePerAviary *= 1.75;
    },
    reapplyEffectForLoad: () => {
      game.skyLoreRatePerAviary *= 1.75;
    },
  },
  {
    id: "block-party",
    name: "Block Parties",
    desc: "Neighborhood influence grows 60% faster. Every stoop is a perch.",
    cost: 9000,
    unlockCondition: () => game.neighborhoodUnlocked,
    applyEffect: () => {
      game.neighborhoodInfluenceRateFactor *= 1.6;
    },
    reapplyEffectForLoad: () => {
      game.neighborhoodInfluenceRateFactor *= 1.6;
    },
  },
  {
    id: "town-criers",
    name: "Town Criers",
    desc: "Town influence grows 50% faster. News travels on wings.",
    cost: 26_000,
    unlockCondition: () => game.townUnlocked,
    applyEffect: () => {
      game.townInfluenceRateFactor *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.townInfluenceRateFactor *= 1.5;
    },
  },
  {
    id: "national-perches",
    name: "National Perches",
    desc: "Country influence grows 45% faster. The flock writes its charter.",
    costFeatherScience: 950,
    unlockCondition: () => game.countryUnlocked,
    applyEffect: () => {
      game.countryInfluenceRateFactor *= 1.45;
    },
    reapplyEffectForLoad: () => {
      game.countryInfluenceRateFactor *= 1.45;
    },
  },
  {
    id: "bird-propaganda",
    name: "Bird Propaganda",
    desc: "World control doubles. The United Nests approve this message.",
    cost: 80_000,
    unlockCondition: () => game.worldUnlocked && game.worldControl >= 10,
    applyEffect: () => {
      game.worldControlRateFactor *= 2;
    },
    reapplyEffectForLoad: () => {
      game.worldControlRateFactor *= 2;
    },
  },
  {
    id: "feathered-research",
    name: "Feathered Research",
    desc: "Feather Science papers accelerate world control by 75%.",
    costFeatherScience: 300,
    unlockCondition: () => game.nests >= 6,
    applyEffect: () => {
      game.worldControlRateFactor *= 1.75;
    },
    reapplyEffectForLoad: () => {
      game.worldControlRateFactor *= 1.75;
    },
  },
  {
    id: "aerial-bureaucracy",
    name: "Aerial Bureaucracy",
    desc: "World control rises 50% faster. More forms, more feathers.",
    cost: 220_000,
    unlockCondition: () => game.worldUnlocked && game.worldControl >= 30,
    applyEffect: () => {
      game.worldControlRateFactor *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.worldControlRateFactor *= 1.5;
    },
  },
  {
    id: "wormhole-tech",
    name: "Wormhole Tech",
    desc: "Wormholes made of worms. Space travel doubles.",
    cost: 20_000_000,
    unlockCondition: () => game.spaceUnlocked && game.starSystems >= 2,
    applyEffect: () => {
      game.starshipColonizeRate *= 2;
    },
    reapplyEffectForLoad: () => {
      game.starshipColonizeRate *= 2;
    },
  },
  {
    id: "star-charts",
    name: "Star Charts",
    desc: "Colonization rate increases by 50%. The stars are just seeds.",
    cost: 45_000_000,
    unlockCondition: () => game.spaceUnlocked && game.starSystems >= 8,
    applyEffect: () => {
      game.starshipColonizeRate *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.starshipColonizeRate *= 1.5;
    },
  },
];

const projectsConfig = [
  {
    id: "sky-council",
    name: "Sky Council",
    desc: "Formalize flock governance. World control rate +60%.",
    costs: { seeds: 6000, twigs: 900, eggs: 30 },
    unlockCondition: () => game.worldUnlocked && game.roosts >= 1,
    applyEffect: () => {
      game.worldControlRateFactor *= 1.6;
    },
  },
  {
    id: "aerie-archives",
    name: "Aerie Archives",
    desc: "Catalog every gust. Sky Lore per aviary +80%.",
    costs: { seeds: 15_000, featherScience: 900 },
    unlockCondition: () => game.aviaries >= 1,
    applyEffect: () => {
      game.skyLoreRatePerAviary *= 1.8;
    },
  },
  {
    id: "mythic-chorus",
    name: "Mythic Chorus",
    desc: "A living anthem. Harmony per roost doubles.",
    costs: { twigs: 8000, eggs: 200, featherScience: 2400 },
    unlockCondition: () => game.roosts >= 4,
    applyEffect: () => {
      game.harmonyPerRoost *= 2;
    },
  },
  {
    id: "neighborhood-canopies",
    name: "Neighborhood Canopies",
    desc: "Rooftop gardens and alley perches. Neighborhood influence +70%.",
    costs: { seeds: 24_000, twigs: 2400, eggs: 60 },
    unlockCondition: () => game.neighborhoodUnlocked,
    applyEffect: () => {
      game.neighborhoodInfluenceRateFactor *= 1.7;
    },
  },
  {
    id: "civic-roost-network",
    name: "Civic Roost Network",
    desc: "Transit hubs for the flock. Town influence +65%.",
    costs: { seeds: 75_000, eggs: 160, featherScience: 1800 },
    unlockCondition: () => game.townUnlocked,
    applyEffect: () => {
      game.townInfluenceRateFactor *= 1.65;
    },
  },
  {
    id: "continental-charters",
    name: "Continental Charters",
    desc: "Global treaties, but feathered. Country influence +60%.",
    costs: { seeds: 140_000, skyLore: 80, featherScience: 2600 },
    unlockCondition: () => game.countryUnlocked,
    applyEffect: () => {
      game.countryInfluenceRateFactor *= 1.6;
    },
  },
  {
    id: "wind-riders",
    name: "Wind Riders",
    desc: "Long-range gliders for crews. Colonization rate +35%.",
    costs: { seeds: 60_000, skyLore: 180, relics: 2 },
    unlockCondition: () => game.spaceUnlocked,
    applyEffect: () => {
      game.starshipColonizeRate *= 1.35;
    },
  },
  {
    id: "relic-observatory",
    name: "Relic Observatory",
    desc: "Decode cosmic relics. Relic discovery +80%.",
    costs: { seeds: 120_000, skyLore: 260, relics: 4 },
    unlockCondition: () => game.spaceUnlocked && game.starSystems >= 6,
    applyEffect: () => {
      game.relicRatePerStarSystem *= 1.8;
    },
  },
];


const doctrineConfig = [
  {
    id: "industry",
    name: "Industry Doctrine",
    desc: "High raw production, lower influence finesse.",
    modifiers: { seed: 1.3, twig: 1.3, influence: 0.92, star: 1.05 },
    actionName: "Assembly Surge",
    actionDesc: "Spend eggs to gain a short production surge.",
  },
  {
    id: "diplomacy",
    name: "Diplomacy Doctrine",
    desc: "Influence and events become easier to control.",
    modifiers: { influence: 1.32, hatch: 1.1, eventHeat: 0.88 },
    actionName: "Grand Summit",
    actionDesc: "Spend lore to immediately push all influence tracks.",
  },
  {
    id: "exploration",
    name: "Exploration Doctrine",
    desc: "Space and relic acceleration at the cost of early throughput.",
    modifiers: { star: 1.35, relic: 1.35, seed: 0.95, influence: 0.95 },
    actionName: "Deep Scan",
    actionDesc: "Spend relics for a star colonization burst.",
  },
];

const achievementsConfig = [
  {
    id: "seed-collector",
    name: "Seed Collector",
    desc: "Gather 10,000 total seeds. Unlocks stronger forage burst.",
    isUnlocked: () => game.seeds >= 10_000,
    reward: () => { game.foragePower *= 1.35; addLog("Achievement reward: Forage Burst output increased."); },
  },
  {
    id: "flock-rising",
    name: "Flock Rising",
    desc: "Reach 150 birds. Grants +1 command point cache.",
    isUnlocked: () => game.birds >= 150,
    reward: () => { game.commandPoints += 1; addLog("Achievement reward: +1 command point."); },
  },
  {
    id: "nest-architect",
    name: "Nest Architect",
    desc: "Build 25 nests.",
    isUnlocked: () => game.nests >= 25,
  },
  {
    id: "harmony-engine",
    name: "Harmony Engine",
    desc: "Build 10 roosts.",
    isUnlocked: () => game.roosts >= 10,
  },
  {
    id: "lore-machine",
    name: "Lore Machine",
    desc: "Accumulate 1,000 sky lore.",
    isUnlocked: () => game.skyLore >= 1_000,
  },
  {
    id: "urban-skyline",
    name: "Urban Skyline",
    desc: "Reach 100% town influence.",
    isUnlocked: () => game.townInfluence >= 100,
  },
  {
    id: "planetary-perch",
    name: "Planetary Perch",
    desc: "Reach 100% world control.",
    isUnlocked: () => game.worldControl >= 100,
  },
  {
    id: "stellar-feathers",
    name: "Stellar Feathers",
    desc: "Colonize 140 star systems.",
    isUnlocked: () => game.starSystems >= STAR_TARGET,
  },
];


const directivesConfig = [
  {
    id: "seed-hoard",
    name: "Seed Hoard",
    desc: "Accumulate a large seed reserve.",
    metric: () => game.seeds,
    baseTarget: 60_000,
    scale: 1.6,
    reward: 1,
    rewardType: "points",
  },
  {
    id: "nest-program",
    name: "Nest Program",
    desc: "Expand infrastructure with more nests.",
    metric: () => game.nests,
    baseTarget: 10,
    scale: 1.45,
    reward: 1,
    rewardType: "points",
  },
  {
    id: "influence-drive",
    name: "Influence Drive",
    desc: "Push civilization influence further.",
    metric: () => game.worldControl + game.countryInfluence + game.townInfluence,
    baseTarget: 110,
    scale: 1.5,
    reward: 2,
    rewardType: "hybrid",
  },
];

const commandTalentConfig = [
  {
    id: "thrift",
    name: "Procurement Algorithms",
    desc: "Bird, nest, and roost costs are reduced by 2.5% per level.",
    maxLevel: 12,
    costForLevel: (nextLevel) => nextLevel,
  },
  {
    id: "broodcare",
    name: "Broodcare Protocols",
    desc: "Hatching and egg production increase by 6% per level.",
    maxLevel: 10,
    costForLevel: (nextLevel) => 1 + Math.floor(nextLevel * 1.2),
  },
  {
    id: "diplomacy",
    name: "Sky Diplomacy",
    desc: "All influence growth rates increase by 7% per level.",
    maxLevel: 10,
    costForLevel: (nextLevel) => 2 + Math.floor(nextLevel * 1.3),
  },
  {
    id: "astro",
    name: "Astro Logistics",
    desc: "Star colonization and relic gain increase by 8% per level.",
    maxLevel: 10,
    costForLevel: (nextLevel) => 2 + Math.floor(nextLevel * 1.4),
  },
];


const relicLabConfig = [
  {
    id: "efficiency",
    name: "Relic Turbines",
    desc: "Seeds, twigs, and feather science +5% per level.",
    maxLevel: 15,
    costForLevel: (nextLevel) => ({ relics: 2 + nextLevel, skyLore: 80 + nextLevel * 35 }),
  },
  {
    id: "weatherproofing",
    name: "Storm Canopies",
    desc: "All influence rates +8% per level.",
    maxLevel: 12,
    costForLevel: (nextLevel) => ({ relics: 3 + nextLevel, skyLore: 120 + nextLevel * 40 }),
  },
  {
    id: "archives",
    name: "Void Archives",
    desc: "Lore and relic gain +10% per level.",
    maxLevel: 12,
    costForLevel: (nextLevel) => ({ relics: 4 + nextLevel, skyLore: 180 + nextLevel * 55 }),
  },
];

const skyEventsConfig = [
  {
    id: "meteor-harvest",
    name: "Meteor Harvest",
    duration: 30,
    detail: "Seed and twig output surges.",
    multipliers: { seed: 1.45, twig: 1.45 },
  },
  {
    id: "chorus-season",
    name: "Chorus Season",
    duration: 35,
    detail: "Egg hatching and influence accelerate.",
    multipliers: { hatch: 1.4, influence: 1.25 },
  },
  {
    id: "ion-squall",
    name: "Ion Squall",
    duration: 26,
    detail: "Star colonization and relic decoding spike.",
    multipliers: { star: 1.5, relic: 1.35 },
  },
  {
    id: "cold-front",
    name: "Cold Front",
    duration: 22,
    detail: "Production slows temporarily.",
    multipliers: { seed: 0.8, twig: 0.8, hatch: 0.82 },
  },
];

function initGame() {
  const saved = loadGame();
  if (saved) {
    game = saved.game;
  } else {
    game = createDefaultGame();
  }
  restoreUpgrades();
  rebuildUpgradesUI();
  rebuildProjectsUI();
  rebuildAchievementsUI();
  rebuildDirectivesUI();
  rebuildCommandTalentsUI();
  rebuildRelicLabUI();
  rebuildDoctrineUI();
  bindEvents();
  refreshUnlocks(true);
  if (saved && saved.offlineSummary) {
    addLog(saved.offlineSummary);
  }
  initDirectives();
  checkAchievements();
  updateUI();
  if (!game.won) {
    startLoops();
  } else {
    showWinState();
  }
}

function bindEvents() {
  elements.expeditionButton.addEventListener("click", () => {
    if (game.won) return;
    sendExpedition();
  });

  elements.neighborhoodRally.addEventListener("click", () => {
    if (game.won) return;
    hostNeighborhoodRally();
  });

  elements.townSummit.addEventListener("click", () => {
    if (game.won) return;
    holdTownSummit();
  });

  elements.countryCharter.addEventListener("click", () => {
    if (game.won) return;
    draftCountryCharter();
  });

  elements.resetGame.addEventListener("click", () => {
    if (confirm("Hard reset? This will erase your save and restart the game.")) {
      localStorage.removeItem("birdGameSave");
      location.reload();
    }
  });

  elements.buyBird.addEventListener("click", () => {
    if (game.seeds < game.birdCost || game.won) return;
    game.seeds -= game.birdCost;
    if (game.birds === 1) {
      game.seeds += 5;
      addLog("First recruit bonus: +5 seeds.", false);
    }
    game.birds += 1;
    game.birdCost = Math.ceil(game.birdCost * COSTS.birdMult);
    addLog("A bird joins the flock.");
    refreshUnlocks();
    updateUI();
    saveGame();
  });

  elements.buyNest.addEventListener("click", () => {
    if (game.seeds < game.nestCost || game.twigs < game.nestTwigCost || game.won)
      return;
    game.seeds -= game.nestCost;
    game.twigs -= game.nestTwigCost;
    game.nests += 1;
    game.nestCost = Math.ceil(game.nestCost * COSTS.nestMult);
    game.nestTwigCost = Math.ceil(game.nestTwigCost * COSTS.nestTwigMult);
    if (!milestoneFlags.firstNest) {
      milestoneFlags.firstNest = true;
      addLog("First nest built. Soft tyranny begins.");
    } else {
      addLog("Nest expanded. Real estate, but fluffier.");
    }
    refreshUnlocks();
    updateUI();
    saveGame();
  });

  elements.buyStarship.addEventListener("click", () => {
    if (
      game.seeds < game.starshipCost ||
      game.skyLore < game.starshipLoreCost ||
      game.won
    )
      return;
    game.seeds -= game.starshipCost;
    game.skyLore -= game.starshipLoreCost;
    game.starships += 1;
    game.starshipCost = Math.ceil(game.starshipCost * COSTS.starshipMult);
    game.starshipLoreCost = Math.ceil(game.starshipLoreCost * COSTS.starshipLoreMult);
    if (!milestoneFlags.firstStarship) {
      milestoneFlags.firstStarship = true;
      addLog("First starship launched. The vacuum is now bird-friendly.");
    } else {
      addLog("Another starship departs. Galactic tourism begins.");
    }
    refreshUnlocks();
    updateUI();
    saveGame();
  });

  elements.buyRoost.addEventListener("click", () => {
    if (game.seeds < game.roostCost || game.twigs < game.roostTwigCost || game.won)
      return;
    game.seeds -= game.roostCost;
    game.twigs -= game.roostTwigCost;
    game.roosts += 1;
    game.roostCost = Math.ceil(game.roostCost * COSTS.roostMult);
    game.roostTwigCost = Math.ceil(game.roostTwigCost * COSTS.roostTwigMult);
    if (!milestoneFlags.firstRoost) {
      milestoneFlags.firstRoost = true;
      addLog("First roost raised. The flock discovers harmony.");
    } else {
      addLog("Roost expanded. Songs echo across the nests.");
    }
    refreshUnlocks();
    updateUI();
    saveGame();
  });

  elements.buyAviary.addEventListener("click", () => {
    if (
      game.seeds < game.aviaryCost ||
      game.featherScience < game.aviaryScienceCost ||
      game.won
    )
      return;
    game.seeds -= game.aviaryCost;
    game.featherScience -= game.aviaryScienceCost;
    game.aviaries += 1;
    game.aviaryCost = Math.ceil(game.aviaryCost * COSTS.aviaryMult);
    game.aviaryScienceCost = Math.ceil(
      game.aviaryScienceCost * COSTS.aviaryScienceMult
    );
    if (!milestoneFlags.firstAviary) {
      milestoneFlags.firstAviary = true;
      addLog("First aviary opens. Lore takes flight.");
    } else {
      addLog("Aviary expanded. Libraries of wind are stacked higher.");
    }
    refreshUnlocks();
    updateUI();
    saveGame();
  });

  elements.newGamePlus.addEventListener("click", () => {
    startNewGamePlus();
  });

  elements.hatchSlider.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    game.hatchUsagePercent = Math.min(100, Math.max(0, value));
    updateUI();
    saveGame();
  });

  elements.forageBurst.addEventListener("click", () => {
    if (game.won || game.forageBurstCooldown > 0) return;
    const base = 14 + game.birds * 0.65;
    const harmony = getHarmonyMultiplier();
    const totalMultiplier = game.ngMultiplier * game.achievementBonus;
    const labEfficiencyMultiplier = 1 + getLabLevel("efficiency") * 0.05;
    const gain = base * game.foragePower * totalMultiplier * harmony * labEfficiencyMultiplier * getEventMultiplier("seed");
    game.seeds += gain;
    game.forageBurstCooldown = 2.25;
    addLog(`Forage burst gathered ${formatNumber(gain)} seeds.`, false);
    updateUI();
    saveGame();
  });

  if (elements.flockFormation) {
    elements.flockFormation.addEventListener("click", useFlockFormation);
  }

  if (elements.scoutRoute) {
    elements.scoutRoute.addEventListener("click", useScoutRoute);
  }

  if (elements.eventHarvest) elements.eventHarvest.addEventListener("click", () => resolveEventChoice("harvest"));
  if (elements.eventStabilize) elements.eventStabilize.addEventListener("click", () => resolveEventChoice("stabilize"));
  if (elements.eventIgnore) elements.eventIgnore.addEventListener("click", () => resolveEventChoice("ignore"));

  if (elements.specializationOptions) {
    elements.specializationOptions.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-doctrine-id]");
      if (!button) return;
      chooseDoctrine(button.dataset.doctrineId);
    });
  }


  ["autoBirds", "autoNests", "autoRoosts", "autoAviaries", "autoStarships", "autoActions"].forEach(
    (key) => {
      const input = elements[key];
      if (!input) return;
      input.addEventListener("change", (event) => {
        game.automation[key] = Boolean(event.target.checked);
        addLog(`${event.target.checked ? "Enabled" : "Disabled"} ${key.replace("auto", "auto ").toLowerCase()}.`, false);
        saveGame();
      });
    }
  );

  if (elements.commandTalents) {
    elements.commandTalents.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-talent-id]");
      if (!button) return;
      purchaseCommandTalent(button.dataset.talentId);
    });
  }

  if (elements.relicLabUpgrades) {
    elements.relicLabUpgrades.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-lab-id]");
      if (!button) return;
      purchaseRelicLabUpgrade(button.dataset.labId);
    });
  }
}


function startLoops() {
  stopLoops();
  tickTimer = setInterval(gameTick, TICK_MS);
  saveTimer = setInterval(saveGame, 10_000);
}

function stopLoops() {
  if (tickTimer) clearInterval(tickTimer);
  if (saveTimer) clearInterval(saveTimer);
  tickTimer = null;
  saveTimer = null;
}

function getInfluenceRates() {
  const harmony = getHarmonyMultiplier();
  const multiplier = game.ngMultiplier * game.achievementBonus;
  const diplomacyMultiplier = 1 + (game.commandTalents?.diplomacy || 0) * 0.07;
  const labInfluenceMultiplier = 1 + getLabLevel("weatherproofing") * 0.08;
  const eventInfluenceMultiplier = getEventMultiplier("influence");
  return {
    neighborhood:
      (game.birds + game.nests * 4) *
      game.neighborhoodInfluenceRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      eventInfluenceMultiplier *
      100,
    town:
      (game.birds + game.roosts * 30) *
      game.townInfluenceRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      eventInfluenceMultiplier *
      100,
    country:
      (game.birds + game.aviaries * 50) *
      game.countryInfluenceRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      eventInfluenceMultiplier *
      100,
    world:
      (game.birds + game.roosts * 25 + game.aviaries * 45) *
      game.worldControlRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      eventInfluenceMultiplier *
      100,
  };
}

function gameTick() {
  if (game.won) return;
  game.forageBurstCooldown = Math.max(0, (game.forageBurstCooldown || 0) - DELTA);
  game.doctrineActionCooldown = Math.max(0, (game.doctrineActionCooldown || 0) - DELTA);
  game.scoutRouteTimer = Math.max(0, (game.scoutRouteTimer || 0) - DELTA);
  game.flockFormationTimer = Math.max(0, (game.flockFormationTimer || 0) - DELTA);
  if (game.scoutRouteTimer <= 0) game.currentRouteFocus = "balanced";
  const multiplier = game.ngMultiplier * game.achievementBonus;
  const harmony = getHarmonyMultiplier();
  processSkyEvents();
  const broodMultiplier = 1 + (game.commandTalents?.broodcare || 0) * 0.06;
  const astroMultiplier = 1 + (game.commandTalents?.astro || 0) * 0.08;
  const labEfficiencyMultiplier = 1 + getLabLevel("efficiency") * 0.05;
  const labArchiveMultiplier = 1 + getLabLevel("archives") * 0.1;
  const seedEventMultiplier = getEventMultiplier("seed");
  const twigEventMultiplier = getEventMultiplier("twig");
  const hatchEventMultiplier = getEventMultiplier("hatch");
  const starEventMultiplier = getEventMultiplier("star");
  const relicEventMultiplier = getEventMultiplier("relic");
  const doctrineMult = getDoctrineMultipliers();
  const routeMult = getRouteMultipliers();
  const formationMult = game.flockFormationTimer > 0 ? 1.45 : 1;
  game.seeds += game.birds * game.seedRatePerBird * multiplier * harmony * labEfficiencyMultiplier * seedEventMultiplier * doctrineMult.seed * routeMult.seed * formationMult * DELTA;
  if (game.twigsUnlocked) {
    game.twigs += game.birds * game.twigRatePerBird * multiplier * harmony * labEfficiencyMultiplier * twigEventMultiplier * doctrineMult.twig * routeMult.twig * formationMult * DELTA;
  }

  if (game.nests > 0) {
    game.eggs += game.nests * game.eggRatePerNest * multiplier * harmony * broodMultiplier * hatchEventMultiplier * doctrineMult.hatch * DELTA;
    const hatchPotential =
      game.nests *
      game.hatchRatePerNest *
      multiplier *
      broodMultiplier *
      harmony *
      (game.hatchUsagePercent / 100) *
      hatchEventMultiplier *
      doctrineMult.hatch *
      DELTA;
    const hatchAmount = Math.min(game.eggs, hatchPotential);
    if (hatchAmount > 0) {
      game.eggs -= hatchAmount;
      game.birdFraction += hatchAmount;
      while (game.birdFraction >= 1) {
        game.birdFraction -= 1;
        game.birds += 1;
      }
    }
  }

  if (game.nests > 0) {
    game.featherScience +=
      game.nests * game.featherScienceRatePerNest * multiplier * harmony * broodMultiplier * labEfficiencyMultiplier * DELTA;
  }

  if (game.aviaries > 0) {
    game.skyLore +=
      game.aviaries * game.skyLoreRatePerAviary * multiplier * harmony * labArchiveMultiplier * DELTA;
  }

  const influenceRates = getInfluenceRates();

  if (game.neighborhoodUnlocked && game.neighborhoodInfluence < NEIGHBORHOOD_TARGET) {
    game.neighborhoodInfluence = Math.min(
      NEIGHBORHOOD_TARGET,
      game.neighborhoodInfluence + influenceRates.neighborhood * doctrineMult.influence * DELTA
    );
  }

  if (game.townUnlocked && game.townInfluence < TOWN_TARGET) {
    game.townInfluence = Math.min(
      TOWN_TARGET,
      game.townInfluence + influenceRates.town * doctrineMult.influence * DELTA
    );
  }

  if (game.countryUnlocked && game.countryInfluence < COUNTRY_TARGET) {
    game.countryInfluence = Math.min(
      COUNTRY_TARGET,
      game.countryInfluence + influenceRates.country * doctrineMult.influence * DELTA
    );
  }

  if (game.worldUnlocked && game.worldControl < 100) {
    game.worldControl = Math.min(
      100,
      game.worldControl + influenceRates.world * doctrineMult.influence * DELTA
    );
  }

  if (game.spaceUnlocked && game.starSystems < STAR_TARGET) {
    game.starSystems = Math.min(
      STAR_TARGET,
      game.starSystems +
        game.starships * game.starshipColonizeRate * multiplier * harmony * astroMultiplier * starEventMultiplier * doctrineMult.star * DELTA
    );
  }

  if (game.spaceUnlocked && game.starSystems > 0) {
    game.relics +=
      game.starSystems * game.relicRatePerStarSystem * multiplier * harmony * astroMultiplier * labArchiveMultiplier * relicEventMultiplier * doctrineMult.relic * DELTA;
  }

  runAutoManager();
  refreshUnlocks();
  handleMilestones();
  checkAchievements();
  checkDirectives();
  checkWin();
  updateUI();
}

function runAutoManager() {
  if (!game.automation) return;
  game.autoBuyTimer += DELTA;
  if (game.autoBuyTimer < AUTO_BUY_INTERVAL_SECONDS) return;
  game.autoBuyTimer = 0;

  if (game.automation.autoBirds) {
    while (game.seeds >= game.birdCost && !game.won) {
      game.seeds -= game.birdCost;
      game.birds += 1;
      game.birdCost = Math.ceil(game.birdCost * COSTS.birdMult);
    }
  }

  if (game.automation.autoNests) {
    while (game.seeds >= game.nestCost && game.twigs >= game.nestTwigCost && !game.won) {
      game.seeds -= game.nestCost;
      game.twigs -= game.nestTwigCost;
      game.nests += 1;
      game.nestCost = Math.ceil(game.nestCost * COSTS.nestMult);
      game.nestTwigCost = Math.ceil(game.nestTwigCost * COSTS.nestTwigMult);
    }
  }

  if (game.automation.autoRoosts) {
    while (game.seeds >= game.roostCost && game.twigs >= game.roostTwigCost && !game.won) {
      game.seeds -= game.roostCost;
      game.twigs -= game.roostTwigCost;
      game.roosts += 1;
      game.roostCost = Math.ceil(game.roostCost * COSTS.roostMult);
      game.roostTwigCost = Math.ceil(game.roostTwigCost * COSTS.roostTwigMult);
    }
  }

  if (game.automation.autoAviaries) {
    while (game.seeds >= game.aviaryCost && game.featherScience >= game.aviaryScienceCost && !game.won) {
      game.seeds -= game.aviaryCost;
      game.featherScience -= game.aviaryScienceCost;
      game.aviaries += 1;
      game.aviaryCost = Math.ceil(game.aviaryCost * COSTS.aviaryMult);
      game.aviaryScienceCost = Math.ceil(game.aviaryScienceCost * COSTS.aviaryScienceMult);
    }
  }

  if (game.automation.autoStarships) {
    while (game.seeds >= game.starshipCost && game.skyLore >= game.starshipLoreCost && !game.won) {
      game.seeds -= game.starshipCost;
      game.skyLore -= game.starshipLoreCost;
      game.starships += 1;
      game.starshipCost = Math.ceil(game.starshipCost * COSTS.starshipMult);
      game.starshipLoreCost = Math.ceil(game.starshipLoreCost * COSTS.starshipLoreMult);
    }
  }

  if (game.automation.autoActions) {
    if (game.neighborhoodUnlocked && game.neighborhoodInfluence < NEIGHBORHOOD_TARGET) {
      hostNeighborhoodRally();
    }
    if (game.townUnlocked && game.townInfluence < TOWN_TARGET) {
      holdTownSummit();
    }
    if (game.countryUnlocked && game.countryInfluence < COUNTRY_TARGET) {
      draftCountryCharter();
    }
  }
}

function ensureAchievementState(achievementId) {
  if (!game.achievements || typeof game.achievements !== "object") {
    game.achievements = {};
  }
  if (!game.achievements[achievementId]) {
    game.achievements[achievementId] = { unlocked: false };
  }
  return game.achievements[achievementId];
}

function getUnlockedAchievementCount() {
  return achievementsConfig.filter((achievement) => ensureAchievementState(achievement.id).unlocked).length;
}

function checkAchievements() {
  let changed = false;
  achievementsConfig.forEach((achievement) => {
    const state = ensureAchievementState(achievement.id);
    if (!state.unlocked && achievement.isUnlocked()) {
      state.unlocked = true;
      changed = true;
      addLog(`Achievement unlocked: ${achievement.name}.`);
      if (typeof achievement.reward === "function") achievement.reward();
    }
  });
  if (changed) {
    game.achievementBonus = 1 + getUnlockedAchievementCount() * 0.03;
    saveGame();
  }
}

function rebuildAchievementsUI() {
  if (!elements.achievements) return;
  elements.achievements.innerHTML = "";
  achievementsConfig.forEach((achievement) => {
    const state = ensureAchievementState(achievement.id);
    const card = document.createElement("div");
    card.className = `achievement${state.unlocked ? " unlocked" : ""}`;
    card.textContent = `${state.unlocked ? "✅" : "⬜"} ${achievement.name} — ${achievement.desc}`;
    elements.achievements.appendChild(card);
  });
}


function ensureDirectiveState(directiveId) {
  if (!game.directives || typeof game.directives !== "object") {
    game.directives = {};
  }
  if (!game.relicLab || typeof game.relicLab !== "object") {
    game.relicLab = { efficiency: 0, weatherproofing: 0, archives: 0 };
  }
  if (typeof game.eventTimeRemaining !== "number") {
    game.eventTimeRemaining = 0;
  }
  if (typeof game.eventCooldown !== "number") {
    game.eventCooldown = EVENT_CHECK_INTERVAL_SECONDS;
  }
  if (typeof game.forageBurstCooldown !== "number") {
    game.forageBurstCooldown = 0;
  }
  if (typeof game.doctrineActionCooldown !== "number") game.doctrineActionCooldown = 0;
  if (typeof game.eventHeat !== "number") game.eventHeat = 0;
  if (typeof game.scoutRouteTimer !== "number") game.scoutRouteTimer = 0;
  if (typeof game.flockFormationTimer !== "number") game.flockFormationTimer = 0;
  if (!game.currentRouteFocus) game.currentRouteFocus = "balanced";
  if (!game.earlyActions || typeof game.earlyActions !== "object") game.earlyActions = { flockFormationUsed: false, scoutRouteUsed: false };
  if (!game.directives[directiveId]) {
    game.directives[directiveId] = { tier: 1, target: 0, completed: 0 };
  }
  return game.directives[directiveId];
}

function computeDirectiveTarget(directive, tier) {
  return Math.ceil(directive.baseTarget * directive.scale ** (tier - 1));
}

function initDirectives() {
  directivesConfig.forEach((directive) => {
    const state = ensureDirectiveState(directive.id);
    if (!state.target || state.target <= 0) {
      state.target = computeDirectiveTarget(directive, state.tier || 1);
    }
  });
}

function checkDirectives() {
  let changed = false;
  directivesConfig.forEach((directive) => {
    const state = ensureDirectiveState(directive.id);
    const progress = directive.metric();
    if (progress >= state.target) {
      state.completed += 1;
      state.tier += 1;
      state.target = computeDirectiveTarget(directive, state.tier);
      game.commandPoints += directive.reward;
      if (directive.rewardType === "hybrid") { game.relics += 0.5; }
      changed = true;
      addLog(`Directive complete: ${directive.name}. +${directive.reward} command points${directive.rewardType === "hybrid" ? " and +0.5 relics" : ""}.`);
    }
  });
  if (changed) {
    rebuildDirectivesUI();
    rebuildCommandTalentsUI();
    saveGame();
  }
}

function rebuildDirectivesUI() {
  if (!elements.directives) return;
  elements.directives.innerHTML = "";
  directivesConfig.forEach((directive) => {
    const state = ensureDirectiveState(directive.id);
    const progress = directive.metric();
    const ratio = Math.max(0, Math.min(1, progress / state.target));

    const card = document.createElement("div");
    card.className = "directive";

    const title = document.createElement("div");
    title.className = "directive-title";
    title.textContent = `${directive.name} · Tier ${state.tier}`;

    const desc = document.createElement("div");
    desc.className = "directive-progress";
    desc.textContent = directive.desc;

    const progressLine = document.createElement("div");
    progressLine.className = "directive-progress";
    progressLine.textContent = `${formatNumber(progress, 2)} / ${formatNumber(state.target, 2)} · Completed ${state.completed}`;

    const barWrap = document.createElement("div");
    barWrap.className = "progress";
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    bar.style.width = `${(ratio * 100).toFixed(1)}%`;
    barWrap.appendChild(bar);

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(barWrap);
    card.appendChild(progressLine);
    elements.directives.appendChild(card);
  });
}

function getTalentLevel(id) {
  if (!game.commandTalents || typeof game.commandTalents !== "object") {
    game.commandTalents = { thrift: 0, broodcare: 0, diplomacy: 0, astro: 0 };
  }
  return game.commandTalents[id] || 0;
}

function rebuildCommandTalentsUI() {
  if (!elements.commandTalents) return;
  elements.commandTalents.innerHTML = "";
  commandTalentConfig.forEach((talent) => {
    const level = getTalentLevel(talent.id);
    const nextLevel = level + 1;
    const isMaxed = level >= talent.maxLevel;
    const cost = talent.costForLevel(nextLevel);

    const card = document.createElement("div");
    card.className = "command-talent";

    const title = document.createElement("div");
    title.className = "command-talent-title";
    title.textContent = `${talent.name} · Lv ${level}/${talent.maxLevel}`;

    const desc = document.createElement("div");
    desc.className = "directive-progress";
    desc.textContent = talent.desc;

    const button = document.createElement("button");
    button.dataset.talentId = talent.id;
    button.textContent = isMaxed ? "Maxed" : `Upgrade (${cost} CP)`;
    button.disabled = isMaxed || game.commandPoints < cost || game.won;

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(button);
    elements.commandTalents.appendChild(card);
  });
}

function purchaseCommandTalent(talentId) {
  const talent = commandTalentConfig.find((item) => item.id === talentId);
  if (!talent || game.won) return;
  const level = getTalentLevel(talent.id);
  if (level >= talent.maxLevel) return;
  const cost = talent.costForLevel(level + 1);
  if (game.commandPoints < cost) return;

  game.commandPoints -= cost;
  game.commandTalents[talent.id] = level + 1;
  if (talent.id === "thrift") {
    applyThriftDiscount();
  }
  addLog(`Command talent upgraded: ${talent.name} to level ${level + 1}.`);
  rebuildCommandTalentsUI();
  updateUI();
  saveGame();
}

function applyThriftDiscount() {
  const thriftLevel = getTalentLevel("thrift");
  const discount = Math.max(0.45, 1 - thriftLevel * 0.025);
  game.birdCost = Math.max(1, Math.ceil(game.birdCost * discount));
  game.nestCost = Math.max(1, Math.ceil(game.nestCost * discount));
  game.roostCost = Math.max(1, Math.ceil(game.roostCost * discount));
}


function getLabLevel(id) {
  if (!game.relicLab || typeof game.relicLab !== "object") {
    game.relicLab = { efficiency: 0, weatherproofing: 0, archives: 0 };
  }
  return game.relicLab[id] || 0;
}

function rebuildRelicLabUI() {
  if (!elements.relicLabUpgrades) return;
  elements.relicLabUpgrades.innerHTML = "";
  relicLabConfig.forEach((upgrade) => {
    const level = getLabLevel(upgrade.id);
    const nextLevel = level + 1;
    const maxed = level >= upgrade.maxLevel;
    const cost = upgrade.costForLevel(nextLevel);

    const card = document.createElement("div");
    card.className = "command-talent";
    const title = document.createElement("div");
    title.className = "command-talent-title";
    title.textContent = `${upgrade.name} · Lv ${level}/${upgrade.maxLevel}`;

    const desc = document.createElement("div");
    desc.className = "directive-progress";
    desc.textContent = upgrade.desc;

    const button = document.createElement("button");
    button.dataset.labId = upgrade.id;
    button.textContent = maxed
      ? "Maxed"
      : `Upgrade (${formatNumber(cost.relics)} relics, ${formatNumber(cost.skyLore)} lore)`;
    button.disabled = maxed || game.relics < cost.relics || game.skyLore < cost.skyLore || game.won;

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(button);
    elements.relicLabUpgrades.appendChild(card);
  });
}

function purchaseRelicLabUpgrade(id) {
  const upgrade = relicLabConfig.find((item) => item.id === id);
  if (!upgrade || game.won) return;
  const level = getLabLevel(id);
  if (level >= upgrade.maxLevel) return;
  const cost = upgrade.costForLevel(level + 1);
  if (game.relics < cost.relics || game.skyLore < cost.skyLore) return;

  game.relics -= cost.relics;
  game.skyLore -= cost.skyLore;
  game.relicLab[id] = level + 1;
  addLog(`Relic Lab upgraded: ${upgrade.name} level ${level + 1}.`);
  rebuildRelicLabUI();
  rebuildDoctrineUI();
  updateUI();
  saveGame();
}

function getEventMultiplier(key) {
  if (!game.activeEvent) return 1;
  return game.activeEvent.multipliers[key] || 1;
}

function processSkyEvents() {
  if (game.activeEvent) {
    game.eventTimeRemaining = Math.max(0, game.eventTimeRemaining - DELTA);
    if (game.eventTimeRemaining <= 0) {
      addLog(`Sky event ended: ${game.activeEvent.name}.`);
      game.activeEvent = null;
      game.eventCooldown = EVENT_CHECK_INTERVAL_SECONDS;
    }
    return;
  }

  game.eventCooldown = Math.max(0, game.eventCooldown - DELTA);
  if (game.eventCooldown > 0) return;

  game.eventCooldown = EVENT_CHECK_INTERVAL_SECONDS;
  const doctrine = doctrineConfig.find((d) => d.id === game.doctrine);
  const heatDamp = doctrine?.modifiers?.eventHeat || 1;
  const eventChance = Math.min(0.85, 0.45 + game.eventHeat * 0.1) * heatDamp;
  if (Math.random() < eventChance) {
    const event = skyEventsConfig[Math.floor(Math.random() * skyEventsConfig.length)];
    game.eventHeat = Math.min(1.5, game.eventHeat + 0.06);
    game.activeEvent = event;
    game.eventTimeRemaining = event.duration;
    addLog(`Sky event started: ${event.name}. ${event.detail}`);
  }
}

function refreshUnlocks(isLoad = false) {
  if (!game.twigsUnlocked && game.birds >= 5) {
    game.twigsUnlocked = true;
    elements.twigsRow.hidden = false;
    if (!isLoad) {
      addLog("Twigs discovered. Every branch is an opportunity.");
    }
  }

  if (!game.nestsUnlocked && game.birds >= BIRDS_FOR_NESTS) {
    game.nestsUnlocked = true;
    elements.nestsRow.hidden = false;
    elements.buyNest.hidden = false;
    elements.eggsRow.hidden = false;
    elements.hatchControl.hidden = true;
    game.eggsUnlocked = true;
    if (!isLoad) {
      addLog("Nests unlocked. The coop has formed a coup.");
    }
  }

  if (!game.roostsUnlocked && game.birds >= BIRDS_FOR_ROOSTS) {
    game.roostsUnlocked = true;
    elements.roostsRow.hidden = false;
    elements.buyRoost.hidden = false;
    if (!isLoad) {
      addLog("Roosts unlocked. The flock learns to harmonize.");
    }
  }

  if (!game.aviariesUnlocked && game.featherScience >= FEATHER_FOR_AVIARIES) {
    game.aviariesUnlocked = true;
    elements.aviariesRow.hidden = false;
    elements.buyAviary.hidden = false;
    elements.loreRow.hidden = false;
    game.loreUnlocked = true;
    if (!isLoad) {
      addLog("Aviaries unlocked. The flock begins to catalog the sky.");
    }
  }

  if (!game.loreUnlocked && game.skyLore > 0) {
    game.loreUnlocked = true;
    elements.loreRow.hidden = false;
  }

  if (!game.neighborhoodUnlocked && game.birds >= BIRDS_FOR_NEIGHBORHOOD) {
    game.neighborhoodUnlocked = true;
    elements.neighborhoodRow.hidden = false;
    if (!isLoad) {
      addLog("Neighborhood influence begins. Every rooftop is a stage.");
    }
  }

  if (
    !game.townUnlocked &&
    game.neighborhoodInfluence >= NEIGHBORHOOD_TARGET
  ) {
    game.townUnlocked = true;
    elements.townRow.hidden = false;
    if (!isLoad) {
      addLog("Town influence secured. The plazas belong to the flock.");
    }
  }

  if (!game.countryUnlocked && game.townInfluence >= TOWN_TARGET) {
    game.countryUnlocked = true;
    elements.countryRow.hidden = false;
    if (!isLoad) {
      addLog("Country influence ignites. National perches are claimed.");
    }
  }

  if (!game.worldUnlocked && game.countryInfluence >= COUNTRY_TARGET) {
    game.worldUnlocked = true;
    elements.worldRow.hidden = false;
    if (!isLoad) {
      addLog("World takeover begins. The seeds were a distraction.");
    }
  }

  if (!game.spaceUnlocked && game.worldControl >= 100) {
    game.spaceUnlocked = true;
    elements.spaceRow.hidden = false;
    elements.buyStarship.hidden = false;
    if (!isLoad) {
      addLog("Space unlocked. The galaxy just got a new soundtrack.");
    }
  }

  if (!game.expeditionsUnlocked && game.roosts >= 1) {
    game.expeditionsUnlocked = true;
    elements.expeditionButton.hidden = false;
    if (!isLoad) {
      addLog("Expeditions unlocked. Scouts map forgotten branches.");
    }
  }

  if (!game.relicsUnlocked && (game.relics > 0 || game.starSystems > 0)) {
    game.relicsUnlocked = true;
    elements.relicRow.hidden = false;
  }

  if (game.twigsUnlocked) {
    elements.twigsRow.hidden = false;
  }

  if (game.nestsUnlocked) {
    elements.nestsRow.hidden = false;
    elements.buyNest.hidden = false;
    elements.eggsRow.hidden = false;
    elements.hatchControl.hidden = game.nests === 0;
  }

  if (game.roostsUnlocked) {
    elements.roostsRow.hidden = false;
    elements.buyRoost.hidden = false;
  }

  if (game.aviariesUnlocked) {
    elements.aviariesRow.hidden = false;
    elements.buyAviary.hidden = false;
    elements.loreRow.hidden = false;
  }

  if (game.nests > 0 || game.featherScience > 0) {
    elements.featherRow.hidden = false;
  }

  if (game.neighborhoodUnlocked) {
    elements.neighborhoodRow.hidden = false;
  }

  if (game.townUnlocked) {
    elements.townRow.hidden = false;
  }

  if (game.countryUnlocked) {
    elements.countryRow.hidden = false;
  }

  if (game.worldUnlocked) {
    elements.worldRow.hidden = false;
  }

  if (game.spaceUnlocked) {
    elements.spaceRow.hidden = false;
    elements.buyStarship.hidden = false;
    elements.eventPanel.hidden = false;
    elements.relicLabPanel.hidden = false;
  }

  if (game.expeditionsUnlocked) {
    elements.expeditionButton.hidden = false;
    elements.actionsPanel.hidden = false;
    elements.automationPanel.hidden = false;
    elements.directivesPanel.hidden = false;
    elements.commandPanel.hidden = false;
  }
  if (game.birds >= 3) {
    elements.tacticsPanel.hidden = false;
  }
  if (game.birds >= DOCTRINE_UNLOCK_BIRDS) {
    elements.specializationPanel.hidden = false;
  }

  if (game.relicsUnlocked) {
    elements.relicRow.hidden = false;
  }

  const hasActionUnlock =
    game.expeditionsUnlocked ||
    game.neighborhoodUnlocked ||
    game.townUnlocked ||
    game.countryUnlocked;
  elements.actionsPanel.hidden = !hasActionUnlock;

  updateUpgradesAvailability();
  updateProjectsAvailability();
}

function updateUI() {
  const harmony = getHarmonyMultiplier();
  const totalMultiplier = game.ngMultiplier * game.achievementBonus;
  const broodMultiplier = 1 + getTalentLevel("broodcare") * 0.06;
  const astroMultiplier = 1 + getTalentLevel("astro") * 0.08;
  const labEfficiencyMultiplier = 1 + getLabLevel("efficiency") * 0.05;
  const labArchiveMultiplier = 1 + getLabLevel("archives") * 0.1;
  const influenceRates = getInfluenceRates();
  const eventSeedMultiplier = getEventMultiplier("seed");
  const eventTwigMultiplier = getEventMultiplier("twig");
  const eventHatchMultiplier = getEventMultiplier("hatch");
  const eventStarMultiplier = getEventMultiplier("star");
  const eggRate = game.nests * game.eggRatePerNest * totalMultiplier * harmony * broodMultiplier * eventHatchMultiplier;
  const hatchRate =
    game.nests *
    game.hatchRatePerNest *
    totalMultiplier *
    harmony *
    broodMultiplier *
    eventHatchMultiplier *
    (game.hatchUsagePercent / 100);
  const netEggRate = eggRate - hatchRate;
  elements.seeds.textContent = formatNumber(game.seeds);
  elements.twigs.textContent = formatNumber(game.twigs);
  elements.eggs.textContent = formatNumber(game.eggs, 2);
  elements.birds.textContent = formatNumber(game.birds);
  elements.nests.textContent = formatNumber(game.nests);
  elements.roosts.textContent = formatNumber(game.roosts);
  elements.aviaries.textContent = formatNumber(game.aviaries);
  elements.harmonyMultiplier.textContent = formatNumber(harmony, 2);
  elements.neighborhoodInfluence.textContent = `${formatNumber(
    game.neighborhoodInfluence,
    2
  )}%`;
  elements.townInfluence.textContent = `${formatNumber(game.townInfluence, 2)}%`;
  elements.countryInfluence.textContent = `${formatNumber(
    game.countryInfluence,
    2
  )}%`;
  elements.worldControl.textContent = `${formatNumber(game.worldControl, 2)}%`;
  elements.starSystems.textContent = `${formatNumber(game.starSystems, 2)} / ${STAR_TARGET}`;
  elements.ngPlus.textContent = game.ngPlusCount;
  elements.ngMultiplier.textContent = formatNumber(totalMultiplier, 2);
  elements.achievementTotal.textContent = achievementsConfig.length;
  elements.achievementCount.textContent = getUnlockedAchievementCount();
  elements.achievementMultiplier.textContent = formatNumber(game.achievementBonus, 2);
  elements.commandPoints.textContent = formatNumber(game.commandPoints);
  elements.ngRow.hidden = game.ngPlusCount === 0 && !game.won;
  elements.featherScience.textContent = formatNumber(game.featherScience, 2);
  elements.skyLore.textContent = formatNumber(game.skyLore, 2);
  elements.relics.textContent = formatNumber(game.relics, 2);
  elements.seedRate.textContent = formatNumber(
    game.birds * game.seedRatePerBird * totalMultiplier * harmony * labEfficiencyMultiplier * eventSeedMultiplier,
    2
  );
  elements.twigRate.textContent = formatNumber(
    game.twigsUnlocked
      ? game.birds * game.twigRatePerBird * totalMultiplier * harmony * labEfficiencyMultiplier * eventTwigMultiplier
      : 0,
    2
  );
  elements.eggRate.textContent = formatSignedNumber(netEggRate, 2);
  elements.hatchRate.textContent = formatNumber(hatchRate, 2);
  elements.birdRate.textContent = formatNumber(
    hatchRate,
    2
  );
  elements.featherScienceRate.textContent = formatNumber(
    game.nests * game.featherScienceRatePerNest * totalMultiplier * harmony * broodMultiplier * labEfficiencyMultiplier,
    2
  );
  elements.loreRate.textContent = formatNumber(
    game.aviaries * game.skyLoreRatePerAviary * totalMultiplier * harmony * labArchiveMultiplier,
    2
  );
  elements.neighborhoodRate.textContent = formatNumber(
    game.neighborhoodUnlocked ? influenceRates.neighborhood : 0,
    2
  );
  elements.townRate.textContent = formatNumber(
    game.townUnlocked ? influenceRates.town : 0,
    2
  );
  elements.countryRate.textContent = formatNumber(
    game.countryUnlocked ? influenceRates.country : 0,
    2
  );
  elements.worldRate.textContent = formatNumber(
    game.worldUnlocked ? influenceRates.world : 0,
    2
  );
  elements.starRate.textContent = formatNumber(
    game.spaceUnlocked
      ? game.starships * game.starshipColonizeRate * totalMultiplier * harmony * astroMultiplier * eventStarMultiplier
      : 0,
    2
  );
  elements.hatchSlider.value = Math.round(game.hatchUsagePercent);
  elements.hatchUsage.textContent = formatNumber(game.hatchUsagePercent);
  const burstGainPreview = (14 + game.birds * 0.65) * totalMultiplier * harmony * labEfficiencyMultiplier * eventSeedMultiplier;
  elements.forageBurstGain.textContent = formatNumber(burstGainPreview, 0);
  if ((game.forageBurstCooldown || 0) > 0) {
    elements.forageBurstStatus.textContent = `Recharging: ${formatNumber(game.forageBurstCooldown, 1)}s`;
    elements.forageBurst.disabled = true;
  } else {
    elements.forageBurstStatus.textContent = "Ready";
    elements.forageBurst.disabled = game.won;
  }
  if (game.activeEvent) {
    elements.eventName.textContent = game.activeEvent.name;
    elements.eventDetail.textContent = game.activeEvent.detail;
    elements.eventTimer.textContent = `${formatNumber(game.eventTimeRemaining, 1)}s remaining`;
  } else {
    elements.eventName.textContent = "Calm skies";
    elements.eventDetail.textContent = "No active event.";
    elements.eventTimer.textContent = `Next event check in ${formatNumber(game.eventCooldown, 1)}s`;
  }

  if (game.activeEvent && elements.eventActions) {
    elements.eventActions.hidden = false;
  } else if (elements.eventActions) {
    elements.eventActions.hidden = true;
  }

  if (elements.tacticsPanel) {
    const tacticsUnlocked = game.birds >= 3;
    elements.tacticsPanel.hidden = !tacticsUnlocked;
    elements.flockFormation.hidden = !tacticsUnlocked;
    elements.scoutRoute.hidden = !tacticsUnlocked;
    const ffReady = game.doctrineActionCooldown <= 0;
    elements.flockFormation.disabled = !ffReady || game.won;
    elements.scoutRoute.disabled = !ffReady || game.won;
    elements.flockFormationStatus.textContent = ffReady ? "Ready: +45% seed/twig for 8s, then cooldown." : `Cooldown ${formatNumber(game.doctrineActionCooldown, 1)}s`;
    elements.scoutRouteStatus.textContent = game.scoutRouteTimer > 0 ? `Route focus: ${game.currentRouteFocus} (${formatNumber(game.scoutRouteTimer,1)}s)` : "Ready: random focus route for 20s.";
  }

  if (elements.specializationPanel) {
    const doctrineUnlocked = game.birds >= DOCTRINE_UNLOCK_BIRDS;
    elements.specializationPanel.hidden = !doctrineUnlocked;
    const chosen = doctrineConfig.find((d) => d.id === game.doctrine);
    elements.specializationStatus.textContent = chosen
      ? `${chosen.name} active. Doctrine action: ${chosen.actionName}.`
      : "Choose one doctrine. This choice defines your midgame bonus profile.";
  }

  if (game.automation) {
    elements.autoBirds.checked = Boolean(game.automation.autoBirds);
    elements.autoNests.checked = Boolean(game.automation.autoNests);
    elements.autoRoosts.checked = Boolean(game.automation.autoRoosts);
    elements.autoAviaries.checked = Boolean(game.automation.autoAviaries);
    elements.autoStarships.checked = Boolean(game.automation.autoStarships);
    elements.autoActions.checked = Boolean(game.automation.autoActions);
  }
  elements.hatchControl.hidden = game.nests === 0;
  elements.featherRow.hidden = game.nests === 0 && game.featherScience <= 0;

  elements.birdCost.textContent = formatNumber(game.birdCost);
  elements.nestCost.textContent = formatNumber(game.nestCost);
  elements.nestTwigCost.textContent = formatNumber(game.nestTwigCost);
  elements.roostCost.textContent = formatNumber(game.roostCost);
  elements.roostTwigCost.textContent = formatNumber(game.roostTwigCost);
  elements.aviaryCost.textContent = formatNumber(game.aviaryCost);
  elements.aviaryScienceCost.textContent = formatNumber(game.aviaryScienceCost);
  elements.starshipCost.textContent = formatNumber(game.starshipCost);
  elements.starshipLoreCost.textContent = formatNumber(game.starshipLoreCost);
  elements.expeditionCost.textContent = formatNumber(COSTS.expeditionSeedCost);
  elements.expeditionTwigCost.textContent = formatNumber(COSTS.expeditionTwigCost);
  elements.neighborhoodCost.textContent = `${formatNumber(
    COSTS.neighborhoodRallySeedCost
  )} seeds, ${formatNumber(COSTS.neighborhoodRallyTwigCost)} twigs`;
  elements.townCost.textContent = `${formatNumber(
    COSTS.townSummitSeedCost
  )} seeds, ${formatNumber(COSTS.townSummitEggCost)} eggs`;
  elements.countryCost.textContent = `${formatNumber(
    COSTS.countryCharterSeedCost
  )} seeds, ${formatNumber(COSTS.countryCharterLoreCost)} lore`;

  elements.buyBird.disabled = game.seeds < game.birdCost || game.won;
  elements.buyNest.disabled =
    game.seeds < game.nestCost || game.twigs < game.nestTwigCost || game.won;
  elements.buyRoost.disabled =
    game.seeds < game.roostCost || game.twigs < game.roostTwigCost || game.won;
  elements.buyAviary.disabled =
    game.seeds < game.aviaryCost ||
    game.featherScience < game.aviaryScienceCost ||
    game.won;
  elements.buyStarship.disabled =
    game.seeds < game.starshipCost || game.skyLore < game.starshipLoreCost || game.won;
  elements.expeditionButton.disabled =
    game.seeds < COSTS.expeditionSeedCost ||
    game.twigs < COSTS.expeditionTwigCost ||
    game.won;
  elements.neighborhoodRally.disabled =
    game.seeds < COSTS.neighborhoodRallySeedCost ||
    game.twigs < COSTS.neighborhoodRallyTwigCost ||
    game.won;
  elements.townSummit.disabled =
    game.seeds < COSTS.townSummitSeedCost ||
    game.eggs < COSTS.townSummitEggCost ||
    game.won;
  elements.countryCharter.disabled =
    game.seeds < COSTS.countryCharterSeedCost ||
    game.skyLore < COSTS.countryCharterLoreCost ||
    game.won;

  elements.neighborhoodRally.hidden =
    !game.neighborhoodUnlocked || game.neighborhoodInfluence >= NEIGHBORHOOD_TARGET;
  elements.townSummit.hidden =
    !game.townUnlocked || game.townInfluence >= TOWN_TARGET;
  elements.countryCharter.hidden =
    !game.countryUnlocked || game.countryInfluence >= COUNTRY_TARGET;

  updateStructureDescriptions();
  updateUpgradesButtons();
  updateProjectsButtons();
  rebuildAchievementsUI();
  rebuildDirectivesUI();
  rebuildCommandTalentsUI();
  rebuildRelicLabUI();
  rebuildDoctrineUI();
  updateNextTarget();
  updateStory();
  updateHeroArt();
}

function updateNextTarget() {
  const target = getNextTarget();
  elements.nextTargetTitle.textContent = target.title;
  elements.nextTargetDetail.textContent = target.detail;
  elements.nextTargetProgressText.textContent = target.progressText;
  elements.nextTargetProgressBar.style.width = `${(target.progress * 100).toFixed(1)}%`;
}

function updateStructureDescriptions() {
  const harmony = getHarmonyMultiplier();
  const multiplier = game.ngMultiplier;
  const seedPerBird = game.seedRatePerBird * multiplier * harmony;
  const twigPerBird = game.twigRatePerBird * multiplier * harmony;
  const eggPerNest = game.eggRatePerNest * multiplier * harmony;
  const hatchPerNest = game.hatchRatePerNest * multiplier * harmony;
  const sciencePerNest = game.featherScienceRatePerNest * multiplier * harmony;
  const lorePerAviary = game.skyLoreRatePerAviary * multiplier * harmony;
  const starRate = game.starshipColonizeRate * multiplier * harmony;

  elements.birdDesc.textContent = game.twigsUnlocked
    ? `Each bird gathers ${formatNumber(seedPerBird, 2)} seeds/s and ${formatNumber(
        twigPerBird,
        2
      )} twigs/s.`
    : `Each bird gathers ${formatNumber(seedPerBird, 2)} seeds/s. Twigs unlock at 5 birds.`;

  elements.nestDesc.textContent = `Each nest produces ${formatNumber(
    eggPerNest,
    2
  )} eggs/s, hatches ${formatNumber(
    hatchPerNest,
    2
  )} birds/s, and adds ${formatNumber(sciencePerNest, 2)} science/s.`;

  elements.roostDesc.textContent = `Each roost adds +${formatNumber(
    game.harmonyPerRoost,
    2
  )} Harmony (boosts all production). Current Harmony x${formatNumber(
    harmony,
    2
  )}.`;

  elements.aviaryDesc.textContent = `Each aviary generates ${formatNumber(
    lorePerAviary,
    2
  )} sky lore/s (used for starships and projects).`;

  elements.starshipDesc.textContent = `Each starship colonizes ${formatNumber(
    starRate,
    2
  )} systems/s.`;

  elements.nestDesc.hidden = elements.buyNest.hidden;
  elements.roostDesc.hidden = elements.buyRoost.hidden;
  elements.aviaryDesc.hidden = elements.buyAviary.hidden;
  elements.starshipDesc.hidden = elements.buyStarship.hidden;
}

function getHarmonyMultiplier() {
  return 1 + game.roosts * game.harmonyPerRoost;
}

function updateStory() {
  const story = getStoryState();
  elements.storyEra.textContent = story.era;
  elements.storyText.textContent = story.text;
}

function getStoryState() {
  if (!game.nestsUnlocked) {
    return {
      era: "Era of Seeds",
      text: "The first birds learn that seeds are leverage, not just lunch.",
    };
  }
  if (!game.roostsUnlocked) {
    return {
      era: "Era of Nests",
      text: "Nests rise in every courtyard. The flock begins to dream together.",
    };
  }
  if (!game.aviariesUnlocked) {
    return {
      era: "Era of Song",
      text: "Roosts hum with harmony. The air itself bends to the chorus.",
    };
  }  if (!game.neighborhoodUnlocked) {
    return {
      era: "Era of Lore",
      text: "Aviaries stack with scrolls of wind. The ground looks negotiable.",
    };
  }
  if (!game.townUnlocked) {
    return {
      era: "Era of Blocks",
      text: "Neighborhoods sway to the flutter. Every corner is a chorus line.",
    };
  }
  if (!game.countryUnlocked) {
    return {
      era: "Era of Towns",
      text: "Town squares fill with feathers. Councils schedule daily feedings.",
    };
  }
  if (!game.worldUnlocked) {
    return {
      era: "Era of Nations",
      text: "Countries align under wing. Treaties are signed in the sky.",
    };
  }
  if (!game.spaceUnlocked) {
    return {
      era: "Era of Dominion",
      text: "Governments are nests now. The horizon is just another perch.",
    };
  }
  if (game.starSystems < STAR_TARGET) {
    return {
      era: "Era of Starlight",
      text: "Starships glide between suns. Relics whisper about older flocks.",
    };
  }
  return {
    era: "Era of Eternal Flight",
    text: "The flock owns the galaxy. Every myth is feathered now.",
  };
}

function getNextTarget() {
  if (!game.twigsUnlocked) {
    const progress = Math.min(1, game.birds / 5);
    return {
      title: "Discover Twigs",
      detail: "Reach 5 birds to begin gathering twigs.",
      progressText: `${formatNumber(game.birds)} / 5 birds`,
      progress,
    };
  }

  if (!game.nestsUnlocked) {
    const progress = Math.min(1, game.birds / BIRDS_FOR_NESTS);
    return {
      title: "Unlock Nests",
      detail: `Reach ${BIRDS_FOR_NESTS} birds to build nests.`,
      progressText: `${formatNumber(game.birds)} / ${BIRDS_FOR_NESTS} birds`,
      progress,
    };
  }

  if (!game.roostsUnlocked) {
    const progress = Math.min(1, game.birds / BIRDS_FOR_ROOSTS);
    return {
      title: "Raise Roosts",
      detail: `Reach ${BIRDS_FOR_ROOSTS} birds to harmonize the flock.`,
      progressText: `${formatNumber(game.birds)} / ${BIRDS_FOR_ROOSTS} birds`,
      progress,
    };
  }

  if (!game.aviariesUnlocked) {
    const progress = Math.min(1, game.featherScience / FEATHER_FOR_AVIARIES);
    return {
      title: "Open Aviaries",
      detail: `Gather ${FEATHER_FOR_AVIARIES} feather science to open aviaries.`,
      progressText: `${formatNumber(game.featherScience, 2)} / ${FEATHER_FOR_AVIARIES} science`,
      progress,
    };
  }

  if (game.birds >= DOCTRINE_UNLOCK_BIRDS && !game.doctrine) {
    return {
      title: "Choose Flight Doctrine",
      detail: "Select Industry, Diplomacy, or Exploration to unlock doctrine action and branch bonuses.",
      progressText: "Doctrine pending",
      progress: 0.2,
    };
  }

  if (!game.neighborhoodUnlocked) {
    const progress = Math.min(1, game.birds / BIRDS_FOR_NEIGHBORHOOD);
    return {
      title: "Rally the Neighborhood",
      detail: `Reach ${BIRDS_FOR_NEIGHBORHOOD} birds to start neighborhood influence.`,
      progressText: `${formatNumber(game.birds)} / ${BIRDS_FOR_NEIGHBORHOOD} birds`,
      progress,
    };
  }

  if (game.neighborhoodInfluence < NEIGHBORHOOD_TARGET) {
    const progress = Math.min(1, game.neighborhoodInfluence / NEIGHBORHOOD_TARGET);
    return {
      title: "Win the Neighborhood",
      detail: "Reach 100% neighborhood influence to unlock the town stage.",
      progressText: `${formatNumber(
        game.neighborhoodInfluence,
        2
      )}% / ${NEIGHBORHOOD_TARGET}%`,
      progress,
    };
  }

  if (game.townInfluence < TOWN_TARGET) {
    const progress = Math.min(1, game.townInfluence / TOWN_TARGET);
    return {
      title: "Secure the Town",
      detail: "Push town influence to 100% to reach country negotiations.",
      progressText: `${formatNumber(game.townInfluence, 2)}% / ${TOWN_TARGET}%`,
      progress,
    };
  }

  if (game.countryInfluence < COUNTRY_TARGET) {
    const progress = Math.min(1, game.countryInfluence / COUNTRY_TARGET);
    return {
      title: "Unify the Country",
      detail: "Complete country influence to start world control.",
      progressText: `${formatNumber(
        game.countryInfluence,
        2
      )}% / ${COUNTRY_TARGET}%`,
      progress,
    };
  }

  if (!game.worldUnlocked) {
    const progress = Math.min(1, game.countryInfluence / COUNTRY_TARGET);
    return {
      title: "Launch World Control",
      detail: "Finalize the charters to unlock global influence.",
      progressText: `${formatNumber(
        game.countryInfluence,
        2
      )}% / ${COUNTRY_TARGET}%`,
      progress,
    };
  }

  if (!game.spaceUnlocked) {
    const progress = Math.min(1, game.worldControl / 100);
    return {
      title: "Unlock Space",
      detail: "Drive world control to 100% to reach the stars.",
      progressText: `${formatNumber(game.worldControl, 2)}% / 100%`,
      progress,
    };
  }

  if (game.starSystems < STAR_TARGET) {
    const progress = Math.min(1, game.starSystems / STAR_TARGET);
    return {
      title: "Colonize the Stars",
      detail: `Expand to ${STAR_TARGET} star systems.`,
      progressText: `${formatNumber(game.starSystems, 2)} / ${STAR_TARGET} systems`,
      progress,
    };
  }

  return {
    title: game.won ? "Victory Achieved" : "Awaiting Victory",
    detail: "Launch New Game+ or bask in the feathers.",
    progressText: "100% complete",
    progress: 1,
  };
}

function updateUpgradesAvailability() {
  let anyAvailable = false;
  upgradesConfig.forEach((upgrade) => {
    const state = ensureUpgradeState(upgrade.id);
    state.unlocked = upgrade.unlockCondition();
    if (state.unlocked && !state.purchased) {
      anyAvailable = true;
    }
  });
  elements.upgradesPanel.hidden = !anyAvailable;
}

function updateProjectsAvailability() {
  let anyAvailable = false;
  projectsConfig.forEach((project) => {
    const state = ensureProjectState(project.id);
    if (project.unlockCondition()) {
      state.unlocked = true;
      if (!state.completed) {
        anyAvailable = true;
      }
    }
  });
  elements.projectsPanel.hidden = !anyAvailable;
}

function updateUpgradesButtons() {
  upgradesConfig.forEach((upgrade) => {
    const state = ensureUpgradeState(upgrade.id);
    const button = document.getElementById(`upgrade-${upgrade.id}`);
    const wrapper = document.getElementById(`upgrade-wrapper-${upgrade.id}`);
    const desc = document.getElementById(`upgrade-desc-${upgrade.id}`);
    if (!button) return;
    const shouldShow = state.unlocked && !state.purchased;

    if (wrapper) wrapper.hidden = !shouldShow;
    button.hidden = !shouldShow;
    if (desc) desc.hidden = !shouldShow;

    if (!shouldShow) return;

    const seedCost = upgrade.cost ?? 0;
    const featherCost = upgrade.costFeatherScience ?? 0;
    button.disabled =
      game.seeds < seedCost || game.featherScience < featherCost || game.won;
    const costParts = [];
    if (seedCost > 0) {
      costParts.push(`${formatNumber(seedCost)} seeds`);
    }
    if (featherCost > 0) {
      costParts.push(`${formatNumber(featherCost)} feather science`);
    }
    button.textContent = `${upgrade.name} (${costParts.join(", ")})`;
  });
}

function updateProjectsButtons() {
  projectsConfig.forEach((project) => {
    const state = ensureProjectState(project.id);
    const button = document.getElementById(`project-${project.id}`);
    const wrapper = document.getElementById(`project-wrapper-${project.id}`);
    const desc = document.getElementById(`project-desc-${project.id}`);
    if (!button) return;

    if (state.completed) {
      if (wrapper) wrapper.hidden = true;
      if (button) button.hidden = true;
      if (desc) desc.hidden = true;
      return;
    }

    if (state.unlocked) {
      if (wrapper) wrapper.hidden = false;
      button.hidden = false;
      if (desc) desc.hidden = false;
      const affordable = canAffordCosts(project.costs);
      button.disabled = !affordable || game.won;
      button.textContent = `${project.name} (${formatCostList(project.costs)})`;
    } else {
      if (wrapper) wrapper.hidden = true;
      button.hidden = true;
      if (desc) desc.hidden = true;
    }
  });
}

function rebuildUpgradesUI() {
  elements.upgrades.innerHTML = "";
  upgradesConfig.forEach((upgrade) => {
    ensureUpgradeState(upgrade.id);
    const wrapper = document.createElement("div");
    wrapper.id = `upgrade-wrapper-${upgrade.id}`;
    wrapper.className = "upgrade";
    wrapper.hidden = true;
    const button = document.createElement("button");
    button.id = `upgrade-${upgrade.id}`;
    button.hidden = true;
    button.addEventListener("click", () => purchaseUpgrade(upgrade));

    const desc = document.createElement("div");
    desc.className = "upgrade-desc";
    desc.id = `upgrade-desc-${upgrade.id}`;
    desc.textContent = upgrade.desc;
    desc.hidden = true;

    wrapper.appendChild(button);
    wrapper.appendChild(desc);
    elements.upgrades.appendChild(wrapper);
  });
}

function rebuildProjectsUI() {
  elements.projects.innerHTML = "";
  projectsConfig.forEach((project) => {
    ensureProjectState(project.id);
    const wrapper = document.createElement("div");
    wrapper.id = `project-wrapper-${project.id}`;
    wrapper.className = "project";
    wrapper.hidden = true;
    const button = document.createElement("button");
    button.id = `project-${project.id}`;
    button.hidden = true;
    button.addEventListener("click", () => purchaseProject(project));

    const desc = document.createElement("div");
    desc.className = "project-desc";
    desc.id = `project-desc-${project.id}`;
    desc.textContent = project.desc;
    desc.hidden = true;

    wrapper.appendChild(button);
    wrapper.appendChild(desc);
    elements.projects.appendChild(wrapper);
  });
}

function purchaseUpgrade(upgrade) {
  const state = ensureUpgradeState(upgrade.id);
  const seedCost = upgrade.cost ?? 0;
  const featherCost = upgrade.costFeatherScience ?? 0;
  if (
    !state.unlocked ||
    state.purchased ||
    game.seeds < seedCost ||
    game.featherScience < featherCost ||
    game.won
  )
    return;
  game.seeds -= seedCost;
  game.featherScience -= featherCost;
  state.purchased = true;
  upgrade.applyEffect();
  addLog(`Upgrade purchased: ${upgrade.name}.`);
  updateUpgradesAvailability();
  updateUI();
  saveGame();
}

function purchaseProject(project) {
  const state = ensureProjectState(project.id);
  if (!state.unlocked || state.completed || game.won) return;
  if (!canAffordCosts(project.costs)) return;
  spendCosts(project.costs);
  state.completed = true;
  project.applyEffect();
  addLog(`Major project completed: ${project.name}.`);
  const wrapper = document.getElementById(`project-wrapper-${project.id}`);
  if (wrapper) wrapper.hidden = true;
  updateProjectsAvailability();
  updateUI();
  saveGame();
}

function sendExpedition() {
  if (
    game.seeds < COSTS.expeditionSeedCost ||
    game.twigs < COSTS.expeditionTwigCost ||
    game.won
  )
    return;
  game.seeds -= COSTS.expeditionSeedCost;
  game.twigs -= COSTS.expeditionTwigCost;
  const roll = Math.random();
  if (roll < 0.4) {
    const loreGain = 6 + Math.random() * 8;
    game.skyLore += loreGain;
    addLog(`Expedition returns with sky lore: +${formatNumber(loreGain, 2)}.`);
  } else if (roll < 0.7) {
    const seedGain = 1200 + Math.random() * 1600;
    game.seeds += seedGain;
    addLog(`Expedition uncovers hidden granaries: +${formatNumber(seedGain)} seeds.`);
  } else {
    const relicGain = 0.4 + Math.random() * 0.8;
    game.relics += relicGain;
    addLog(`Expedition finds an ancient relic: +${formatNumber(relicGain, 2)} relics.`);
  }
  refreshUnlocks();
  updateUI();
  saveGame();
}

function hostNeighborhoodRally() {
  if (
    !game.neighborhoodUnlocked ||
    game.neighborhoodInfluence >= NEIGHBORHOOD_TARGET ||
    game.seeds < COSTS.neighborhoodRallySeedCost ||
    game.twigs < COSTS.neighborhoodRallyTwigCost ||
    game.won
  )
    return;
  game.seeds -= COSTS.neighborhoodRallySeedCost;
  game.twigs -= COSTS.neighborhoodRallyTwigCost;
  const gain = 2.5 + Math.random() * 3.5;
  game.neighborhoodInfluence = Math.min(
    NEIGHBORHOOD_TARGET,
    game.neighborhoodInfluence + gain
  );
  addLog(`Neighborhood rally boosts influence by ${formatNumber(gain, 2)}%.`);
  refreshUnlocks();
  updateUI();
  saveGame();
}

function holdTownSummit() {
  if (
    !game.townUnlocked ||
    game.townInfluence >= TOWN_TARGET ||
    game.seeds < COSTS.townSummitSeedCost ||
    game.eggs < COSTS.townSummitEggCost ||
    game.won
  )
    return;
  game.seeds -= COSTS.townSummitSeedCost;
  game.eggs -= COSTS.townSummitEggCost;
  const gain = 2 + Math.random() * 3;
  game.townInfluence = Math.min(TOWN_TARGET, game.townInfluence + gain);
  addLog(`Town summit sways voters: +${formatNumber(gain, 2)}% influence.`);
  refreshUnlocks();
  updateUI();
  saveGame();
}

function draftCountryCharter() {
  if (
    !game.countryUnlocked ||
    game.countryInfluence >= COUNTRY_TARGET ||
    game.seeds < COSTS.countryCharterSeedCost ||
    game.skyLore < COSTS.countryCharterLoreCost ||
    game.won
  )
    return;
  game.seeds -= COSTS.countryCharterSeedCost;
  game.skyLore -= COSTS.countryCharterLoreCost;
  const gain = 1.5 + Math.random() * 2.5;
  game.countryInfluence = Math.min(COUNTRY_TARGET, game.countryInfluence + gain);
  addLog(`Country charter ratified: +${formatNumber(gain, 2)}% influence.`);
  refreshUnlocks();
  updateUI();
  saveGame();
}


function getDoctrineMultipliers() {
  const base = { seed: 1, twig: 1, hatch: 1, influence: 1, star: 1, relic: 1 };
  const doctrine = doctrineConfig.find((d) => d.id === game.doctrine);
  if (!doctrine) return base;
  return {
    seed: doctrine.modifiers.seed || 1,
    twig: doctrine.modifiers.twig || 1,
    hatch: doctrine.modifiers.hatch || 1,
    influence: doctrine.modifiers.influence || 1,
    star: doctrine.modifiers.star || 1,
    relic: doctrine.modifiers.relic || 1,
  };
}

function getRouteMultipliers() {
  if (game.scoutRouteTimer <= 0) return { seed: 1, twig: 1 };
  if (game.currentRouteFocus === "seed") return { seed: 1.4, twig: 0.8 };
  if (game.currentRouteFocus === "twig") return { seed: 0.8, twig: 1.4 };
  return { seed: 1.15, twig: 1.15 };
}

function useFlockFormation() {
  if (game.won || game.doctrineActionCooldown > 0 || game.birds < 3) return;
  game.flockFormationTimer = 8;
  game.doctrineActionCooldown = 20;
  game.earlyActions.flockFormationUsed = true;
  addLog("Flock Formation activated: output surges briefly.");
}

function useScoutRoute() {
  if (game.won || game.doctrineActionCooldown > 0 || game.birds < 3) return;
  const rolls = ["seed", "twig", "balanced"];
  game.currentRouteFocus = rolls[Math.floor(Math.random() * rolls.length)];
  game.scoutRouteTimer = 20;
  game.doctrineActionCooldown = 20;
  game.earlyActions.scoutRouteUsed = true;
  addLog(`Scout Route set to ${game.currentRouteFocus} focus.`);
}

function resolveEventChoice(choice) {
  if (!game.activeEvent || game.won) return;
  if (choice === "harvest") {
    const gain = 1800 + game.birds * 4;
    game.seeds += gain;
    game.eventHeat += 0.2;
    addLog(`Event harvested aggressively: +${formatNumber(gain)} seeds, heat rises.`);
  } else if (choice === "stabilize") {
    const loreCost = 20;
    if (game.skyLore >= loreCost) {
      game.skyLore -= loreCost;
      game.eventHeat = Math.max(0, game.eventHeat - 0.35);
      game.eventTimeRemaining = Math.max(3, game.eventTimeRemaining - 8);
      addLog("Event stabilized using lore. Duration reduced and heat lowered.");
    } else {
      addLog("Need 20 lore to stabilize this event.", false);
    }
  } else {
    game.eventHeat = Math.max(0, game.eventHeat - 0.05);
    addLog("Event ignored. The flock observes from afar.", false);
  }
  updateUI();
  saveGame();
}

function chooseDoctrine(id) {
  if (game.doctrine || game.birds < DOCTRINE_UNLOCK_BIRDS) return;
  const doctrine = doctrineConfig.find((d) => d.id === id);
  if (!doctrine) return;
  game.doctrine = doctrine.id;
  addLog(`Doctrine chosen: ${doctrine.name}. ${doctrine.actionDesc}`);
  rebuildDoctrineUI();
  updateUI();
  saveGame();
}

function rebuildDoctrineUI() {
  if (!elements.specializationOptions) return;
  elements.specializationOptions.innerHTML = "";
  doctrineConfig.forEach((doctrine) => {
    const card = document.createElement("div");
    card.className = `doctrine-card${game.doctrine === doctrine.id ? " active" : ""}`;

    const title = document.createElement("div");
    title.className = "command-talent-title";
    title.textContent = doctrine.name;

    const desc = document.createElement("div");
    desc.className = "directive-progress";
    desc.textContent = doctrine.desc;

    const action = document.createElement("div");
    action.className = "directive-progress";
    action.textContent = `${doctrine.actionName}: ${doctrine.actionDesc}`;

    const button = document.createElement("button");
    button.dataset.doctrineId = doctrine.id;
    button.textContent = game.doctrine === doctrine.id ? "Selected" : "Adopt Doctrine";
    button.disabled = Boolean(game.doctrine) || game.won;

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(action);
    card.appendChild(button);
    elements.specializationOptions.appendChild(card);
  });
}

function canAffordCosts(costs) {
  const entries = Object.entries(costs);
  return entries.every(([key, value]) => {
    switch (key) {
      case "seeds":
        return game.seeds >= value;
      case "twigs":
        return game.twigs >= value;
      case "eggs":
        return game.eggs >= value;
      case "featherScience":
        return game.featherScience >= value;
      case "skyLore":
        return game.skyLore >= value;
      case "relics":
        return game.relics >= value;
      default:
        return true;
    }
  });
}

function spendCosts(costs) {
  Object.entries(costs).forEach(([key, value]) => {
    switch (key) {
      case "seeds":
        game.seeds -= value;
        break;
      case "twigs":
        game.twigs -= value;
        break;
      case "eggs":
        game.eggs -= value;
        break;
      case "featherScience":
        game.featherScience -= value;
        break;
      case "skyLore":
        game.skyLore -= value;
        break;
      case "relics":
        game.relics -= value;
        break;
      default:
        break;
    }
  });
}

function formatCostList(costs) {
  const labels = {
    seeds: "seeds",
    twigs: "twigs",
    eggs: "eggs",
    featherScience: "feather science",
    skyLore: "lore",
    relics: "relics",
  };
  return Object.entries(costs)
    .map(([key, value]) => `${formatNumber(value)} ${labels[key] ?? key}`)
    .join(", ");
}

function handleMilestones() {
  if (game.neighborhoodUnlocked) {
    if (game.neighborhoodInfluence >= NEIGHBORHOOD_TARGET && !milestoneFlags.neighborhood100) {
      milestoneFlags.neighborhood100 = true;
      addLog("Neighborhood influence 100%. The block parties are permanent.");
    }
  }

  if (game.townUnlocked) {
    if (game.townInfluence >= TOWN_TARGET && !milestoneFlags.town100) {
      milestoneFlags.town100 = true;
      addLog("Town influence 100%. The mayor now answers to the roost.");
    }
  }

  if (game.countryUnlocked) {
    if (game.countryInfluence >= COUNTRY_TARGET && !milestoneFlags.country100) {
      milestoneFlags.country100 = true;
      addLog("Country influence 100%. The anthem is a chorus of wings.");
    }
  }

  if (game.worldUnlocked) {
    if (game.worldControl >= 25 && !milestoneFlags.world25) {
      milestoneFlags.world25 = true;
      addLog("World control 25%. The pigeons are now a committee.");
    }
    if (game.worldControl >= 50 && !milestoneFlags.world50) {
      milestoneFlags.world50 = true;
      addLog("World control 50%. Half the planet is now a flight path.");
    }
    if (game.worldControl >= 75 && !milestoneFlags.world75) {
      milestoneFlags.world75 = true;
      addLog("World control 75%. The ground seems optional.");
    }
    if (game.worldControl >= 100 && !milestoneFlags.world100) {
      milestoneFlags.world100 = true;
      addLog("World control 100%. Earth is officially a nest.");
    }
  }

  if (game.relics >= 1 && !milestoneFlags.firstRelic) {
    milestoneFlags.firstRelic = true;
    addLog("First relic decoded. The flock learns older secrets.");
  }

  if (game.starSystems >= 1 && !milestoneFlags.firstStarSystem) {
    milestoneFlags.firstStarSystem = true;
    addLog("First star system colonized. We come in peace, and with snacks.");
  }

  if (Math.random() < 0.002) {
    const line = philosophyLines[Math.floor(Math.random() * philosophyLines.length)];
    addLog(`Philosophy Bird: "${line}"`, false);
  }

  if (Math.random() < 0.003) {
    const line = birdChatterLines[Math.floor(Math.random() * birdChatterLines.length)];
    addLog(`Birds chatter: "${line}"`, false);
  }
}

function checkWin() {
  if (game.starSystems >= STAR_TARGET && !game.won) {
    game.won = true;
    stopLoops();
    showWinState();
    addLog("Victory! The flock now owns the galaxy.");
    saveGame();
  }
}

function showWinState() {
  elements.newGamePlus.hidden = false;
  elements.ending.hidden = false;
  elements.ngRow.hidden = false;
  elements.expeditionButton.disabled = true;
  elements.buyBird.disabled = true;
  elements.buyNest.disabled = true;
  elements.buyRoost.disabled = true;
  elements.buyAviary.disabled = true;
  elements.buyStarship.disabled = true;
  updateUpgradesButtons();
  updateProjectsButtons();
}

function startNewGamePlus() {
  game.ngPlusCount += 1;
  game.ngMultiplier *= 2;
  const multiplier = game.ngMultiplier;
  const ngPlusCount = game.ngPlusCount;
  const previousAchievements = game.achievements;
  const previousAutomation = game.automation;
  const previousCommandTalents = game.commandTalents;
  const previousCommandPoints = game.commandPoints;
  const previousRelicLab = game.relicLab;
  game = createDefaultGame();
  game.ngPlusCount = ngPlusCount;
  game.ngMultiplier = multiplier;
  game.achievements = previousAchievements || {};
  game.automation = previousAutomation || game.automation;
  game.commandTalents = previousCommandTalents || game.commandTalents;
  game.commandPoints = previousCommandPoints || 0;
  game.relicLab = previousRelicLab || game.relicLab;
  game.achievementBonus = 1 + getUnlockedAchievementCount() * 0.03;
  game.log = [];
  resetMilestones();
  rebuildUpgradesUI();
  rebuildProjectsUI();
  rebuildDirectivesUI();
  rebuildCommandTalentsUI();
  rebuildRelicLabUI();
  rebuildDoctrineUI();
  refreshUnlocks(true);
  elements.log.innerHTML = "";
  addLog(`New Game+ begun. Feathered multiplier now x${formatNumber(multiplier)}.`);
  elements.newGamePlus.hidden = true;
  elements.ending.hidden = true;
  game.won = false;
  updateUI();
  saveGame();
  startLoops();
}

function resetMilestones() {
  Object.keys(milestoneFlags).forEach((key) => {
    milestoneFlags[key] = false;
  });
}

function addLog(message, shouldSave = true) {
  const entry = {
    time: Date.now(),
    message,
  };
  game.log.push(entry);
  const div = document.createElement("div");
  div.className = "log-entry";
  div.textContent = message;
  elements.log.appendChild(div);
  elements.log.scrollTop = elements.log.scrollHeight;
  if (shouldSave) saveGame();
}

function formatNumber(value, decimals = 0) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  const getDisplayDecimals = (scaled) => {
    if (decimals === 0 && Math.abs(scaled) < 10) {
      return 1;
    }
    return decimals;
  };
  if (Math.abs(num) < 1e3) {
    return num.toFixed(decimals);
  }
  if (Math.abs(num) < 1e6) {
    const scaled = num / 1e3;
    return `${scaled.toFixed(getDisplayDecimals(scaled))}K`;
  }
  if (Math.abs(num) < 1e9) {
    const scaled = num / 1e6;
    return `${scaled.toFixed(getDisplayDecimals(scaled))}M`;
  }
  if (Math.abs(num) < 1e12) {
    const scaled = num / 1e9;
    return `${scaled.toFixed(getDisplayDecimals(scaled))}B`;
  }
  return num.toExponential(2);
}

function formatSignedNumber(value, decimals = 0) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatNumber(Math.abs(value), decimals)}`;
}

function saveGame() {
  const payload = {
    seeds: game.seeds,
    twigs: game.twigs,
    eggs: game.eggs,
    birds: game.birds,
    nests: game.nests,
    roosts: game.roosts,
    aviaries: game.aviaries,
    starships: game.starships,
    worldControl: game.worldControl,
    neighborhoodInfluence: game.neighborhoodInfluence,
    townInfluence: game.townInfluence,
    countryInfluence: game.countryInfluence,
    starSystems: game.starSystems,
    featherScience: game.featherScience,
    skyLore: game.skyLore,
    relics: game.relics,
    birdFraction: game.birdFraction,
    forageBurstCooldown: game.forageBurstCooldown,
    doctrine: game.doctrine,
    doctrineActionCooldown: game.doctrineActionCooldown,
    eventHeat: game.eventHeat,
    currentRouteFocus: game.currentRouteFocus,
    scoutRouteTimer: game.scoutRouteTimer,
    flockFormationTimer: game.flockFormationTimer,
    earlyActions: game.earlyActions,
    birdCost: game.birdCost,
    nestCost: game.nestCost,
    nestTwigCost: game.nestTwigCost,
    roostCost: game.roostCost,
    roostTwigCost: game.roostTwigCost,
    aviaryCost: game.aviaryCost,
    aviaryScienceCost: game.aviaryScienceCost,
    starshipCost: game.starshipCost,
    starshipLoreCost: game.starshipLoreCost,
    peckPower: game.peckPower,
    foragePower: game.foragePower,
    seedRatePerBird: game.seedRatePerBird,
    twigRatePerBird: game.twigRatePerBird,
    eggRatePerNest: game.eggRatePerNest,
    hatchRatePerNest: game.hatchRatePerNest,
    hatchUsagePercent: game.hatchUsagePercent,
    featherScienceRatePerNest: game.featherScienceRatePerNest,
    skyLoreRatePerAviary: game.skyLoreRatePerAviary,
    harmonyPerRoost: game.harmonyPerRoost,
    neighborhoodInfluenceRateFactor: game.neighborhoodInfluenceRateFactor,
    townInfluenceRateFactor: game.townInfluenceRateFactor,
    countryInfluenceRateFactor: game.countryInfluenceRateFactor,
    worldControlRateFactor: game.worldControlRateFactor,
    starshipColonizeRate: game.starshipColonizeRate,
    relicRatePerStarSystem: game.relicRatePerStarSystem,
    twigsUnlocked: game.twigsUnlocked,
    nestsUnlocked: game.nestsUnlocked,
    eggsUnlocked: game.eggsUnlocked,
    roostsUnlocked: game.roostsUnlocked,
    aviariesUnlocked: game.aviariesUnlocked,
    loreUnlocked: game.loreUnlocked,
    neighborhoodUnlocked: game.neighborhoodUnlocked,
    townUnlocked: game.townUnlocked,
    countryUnlocked: game.countryUnlocked,
    worldUnlocked: game.worldUnlocked,
    spaceUnlocked: game.spaceUnlocked,
    relicsUnlocked: game.relicsUnlocked,
    expeditionsUnlocked: game.expeditionsUnlocked,
    ngPlusCount: game.ngPlusCount,
    ngMultiplier: game.ngMultiplier,
    achievementBonus: game.achievementBonus,
    automation: game.automation,
    autoBuyTimer: game.autoBuyTimer,
    achievements: game.achievements,
    commandPoints: game.commandPoints,
    directives: game.directives,
    commandTalents: game.commandTalents,
    relicLab: game.relicLab,
    activeEvent: game.activeEvent,
    eventTimeRemaining: game.eventTimeRemaining,
    eventCooldown: game.eventCooldown,
    upgrades: game.upgrades,
    projects: game.projects,
    log: game.log,
    won: game.won,
    lastSavedAt: Date.now(),
  };
  localStorage.setItem("birdGameSave", JSON.stringify(payload));
}

function loadGame() {
  const raw = localStorage.getItem("birdGameSave");
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    const loaded = createDefaultGame();
    Object.assign(loaded, data);
    if (typeof loaded.hatchUsagePercent !== "number") {
      loaded.hatchUsagePercent = 100;
    }
    if (!loaded.hatchRatePerNest && loaded.birdGrowthRatePerNest) {
      loaded.hatchRatePerNest = loaded.birdGrowthRatePerNest;
    }
    if (typeof loaded.forageBurstCooldown !== "number") {
      loaded.forageBurstCooldown = 0;
    }
    const offlineSummary = applyOfflineProgress(loaded);
    return { game: loaded, offlineSummary };
  } catch (error) {
    console.error("Failed to load save", error);
    return null;
  }
}

function applyOfflineProgress(loaded) {
  const now = Date.now();
  if (!loaded.lastSavedAt) {
    loaded.lastSavedAt = now;
    return null;
  }
  const deltaSeconds = Math.max(
    0,
    Math.min((now - loaded.lastSavedAt) / 1000, MAX_OFFLINE_SECONDS)
  );
  if (deltaSeconds <= 0) {
    loaded.lastSavedAt = now;
    return null;
  }

  const multiplier = loaded.ngMultiplier * (loaded.achievementBonus || 1);
  const harmony = 1 + loaded.roosts * loaded.harmonyPerRoost;
  const broodMultiplier = 1 + ((loaded.commandTalents && loaded.commandTalents.broodcare) || 0) * 0.06;
  const astroMultiplier = 1 + ((loaded.commandTalents && loaded.commandTalents.astro) || 0) * 0.08;
  const diplomacyMultiplier = 1 + ((loaded.commandTalents && loaded.commandTalents.diplomacy) || 0) * 0.07;
  const labEfficiencyMultiplier = 1 + ((loaded.relicLab && loaded.relicLab.efficiency) || 0) * 0.05;
  const labArchiveMultiplier = 1 + ((loaded.relicLab && loaded.relicLab.archives) || 0) * 0.1;
  const labInfluenceMultiplier = 1 + ((loaded.relicLab && loaded.relicLab.weatherproofing) || 0) * 0.08;
  const seedsGain = loaded.birds * loaded.seedRatePerBird * multiplier * harmony * labEfficiencyMultiplier * deltaSeconds;
  const twigsGain = loaded.twigsUnlocked
    ? loaded.birds * loaded.twigRatePerBird * multiplier * harmony * labEfficiencyMultiplier * deltaSeconds
    : 0;
  loaded.seeds += seedsGain;
  loaded.twigs += twigsGain;

  const birdsBefore = loaded.birds;
  const eggsBefore = loaded.eggs;
  if (loaded.nests > 0) {
    loaded.eggs += loaded.nests * loaded.eggRatePerNest * multiplier * harmony * broodMultiplier * deltaSeconds;
    const hatchPotential =
      loaded.nests *
      loaded.hatchRatePerNest *
      multiplier *
      harmony *
      broodMultiplier *
      (loaded.hatchUsagePercent / 100) *
      deltaSeconds;
    const hatchAmount = Math.min(loaded.eggs, hatchPotential);
    if (hatchAmount > 0) {
      loaded.eggs -= hatchAmount;
      loaded.birdFraction += hatchAmount;
      const newBirds = Math.floor(loaded.birdFraction);
      if (newBirds > 0) {
        loaded.birdFraction -= newBirds;
        loaded.birds += newBirds;
      }
    }
  }

  const scienceBefore = loaded.featherScience;
  if (loaded.nests > 0) {
    loaded.featherScience +=
      loaded.nests * loaded.featherScienceRatePerNest * multiplier * harmony * broodMultiplier * labEfficiencyMultiplier * deltaSeconds;
  }

  const loreBefore = loaded.skyLore;
  if (loaded.aviaries > 0) {
    loaded.skyLore +=
      loaded.aviaries * loaded.skyLoreRatePerAviary * multiplier * harmony * labArchiveMultiplier * deltaSeconds;
  }

  const neighborhoodBefore = loaded.neighborhoodInfluence;
  if (loaded.neighborhoodUnlocked && loaded.neighborhoodInfluence < NEIGHBORHOOD_TARGET) {
    const neighborhoodRate =
      (loaded.birds + loaded.nests * 4) *
      loaded.neighborhoodInfluenceRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      100;
    loaded.neighborhoodInfluence = Math.min(
      NEIGHBORHOOD_TARGET,
      loaded.neighborhoodInfluence + neighborhoodRate * deltaSeconds
    );
  }

  const townBefore = loaded.townInfluence;
  if (loaded.townUnlocked && loaded.townInfluence < TOWN_TARGET) {
    const townRate =
      (loaded.birds + loaded.roosts * 30) *
      loaded.townInfluenceRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      100;
    loaded.townInfluence = Math.min(
      TOWN_TARGET,
      loaded.townInfluence + townRate * deltaSeconds
    );
  }

  const countryBefore = loaded.countryInfluence;
  if (loaded.countryUnlocked && loaded.countryInfluence < COUNTRY_TARGET) {
    const countryRate =
      (loaded.birds + loaded.aviaries * 50) *
      loaded.countryInfluenceRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      100;
    loaded.countryInfluence = Math.min(
      COUNTRY_TARGET,
      loaded.countryInfluence + countryRate * deltaSeconds
    );
  }

  const worldBefore = loaded.worldControl;
  if (loaded.worldUnlocked && loaded.worldControl < 100) {
    const rate =
      (loaded.birds + loaded.roosts * 25 + loaded.aviaries * 45) *
      loaded.worldControlRateFactor *
      multiplier *
      harmony *
      diplomacyMultiplier *
      labInfluenceMultiplier *
      deltaSeconds *
      100;
    loaded.worldControl = Math.min(100, loaded.worldControl + rate);
  }

  const starBefore = loaded.starSystems;
  if (loaded.spaceUnlocked && loaded.starSystems < STAR_TARGET) {
    loaded.starSystems = Math.min(
      STAR_TARGET,
      loaded.starSystems +
        loaded.starships * loaded.starshipColonizeRate * multiplier * harmony * astroMultiplier * deltaSeconds
    );
  }

  const relicBefore = loaded.relics;
  if (loaded.spaceUnlocked && loaded.starSystems > 0) {
    loaded.relics +=
      loaded.starSystems *
      loaded.relicRatePerStarSystem *
      multiplier *
      harmony *
      astroMultiplier *
      labArchiveMultiplier *
      deltaSeconds;
  }

  loaded.lastSavedAt = now;

  const birdsGain = loaded.birds - birdsBefore;
  const eggsGain = loaded.eggs - eggsBefore;
  const scienceGain = loaded.featherScience - scienceBefore;
  const loreGain = loaded.skyLore - loreBefore;
  const neighborhoodGain = loaded.neighborhoodInfluence - neighborhoodBefore;
  const townGain = loaded.townInfluence - townBefore;
  const countryGain = loaded.countryInfluence - countryBefore;
  const worldGain = loaded.worldControl - worldBefore;
  const starGain = loaded.starSystems - starBefore;
  const relicGain = loaded.relics - relicBefore;

  return `Offline gains (${formatNumber(deltaSeconds, 1)}s): +${formatNumber(
    seedsGain,
    2
  )} seeds, +${formatNumber(twigsGain, 2)} twigs, +${formatNumber(
    eggsGain,
    2
  )} eggs, +${formatNumber(birdsGain)} birds, +${formatNumber(
    scienceGain,
    2
  )} science, +${formatNumber(loreGain, 2)} lore, +${formatNumber(
    neighborhoodGain,
    2
  )}% neighborhood, +${formatNumber(townGain, 2)}% town, +${formatNumber(
    countryGain,
    2
  )}% country, +${formatNumber(worldGain, 2)}% world control, +${formatNumber(
    starGain,
    2
  )} systems, +${formatNumber(relicGain, 2)} relics.`;
}

function restoreUpgrades() {
  if (!game.upgrades || typeof game.upgrades !== "object") {
    game.upgrades = {};
  }
  game.peckPower = 1;
  game.foragePower = 1;
  game.seedRatePerBird = BASE_RATES.seedRatePerBird;
  game.twigRatePerBird = BASE_RATES.twigRatePerBird;
  game.eggRatePerNest = BASE_RATES.eggRatePerNest;
  game.hatchRatePerNest = BASE_RATES.hatchRatePerNest;
  game.featherScienceRatePerNest = BASE_RATES.featherScienceRatePerNest;
  game.skyLoreRatePerAviary = BASE_RATES.skyLoreRatePerAviary;
  game.harmonyPerRoost = BASE_RATES.harmonyPerRoost;
  game.neighborhoodInfluenceRateFactor = BASE_RATES.neighborhoodInfluenceRateFactor;
  game.townInfluenceRateFactor = BASE_RATES.townInfluenceRateFactor;
  game.countryInfluenceRateFactor = BASE_RATES.countryInfluenceRateFactor;
  game.worldControlRateFactor = BASE_RATES.worldControlRateFactor;
  game.starshipColonizeRate = BASE_RATES.starshipColonizeRate;
  game.relicRatePerStarSystem = BASE_RATES.relicRatePerStarSystem;
  if (typeof game.achievementBonus !== "number") {
    game.achievementBonus = 1;
  }
  if (!game.automation || typeof game.automation !== "object") {
    game.automation = {
      autoBirds: false,
      autoNests: false,
      autoRoosts: false,
      autoAviaries: false,
      autoStarships: false,
      autoActions: false,
    };
  }
  if (typeof game.commandPoints !== "number") {
    game.commandPoints = 0;
  }
  if (!game.commandTalents || typeof game.commandTalents !== "object") {
    game.commandTalents = { thrift: 0, broodcare: 0, diplomacy: 0, astro: 0 };
  }
  if (!game.directives || typeof game.directives !== "object") {
    game.directives = {};
  }
  if (!game.relicLab || typeof game.relicLab !== "object") {
    game.relicLab = { efficiency: 0, weatherproofing: 0, archives: 0 };
  }
  if (typeof game.eventTimeRemaining !== "number") {
    game.eventTimeRemaining = 0;
  }
  if (typeof game.eventCooldown !== "number") {
    game.eventCooldown = EVENT_CHECK_INTERVAL_SECONDS;
  }
  if (typeof game.forageBurstCooldown !== "number") {
    game.forageBurstCooldown = 0;
  }
  if (typeof game.doctrineActionCooldown !== "number") game.doctrineActionCooldown = 0;
  if (typeof game.eventHeat !== "number") game.eventHeat = 0;
  if (typeof game.scoutRouteTimer !== "number") game.scoutRouteTimer = 0;
  if (typeof game.flockFormationTimer !== "number") game.flockFormationTimer = 0;
  if (!game.currentRouteFocus) game.currentRouteFocus = "balanced";
  if (!game.earlyActions || typeof game.earlyActions !== "object") game.earlyActions = { flockFormationUsed: false, scoutRouteUsed: false };
  achievementsConfig.forEach((achievement) => ensureAchievementState(achievement.id));
  directivesConfig.forEach((directive) => ensureDirectiveState(directive.id));
  initDirectives();
  game.achievementBonus = 1 + getUnlockedAchievementCount() * 0.03;
  upgradesConfig.forEach((upgrade) => {
    ensureUpgradeState(upgrade.id);
    if (game.upgrades[upgrade.id].purchased) {
      upgrade.reapplyEffectForLoad();
    }
  });
  loadLog();
}

function ensureUpgradeState(upgradeId) {
  if (!game.upgrades || typeof game.upgrades !== "object") {
    game.upgrades = {};
  }
  if (!game.upgrades[upgradeId]) {
    game.upgrades[upgradeId] = { unlocked: false, purchased: false };
  }
  return game.upgrades[upgradeId];
}

function ensureProjectState(projectId) {
  if (!game.projects || typeof game.projects !== "object") {
    game.projects = {};
  }
  if (!game.projects[projectId]) {
    game.projects[projectId] = { unlocked: false, completed: false };
  }
  return game.projects[projectId];
}

function loadLog() {
  elements.log.innerHTML = "";
  if (!game.log) {
    game.log = [];
  }
  game.log.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = entry.message;
    elements.log.appendChild(div);
  });
  elements.log.scrollTop = elements.log.scrollHeight;
}

function updateHeroArt() {
  if (!elements.heroBirds || !elements.heroUpgrades) return;
  const birdCount = getHeroBirdCount(game.birds);
  const upgradesKey = [
    game.nestsUnlocked,
    game.roostsUnlocked,
    game.aviariesUnlocked,
    game.spaceUnlocked,
    game.neighborhoodUnlocked,
    game.townUnlocked,
    game.countryUnlocked,
    game.worldUnlocked,
    game.nests,
    game.roosts,
    game.aviaries,
    game.starships,
    Math.round(game.neighborhoodInfluence),
    Math.round(game.townInfluence),
    Math.round(game.countryInfluence),
    Math.round(game.worldControl),
    game.projects && Object.values(game.projects).some((p) => p.completed),
  ].join("|");

  if (birdCount !== heroArtState.birdCount) {
    heroArtState.birdCount = birdCount;
    renderHeroBirds(birdCount);
  }

  if (upgradesKey !== heroArtState.upgradesKey) {
    heroArtState.upgradesKey = upgradesKey;
    renderHeroUpgrades();
  }
}

function renderHeroBirds(count) {
  elements.heroBirds.innerHTML = "";
  const birdEmojis = ["🐦", "🕊️", "🐤", "🐧", "🪶"];
  for (let i = 0; i < count; i += 1) {
    const span = document.createElement("span");
    span.className = "hero-bird-icon";
    span.textContent = birdEmojis[i % birdEmojis.length];
    const top = 20 + Math.random() * 45;
    const startX = -20 - Math.random() * 40;
    const duration = 6 + Math.random() * 6;
    const delay = -Math.random() * duration;
    span.style.setProperty("--top", `${top}%`);
    span.style.setProperty("--start-x", `${startX}px`);
    span.style.setProperty("--duration", `${duration}s`);
    span.style.setProperty("--delay", `${delay}s`);
    elements.heroBirds.appendChild(span);
  }
}

function renderHeroUpgrades() {
  elements.heroUpgrades.innerHTML = "";
  const badges = [];
  if (game.nestsUnlocked) badges.push({ icon: "🪺", label: game.nests });
  if (game.roostsUnlocked) badges.push({ icon: "🏡", label: game.roosts });
  if (game.aviariesUnlocked) badges.push({ icon: "🏞️", label: game.aviaries });
  if (game.neighborhoodUnlocked) {
    badges.push({
      icon: "🏘️",
      label: `${formatNumber(game.neighborhoodInfluence, 0)}%`,
    });
  }
  if (game.townUnlocked) {
    badges.push({ icon: "🏙️", label: `${formatNumber(game.townInfluence, 0)}%` });
  }
  if (game.countryUnlocked) {
    badges.push({
      icon: "🏛️",
      label: `${formatNumber(game.countryInfluence, 0)}%`,
    });
  }
  if (game.worldUnlocked) {
    badges.push({ icon: "🌍", label: `${formatNumber(game.worldControl, 0)}%` });
  }
  if (game.spaceUnlocked) badges.push({ icon: "🚀", label: game.starships });
  if (game.projects && Object.values(game.projects).some((p) => p.completed)) {
    badges.push({ icon: "📜", label: "Projects" });
  }

  badges.slice(0, 8).forEach((badge) => {
    const span = document.createElement("div");
    span.className = "hero-upgrade-icon";
    span.textContent = badge.icon;
    const label = document.createElement("span");
    label.textContent = badge.label;
    span.appendChild(label);
    elements.heroUpgrades.appendChild(span);
  });
}

function getHeroBirdCount(totalBirds) {
  if (totalBirds <= 1) return 1;
  const count = Math.floor(1 + Math.log10(totalBirds + 1) * 4.5);
  return Math.max(1, Math.min(12, count));
}

initGame();
