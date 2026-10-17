import { TECHS, projectById, type ProjectDef } from "../src/game/content";
import {
  assignRole,
  buyTech,
  calculateRates,
  canBuyTech,
  canChooseOption,
  canStart,
  chooseDoctrine,
  getCapacity,
  getIdleBirds,
  resolveEvent,
  startProject,
  tick,
} from "../src/game/engine";
import type { DoctrineId, GameState, ResourceId, RoleId } from "../src/game/types";

export type Style = "attentive" | "stingy";

const ROLE_ORDER: RoleId[] = [
  "foragers",
  "weavers",
  "scouts",
  "broodkeepers",
  "scholars",
  "envoys",
  "navigators",
];

export function step(state: GameState, style: Style, doctrine: DoctrineId): GameState {
  let next = state;
  if (next.pendingEvent) {
    const option = chooseOption(next, next.pendingEvent);
    if (option && canChooseOption(next, next.pendingEvent, option).ok) {
      next = resolveEvent(next, next.pendingEvent, option);
    }
  }
  if (next.act >= 2 && !next.doctrine) next = chooseDoctrine(next, doctrine);
  const projectId = pickProject(next, style);
  const reserve = birdsToReserve(next, projectId);
  next = assignTargets(next, weightsFor(next), reserve);
  if (!next.active && projectId && canStart(next, projectId).ok) {
    return startProject(next, projectId);
  }
  if (style === "attentive") next = maybeBuyTech(next, projectId);
  return next;
}

function chooseOption(state: GameState, eventId: string): string | null {
  const preference: Record<string, string[]> = {
    "summer-gale": state.resources.seeds > 80 ? ["ride", "brace"] : ["brace", "ride"],
    "night-frost": state.resources.twigs > 30 ? ["burn", "huddle"] : ["huddle", "burn"],
    "garden-treaty": ["study", "accept"],
    cuckoo: state.resources.knowledge > 40 ? ["drive", "tolerate"] : ["tolerate", "drive"],
    "song-school": ["hunt", "build"],
    "civic-doubt": state.resources.knowledge > 80 ? ["congress", "leave"] : ["leave", "congress"],
    "storm-year": state.resources.seeds > 400 ? ["open", "hold"] : ["hold", "open"],
    "rival-aerie": ["ally", "contest"],
    "quiet-signal": state.resources.starlight > 40 ? ["follow", "archive"] : ["archive", "follow"],
    headwind: ["wait", "burn"],
    "last-ground": ["sanctuary", "harvest"],
  };
  const order = preference[eventId] ?? [];
  for (const option of order) {
    if (canChooseOption(state, eventId, option).ok) return option;
  }
  return order[0] ?? null;
}

function pickProject(state: GameState, style: Style): string | null {
  if (!state.flags.includes("seed-cache")) return "seed-cache";
  if (!state.flags.includes("first-nest")) return "first-nest";
  if (!state.flags.includes("survey")) return "survey";
  if ((state.counts.nest ?? 0) < 2) return "nest";
  if (!state.flags.includes("roost")) return "roost";

  if (state.act === 2) {
    if ((state.counts.archive ?? 0) < 1) return "archive";
    if (state.flock < 16 && getCapacity(state) < 16.5) return "nest";
    if (state.flock + 0.05 < 16 && state.flock + 3 <= getCapacity(state) + 0.01) return "brood";
    if (state.doctrine && state.flock >= 16) return "council";
    return null;
  }

  if (state.act === 3) {
    if ((state.counts.beacon ?? 0) < 2) return "beacon";
    if (state.flock < 24 && getCapacity(state) < state.flock + 1 && (state.counts.nest ?? 0) < 6) {
      return "nest";
    }
    if (state.flock + 0.05 < 24 && state.flock + 3 <= getCapacity(state) + 0.01) return "brood";
    if (state.flock >= 24) return "accord";
    return null;
  }

  if (state.act >= 4 && !state.won) {
    if (state.systems < 6) {
      const scans = state.counts.scan ?? 0;
      const scanReady = scans < 4 && canAfford(state, "scan");
      const arkReady = canAfford(state, "ark");
      if (style === "stingy") return scans < 4 ? "scan" : "ark";
      if (arkReady && (state.counts.ark ?? 0) < 2 && state.resources.seeds > 900) return "ark";
      if (scanReady) return "scan";
      return scans < 4 ? "scan" : "ark";
    }
    if (state.flock + 0.05 < 32) {
      if (getCapacity(state) < state.flock + 1 && (state.counts.nest ?? 0) < 8) return "nest";
      if (state.flock + 3 <= getCapacity(state) + 0.01) return "brood";
      return null;
    }
    return "murmur";
  }
  return null;
}

