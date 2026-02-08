const TICK_MS = 100;
const DELTA = TICK_MS / 1000;

const BIRDS_FOR_NESTS = 15;
const BIRDS_FOR_WORLD = 750;
const STAR_TARGET = 80;

const COSTS = {
  birdBase: 12,
  birdMult: 1.14,
  nestBase: 180,
  nestMult: 1.15,
  starshipBase: 2_500_000,
  starshipMult: 1.32,
};

const BASE_RATES = {
  seedRatePerBird: 1,
  birdGrowthRatePerNest: 0.045,
  featherScienceRatePerNest: 0.18,
  worldControlRateFactor: 8e-7,
  starshipColonizeRate: 0.08,
};

const MAX_OFFLINE_SECONDS = 6 * 60 * 60;

const philosophyLines = [
  "A seed today, a galaxy tomorrow.",
  "Do birds dream of infinite worms?",
  "The coop is the mind, the sky is the body.",
  "We peck, therefore we are.",
  "The universe is a nest in progress.",
];

const milestoneFlags = {
  world25: false,
  world50: false,
  world75: false,
  world100: false,
  firstNest: false,
  firstStarship: false,
  firstStarSystem: false,
  win: false,
};

let game = null;
let tickTimer = null;
let saveTimer = null;

const elements = {
  seeds: document.getElementById("seeds"),
  seedRate: document.getElementById("seed-rate"),
  birds: document.getElementById("birds"),
  birdRate: document.getElementById("bird-rate"),
  nests: document.getElementById("nests"),
  worldControl: document.getElementById("world-control"),
  worldRate: document.getElementById("world-rate"),
  starSystems: document.getElementById("star-systems"),
  starRate: document.getElementById("star-rate"),
  featherScience: document.getElementById("feather-science"),
  featherScienceRate: document.getElementById("feather-science-rate"),
  nestsRow: document.getElementById("nests-row"),
  worldRow: document.getElementById("world-row"),
  spaceRow: document.getElementById("space-row"),
  ngRow: document.getElementById("ng-row"),
  ngPlus: document.getElementById("ng-plus"),
  ngMultiplier: document.getElementById("ng-multiplier"),
  peckButton: document.getElementById("peck-button"),
  buyBird: document.getElementById("buy-bird"),
  birdCost: document.getElementById("bird-cost"),
  buyNest: document.getElementById("buy-nest"),
  nestCost: document.getElementById("nest-cost"),
  buyStarship: document.getElementById("buy-starship"),
  starshipCost: document.getElementById("starship-cost"),
  newGamePlus: document.getElementById("new-game-plus"),
  upgradesPanel: document.getElementById("upgrades-panel"),
  upgrades: document.getElementById("upgrades"),
  log: document.getElementById("log"),
  ending: document.getElementById("ending"),
  nextTargetTitle: document.getElementById("next-target-title"),
  nextTargetDetail: document.getElementById("next-target-detail"),
  nextTargetProgressBar: document.getElementById("next-target-progress-bar"),
  nextTargetProgressText: document.getElementById("next-target-progress-text"),
};

function createDefaultGame() {
  return {
    seeds: 0,
    birds: 1,
    nests: 0,
    starships: 0,
    worldControl: 0,
    starSystems: 0,
    featherScience: 0,
    birdFraction: 0,
    birdCost: COSTS.birdBase,
    nestCost: COSTS.nestBase,
    starshipCost: COSTS.starshipBase,
    peckPower: 1,
    seedRatePerBird: BASE_RATES.seedRatePerBird,
    birdGrowthRatePerNest: BASE_RATES.birdGrowthRatePerNest,
    featherScienceRatePerNest: BASE_RATES.featherScienceRatePerNest,
    worldControlRateFactor: BASE_RATES.worldControlRateFactor,
    starshipColonizeRate: BASE_RATES.starshipColonizeRate,
    nestsUnlocked: false,
    worldUnlocked: false,
    spaceUnlocked: false,
    ngPlusCount: 0,
    ngMultiplier: 1,
    upgrades: {},
    log: [],
    won: false,
    lastSavedAt: Date.now(),
  };
}

