import { PROJECTS, SEASONS, count } from "./content";
import { getSeason } from "./engine";
import type { Act, GameState, SeasonId } from "./types";

export type Scenery = "canopy" | "aerie" | "dominion" | "crossing" | "murmuration";

export interface Completion {
  id: string;
  era: boolean;
}

export interface SceneModel {
  season: SeasonId;
  scenery: Scenery;
  /** Birds drawn in the strip, including the one in the air when there is a flyer. */
  birds: number;
  perched: number;
  flyer: boolean;
  nests: number;
  roost: boolean;
  archives: number;
  beacons: number;
  granaries: number;
  academies: number;
  eyries: number;
  solars: number;
  arks: number;
  routes: number;
  stars: number;
  seedHeads: number;
  leaves: number;
  seedfall: boolean;
}

const NEST_CAP = 4;
const ARCHIVE_CAP = 2;
const BEACON_CAP = 3;
const ROUTE_CAP = 4;
const STAR_CAP = 8;

export function visibleFlock(flock: number): { birds: number; perched: number; flyer: boolean } {
  const n = Math.max(0, Math.floor(flock));
  if (n <= 0) return { birds: 0, perched: 0, flyer: false };
  if (n === 1) return { birds: 1, perched: 1, flyer: false };
  const birds = n <= 6 ? n : n <= 12 ? 7 : n <= 20 ? 8 : 9;
  return { birds, perched: birds - 1, flyer: true };
}

export function sceneryFor(act: Act, won: boolean): Scenery {
  if (won || act >= 5) return "murmuration";
  if (act >= 4) return "crossing";
  if (act >= 3) return "dominion";
  return act >= 2 ? "aerie" : "canopy";
}

export function sceneFromState(state: GameState): SceneModel {
  const season = getSeason(state).id;
  const scenery = sceneryFor(state.act, state.won);
  const flock = visibleFlock(state.flock);
  const systems = Math.max(0, Math.floor(state.systems));
  const seedfall = state.effects.some((effect) => effect.id === "seedfall" && effect.until > state.elapsed);
  return {
    season,
    scenery,
    birds: flock.birds,
    perched: flock.perched,
    flyer: flock.flyer,
    nests: Math.min(NEST_CAP, count(state, "nest")),
    roost: state.flags.includes("roost"),
    archives: Math.min(ARCHIVE_CAP, count(state, "archive")),
    beacons: Math.min(BEACON_CAP, count(state, "beacon")),
    granaries: Math.min(2, count(state, "granary")),
    academies: Math.min(2, count(state, "academy")),
    eyries: Math.min(2, count(state, "eyrie")),
    solars: Math.min(2, count(state, "solar")),
    arks: Math.min(3, count(state, "ark")),
    routes: Math.min(ROUTE_CAP, Math.max(0, Math.floor(state.routes))),
    stars: starCount(scenery, systems),
    seedHeads: seedHeadCount(season, seedfall),
    leaves: leafCount(season, scenery),
    seedfall,
  };
}

export function sceneCaption(model: SceneModel): string {
  const season = SEASONS.find((item) => item.id === model.season)?.name ?? "Season";
  const place: Record<Scenery, string> = {
    canopy: "canopy",
    aerie: "aerie",
    dominion: "dominion",
    crossing: "crossing",
    murmuration: "murmuration",
  };
  const birds =
    model.birds === 1 ? "1 goldfinch" : `${model.birds} goldfinches`;
  const bits = [`${season} ${place[model.scenery]}`, birds];
  if (model.nests > 0) bits.push(model.nests === 1 ? "1 nest" : `${model.nests} nests`);
  if (model.roost) bits.push("a roost");
  if (model.archives > 0) bits.push(model.archives === 1 ? "an archive" : `${model.archives} archives`);
  if (model.beacons > 0) bits.push(model.beacons === 1 ? "a beacon" : `${model.beacons} beacons`);
  if (model.arks > 0) bits.push(model.arks === 1 ? "a seed ark" : `${model.arks} seed arks`);
  if (model.stars > 0 && (model.scenery === "crossing" || model.scenery === "murmuration")) {
    bits.push("stars out");
  }
  if (model.seedfall) bits.push("seed falling");
  return `${bits.join(", ")}.`;
}

/**
 * The project that finished between two snapshots, if one did.
 * The first nest also increments the nest count; that is not a second build.
 */
export function newlyCompleted(before: GameState, after: GameState): Completion | null {
  let hit: Completion | null = null;
  for (const project of PROJECTS) {
    if (project.repeatable) {
      const gain = count(after, project.id) - count(before, project.id);
      if (project.id === "nest") {
        const firstLanded = !before.flags.includes("first-nest") && after.flags.includes("first-nest");
        if (gain - (firstLanded ? 1 : 0) > 0) hit = { id: "nest", era: false };
        continue;
      }
      if (gain > 0) hit = { id: project.id, era: false };
      continue;
    }
    if (!before.flags.includes(project.id) && after.flags.includes(project.id)) {
      hit = { id: project.id, era: project.goal };
    }
  }
  return hit;
}

function starCount(scenery: Scenery, systems: number): number {
  if (scenery === "murmuration") return Math.max(6, Math.min(STAR_CAP, systems));
  if (scenery === "crossing") return Math.max(4, Math.min(STAR_CAP, systems));
  return Math.min(STAR_CAP, systems);
}

function seedHeadCount(season: SeasonId, seedfall: boolean): number {
  if (seedfall) return 5;
  if (season === "sunlit") return 4;
  if (season === "crosswind") return 3;
  if (season === "rain") return 2;
  return 1;
}

function leafCount(season: SeasonId, scenery: Scenery): number {
  if (scenery === "murmuration") return 3;
  if (season === "dearth") return 2;
  if (season === "rain") return 4;
  return 6;
}