function birdsToReserve(state: GameState, projectId: string | null): number {
  if (!projectId || state.active) return 0;
  const project = projectById(projectId);
  if (!project) return 0;
  if (!canPay(state, project)) return 0;
  const blocked = project.blocked?.(state);
  if (blocked) return 0;
  return project.birds;
}

function canAfford(state: GameState, projectId: string): boolean {
  const project = projectById(projectId);
  if (!project) return false;
  return canPay(state, project);
}

function canPay(state: GameState, project: ProjectDef): boolean {
  const costs = project.costs(state);
  return (Object.entries(costs) as Array<[ResourceId, number]>).every(
    ([key, value]) => state.resources[key] >= value,
  );
}

function maybeBuyTech(state: GameState, projectId: string | null): GameState {
  const project = projectId ? projectById(projectId) : undefined;
  const goal = project?.costs(state) ?? {};
  const priority = [
    "woven-baskets",
    "seed-ledgers",
    "roost-logistics",
    "collective-memory",
    "communal-hatcheries",
    "civic-murmuration",
    "heliography",
    "fat-stores",
    "range-equation",
    "reserve-granaries",
  ];
  for (const techId of priority) {
    if (!canBuyTech(state, techId)) continue;
    const tech = TECHS.find((item) => item.id === techId)?.cost;
    if (!tech) continue;
    if (!keepsBank(state, tech, goal)) continue;
    return buyTech(state, techId);
  }
  return state;
}

function keepsBank(
  state: GameState,
  cost: Partial<Record<ResourceId, number>>,
  goal: Partial<Record<ResourceId, number>>,
): boolean {
  for (const key of ["seeds", "twigs", "knowledge", "influence", "starlight"] as ResourceId[]) {
    const after = state.resources[key] - (cost[key] ?? 0);
    if (after < (goal[key] ?? 0) * 0.85) return false;
  }
  return true;
}

function weightsFor(state: GameState): Partial<Record<RoleId, number>> {
  if (!state.flags.includes("seed-cache")) return { foragers: 1 };
  if (!state.flags.includes("first-nest")) return { foragers: 1, weavers: 1 };
  if (!state.flags.includes("survey")) return { foragers: 2, weavers: 1 };
  if (state.act === 1) return { foragers: 3, weavers: 2, scouts: 1 };
  if (state.act === 2) return { foragers: 4, weavers: 2, scouts: 1, broodkeepers: 2, scholars: 2 };
  if (state.act === 3) {
    return { foragers: 5, weavers: 3, broodkeepers: 2, scholars: 2, envoys: 3 };
  }
  return { foragers: 6, weavers: 3, broodkeepers: 2, scholars: 2, envoys: 1, navigators: 3 };
}

function assignTargets(
  state: GameState,
  weights: Partial<Record<RoleId, number>>,
  reserve: number,
): GameState {
  const available = Math.max(
    0,
    Math.floor(state.flock + 1e-6) - (state.active?.birds ?? 0) - reserve,
  );
  const desired = blankRoles();
  const entries = ROLE_ORDER.filter((role) => (weights[role] ?? 0) > 0);
  const total = entries.reduce((sum, role) => sum + (weights[role] ?? 0), 0) || 1;
  let used = 0;
  for (const role of entries) {
    const amount = Math.floor((available * (weights[role] ?? 0)) / total);
    desired[role] = amount;
    used += amount;
  }
  desired.foragers += Math.max(0, available - used);
  let guard = 50;
  while (guard > 0 && previewSeeds(state, desired) < 0.04) {
    guard -= 1;
    const donor = [...entries].reverse().find((role) => role !== "foragers" && desired[role] > 0);
    if (!donor) break;
    desired[donor] -= 1;
    desired.foragers += 1;
  }
  return applyDesired(state, desired);
}

