const TICK_MS = 100;
const DELTA = TICK_MS / 1000;

const BIRDS_FOR_NESTS = 10;
const BIRDS_FOR_WORLD = 500;
const STAR_TARGET = 50;

const COSTS = {
  birdBase: 10,
  birdMult: 1.15,
  nestBase: 100,
  nestMult: 1.15,
  starshipBase: 1_000_000,
  starshipMult: 1.3,
};

const BASE_RATES = {
  seedRatePerBird: 1,
  birdGrowthRatePerNest: 0.05,
  worldControlRateFactor: 1e-6,
  starshipColonizeRate: 0.1,
};

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
  nestsRow: document.getElementById("nests-row"),
  worldRow: document.getElementById("world-row"),
  spaceRow: document.getElementById("space-row"),
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
    birdFraction: 0,
    birdCost: COSTS.birdBase,
    nestCost: COSTS.nestBase,
    starshipCost: COSTS.starshipBase,
    peckPower: 1,
    seedRatePerBird: BASE_RATES.seedRatePerBird,
    birdGrowthRatePerNest: BASE_RATES.birdGrowthRatePerNest,
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
  };
}

const upgradesConfig = [
  {
    id: "quick-pecking",
    name: "Quick Pecking",
    desc: "Double manual pecking. Your beak is a blur.",
    cost: 15,
    unlockText: "Reach 1 bird",
    unlockCondition: () => game.birds >= 1,
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
    cost: 75,
    unlockText: "Reach 5 birds",
    unlockCondition: () => game.birds >= 5,
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
    cost: 300,
    unlockText: "Build 1 nest",
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
    cost: 600,
    unlockText: "Reach 15 birds",
    unlockCondition: () => game.birds >= 15,
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
    cost: 50,
    unlockText: "Reach 10 birds",
    unlockCondition: () => game.birds >= 10,
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
    cost: 1000,
    unlockText: "Reach 50 birds",
    unlockCondition: () => game.birds >= 50,
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
    cost: 50_000,
    unlockText: "Unlock world control and reach 10%",
    unlockCondition: () => game.worldUnlocked && game.worldControl >= 10,
    applyEffect: () => {
      game.worldControlRateFactor *= 2;
    },
    reapplyEffectForLoad: () => {
      game.worldControlRateFactor *= 2;
    },
  },
  {
    id: "aerial-bureaucracy",
    name: "Aerial Bureaucracy",
    desc: "World control rises 50% faster. More forms, more feathers.",
    cost: 150_000,
    unlockText: "Unlock world control and reach 25%",
    unlockCondition: () => game.worldUnlocked && game.worldControl >= 25,
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
    cost: 10_000_000,
    unlockText: "Unlock space and reach 1 star system",
    unlockCondition: () => game.spaceUnlocked && game.starSystems >= 1,
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
    cost: 25_000_000,
    unlockText: "Unlock space and reach 5 star systems",
    unlockCondition: () => game.spaceUnlocked && game.starSystems >= 5,
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
  game = saved || createDefaultGame();
  restoreUpgrades();
  rebuildUpgradesUI();
  bindEvents();
  refreshUnlocks(true);
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
  elements.seedRate.textContent = formatNumber(
    game.birds * game.seedRatePerBird * game.ngMultiplier,
    2
  );
  elements.birdRate.textContent = formatNumber(
    game.nests * game.birdGrowthRatePerNest * game.ngMultiplier,
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
  upgradesConfig.forEach((upgrade) => {
    if (upgrade.unlockCondition()) {
      game.upgrades[upgrade.id].unlocked = true;
    }
  });
  elements.upgradesPanel.hidden = false;
}

function updateUpgradesButtons() {
  upgradesConfig.forEach((upgrade) => {
    const state = game.upgrades[upgrade.id];
    const button = document.getElementById(`upgrade-${upgrade.id}`);
    const wrapper = document.getElementById(`upgrade-wrapper-${upgrade.id}`);
    const unlock = document.getElementById(`upgrade-unlock-${upgrade.id}`);
    if (!button) return;

    button.hidden = false;
    if (state.purchased) {
      button.disabled = true;
      button.textContent = `${upgrade.name} (Purchased)`;
      if (unlock) unlock.hidden = true;
      if (wrapper) wrapper.classList.remove("locked");
      return;
    }

    if (state.unlocked) {
      button.disabled = game.seeds < upgrade.cost || game.won;
      button.textContent = `${upgrade.name} (${formatNumber(upgrade.cost)} seeds)`;
      if (unlock) unlock.hidden = true;
      if (wrapper) wrapper.classList.remove("locked");
    } else {
      button.disabled = true;
      button.textContent = `Locked (${upgrade.unlockText})`;
      if (unlock) {
        unlock.textContent = `Unlocks when ${upgrade.unlockText}.`;
        unlock.hidden = false;
      }
      if (wrapper) wrapper.classList.add("locked");
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
    wrapper.className = "upgrade";
    wrapper.id = `upgrade-wrapper-${upgrade.id}`;
    const button = document.createElement("button");
    button.id = `upgrade-${upgrade.id}`;
    button.addEventListener("click", () => purchaseUpgrade(upgrade));

    const unlock = document.createElement("div");
    unlock.className = "upgrade-unlock";
    unlock.id = `upgrade-unlock-${upgrade.id}`;
    unlock.textContent = `Unlocks when ${upgrade.unlockText}.`;

    const desc = document.createElement("div");
    desc.className = "upgrade-desc";
    desc.textContent = upgrade.desc;

    wrapper.appendChild(button);
    wrapper.appendChild(unlock);
    wrapper.appendChild(desc);
    elements.upgrades.appendChild(wrapper);
  });
}

function purchaseUpgrade(upgrade) {
  const state = game.upgrades[upgrade.id];
  if (!state.unlocked || state.purchased || game.seeds < upgrade.cost || game.won) return;
  game.seeds -= upgrade.cost;
  state.purchased = true;
  upgrade.applyEffect();
  addLog(`Upgrade purchased: ${upgrade.name}.`);
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
    birdFraction: game.birdFraction,
    birdCost: game.birdCost,
    nestCost: game.nestCost,
    starshipCost: game.starshipCost,
    peckPower: game.peckPower,
    seedRatePerBird: game.seedRatePerBird,
    birdGrowthRatePerNest: game.birdGrowthRatePerNest,
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
    return loaded;
  } catch (error) {
    console.error("Failed to load save", error);
    return null;
  }
}

function restoreUpgrades() {
  game.peckPower = 1;
  game.seedRatePerBird = BASE_RATES.seedRatePerBird;
  game.birdGrowthRatePerNest = BASE_RATES.birdGrowthRatePerNest;
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
