import {
  ACT_NAMES,
  DOCTRINES,
  EVENTS,
  PROJECTS,
  RESOURCE_LABEL,
  ROLE_DEFS,
  SEASONS,
  TECHS,
  TUNE,
  UPGRADES,
  capacityPreview,
  count,
  emptyResources,
  emptyRoles,
  projectById,
  type EventDef,
  type ProjectDef,
} from "./content";
import { clampResource, formatAmount, formatDuration, formatRate } from "./number";
import { doctrineRemark, isBirdLine, repeatRemark, roleArrival } from "./voice";
import {
  SAVE_VERSION,
  type Act,
  type DoctrineId,
  type GameLog,
  type GameState,
  type Rates,
  type ResourceId,
  type Resources,
  type RoleId,
  type RunMeta,
  type SeasonId,
} from "./types";

const EVENT_QUEUE_CAP = 3;
const OFFLINE_REPORT_AFTER = 60;

export function createInitialState(now: number, meta?: Partial<RunMeta>): GameState {
  const ranks = { ...(meta?.ranks ?? {}) };
  const fledgling = ranks.fledgling ?? 0;
  const headings = ranks.headings ?? 0;
  const flock = 6 + fledgling;
  return {
    version: SAVE_VERSION,
    act: 1,
    actStartedAt: 0,
    elapsed: 0,
    lastTickAt: now,
    paused: false,
    resources: {
      seeds: 12,
      twigs: 0,
      knowledge: 0,
      influence: 0,
      starlight: 0,
    },
    flock,
    roles: { ...emptyRoles(), foragers: 3 },
    counts: {},
    flags: [],
    routes: headings,
    systems: 0,
    morale: 0.84,
    doctrine: null,
    doctrineChanges: 0,
    techs: [],
    cooldowns: {},
    active: null,
    pendingEvent: null,
    eventQueue: [],
    seenEvents: [],
    effects: [],
    logs: [
      {
        id: 1,
        at: 0,
        text: "Six birds. Three working, three idle.",
        tone: "story",
      },
    ],
    logSeq: 1,
    won: false,
    marks: meta?.marks ?? 0,
    ranks,
    migrations: meta?.migrations ?? 0,
    wins: meta?.wins ?? 0,
    doctrinesWon: [...(meta?.doctrinesWon ?? [])],
    bestTime: meta?.bestTime ?? null,
    offlineReport: null,
    notebook: { intro: "pending", seen: [], quiet: false },
  };
}

export function rank(state: GameState, id: string): number {
  return state.ranks[id] ?? 0;
}

export function getCapacity(state: GameState): number {
  return capacityPreview(state);
}

export function getIdleBirds(state: GameState): number {
  const assigned = Object.values(state.roles).reduce((sum, value) => sum + value, 0);
  const busy = state.active?.birds ?? 0;
  return Math.max(0, Math.floor(state.flock + 1e-6) - assigned - busy);
}

export function seasonLength(state: GameState): number {
  if (state.act <= 1) return TUNE.seasonAct1;
  if (state.act === 2) return TUNE.seasonAct2;
  return TUNE.seasonLater;
}

export function getSeason(state: GameState): (typeof SEASONS)[number] {
  const index = Math.floor(state.elapsed / seasonLength(state)) % SEASONS.length;
  return SEASONS[index] ?? SEASONS[0];
}

export function offlineCapSeconds(state: GameState): number {
  const hours = TUNE.offlineHours + rank(state, "twilight") * 2;
  const doctrine = state.doctrine === "stewardship" ? 1.25 : 1;
  return hours * 3600 * doctrine;
}

export function storageMultiplier(state: GameState): number {
  let multiplier = 1 + 0.1 * rank(state, "crops");
  if (state.doctrine === "stewardship") multiplier *= 1.25;
  if (state.techs.includes("reserve-granaries")) multiplier *= 1.35;
  return multiplier;
}

export function getStorage(state: GameState): Resources {
  const mult = storageMultiplier(state);
  const ledger = state.techs.includes("seed-ledgers") ? 1.1 : 1;
  const garden = state.flags.includes("garden") ? 220 : 0;
  const seeds =
    (260 +
      (state.flags.includes("seed-cache") ? 220 : 0) +
      garden +
      count(state, "nest") * 190 +
      (state.flags.includes("roost") ? 320 : 0) +
      count(state, "granary") * 520 +
      count(state, "beacon") * 90 +
      count(state, "solar") * 340 +
      state.systems * 240) *
    mult *
    ledger;
  const twigs =
    (180 +
      count(state, "nest") * 110 +
      (state.flags.includes("roost") ? 220 : 0) +
      count(state, "beacon") * 40 +
      count(state, "granary") * 180 +
      count(state, "solar") * 260 +
      state.systems * 150) *
    mult;
  const knowledge =
    (90 +
      count(state, "archive") * 260 +
      count(state, "beacon") * 40 +
      count(state, "academy") * 300 +
      state.systems * 150) *
    (1 + 0.1 * rank(state, "crops"));
  const influence =
    (60 + count(state, "beacon") * 55 + count(state, "eyrie") * 20) *
    (1 + 0.1 * rank(state, "crops"));
  const starlight =
    (70 + count(state, "solar") * 80 + Math.max(0, state.systems) * 55) *
    (1 + 0.1 * rank(state, "crops"));
  return { seeds, twigs, knowledge, influence, starlight };
}

export interface CapLine {
  label: string;
  value: string;
}