const upgradesConfig = [
  {
    id: "quick-pecking",
    name: "Quick Pecking",
    desc: "Double manual pecking. Your beak is a blur.",
    cost: 25,
    unlockCondition: () => game.birds >= 2,
    applyEffect: () => {
      game.peckPower *= 2;
    },
    reapplyEffectForLoad: () => {
      game.peckPower *= 2;
    },
  },
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
      game.birdGrowthRatePerNest *= 1.5;
    },
    reapplyEffectForLoad: () => {
      game.birdGrowthRatePerNest *= 1.5;
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
    desc: "Double seed rate and nest growth. Genius is just organized pecking.",
    cost: 3500,
    unlockCondition: () => game.birds >= 80,
    applyEffect: () => {
      game.seedRatePerBird *= 2;
      game.birdGrowthRatePerNest *= 2;
    },
    reapplyEffectForLoad: () => {
      game.seedRatePerBird *= 2;
      game.birdGrowthRatePerNest *= 2;
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

function initGame() {
  const saved = loadGame();
  if (saved) {
    game = saved.game;
  } else {
    game = createDefaultGame();
  }
  restoreUpgrades();
  rebuildUpgradesUI();
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
  elements.peckButton.addEventListener("click", () => {
    if (game.won) return;
    const gain = game.peckPower * game.ngMultiplier;
    game.seeds += gain;
    addLog(`Peck! +${formatNumber(gain)} seeds.`, false);
    updateUI();
    saveGame();
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
    if (game.seeds < game.nestCost || game.won) return;
    game.seeds -= game.nestCost;
    game.nests += 1;
    game.nestCost = Math.ceil(game.nestCost * COSTS.nestMult);
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
    if (game.seeds < game.starshipCost || game.won) return;
    game.seeds -= game.starshipCost;
    game.starships += 1;
    game.starshipCost = Math.ceil(game.starshipCost * COSTS.starshipMult);
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

  elements.newGamePlus.addEventListener("click", () => {
    startNewGamePlus();
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
  game.seeds += game.birds * game.seedRatePerBird * multiplier * DELTA;

  if (game.nests > 0) {
    game.birdFraction += game.nests * game.birdGrowthRatePerNest * multiplier * DELTA;
    while (game.birdFraction >= 1) {
      game.birdFraction -= 1;
      game.birds += 1;
    }
  }

  if (game.nests > 0) {
    game.featherScience += game.nests * game.featherScienceRatePerNest * multiplier * DELTA;
  }

  if (game.worldUnlocked && game.worldControl < 100) {
    const rate = game.birds * game.worldControlRateFactor * multiplier * DELTA * 100;
    game.worldControl = Math.min(100, game.worldControl + rate);
  }

  if (game.spaceUnlocked && game.starSystems < STAR_TARGET) {
    game.starSystems = Math.min(
      STAR_TARGET,
      game.starSystems + game.starships * game.starshipColonizeRate * multiplier * DELTA
    );
  }

  refreshUnlocks();
  handleMilestones();
  checkWin();
  updateUI();
}

function refreshUnlocks(isLoad = false) {
  if (!game.nestsUnlocked && game.birds >= BIRDS_FOR_NESTS) {
    game.nestsUnlocked = true;
    elements.nestsRow.hidden = false;
    elements.buyNest.hidden = false;
    if (!isLoad) {
      addLog("Nests unlocked. The coop has formed a coup.");
    }
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

  if (game.nestsUnlocked) {
    elements.nestsRow.hidden = false;
    elements.buyNest.hidden = false;
  }

  if (game.worldUnlocked) {
    elements.worldRow.hidden = false;
  }

  if (game.spaceUnlocked) {
    elements.spaceRow.hidden = false;
    elements.buyStarship.hidden = false;
  }

  updateUpgradesAvailability();
}

function updateUI() {
  elements.seeds.textContent = formatNumber(game.seeds);
  elements.birds.textContent = formatNumber(game.birds);
  elements.nests.textContent = formatNumber(game.nests);
  elements.worldControl.textContent = `${formatNumber(game.worldControl, 2)}%`;
  elements.starSystems.textContent = `${formatNumber(game.starSystems, 2)} / ${STAR_TARGET}`;
  elements.ngPlus.textContent = game.ngPlusCount;
  elements.ngMultiplier.textContent = formatNumber(game.ngMultiplier);
  elements.ngRow.hidden = game.ngPlusCount === 0 && !game.won;
  elements.featherScience.textContent = formatNumber(game.featherScience, 2);
  elements.seedRate.textContent = formatNumber(
    game.birds * game.seedRatePerBird * game.ngMultiplier,
    2
  );
  elements.birdRate.textContent = formatNumber(
    game.nests * game.birdGrowthRatePerNest * game.ngMultiplier,
    2
  );
  elements.featherScienceRate.textContent = formatNumber(
    game.nests * game.featherScienceRatePerNest * game.ngMultiplier,
    2
  );
  elements.worldRate.textContent = formatNumber(
    game.worldUnlocked ? game.birds * game.worldControlRateFactor * game.ngMultiplier * 100 : 0,
    2
  );
  elements.starRate.textContent = formatNumber(
    game.spaceUnlocked ? game.starships * game.starshipColonizeRate * game.ngMultiplier : 0,
    2
  );

  elements.birdCost.textContent = formatNumber(game.birdCost);
  elements.nestCost.textContent = formatNumber(game.nestCost);
  elements.starshipCost.textContent = formatNumber(game.starshipCost);

  elements.buyBird.disabled = game.seeds < game.birdCost || game.won;
  elements.buyNest.disabled = game.seeds < game.nestCost || game.won;
  elements.buyStarship.disabled = game.seeds < game.starshipCost || game.won;
  elements.peckButton.disabled = game.won;

  updateUpgradesButtons();
  updateNextTarget();
}

function updateNextTarget() {
  const target = getNextTarget();
  elements.nextTargetTitle.textContent = target.title;
  elements.nextTargetDetail.textContent = target.detail;
  elements.nextTargetProgressText.textContent = target.progressText;
  elements.nextTargetProgressBar.style.width = `${(target.progress * 100).toFixed(1)}%`;
}

function getNextTarget() {
  if (!game.nestsUnlocked) {
    const progress = Math.min(1, game.birds / BIRDS_FOR_NESTS);
    return {
      title: "Unlock Nests",
      detail: `Reach ${BIRDS_FOR_NESTS} birds to build nests.`,
      progressText: `${formatNumber(game.birds)} / ${BIRDS_FOR_NESTS} birds`,
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
    if (upgrade.unlockCondition()) {
      game.upgrades[upgrade.id].unlocked = true;
      if (!game.upgrades[upgrade.id].purchased) {
        anyAvailable = true;
      }
    }
  });
  elements.upgradesPanel.hidden = !anyAvailable;
}

function updateUpgradesButtons() {
  upgradesConfig.forEach((upgrade) => {
    const state = game.upgrades[upgrade.id];
    const button = document.getElementById(`upgrade-${upgrade.id}`);
    const wrapper = document.getElementById(`upgrade-wrapper-${upgrade.id}`);
    if (!button) return;

    if (state.purchased) {
      if (wrapper) wrapper.hidden = true;
      return;
    }

    if (state.unlocked) {
      if (wrapper) wrapper.hidden = false;
      button.hidden = false;
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
    } else {
      if (wrapper) wrapper.hidden = true;
      button.hidden = true;
    }
  });
}

function rebuildUpgradesUI() {
  elements.upgrades.innerHTML = "";
  upgradesConfig.forEach((upgrade) => {
    if (!game.upgrades[upgrade.id]) {
      game.upgrades[upgrade.id] = {
        unlocked: false,
        purchased: false,
      };
    }
    const wrapper = document.createElement("div");
    wrapper.id = `upgrade-wrapper-${upgrade.id}`;
    wrapper.className = "upgrade";
    const button = document.createElement("button");
    button.id = `upgrade-${upgrade.id}`;
    button.hidden = true;
    button.addEventListener("click", () => purchaseUpgrade(upgrade));

    const desc = document.createElement("div");
    desc.className = "upgrade-desc";
    desc.textContent = upgrade.desc;

    wrapper.appendChild(button);
    wrapper.appendChild(desc);
    elements.upgrades.appendChild(wrapper);
  });
}

function purchaseUpgrade(upgrade) {
  const state = game.upgrades[upgrade.id];
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

  if (game.starSystems >= 1 && !milestoneFlags.firstStarSystem) {
    milestoneFlags.firstStarSystem = true;
    addLog("First star system colonized. We come in peace, and with snacks.");
  }

  if (Math.random() < 0.002) {
    const line = philosophyLines[Math.floor(Math.random() * philosophyLines.length)];
    addLog(`Philosophy Bird: "${line}"`, false);
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
  elements.peckButton.disabled = true;
  elements.buyBird.disabled = true;
  elements.buyNest.disabled = true;
  elements.buyStarship.disabled = true;
  updateUpgradesButtons();
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

function saveGame() {
  const payload = {
    seeds: game.seeds,
    birds: game.birds,
    nests: game.nests,
    starships: game.starships,
    worldControl: game.worldControl,
    starSystems: game.starSystems,
    featherScience: game.featherScience,
    birdFraction: game.birdFraction,
    birdCost: game.birdCost,
    nestCost: game.nestCost,
    starshipCost: game.starshipCost,
    peckPower: game.peckPower,
    seedRatePerBird: game.seedRatePerBird,
    birdGrowthRatePerNest: game.birdGrowthRatePerNest,
    featherScienceRatePerNest: game.featherScienceRatePerNest,
    worldControlRateFactor: game.worldControlRateFactor,
    starshipColonizeRate: game.starshipColonizeRate,
    nestsUnlocked: game.nestsUnlocked,
    worldUnlocked: game.worldUnlocked,
    spaceUnlocked: game.spaceUnlocked,
    ngPlusCount: game.ngPlusCount,
    ngMultiplier: game.ngMultiplier,
    upgrades: game.upgrades,
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
  const seedsGain = loaded.birds * loaded.seedRatePerBird * multiplier * deltaSeconds;
  loaded.seeds += seedsGain;

  const birdsBefore = loaded.birds;
  if (loaded.nests > 0) {
    loaded.birdFraction += loaded.nests * loaded.birdGrowthRatePerNest * multiplier * deltaSeconds;
    const newBirds = Math.floor(loaded.birdFraction);
    if (newBirds > 0) {
      loaded.birdFraction -= newBirds;
      loaded.birds += newBirds;
    }
  }

  const worldBefore = loaded.worldControl;
  if (loaded.worldUnlocked && loaded.worldControl < 100) {
    const rate = loaded.birds * loaded.worldControlRateFactor * multiplier * deltaSeconds * 100;
    loaded.worldControl = Math.min(100, loaded.worldControl + rate);
  }

  const starBefore = loaded.starSystems;
  if (loaded.spaceUnlocked && loaded.starSystems < STAR_TARGET) {
    loaded.starSystems = Math.min(
      STAR_TARGET,
      loaded.starSystems + loaded.starships * loaded.starshipColonizeRate * multiplier * deltaSeconds
    );
  }

  loaded.lastSavedAt = now;

  const birdsGain = loaded.birds - birdsBefore;
  const worldGain = loaded.worldControl - worldBefore;
  const starGain = loaded.starSystems - starBefore;

  return `Offline gains (${formatNumber(deltaSeconds, 1)}s): +${formatNumber(
    seedsGain,
    2
  )} seeds, +${formatNumber(birdsGain)} birds, +${formatNumber(
    worldGain,
    2
  )}% world control, +${formatNumber(starGain, 2)} systems.`;
}

function restoreUpgrades() {
  game.peckPower = 1;
  game.seedRatePerBird = BASE_RATES.seedRatePerBird;
  game.birdGrowthRatePerNest = BASE_RATES.birdGrowthRatePerNest;
  game.featherScienceRatePerNest = BASE_RATES.featherScienceRatePerNest;
  game.worldControlRateFactor = BASE_RATES.worldControlRateFactor;
  game.starshipColonizeRate = BASE_RATES.starshipColonizeRate;
  upgradesConfig.forEach((upgrade) => {
    if (!game.upgrades[upgrade.id]) {
      game.upgrades[upgrade.id] = { unlocked: false, purchased: false };
    }
    if (game.upgrades[upgrade.id].purchased) {
      upgrade.reapplyEffectForLoad();
    }
  });
  loadLog();
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

initGame();
