const TICK_MS = 100;
const DELTA = TICK_MS / 1000;

const BIRDS_FOR_NESTS = 15;
const BIRDS_FOR_ROOSTS = 60;
const FEATHER_FOR_AVIARIES = 120;
const BIRDS_FOR_WORLD = 1200;
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
};

const BASE_RATES = {
  seedRatePerBird: 1,
  twigRatePerBird: 0.15,
  eggRatePerNest: 0.06,
  hatchRatePerNest: 0.03,
  featherScienceRatePerNest: 0.18,
  skyLoreRatePerAviary: 0.05,
  harmonyPerRoost: 0.02,
  worldControlRateFactor: 8e-7,
  starshipColonizeRate: 0.08,
  relicRatePerStarSystem: 0.002,
};

const MAX_OFFLINE_SECONDS = 6 * 60 * 60;

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
  skyLore: document.getElementById("sky-lore"),
  loreRate: document.getElementById("lore-rate"),
  relics: document.getElementById("relics"),
  nestsRow: document.getElementById("nests-row"),
  twigsRow: document.getElementById("twigs-row"),
  eggsRow: document.getElementById("eggs-row"),
  hatchControl: document.getElementById("hatch-control"),
  hatchSlider: document.getElementById("hatch-slider"),
  hatchUsage: document.getElementById("hatch-usage"),
  roostsRow: document.getElementById("roosts-row"),
  aviariesRow: document.getElementById("aviaries-row"),
  loreRow: document.getElementById("lore-row"),
  worldRow: document.getElementById("world-row"),
  spaceRow: document.getElementById("space-row"),
  relicRow: document.getElementById("relic-row"),
  ngRow: document.getElementById("ng-row"),
  ngPlus: document.getElementById("ng-plus"),
  ngMultiplier: document.getElementById("ng-multiplier"),
  expeditionButton: document.getElementById("expedition-button"),
  expeditionCost: document.getElementById("expedition-cost"),
  expeditionTwigCost: document.getElementById("expedition-twig-cost"),
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
    starSystems: 0,
    featherScience: 0,
    skyLore: 0,
    relics: 0,
    birdFraction: 0,
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
    worldControlRateFactor: BASE_RATES.worldControlRateFactor,
    starshipColonizeRate: BASE_RATES.starshipColonizeRate,
    relicRatePerStarSystem: BASE_RATES.relicRatePerStarSystem,
    twigsUnlocked: false,
    nestsUnlocked: false,
    eggsUnlocked: false,
    roostsUnlocked: false,
    aviariesUnlocked: false,
    loreUnlocked: false,
    worldUnlocked: false,
    spaceUnlocked: false,
    relicsUnlocked: false,
    expeditionsUnlocked: false,
    ngPlusCount: 0,
    ngMultiplier: 1,
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
  bindEvents();
  refreshUnlocks(true);
  if (saved && saved.offlineSummary) {
    addLog(saved.offlineSummary);
  }
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