export function capBreakdown(state: GameState, id: ResourceId | "flock"): CapLine[] {
  if (id === "flock") {
    const lines: CapLine[] = [{ label: "Canopy", value: "8" }];
    const fledgling = rank(state, "fledgling");
    if (fledgling) lines.push({ label: "Fledgling memory", value: `+${fledgling}` });
    const nests = count(state, "nest");
    if (nests) lines.push({ label: `${nests} nests`, value: `+${nests * 5}` });
    if (state.flags.includes("roost")) lines.push({ label: "First roost", value: "+8" });
    const eyries = count(state, "eyrie");
    if (eyries) lines.push({ label: `${eyries} eyries`, value: `+${eyries * 6}` });
    const solars = count(state, "solar");
    if (solars) lines.push({ label: `${solars} solar nurseries`, value: `+${solars * 8}` });
    if (state.systems) lines.push({ label: "Linked systems", value: `+${state.systems * 2}` });
    lines.push({ label: "Capacity", value: formatAmount(getCapacity(state)) });
    return lines;
  }
  const storage = getStorage(state);
  const lines: CapLine[] = [];
  if (id === "seeds") {
    lines.push({ label: "What the branches hold", value: "260" });
    if (state.flags.includes("seed-cache")) lines.push({ label: "Seed cache", value: "+220" });
    if (state.flags.includes("garden")) lines.push({ label: "Garden access", value: "+220" });
    pushCount(lines, count(state, "nest"), "nests", 190);
    if (state.flags.includes("roost")) lines.push({ label: "First roost", value: "+320" });
    pushCount(lines, count(state, "granary"), "granary roosts", 520);
    pushCount(lines, count(state, "beacon"), "beacons", 90);
    pushCount(lines, count(state, "solar"), "solar nurseries", 340);
    pushCount(lines, state.systems, "systems", 240);
  } else if (id === "twigs") {
    lines.push({ label: "What the branches hold", value: "180" });
    pushCount(lines, count(state, "nest"), "nests", 110);
    if (state.flags.includes("roost")) lines.push({ label: "First roost", value: "+220" });
    pushCount(lines, count(state, "beacon"), "beacons", 40);
    pushCount(lines, count(state, "granary"), "granary roosts", 180);
    pushCount(lines, count(state, "solar"), "solar nurseries", 260);
    pushCount(lines, state.systems, "systems", 150);
  } else if (id === "knowledge") {
    lines.push({ label: "Shared memory", value: "90" });
    pushCount(lines, count(state, "archive"), "archives", 260);
    pushCount(lines, count(state, "beacon"), "beacons", 40);
    pushCount(lines, count(state, "academy"), "academies", 300);
    pushCount(lines, state.systems, "systems", 150);
  } else if (id === "influence") {
    lines.push({ label: "Word of beak", value: "60" });
    pushCount(lines, count(state, "beacon"), "beacons", 55);
    pushCount(lines, count(state, "eyrie"), "eyries", 20);
  } else {
    lines.push({ label: "What the night holds", value: "70" });
    pushCount(lines, count(state, "solar"), "solar nurseries", 80);
    pushCount(lines, state.systems, "systems", 55);
  }
  if (id === "seeds" || id === "twigs") {
    if (state.doctrine === "stewardship") lines.push({ label: "Stewardship", value: "×1.25" });
    if (state.techs.includes("reserve-granaries")) {
      lines.push({ label: "Reserve Granaries", value: "×1.35" });
    }
  }
  if (id === "seeds" && state.techs.includes("seed-ledgers")) {
    lines.push({ label: "Seed Ledgers", value: "×1.1" });
  }
  if (rank(state, "crops") > 0) {
    lines.push({ label: "Deeper crops", value: `×${(1 + 0.1 * rank(state, "crops")).toFixed(2)}` });
  }
  lines.push({ label: "Cap", value: formatAmount(storage[id]) });
  return lines;
}

function pushCount(lines: CapLine[], amount: number, label: string, each: number): void {
  if (amount > 0) lines.push({ label: `${amount} ${label}`, value: `+${amount * each}` });
}

export function isRoleUnlocked(state: GameState, role: RoleId): boolean {
  if (role === "foragers") return true;
  if (role === "weavers") return state.flags.includes("seed-cache");
  if (role === "scouts") return state.flags.includes("survey");
  if (role === "broodkeepers" || role === "scholars") return state.act >= 2;
  if (role === "envoys") return state.act >= 3;
  return state.act >= 4;
}

export function visibleRoles(state: GameState): RoleId[] {
  return ROLE_DEFS.map((role) => role.id).filter((id) => isRoleUnlocked(state, id));
}

export function isResourceUnlocked(state: GameState, resource: ResourceId): boolean {
  if (resource === "seeds") return true;
  if (resource === "twigs") return state.flags.includes("seed-cache");
  if (resource === "knowledge") return state.flags.includes("survey");
  if (resource === "influence") return state.act >= 3;
  return state.act >= 4;
}

export function expeditionSpeed(state: GameState): number {
  let speed = 1;
  if (state.doctrine === "stewardship") speed *= 0.94;
  if (state.doctrine === "ingenuity") speed *= 1.15;
  if (state.doctrine === "wanderlust") speed *= 1.1;
  if (state.techs.includes("roost-logistics")) speed *= 1.12;
  if (state.techs.includes("range-equation")) speed *= 1.12;
  speed *= 1 + 0.05 * rank(state, "airframe");
  if (effectActive(state, "burn")) speed *= 1.35;
  if (effectActive(state, "huddle")) speed *= 0.92;
  return speed;
}

function effectActive(state: GameState, id: string): boolean {
  return state.effects.some((effect) => effect.id === id && effect.until > state.elapsed);
}

export function calculateRates(state: GameState): Rates {
  const season = getSeason(state);
  const route =
    state.routes *
    TUNE.routeBonus *
    (state.doctrine === "wanderlust" ? 1.4 : 1);
  const steady = state.doctrine === "wanderlust" ? 0.94 : state.doctrine === "stewardship" ? 1.08 : 1;
  const seedTech = state.techs.includes("seed-ledgers") ? 1.18 : 1;
  const twigTech = state.techs.includes("woven-baskets") ? 1.25 : 1;
  const memory = state.techs.includes("collective-memory") ? 1.3 : 1;
  const ingenuity = state.doctrine === "ingenuity" ? 1.3 : 1;
  const scoutDoctrine = state.doctrine === "wanderlust" ? 1.4 : 1;
  const civic = state.techs.includes("civic-murmuration") ? 1.35 : 1;
  const helio = state.techs.includes("heliography") ? 1.5 : 1;
  const charts = 1 + 0.1 * rank(state, "charts");
  const wanderStar = state.doctrine === "wanderlust" ? 1.3 : 1;
  const seedfall = effectActive(state, "seedfall") ? 1.4 : 1;
  const seedfallTwig = effectActive(state, "seedfall") ? 1.2 : 1;
  const huddle = effectActive(state, "huddle") ? 0.85 : 1;
  const tailwind = effectActive(state, "tailwind") ? 1.6 : 1;
  const cuckoo = effectActive(state, "cuckoo") ? 0.8 : 1;
  const garden = state.flags.includes("garden") ? 1.1 : 1;
  const hunt = state.flags.includes("song-hunt") ? 1.06 : 1;
  const build = state.flags.includes("song-build") ? 1.06 : 1;
  const sanctuary = state.flags.includes("sanctuary") ? 0.96 : 1;
  const upkeepMult =
    (state.doctrine === "ingenuity" ? 1.1 : state.doctrine === "stewardship" ? 0.92 : 1) *
    (state.techs.includes("fat-stores") ? 0.85 : 1);
  const upkeep = state.flock * TUNE.upkeep * upkeepMult;

  const seeds =
    (state.roles.foragers * TUNE.forager * season.seed * (1 + route) * steady * seedTech * seedfall * garden * hunt * sanctuary * huddle +
      count(state, "nest") * TUNE.nestSeed +
      count(state, "granary") * TUNE.granarySeed +
      count(state, "solar") * TUNE.solarSeed) -
    upkeep;
  const twigs =
    (state.roles.weavers * TUNE.weaver * season.twig * (1 + route) * steady * twigTech * seedfallTwig * build * huddle +
      count(state, "nest") * TUNE.nestTwig);
  const notes = state.flags.includes("survey") ? TUNE.fieldNotes : 0;
  const knowledge =
    (state.roles.scholars * TUNE.scholar +
      state.roles.scouts * TUNE.scout * scoutDoctrine +
      count(state, "archive") * TUNE.archiveKnowledge +
      count(state, "academy") * TUNE.academyKnowledge +
      state.systems * TUNE.systemKnowledge +
      notes) *
    season.knowledge *
    memory *
    ingenuity *
    charts *
    huddle;
  const influence =
    (state.roles.envoys * TUNE.envoy + count(state, "beacon") * TUNE.beaconInfluence) *
    civic *
    tailwind *
    Math.max(0.55, state.morale);
  const starlight =
    (state.roles.navigators * TUNE.navigator * helio +
      state.systems * TUNE.systemStar +
      count(state, "solar") * TUNE.solarStar) *
    wanderStar *
    charts;
  const reserveOk = state.resources.seeds > state.flock * 5;
  const population =
    state.flock < getCapacity(state) && reserveOk
      ? (state.roles.broodkeepers * TUNE.brood + count(state, "eyrie") * TUNE.eyrieGrowth) *
        (state.techs.includes("communal-hatcheries") ? 1.4 : 1) *
        cuckoo *
        Math.max(0.55, state.morale)
      : 0;

  return { seeds, twigs, knowledge, influence, starlight, population, upkeep };
}

