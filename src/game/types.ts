export const SAVE_VERSION = 2;

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

export type SeasonId = "sunlit" | "crosswind" | "rain" | "dearth";

export interface Resources {
  seeds: number;
  twigs: number;
  knowledge: number;
  influence: number;
  starlight: number;
}

export interface ActiveProject {
  id: string;
  /** Remaining work-seconds. Wall time is this divided by expedition speed. */
  remaining: number;
  duration: number;
  birds: number;
}

export interface TimedEffect {
  id: string;
  until: number;
}

export interface GameLog {
  id: number;
  at: number;
  text: string;
  tone?: "good" | "warning" | "story";
}

export interface OfflineReport {
  seconds: number;
  capped: boolean;
  gained: Partial<Resources>;
  flockGained: number;
  finished: string[];
  eventsWaiting: number;
}

export interface GameState {
  version: number;
  act: Act;
  actStartedAt: number;
  elapsed: number;
  lastTickAt: number;
  paused: boolean;
  resources: Resources;
  flock: number;
  roles: Record<RoleId, number>;
  counts: Record<string, number>;
  flags: string[];
  routes: number;
  systems: number;
  morale: number;
  doctrine: DoctrineId | null;
  doctrineChanges: number;
  techs: string[];
  cooldowns: Record<string, number>;
  active: ActiveProject | null;
  pendingEvent: string | null;
  eventQueue: string[];
  seenEvents: string[];
  effects: TimedEffect[];
  logs: GameLog[];
  logSeq: number;
  won: boolean;
  marks: number;
  ranks: Record<string, number>;
  migrations: number;
  wins: number;
  doctrinesWon: DoctrineId[];
  bestTime: number | null;
  offlineReport: OfflineReport | null;
}

export interface Rates extends Resources {
  population: number;
  upkeep: number;
}

export interface RunMeta {
  marks: number;
  ranks: Record<string, number>;
  migrations: number;
  wins: number;
  doctrinesWon: DoctrineId[];
  bestTime: number | null;
}