function gameTick() {
  if (game.won) return;
  const multiplier = game.ngMultiplier;
  const harmony = getHarmonyMultiplier();
  game.seeds += game.birds * game.seedRatePerBird * multiplier * harmony * DELTA;
  if (game.twigsUnlocked) {
    game.twigs += game.birds * game.twigRatePerBird * multiplier * harmony * DELTA;
  }

  if (game.nests > 0) {
    game.eggs += game.nests * game.eggRatePerNest * multiplier * harmony * DELTA;
    const hatchPotential =
      game.nests *
      game.hatchRatePerNest *
      multiplier *
      harmony *
      (game.hatchUsagePercent / 100) *
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
      game.nests * game.featherScienceRatePerNest * multiplier * harmony * DELTA;
  }

  if (game.aviaries > 0) {
    game.skyLore +=
      game.aviaries * game.skyLoreRatePerAviary * multiplier * harmony * DELTA;
  }

  if (game.worldUnlocked && game.worldControl < 100) {
    const rate =
      game.birds * game.worldControlRateFactor * multiplier * harmony * DELTA * 100;
    game.worldControl = Math.min(100, game.worldControl + rate);
  }

  if (game.spaceUnlocked && game.starSystems < STAR_TARGET) {
    game.starSystems = Math.min(
      STAR_TARGET,
      game.starSystems +
        game.starships * game.starshipColonizeRate * multiplier * harmony * DELTA
    );
  }

  if (game.spaceUnlocked && game.starSystems > 0) {
    game.relics +=
      game.starSystems * game.relicRatePerStarSystem * multiplier * harmony * DELTA;
  }

  refreshUnlocks();
  handleMilestones();
  checkWin();
  updateUI();
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
    elements.hatchControl.hidden = false;
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

  if (!game.worldUnlocked && game.birds >= BIRDS_FOR_WORLD) {
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
    elements.hatchControl.hidden = false;
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

  if (game.worldUnlocked) {
    elements.worldRow.hidden = false;
  }

  if (game.spaceUnlocked) {
    elements.spaceRow.hidden = false;
    elements.buyStarship.hidden = false;
  }

  if (game.expeditionsUnlocked) {
    elements.expeditionButton.hidden = false;
    elements.actionsPanel.hidden = false;
  }

  if (game.relicsUnlocked) {
    elements.relicRow.hidden = false;
  }

  elements.actionsPanel.hidden = !game.expeditionsUnlocked;

  updateUpgradesAvailability();
  updateProjectsAvailability();
}

function updateUI() {
  const harmony = getHarmonyMultiplier();
  const eggRate = game.nests * game.eggRatePerNest * game.ngMultiplier * harmony;
  const hatchRate =
    game.nests *
    game.hatchRatePerNest *
    game.ngMultiplier *
    harmony *
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
  elements.worldControl.textContent = `${formatNumber(game.worldControl, 2)}%`;
  elements.starSystems.textContent = `${formatNumber(game.starSystems, 2)} / ${STAR_TARGET}`;
  elements.ngPlus.textContent = game.ngPlusCount;
  elements.ngMultiplier.textContent = formatNumber(game.ngMultiplier);
  elements.ngRow.hidden = game.ngPlusCount === 0 && !game.won;
  elements.featherScience.textContent = formatNumber(game.featherScience, 2);
  elements.skyLore.textContent = formatNumber(game.skyLore, 2);
  elements.relics.textContent = formatNumber(game.relics, 2);
  elements.seedRate.textContent = formatNumber(
    game.birds * game.seedRatePerBird * game.ngMultiplier * harmony,
    2
  );
  elements.twigRate.textContent = formatNumber(
    game.twigsUnlocked
      ? game.birds * game.twigRatePerBird * game.ngMultiplier * harmony
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
    game.nests * game.featherScienceRatePerNest * game.ngMultiplier * harmony,
    2
  );
  elements.loreRate.textContent = formatNumber(
    game.aviaries * game.skyLoreRatePerAviary * game.ngMultiplier * harmony,
    2
  );
  elements.worldRate.textContent = formatNumber(
    game.worldUnlocked
      ? game.birds * game.worldControlRateFactor * game.ngMultiplier * harmony * 100
      : 0,
    2
  );
  elements.starRate.textContent = formatNumber(
    game.spaceUnlocked
      ? game.starships * game.starshipColonizeRate * game.ngMultiplier * harmony
      : 0,
    2
  );
  elements.hatchSlider.value = Math.round(game.hatchUsagePercent);
  elements.hatchUsage.textContent = formatNumber(game.hatchUsagePercent);

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

  updateStructureDescriptions();
  updateUpgradesButtons();
  updateProjectsButtons();
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
  }
  if (!game.worldUnlocked) {
    return {
      era: "Era of Lore",
      text: "Aviaries stack with scrolls of wind. The ground looks negotiable.",
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

  if (!game.worldUnlocked) {
    const progress = Math.min(1, game.birds / BIRDS_FOR_WORLD);
    return {
      title: "Start World Control",
      detail: `Reach ${BIRDS_FOR_WORLD} birds to begin the takeover.`,
      progressText: `${formatNumber(game.birds)} / ${BIRDS_FOR_WORLD} birds`,
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
  game = createDefaultGame();
  game.ngPlusCount = game.ngPlusCount || 0;
  game.ngMultiplier = multiplier;
  game.log = [];
  resetMilestones();
  rebuildUpgradesUI();
  rebuildProjectsUI();
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
  if (Math.abs(num) < 1e3) {
    return num.toFixed(decimals);
  }
  if (Math.abs(num) < 1e6) {
    return `${(num / 1e3).toFixed(decimals)}K`;
  }
  if (Math.abs(num) < 1e9) {
    return `${(num / 1e6).toFixed(decimals)}M`;
  }
  if (Math.abs(num) < 1e12) {
    return `${(num / 1e9).toFixed(decimals)}B`;
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
    starSystems: game.starSystems,
    featherScience: game.featherScience,
    skyLore: game.skyLore,
    relics: game.relics,
    birdFraction: game.birdFraction,
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
    worldControlRateFactor: game.worldControlRateFactor,
    starshipColonizeRate: game.starshipColonizeRate,
    relicRatePerStarSystem: game.relicRatePerStarSystem,
    twigsUnlocked: game.twigsUnlocked,
    nestsUnlocked: game.nestsUnlocked,
    eggsUnlocked: game.eggsUnlocked,
    roostsUnlocked: game.roostsUnlocked,
    aviariesUnlocked: game.aviariesUnlocked,
    loreUnlocked: game.loreUnlocked,
    worldUnlocked: game.worldUnlocked,
    spaceUnlocked: game.spaceUnlocked,
    relicsUnlocked: game.relicsUnlocked,
    expeditionsUnlocked: game.expeditionsUnlocked,
    ngPlusCount: game.ngPlusCount,
    ngMultiplier: game.ngMultiplier,
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

  const multiplier = loaded.ngMultiplier;
  const harmony = 1 + loaded.roosts * loaded.harmonyPerRoost;
  const seedsGain = loaded.birds * loaded.seedRatePerBird * multiplier * harmony * deltaSeconds;
  const twigsGain = loaded.twigsUnlocked
    ? loaded.birds * loaded.twigRatePerBird * multiplier * harmony * deltaSeconds
    : 0;
  loaded.seeds += seedsGain;
  loaded.twigs += twigsGain;

  const birdsBefore = loaded.birds;
  const eggsBefore = loaded.eggs;
  if (loaded.nests > 0) {
    loaded.eggs += loaded.nests * loaded.eggRatePerNest * multiplier * harmony * deltaSeconds;
    const hatchPotential =
      loaded.nests *
      loaded.hatchRatePerNest *
      multiplier *
      harmony *
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
      loaded.nests * loaded.featherScienceRatePerNest * multiplier * harmony * deltaSeconds;
  }

  const loreBefore = loaded.skyLore;
  if (loaded.aviaries > 0) {
    loaded.skyLore +=
      loaded.aviaries * loaded.skyLoreRatePerAviary * multiplier * harmony * deltaSeconds;
  }

  const worldBefore = loaded.worldControl;
  if (loaded.worldUnlocked && loaded.worldControl < 100) {
    const rate =
      loaded.birds * loaded.worldControlRateFactor * multiplier * harmony * deltaSeconds * 100;
    loaded.worldControl = Math.min(100, loaded.worldControl + rate);
  }

  const starBefore = loaded.starSystems;
  if (loaded.spaceUnlocked && loaded.starSystems < STAR_TARGET) {
    loaded.starSystems = Math.min(
      STAR_TARGET,
      loaded.starSystems +
        loaded.starships * loaded.starshipColonizeRate * multiplier * harmony * deltaSeconds
    );
  }

  const relicBefore = loaded.relics;
  if (loaded.spaceUnlocked && loaded.starSystems > 0) {
    loaded.relics +=
      loaded.starSystems *
      loaded.relicRatePerStarSystem *
      multiplier *
      harmony *
      deltaSeconds;
  }

  loaded.lastSavedAt = now;

  const birdsGain = loaded.birds - birdsBefore;
  const eggsGain = loaded.eggs - eggsBefore;
  const scienceGain = loaded.featherScience - scienceBefore;
  const loreGain = loaded.skyLore - loreBefore;
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
    worldGain,
    2
  )}% world control, +${formatNumber(starGain, 2)} systems, +${formatNumber(
    relicGain,
    2
  )} relics.`;
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
  game.worldControlRateFactor = BASE_RATES.worldControlRateFactor;
  game.starshipColonizeRate = BASE_RATES.starshipColonizeRate;
  game.relicRatePerStarSystem = BASE_RATES.relicRatePerStarSystem;
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
    game.worldUnlocked,
    game.nests,
    game.roosts,
    game.aviaries,
    game.starships,
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
  if (game.worldUnlocked) badges.push({ icon: "🌍", label: `${formatNumber(game.worldControl, 0)}%` });
  if (game.spaceUnlocked) badges.push({ icon: "🚀", label: game.starships });
  if (game.projects && Object.values(game.projects).some((p) => p.completed)) {
    badges.push({ icon: "📜", label: "Projects" });
  }

  const baseLeft = 10;
  const baseBottom = 6;
  badges.slice(0, 5).forEach((badge, index) => {
    const span = document.createElement("div");
    span.className = "hero-upgrade-icon";
    span.style.left = `${baseLeft + index * 52}px`;
    span.style.bottom = `${baseBottom}px`;
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