/** Why the flock number is not moving. Null when young are actually arriving. */
export function growthPause(state: GameState): string | null {
  if (calculateRates(state).population >= 0.0005) return null;
  if (state.act < 2) return "The flock grows once there is a roost to raise young in";
  const raising = state.roles.broodkeepers > 0 || count(state, "eyrie") > 0;
  if (!raising) return "Assign Broodkeepers to raise young";
  if (state.flock >= getCapacity(state) - 0.05) return "At capacity";
  const need = state.flock * 5;
  const shown = Number.isInteger(need) ? formatAmount(need, 0) : formatAmount(need, 1);
  return `Seed reserve too low: growth needs more than ${shown} seeds`;
}

export function roleYield(state: GameState, role: RoleId): string {
  const definition = ROLE_DEFS.find((item) => item.id === role);
  if (!definition) return "";
  const before = calculateRates(state);
  const after = calculateRates({
    ...state,
    roles: { ...state.roles, [role]: state.roles[role] + 1 },
  });
  const key = definition.resource;
  const gain = Math.max(0, after[key] - before[key]);
  const digits = gain < 0.1 ? 3 : 2;
  const unit = key === "population" ? "birds" : key;
  return `+${formatAmount(gain, digits)} ${unit}/s each`;
}

export function assignRole(state: GameState, role: RoleId, delta: -1 | 1): GameState {
  if (!isRoleUnlocked(state, role)) return state;
  if (delta === 1 && getIdleBirds(state) < 1) return state;
  if (delta === -1 && state.roles[role] < 1) return state;
  return {
    ...state,
    roles: { ...state.roles, [role]: state.roles[role] + delta },
  };
}

export function listProjects(state: GameState): ProjectDef[] {
  if (state.won) return [];
  return PROJECTS.filter((project) => {
    if (project.era && project.act !== state.act) return false;
    if (!project.era && state.act < project.act) return false;
    if (!project.repeatable && state.flags.includes(project.id)) return false;
    return project.visible(state);
  }).sort((a, b) => Number(b.goal) - Number(a.goal));
}

export interface Readiness {
  ok: boolean;
  reason: string;
}

export function canStart(state: GameState, projectId: string): Readiness {
  const project = projectById(projectId);
  if (!project || state.won) return { ok: false, reason: "That plan is gone." };
  if (!listProjects(state).some((item) => item.id === projectId)) {
    return { ok: false, reason: "Not available right now." };
  }
  if (state.active) return { ok: false, reason: "Another expedition is already out." };
  const blocked = project.blocked?.(state);
  if (blocked) return { ok: false, reason: blocked };
  const costs = project.costs(state);
  const missingCost = !hasCosts(state, costs) ? formatMissing(state, costs) : "";
  const idle = getIdleBirds(state);
  const missingBirds = Math.max(0, project.birds - idle);
  const impact =
    project.birds > 0 ? borrowImpact(state, project.birds, wallTime(state, project)) : "";
  if (missingCost || missingBirds > 0) {
    const free =
      missingBirds > 0
        ? `Free ${missingBirds} more bird${missingBirds === 1 ? "" : "s"}.`
        : "";
    const reason = [missingCost, free, impact].filter(Boolean).join(" ");
    return { ok: false, reason };
  }
  return { ok: true, reason: project.duration(state) === 0 ? "Ready to build." : "Ready to launch." };
}

export function startProject(state: GameState, projectId: string): GameState {
  const project = projectById(projectId);
  if (!project || !canStart(state, projectId).ok) return state;
  const costs = project.costs(state);
  const spent: GameState = {
    ...state,
    resources: spend(state.resources, costs),
  };
  const duration = project.duration(state);
  if (duration <= 0) {
    return completeProject(spent, project.id);
  }
  const away = project.birds > 0 ? ` ${project.birds} birds step off the job.` : "";
  return pushLog(
    {
      ...spent,
      active: { id: project.id, remaining: duration, duration, birds: project.birds },
    },
    `${project.name} starts.${away}`,
    "story",
  );
}

export function recallProject(state: GameState): GameState {
  if (!state.active) return state;
  const project = projectById(state.active.id);
  return pushLog(
    { ...state, active: null },
    `${project?.name ?? "The plan"} recalled. Stores stay spent.`,
    "warning",
  );
}

export function wallTime(state: GameState, project: ProjectDef): number {
  const duration = project.duration(state);
  if (duration <= 0) return 0;
  const speed = Math.max(0.2, expeditionSpeed(state));
  return duration / speed;
}

export function timeToAfford(state: GameState, costs: Partial<Resources>): string {
  const limit = limitingResource(state, costs);
  if (!limit) return "Stores cover this.";
  const hint = limit.rate < stallFloor(limit.id) ? ` ${roleFix(state, limit.id)}` : "";
  if (limit.rate <= 0.001) {
    const falling = limit.rate < -0.001;
    return `${RESOURCE_LABEL[limit.id]} ${falling ? "is falling" : "is not increasing"}.${hint}`;
  }
  return `About ${formatDuration(limit.seconds)} at the current rates.${hint}`;
}

const PULL_ORDER: RoleId[] = [
  "foragers",
  "weavers",
  "scouts",
  "scholars",
  "broodkeepers",
  "envoys",
  "navigators",
];