function previewSeeds(state: GameState, roles: Record<RoleId, number>): number {
  return calculateRates({ ...state, roles }).seeds;
}

function applyDesired(state: GameState, desired: Record<RoleId, number>): GameState {
  let next = state;
  for (const role of ROLE_ORDER) {
    while (next.roles[role] > desired[role]) {
      const updated = assignRole(next, role, -1);
      if (updated === next) break;
      next = updated;
    }
  }
  for (const role of ROLE_ORDER) {
    while (next.roles[role] < desired[role] && getIdleBirds(next) >= 1) {
      const updated = assignRole(next, role, 1);
      if (updated === next) break;
      next = updated;
    }
  }
  return next;
}

function blankRoles(): Record<RoleId, number> {
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

export interface PlayResult {
  state: GameState;
  times: Record<string, number>;
  steps: number;
}

const MILESTONES: Array<[string, (state: GameState) => boolean]> = [
  ["cache", (state) => state.flags.includes("seed-cache")],
  ["nest", (state) => state.flags.includes("first-nest")],
  ["survey", (state) => state.flags.includes("survey")],
  ["roost", (state) => state.flags.includes("roost")],
  ["council", (state) => state.flags.includes("council")],
  ["accord", (state) => state.flags.includes("accord")],
  ["win", (state) => state.won],
];

export function play(
  state: GameState,
  style: Style,
  doctrine: DoctrineId,
  maxSeconds = 10 * 3600,
): PlayResult {
  const times: Record<string, number> = {};
  let current = state;
  let steps = 0;
  let progressAt = 0;
  let signature = snapshot(current);
  const maxSteps = 40_000;
  while (!current.won && current.elapsed < maxSeconds && steps < maxSteps) {
    steps += 1;
    const acted = step(current, style, doctrine);
    if (acted !== current) {
      current = acted;
      note(times, current);
      signature = snapshot(current);
      progressAt = current.elapsed;
      continue;
    }
    if (current.active) progressAt = current.elapsed;
    const before = current.elapsed;
    current = tickSafe(current, 20);
    note(times, current);
    const nextSignature = snapshot(current);
    if (nextSignature !== signature) {
      signature = nextSignature;
      progressAt = current.elapsed;
    } else if (current.elapsed - progressAt > 45 * 60) {
      throw new Error(`stalled at ${current.elapsed.toFixed(0)}s\n${describe(current)}`);
    }
    if (current.elapsed <= before) throw new Error("simulated time stopped");
  }
  note(times, current);
  return { state: current, times, steps };
}

function tickSafe(state: GameState, seconds: number): GameState {
  return tick(state, seconds);
}

function note(times: Record<string, number>, state: GameState): void {
  for (const [name, ready] of MILESTONES) {
    if (times[name] === undefined && ready(state)) times[name] = state.elapsed;
  }
}

function snapshot(state: GameState): string {
  return [
    state.act,
    state.flags.join(","),
    JSON.stringify(state.counts),
    state.techs.join(","),
    state.systems,
    Math.floor(state.flock),
    Math.floor(state.resources.seeds),
    Math.floor(state.resources.twigs),
    Math.floor(state.resources.knowledge),
    Math.floor(state.resources.influence),
    Math.floor(state.resources.starlight),
    state.active?.id ?? "",
    state.pendingEvent ?? "",
    state.won ? "1" : "0",
  ].join("|");
}

export function describe(state: GameState): string {
  const rates = calculateRates(state);
  return [
    `act ${state.act} elapsed ${state.elapsed.toFixed(0)} won ${state.won}`,
    `resources ${JSON.stringify(state.resources)}`,
    `rates ${JSON.stringify(rates)}`,
    `flock ${state.flock.toFixed(1)} cap ${getCapacity(state)} idle ${getIdleBirds(state)}`,
    `roles ${JSON.stringify(state.roles)}`,
    `counts ${JSON.stringify(state.counts)} systems ${state.systems} routes ${state.routes}`,
    `flags ${state.flags.join(",")}`,
    `techs ${state.techs.join(",")}`,
    `active ${state.active?.id ?? "none"} pending ${state.pendingEvent ?? "none"}`,
    `objective waiting on stores or birds`,
    state.logs
      .slice(-8)
      .map((entry) => entry.text)
      .join("\n"),
  ].join("\n");
}