/** What leaving roles for a launch does to income. Empty when idle birds cover it. */
export function borrowImpact(state: GameState, birds: number, seconds: number): string {
  if (birds <= 0) return "";
  const pull = Math.max(0, birds - getIdleBirds(state));
  if (pull <= 0) return "";
  const roles = { ...state.roles };
  const taken: Partial<Record<RoleId, number>> = {};
  let left = pull;
  while (left > 0) {
    const role = [...PULL_ORDER]
      .filter((id) => roles[id] > 0)
      .sort((a, b) => roles[b] - roles[a] || PULL_ORDER.indexOf(a) - PULL_ORDER.indexOf(b))[0];
    if (!role) break;
    roles[role] -= 1;
    taken[role] = (taken[role] ?? 0) + 1;
    left -= 1;
  }
  if (left > 0) return "";
  const before = calculateRates(state);
  const after = calculateRates({ ...state, roles });
  const changes = rateChanges(before, after);
  const who = describeTaken(taken);
  const clock = formatDuration(seconds);
  return changes ? `Pulls ${who}; ${changes} for ${clock}.` : `Pulls ${who} for ${clock}.`;
}

export function actionLabel(reason: string, ready: boolean, instant: boolean): string {
  if (ready) return instant ? "Build" : "Launch";
  const free = reason.match(/^Free (\d+) more bird/);
  if (free) return `Free ${free[1]} ${Number(free[1]) === 1 ? "bird" : "birds"}`;
  const sentence = reason.split(". ")[0] ?? reason;
  if (sentence.startsWith("Need ") && sentence.length <= 36) return sentence.replace(/\.$/, "");
  return instant ? "Build" : "Launch";
}

export function stallFloor(id: ResourceId): number {
  switch (id) {
    case "seeds":
      return TUNE.stallSeed;
    case "twigs":
      return TUNE.stallTwig;
    case "knowledge":
      return TUNE.stallKnowledge;
    case "influence":
      return TUNE.stallInfluence;
    case "starlight":
      return TUNE.stallStarlight;
  }
}

export function roleFix(state: GameState, id: ResourceId): string {
  if (id === "knowledge" && !isRoleUnlocked(state, "scholars")) return "Assign a Scout.";
  const noun: Record<ResourceId, string> = {
    seeds: "Forager",
    twigs: "Weaver",
    knowledge: "Scholar",
    influence: "Envoy",
    starlight: "Navigator",
  };
  return `Assign a ${noun[id]}.`;
}

interface ResourceLimit {
  id: ResourceId;
  rate: number;
  seconds: number;
}

export function limitingResource(state: GameState, costs: Partial<Resources>): ResourceLimit | null {
  const rates = calculateRates(state);
  let worst: ResourceLimit | null = null;
  for (const [key, cost] of Object.entries(costs) as Array<[ResourceId, number]>) {
    const short = cost - state.resources[key];
    if (short <= 0.05) continue;
    const rate = rates[key];
    const seconds = rate <= 0.001 ? Number.POSITIVE_INFINITY : short / rate;
    if (!worst || seconds > worst.seconds) worst = { id: key, rate, seconds };
  }
  return worst;
}

/** Short Now-line when the goal is waiting on a resource that is barely coming in. */
export function stallHint(state: GameState, costs: Partial<Resources>): string | null {
  const limit = limitingResource(state, costs);
  if (!limit || limit.rate >= stallFloor(limit.id)) return null;
  const label = RESOURCE_LABEL[limit.id];
  const fix = roleFix(state, limit.id);
  if (limit.rate < -0.001) return `${label} is falling. ${fix}`;
  if (limit.rate <= 0.001) return `${label} is not increasing. ${fix}`;
  return `${label} is barely coming in. ${fix}`;
}

function rateChanges(before: Rates, after: Rates): string {
  const keys: ResourceId[] = ["seeds", "twigs", "knowledge", "influence", "starlight"];
  const parts: string[] = [];
  for (const key of keys) {
    if (Math.abs(before[key] - after[key]) < 0.015) continue;
    parts.push(`${key} ${formatRate(before[key])} to ${formatRate(after[key])}`);
    if (parts.length === 2) break;
  }
  return parts.join(", ");
}

function describeTaken(taken: Partial<Record<RoleId, number>>): string {
  const parts = (Object.entries(taken) as Array<[RoleId, number]>)
    .filter(([, amount]) => amount > 0)
    .map(([role, amount]) => `${amount} ${roleNoun(role, amount)}`);
  if (parts.length === 0) return "birds";
  if (parts.length === 1) return parts[0] ?? "birds";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function roleNoun(role: RoleId, amount: number): string {
  const name = ROLE_DEFS.find((item) => item.id === role)?.name.toLowerCase() ?? role;
  if (amount === 1 && name.endsWith("s")) return name.slice(0, -1);
  return name;
}

export function canBuyTech(state: GameState, techId: string): boolean {
  const tech = TECHS.find((item) => item.id === techId);
  if (!tech) return false;
  if (!state.flags.includes("first-nest")) return false;
  if (tech.act > state.act) return false;
  if (state.techs.includes(techId)) return false;
  return hasCosts(state, tech.cost);
}

export function buyTech(state: GameState, techId: string): GameState {
  const tech = TECHS.find((item) => item.id === techId);
  if (!tech || !canBuyTech(state, techId)) return state;
  return pushLog(
    {
      ...state,
      resources: spend(state.resources, tech.cost),
      techs: [...state.techs, techId],
    },
    `Noted: ${tech.name}.`,
  );
}

export function chooseDoctrine(state: GameState, doctrine: DoctrineId): GameState {
  if (state.act < 2 || state.doctrine) return state;
  if (!DOCTRINES.some((item) => item.id === doctrine)) return state;
  const next = applyDoctrineGift({ ...state, doctrine }, doctrine);
  const gift = doctrineGiftNote(doctrine);
  const line = gift ? `${doctrineRemark(doctrine)} ${gift}` : doctrineRemark(doctrine);
  return pushNotable(next, line);
}

function applyDoctrineGift(state: GameState, doctrine: DoctrineId): GameState {
  if (doctrine === "ingenuity") {
    let next = state;
    if (next.flock + 1 <= getCapacity(next) + 0.01) {
      next = {
        ...next,
        flock: next.flock + 1,
        roles: { ...next.roles, scholars: next.roles.scholars + 1 },
      };
    }
    return { ...next, resources: gain(next, { knowledge: TUNE.ingenuityGift }) };
  }
  if (doctrine === "wanderlust") {
    return { ...state, routes: Math.min(TUNE.maxRoutes, state.routes + TUNE.wanderlustGift) };
  }
  return state;
}

function doctrineGiftNote(doctrine: DoctrineId): string {
  if (doctrine === "ingenuity") {
    return `A scholar joins. +${TUNE.ingenuityGift} knowledge.`;
  }
  if (doctrine === "wanderlust") {
    return `+${TUNE.wanderlustGift} routes already flown.`;
  }
  return "";
}

export function respecDoctrine(state: GameState, doctrine: DoctrineId): GameState {
  if (rank(state, "second-look") < 1) return state;
  if (!state.doctrine || state.doctrineChanges >= 1) return state;
  if (state.doctrine === doctrine) return state;
  if (state.act < 2) return state;
  const definition = DOCTRINES.find((item) => item.id === doctrine);
  return pushNotable(
    { ...state, doctrine, doctrineChanges: state.doctrineChanges + 1 },
    `Second look: ${definition?.name ?? doctrine}. ${doctrineRemark(doctrine)}`,
  );
}

export function canChooseOption(state: GameState, eventId: string, optionId: string): Readiness {
  const event = EVENTS.find((item) => item.id === eventId);
  const option = event?.options.find((item) => item.id === optionId);
  if (!event || !option || state.pendingEvent !== eventId) {
    return { ok: false, reason: "That moment has passed." };
  }
  if (option.cost && !hasCosts(state, option.cost)) {
    return { ok: false, reason: formatMissing(state, option.cost) };
  }
  return { ok: true, reason: "Ready." };
}

export function resolveEvent(state: GameState, eventId: string, optionId: string): GameState {
  if (!canChooseOption(state, eventId, optionId).ok) return state;
  const event = EVENTS.find((item) => item.id === eventId);
  const option = event?.options.find((item) => item.id === optionId);
  if (!event || !option) return state;
  let next: GameState = {
    ...state,
    pendingEvent: null,
    resources: option.cost ? spend(state.resources, option.cost) : state.resources,
    flags: state.flags.includes(`event:${eventId}:${optionId}`)
      ? state.flags
      : [...state.flags, `event:${eventId}:${optionId}`],
  };
  next = applyEvent(next, eventId, optionId);
  next = pushLog(next, `${event.title}: ${option.name}.`, "story");
  return promoteQueue(next);
}

export function dismissReport(state: GameState): GameState {
  if (!state.offlineReport) return state;
  return { ...state, offlineReport: null };
}

export function pauseGame(state: GameState, paused: boolean, now: number): GameState {
  return { ...state, paused, lastTickAt: now };
}

export interface Objective {
  title: string;
  detail: string;
  progress: number;
  next: string;
  /** Plan the notebook should put first, when one click is the next step. */
  projectId: string | null;
}

export function getObjective(state: GameState): Objective {
  const objective = objectiveBody(state);
  if (state.active && state.active.id === objective.projectId) return objective;
  const project = objective.projectId ? projectById(objective.projectId) : undefined;
  const hint = project ? stallHint(state, project.costs(state)) : null;
  if (hint) return { ...objective, next: hint };
  const later = eraStall(state);
  if (later) return { ...objective, next: later };
  return objective;
}

function eraStall(state: GameState): string | null {
  const id =
    state.act === 2 && state.doctrine && !state.flags.includes("council")
      ? "council"
      : state.act === 3 && !state.flags.includes("accord")
        ? "accord"
        : state.act === 4 && !state.won
          ? "murmur"
          : null;
  if (!id || id === getImmediateId(state)) return null;
  const project = projectById(id);
  if (!project) return null;
  return stallHint(state, project.costs(state));
}

function getImmediateId(state: GameState): string | null {
  return objectiveBody(state).projectId;
}

function objectiveBody(state: GameState): Objective {
  if (state.won) {
    const ending = endingText(state);
    return {
      title: ending.title,
      detail: ending.body,
      progress: 1,
      next: "The expedition is complete. You can migrate.",
      projectId: null,
    };
  }
  if (!state.flags.includes("seed-cache")) {
    return {
      title: "Store the first harvest",
      detail: "Let the foragers fill a hollow. Idle birds can join them.",
      progress: Math.min(1, state.resources.seeds / 58) * 0.08,
      next:
        state.resources.seeds >= 58
          ? "Line the seed cache."
          : `Gather ${formatAmount(58 - state.resources.seeds, 0)} more seeds.`,
      projectId: "seed-cache",
    };
  }
  if (!state.flags.includes("first-nest")) {
    return {
      title: "Weave the first nest",
      detail: "Assign a weaver. Twigs do not appear on their own.",
      progress: 0.1 + Math.min(1, state.resources.twigs / 16) * 0.08,
      next:
        state.resources.twigs < 16
          ? `Gather ${formatAmount(16 - state.resources.twigs, 0)} more twigs.`
          : state.resources.seeds < 48
            ? `Gather ${formatAmount(48 - state.resources.seeds, 0)} more seeds.`
            : "Weave the first nest.",
      projectId: "first-nest",
    };
  }
  if (!state.flags.includes("survey")) {
    return {
      title: "Survey the canopy",
      detail: "Borrow two birds and mark the branches worth returning to.",
      progress: 0.2,
      next: "Survey the canopy.",
      projectId: "survey",
    };
  }
  if (state.act === 1) {
    return {
      title: "Establish the first roost",
      detail: "Two nests and a survey, then bind them into a place.",
      progress: 0.22 + Math.min(1, count(state, "nest") / 2) * 0.08,
      next: count(state, "nest") < 2 ? "Raise a second nest." : "Commit to the first roost.",
      projectId: count(state, "nest") < 2 ? "nest" : "roost",
    };
  }
  if (state.act === 2) {
    const projectId = !state.doctrine
      ? null
      : count(state, "archive") < 1
        ? "archive"
        : state.flock < 16
          ? "brood"
          : "council";
    return {
      title: "Convene the Sky Council",
      detail: "An archive, a doctrine, and a flock large enough to argue.",
      progress: 0.32 + (count(state, "archive") > 0 ? 0.06 : 0) + Math.min(0.1, state.flock / 160),
      next: !state.doctrine
        ? "Choose a doctrine in Study."
        : count(state, "archive") < 1
          ? "Raise an archive."
          : state.flock < 16
            ? `Grow the flock to 16 (${formatAmount(Math.floor(state.flock), 0)}/16).`
            : "Save up for the council.",
      projectId,
    };
  }
  if (state.act === 3) {
    const projectId =
      count(state, "beacon") < 2 ? "beacon" : state.flock < 24 ? "brood" : "accord";
    return {
      title: "Ratify the Open-Sky Accord",
      detail: "Two beacons, a larger flock, and influence you are willing to spend.",
      progress: 0.55 + Math.min(0.1, count(state, "beacon") / 20) + Math.min(0.08, state.flock / 400),
      next:
        count(state, "beacon") < 2
          ? `Raise beacons (${count(state, "beacon")}/2).`
          : state.flock < 24
            ? `Grow the flock to 24 (${formatAmount(Math.floor(state.flock), 0)}/24).`
            : "Save up for the accord.",
      projectId,
    };
  }
  const projectId = state.systems < 6 ? "ark" : state.flock < 32 ? "brood" : "murmur";
  return {
    title: "Begin the Great Murmuration",
    detail: "Six systems and a flock that can spare ten birds.",
    progress: 0.78 + Math.min(0.14, state.systems / 50) + Math.min(0.06, state.flock / 600),
    next:
      state.systems < 6
        ? `Reach six systems (${state.systems}/6). Arks build harbors; scans are cheaper.`
        : state.flock < 32
          ? `Grow the flock to 32 (${formatAmount(Math.floor(state.flock), 0)}/32).`
          : "Save up for the murmuration.",
    projectId,
  };
}

export function endingText(state: GameState): { title: string; body: string } {
  let body: string;
  if (state.doctrine === "stewardship") {
    body = "Every world keeps more cover than the flock found.";
  } else if (state.doctrine === "ingenuity") {
    body = "The route writes itself down, and remembers.";
  } else {
    body = "The flock never settles. The routes are home.";
  }
  if (state.flags.includes("event:garden-treaty:accept")) {
    body += " The first garden stays on the route.";
  }
  if (state.flags.includes("event:quiet-signal:follow")) {
    body += " The signal became a heading.";
  }
  if (state.flags.includes("event:quiet-signal:archive")) {
    body += " The signal was copied and left alone.";
  }
  if (state.flags.includes("sanctuary")) {
    body += " One ground was left wild.";
  }
  if (state.flags.includes("took-seed")) {
    body += " The last ground was harvested.";
  }
  return { title: "The route is written", body };
}

export function marksForRun(state: GameState): number {
  if (state.won) {
    let marks = 8;
    if (state.elapsed < 8 * 3600) marks += 2;
    if (state.doctrine && !state.doctrinesWon.includes(state.doctrine)) marks += 2;
    return marks;
  }
  if (state.act >= 2) return state.act - 1;
  return 0;
}

export function migrate(
  state: GameState,
  now: number,
  purchases: Record<string, number>,
): { ok: true; state: GameState } | { ok: false; reason: string } {
  if (state.act < 2 && !state.won) {
    return {
      ok: false,
      reason: "Finish the first roost before migrating. There is nothing to carry yet.",
    };
  }
  let marks = state.marks + marksForRun(state);
  const ranks = { ...state.ranks };
  for (const [id, add] of Object.entries(purchases)) {
    if (!Number.isInteger(add) || add < 0) {
      return { ok: false, reason: "That purchase is not a rank." };
    }
    if (add === 0) continue;
    const upgrade = UPGRADES.find((item) => item.id === id);
    if (!upgrade) return { ok: false, reason: "Unknown flyway rank." };
    const current = ranks[id] ?? 0;
    if (current + add > upgrade.costs.length) {
      return { ok: false, reason: `${upgrade.name} cannot be raised that far.` };
    }
    let cost = 0;
    for (let step = current; step < current + add; step += 1) cost += upgrade.costs[step] ?? 0;
    if (cost > marks) return { ok: false, reason: `Need ${cost - marks} more marks.` };
    marks -= cost;
    ranks[id] = current + add;
  }
  const doctrinesWon =
    state.won && state.doctrine && !state.doctrinesWon.includes(state.doctrine)
      ? [...state.doctrinesWon, state.doctrine]
      : [...state.doctrinesWon];
  const fresh = createInitialState(now, {
    marks,
    ranks,
    migrations: state.migrations + 1,
    wins: state.wins + (state.won ? 1 : 0),
    doctrinesWon,
    bestTime:
      state.won && (state.bestTime === null || state.elapsed < state.bestTime)
        ? state.elapsed
        : state.bestTime,
  });
  fresh.notebook = {
    intro: "done",
    seen: [...state.notebook.seen],
    quiet: state.notebook.quiet,
  };
  return {
    ok: true,
    state: pushLog(
      fresh,
      state.won
        ? "New flock. The old headings came along."
        : "Turned back early. A few headings carry over.",
      "story",
    ),
  };
}

export interface TickOptions {
  enqueueEvents?: boolean;
}

/**
 * Advance simulated time by `seconds`. Rates are applied 1:1 with the
 * requested duration. Long spans are sliced at season changes, effect
 * expiries, project completion, and event triggers.
 */
export function tick(state: GameState, seconds: number, options?: TickOptions): GameState {
  if (state.paused || state.won || !(seconds > 0) || !Number.isFinite(seconds)) return state;
  const enqueueEvents = options?.enqueueEvents !== false;
  let next = state;
  let left = seconds;
  let guard = 0;
  while (left > 1e-4 && guard < 100_000) {
    guard += 1;
    const slice = nextSlice(next, left);
    next = applySlice(next, slice, enqueueEvents);
    left -= slice;
  }
  return next;
}

export function catchUp(
  state: GameState,
  now: number,
  options?: { enqueueEvents?: boolean },
): GameState {
  if (!Number.isFinite(now)) return state;
  if (!(state.lastTickAt > 0) || state.lastTickAt > now) {
    return state.lastTickAt === now ? state : { ...state, lastTickAt: now };
  }
  if (state.paused || state.won) {
    return state.lastTickAt === now ? state : { ...state, lastTickAt: now };
  }
  const gap = (now - state.lastTickAt) / 1000;
  if (gap <= 0) return state;
  const cap = offlineCapSeconds(state);
  const applied = Math.min(gap, cap);
  const beforeResources = { ...state.resources };
  const beforeFlock = state.flock;
  const before = state;
  let next = tick(state, applied, { enqueueEvents: options?.enqueueEvents !== false });
  next = { ...next, lastTickAt: now, offlineReport: state.offlineReport };
  if (applied >= OFFLINE_REPORT_AFTER) {
    const gained: Partial<Resources> = {};
    (Object.keys(beforeResources) as ResourceId[]).forEach((key) => {
      const delta = next.resources[key] - beforeResources[key];
      if (Math.abs(delta) >= 0.05) gained[key] = delta;
    });
    next = {
      ...next,
      offlineReport: {
        seconds: applied,
        capped: gap > cap + 1,
        gained,
        flockGained: Math.max(0, next.flock - beforeFlock),
        finished: finishedProjectNames(before, next),
        eventsWaiting: (next.pendingEvent ? 1 : 0) + next.eventQueue.length,
      },
    };
  }
  return next;
}

function finishedProjectNames(before: GameState, after: GameState): string[] {
  const names: string[] = [];
  for (const project of PROJECTS) {
    const previous =
      (before.counts[project.id] ?? 0) + (before.flags.includes(project.id) ? 1 : 0);
    const current = (after.counts[project.id] ?? 0) + (after.flags.includes(project.id) ? 1 : 0);
    for (let index = 0; index < current - previous; index += 1) names.push(project.name);
  }
  return names;
}

function nextSlice(state: GameState, left: number): number {
  let slice = left;
  if (state.active) {
    const speed = Math.max(0.2, expeditionSpeed(state));
    slice = Math.min(slice, state.active.remaining / speed);
  }
  const length = seasonLength(state);
  const into = state.elapsed % length;
  const untilSeason = length - into;
  if (untilSeason > 1e-6) slice = Math.min(slice, untilSeason);
  for (const effect of state.effects) {
    const until = effect.until - state.elapsed;
    if (until > 1e-6) slice = Math.min(slice, until);
  }
  return Math.max(slice, Math.min(left, 1e-3));
}

function applySlice(state: GameState, slice: number, enqueueEvents: boolean): GameState {
  const rates = calculateRates(state);
  const storage = getStorage(state);
  const resources = { ...state.resources };
  (Object.keys(resources) as ResourceId[]).forEach((key) => {
    resources[key] = clampResource(Math.min(storage[key], resources[key] + rates[key] * slice));
  });
  const flock = Math.min(getCapacity(state), state.flock + rates.population * slice);
  const season = getSeason(state);
  const starving = resources.seeds <= 0.001 && rates.seeds < 0;
  const target = starving ? 0.58 : season.id === "rain" ? 0.98 : rates.seeds >= 0 ? 0.9 : 0.72;
  const lifted = state.doctrine === "stewardship" ? Math.min(1, target + 0.04) : target;
  const morale = clampUnit(state.morale + (lifted - state.morale) * Math.min(1, slice / 90));
  const elapsed = state.elapsed + slice;
  let active = state.active;
  if (active) {
    const speed = Math.max(0.2, expeditionSpeed(state));
    active = { ...active, remaining: active.remaining - slice * speed };
  }
  let next: GameState = {
    ...state,
    elapsed,
    resources,
    flock,
    morale,
    active,
    effects: state.effects.filter((effect) => effect.until > elapsed + 1e-6),
  };
  if (next.active && next.active.remaining <= 1e-4) {
    const id = next.active.id;
    next = { ...next, active: null };
    next = completeProject(next, id);
  }
  if (enqueueEvents) next = enqueueDue(next);
  return next;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0.7;
  return Math.min(1, Math.max(0.5, value));
}

function completeProject(state: GameState, id: string): GameState {
  let next: GameState = state;
  const once = !projectById(id)?.repeatable;
  if (once) {
    if (!next.flags.includes(id)) next = { ...next, flags: [...next.flags, id] };
  } else {
    next = { ...next, counts: { ...next.counts, [id]: count(next, id) + 1 } };
  }
  switch (id) {
    case "first-nest":
      next = { ...next, counts: { ...next.counts, nest: count(next, "nest") + 1 } };
      break;
    case "survey":
      next = { ...next, routes: Math.min(TUNE.maxRoutes, next.routes + 2) };
      break;
    case "seedfall":
      next = {
        ...next,
        routes: Math.min(TUNE.maxRoutes, next.routes + 1),
        cooldowns: { ...next.cooldowns, seedfall: next.elapsed + 240 },
        effects: upsertEffect(next, "seedfall", 75),
      };
      break;
    case "roost":
      next = setAct(next, 2);
      break;
    case "brood":
      next = {
        ...next,
        flock: Math.min(getCapacity(next), next.flock + 3),
        cooldowns: { ...next.cooldowns, brood: next.elapsed + TUNE.broodRest },
      };
      break;
    case "corridor":
      next = { ...next, routes: Math.min(TUNE.maxRoutes, next.routes + 1) };
      break;
    case "council":
      next = setAct(next, 3);
      next = {
        ...next,
        resources: { ...next.resources, influence: Math.max(next.resources.influence, 8) },
      };
      break;
    case "treaty":
      next = {
        ...next,
        resources: gain(next, { influence: 14 }),
        cooldowns: { ...next.cooldowns, treaty: next.elapsed + 180 },
        effects: upsertEffect(next, "tailwind", 90),
      };
      break;
    case "accord":
      next = setAct(next, 4);
      next = {
        ...next,
        systems: Math.max(1, next.systems),
        resources: gain(next, { starlight: 24 }),
      };
      break;
    case "ark":
      next = { ...next, systems: next.systems + 1 };
      break;
    case "scan":
      next = {
        ...next,
        systems: next.systems + 1,
        routes: Math.min(TUNE.maxRoutes, next.routes + 1),
      };
      break;
    case "murmur":
      next = setAct(next, 5);
      next = { ...next, won: true, paused: false };
      break;
    default:
      break;
  }
  return pushStory(next, projectLogLine(next, id));
}

/** One line per completion. A quip only when the previous line was not a bird. */
function projectLogLine(state: GameState, id: string): string {
  switch (id) {
    case "seed-cache":
      return roleArrival("weavers");
    case "first-nest":
      return "The first nest is up. Plans can start.";
    case "survey":
      return roleArrival("scouts");
    case "roost":
      return `The roost is up. ${roleArrival("broodkeepers")} ${roleArrival("scholars")}`;
    case "council":
      return `The council sits. ${roleArrival("envoys")}`;
    case "accord":
      return `The accord is set. ${roleArrival("navigators")}`;
    case "murmur":
      return endingText(state).body;
    default: {
      const nth = Math.max(1, count(state, id));
      const last = state.logs[state.logs.length - 1]?.text ?? "";
      if (nth % 2 === 1 && !isBirdLine(last)) return repeatRemark(id, nth);
      return plainResult(id);
    }
  }
}

function plainResult(id: string): string {
  switch (id) {
    case "nest":
      return "Another nest. More housing.";
    case "seedfall":
      return "Seedfall hit. One new route.";
    case "archive":
      return "Archive raised. Knowledge store grows.";
    case "brood":
      return "Three birds join the flock.";
    case "corridor":
      return "One new route.";
    case "beacon":
      return "Beacon raised. Influence grows.";
    case "treaty":
      return "Treaty flight home. Influence up.";
    case "granary":
      return "Granary roost raised.";
    case "academy":
      return "Academy roost raised.";
    case "eyrie":
      return "Eyrie roost raised.";
    case "solar":
      return "Solar nursery woven.";
    case "ark":
      return "Seed ark launched. One new system.";
    case "scan":
      return "One star read. One new route.";
    default:
      return "Done.";
  }
}

function setAct(state: GameState, act: Act): GameState {
  if (state.act === act) return state;
  return { ...state, act, actStartedAt: state.elapsed };
}

function upsertEffect(state: GameState, id: string, seconds: number): GameState["effects"] {
  return [
    ...state.effects.filter((effect) => effect.id !== id),
    { id, until: state.elapsed + seconds },
  ];
}

function gain(state: GameState, extra: Partial<Resources>): Resources {
  const storage = getStorage(state);
  const resources = { ...state.resources };
  (Object.entries(extra) as Array<[ResourceId, number]>).forEach(([key, amount]) => {
    resources[key] = clampResource(Math.min(storage[key], resources[key] + amount));
  });
  return resources;
}

function applyEvent(state: GameState, eventId: string, optionId: string): GameState {
  const key = `${eventId}:${optionId}`;
  switch (key) {
    case "summer-gale:ride":
      return { ...state, routes: Math.min(TUNE.maxRoutes, state.routes + 2) };
    case "summer-gale:brace":
      return { ...state, morale: clampUnit(state.morale + 0.12) };
    case "night-frost:burn":
      return { ...state, morale: clampUnit(state.morale + 0.08) };
    case "night-frost:huddle":
      return {
        ...state,
        resources: gain(state, { knowledge: 8 }),
        effects: upsertEffect(state, "huddle", 120),
      };
    case "garden-treaty:accept":
      return {
        ...state,
        flags: [...state.flags, "garden"],
        resources: gain(state, { influence: 6 }),
      };
    case "garden-treaty:study":
      return {
        ...state,
        resources: gain(state, { knowledge: 45 }),
        routes: Math.min(TUNE.maxRoutes, state.routes + 1),
      };
    case "cuckoo:drive":
      return state;
    case "cuckoo:tolerate":
      return {
        ...state,
        resources: gain(state, { knowledge: 35 }),
        effects: upsertEffect(state, "cuckoo", 180),
      };
    case "song-school:hunt":
      return { ...state, flags: [...state.flags, "song-hunt"] };
    case "song-school:build":
      return { ...state, flags: [...state.flags, "song-build"] };
    case "civic-doubt:congress":
      return { ...state, resources: gain(state, { influence: 18 }) };
    case "civic-doubt:leave":
      return {
        ...state,
        morale: clampUnit(state.morale - 0.06),
        resources: gain(state, { influence: 4 }),
      };
    case "storm-year:open": {
      const spent = Math.max(20, state.resources.seeds * 0.12);
      return {
        ...state,
        resources: gain(
          { ...state, resources: spend(state.resources, { seeds: spent }) },
          { influence: 12 },
        ),
        morale: clampUnit(state.morale + 0.1),
      };
    }
    case "storm-year:hold":
      return { ...state, morale: clampUnit(state.morale - 0.07) };
    case "rival-aerie:contest":
      return {
        ...state,
        routes: Math.min(TUNE.maxRoutes, state.routes + 1),
        resources: gain(state, { influence: 10 }),
      };
    case "rival-aerie:ally":
      return {
        ...state,
        flags: [...state.flags, "ally"],
        resources: gain(state, { influence: 4 }),
      };
    case "quiet-signal:follow":
      return { ...state, systems: state.systems + 1 };
    case "quiet-signal:archive":
      return { ...state, resources: gain(state, { knowledge: 90, starlight: 24 }) };
    case "headwind:burn":
      return { ...state, effects: upsertEffect(state, "burn", 70) };
    case "headwind:wait":
      return { ...state, resources: gain(state, { knowledge: 20 }) };
    case "last-ground:sanctuary":
      return { ...state, flags: [...state.flags, "sanctuary"] };
    case "last-ground:harvest":
      return {
        ...state,
        flags: [...state.flags, "took-seed"],
        resources: gain(state, { seeds: 180, twigs: 70 }),
      };
    default:
      return state;
  }
}

function enqueueDue(state: GameState): GameState {
  const due = EVENTS.filter((event) => isEventDue(state, event));
  if (due.length === 0) return promoteQueue(state);
  const occupied = state.eventQueue.length + (state.pendingEvent ? 1 : 0);
  const room = Math.max(0, EVENT_QUEUE_CAP - occupied);
  const take = due.slice(0, room);
  const dropped = due.slice(room);
  let next: GameState = {
    ...state,
    eventQueue: [...state.eventQueue, ...take.map((event) => event.id)],
    seenEvents: [...state.seenEvents, ...due.map((event) => event.id)],
  };
  if (dropped.length > 0) {
    next = pushLog(
      next,
      "A choice passed while the flock was busy.",
      "warning",
    );
  }
  return promoteQueue(next);
}

function isEventDue(state: GameState, event: EventDef): boolean {
  if (state.seenEvents.includes(event.id)) return false;
  if (state.pendingEvent === event.id) return false;
  if (state.eventQueue.includes(event.id)) return false;
  if (state.act < event.act) return false;
  return event.when(state);
}

function promoteQueue(state: GameState): GameState {
  if (state.pendingEvent || state.eventQueue.length === 0) return state;
  const [nextId, ...rest] = state.eventQueue;
  return { ...state, pendingEvent: nextId, eventQueue: rest };
}

function hasCosts(state: GameState, costs: Partial<Resources>): boolean {
  return (Object.entries(costs) as Array<[ResourceId, number]>).every(
    ([key, value]) => state.resources[key] + 1e-6 >= value,
  );
}

function spend(resources: Resources, costs: Partial<Resources>): Resources {
  const next = { ...resources };
  (Object.entries(costs) as Array<[ResourceId, number]>).forEach(([key, value]) => {
    next[key] = clampResource(next[key] - value);
  });
  return next;
}

export function formatMissing(state: GameState, costs: Partial<Resources>): string {
  const missing = (Object.entries(costs) as Array<[ResourceId, number]>)
    .map(([resource, cost]) => [resource, Math.max(0, cost - state.resources[resource])] as const)
    .filter(([, amount]) => amount > 0.05);
  if (missing.length === 0) return "Ready.";
  return `Need ${missing
    .map(([resource, amount]) => `${formatAmount(amount, amount < 10 ? 1 : 0)} ${resource}`)
    .join(" and ")}.`;
}

export function formatCosts(costs: Partial<Resources>): string {
  const parts = (Object.entries(costs) as Array<[ResourceId, number]>).filter(([, value]) => value > 0);
  if (parts.length === 0) return "Nothing stored";
  return parts.map(([key, value]) => `${formatAmount(value)} ${key}`).join(" · ");
}

function pushLog(state: GameState, text: string, tone: GameLog["tone"] = "good"): GameState {
  const entry: GameLog = { id: state.logSeq + 1, at: state.elapsed, text, tone };
  return { ...state, logSeq: entry.id, logs: [...state.logs.slice(-79), entry] };
}

/** One bird line at a time. A second voice folds into the line already showing. */
function pushStory(state: GameState, text: string): GameState {
  const last = state.logs[state.logs.length - 1];
  if (last && isBirdLine(last.text) && isBirdLine(text)) {
    const logs = state.logs.slice(0, -1);
    logs.push({ ...last, text: `${last.text} ${text}` });
    return { ...state, logs };
  }
  return pushLog(state, text, "story");
}

/** Keeps a bird from answering the bird on the previous line. */
function pushNotable(state: GameState, text: string, tone: GameLog["tone"] = "story"): GameState {
  const last = state.logs[state.logs.length - 1];
  if (last && isBirdLine(last.text) && isBirdLine(text)) {
    const plain = text.replace(/\b(Pip|Bram|Nell|Quill):\s*/g, "").trim();
    if (!plain) return state;
    return pushLog(state, plain, tone);
  }
  return pushLog(state, text, tone);
}

export function actName(act: Act): string {
  return ACT_NAMES[act];
}

export function resourceIds(): ResourceId[] {
  return ["seeds", "twigs", "knowledge", "influence", "starlight"];
}

export { emptyResources, SEASONS, type SeasonId };
