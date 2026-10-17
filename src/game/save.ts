import { createInitialState, catchUp } from "./engine";
import { notebookForOlderSave } from "./guide";
import { clampResource } from "./number";
import {
  SAVE_VERSION,
  type DoctrineId,
  type GameState,
  type ResourceId,
  type RoleId,
} from "./types";

export const SAVE_KEY = "bve.campaign";
export const BACKUP_KEY = "bve.campaign.backup";
export const QUARANTINE_KEY = "bve.campaign.quarantine";

/** Browser keys from builds before this campaign. Deleted on load, never read. */
export const OBSOLETE_SAVE_KEYS = ["birds-vs-everything-v3", "birdGameSave"] as const;

const MAX_SAVE_CHARS = 120_000;
const ROLES: RoleId[] = [
  "foragers",
  "weavers",
  "scouts",
  "broodkeepers",
  "scholars",
  "envoys",
  "navigators",
];
const RESOURCES: ResourceId[] = ["seeds", "twigs", "knowledge", "influence", "starlight"];
const DOCTRINES: DoctrineId[] = ["stewardship", "ingenuity", "wanderlust"];

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveEnvelope {
  version: number;
  checksum: string;
  savedAt: number;
  state: unknown;
}

export type DecodeResult =
  | { ok: true; state: GameState; migrated: boolean }
  | { ok: false; error: string };

export interface LoadResult {
  state: GameState;
  note: string | null;
  quarantined: boolean;
}

export function checksumOf(value: unknown): string {
  const text = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function encodeSave(state: GameState, savedAt = Date.now()): string {
  const payload = stateForDisk(state);
  const envelope: SaveEnvelope = {
    version: SAVE_VERSION,
    checksum: checksumOf(payload),
    savedAt,
    state: payload,
  };
  return JSON.stringify(envelope, null, 2);
}

export function decodeSave(raw: string, now: number): DecodeResult {
  if (typeof raw !== "string" || raw.length === 0) {
    return { ok: false, error: "The save was empty." };
  }
  if (raw.length > MAX_SAVE_CHARS) {
    return { ok: false, error: "That save is too large to be a flock notebook." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That text is not valid JSON." };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "The save was not an object." };
  }
  const envelope = parsed as Partial<SaveEnvelope>;
  if (typeof envelope.checksum !== "string" || !("state" in envelope)) {
    return { ok: false, error: "The save is missing its checksum. Paste the export unchanged." };
  }
  if (checksumOf(envelope.state) !== envelope.checksum) {
    return {
      ok: false,
      error: "The checksum does not match. Paste the export unchanged.",
    };
  }
  const version = envelope.version;
  if (version !== 1 && version !== 2 && version !== 3) {
    return {
      ok: false,
      error: `This save is version ${String(version)}, which this notebook cannot read. It was not applied.`,
    };
  }
  const migrated = upgradePayload(envelope.state, version);
  if (!migrated.ok) return migrated;
  const normalized = normalizeState(migrated.value, now);
  if (!normalized.ok) return normalized;
  return { ok: true, state: normalized.state, migrated: version !== SAVE_VERSION };
}

export function saveGame(store: KeyValueStore, state: GameState, now = Date.now()): void {
  const existing = store.getItem(SAVE_KEY);
  if (existing && decodeSave(existing, now).ok) {
    store.setItem(BACKUP_KEY, existing);
  }
  store.setItem(SAVE_KEY, encodeSave(state, now));
}

export function discardObsoleteSaves(store: KeyValueStore): void {
  for (const key of OBSOLETE_SAVE_KEYS) {
    if (store.getItem(key) !== null) store.removeItem(key);
  }
}

export function loadGame(store: KeyValueStore, now = Date.now()): LoadResult {
  discardObsoleteSaves(store);
  const primary = store.getItem(SAVE_KEY);
  if (!primary) {
    return {
      state: createInitialState(now),
      note: null,
      quarantined: false,
    };
  }
  const decoded = decodeSave(primary, now);
  if (decoded.ok) {
    const caught = wake(decoded.state, now);
    const migrationNote = decoded.migrated
      ? "An older notebook was brought forward to this version."
      : null;
    return {
      state: caught,
      note: migrationNote,
      quarantined: false,
    };
  }
  quarantine(store, primary);
  const backup = store.getItem(BACKUP_KEY);
  if (backup) {
    const restored = decodeSave(backup, now);
    if (restored.ok) {
      return {
        state: wake(restored.state, now),
        note: "The latest save could not be read. The backup was restored, and the broken copy was quarantined.",
        quarantined: true,
      };
    }
    quarantine(store, backup);
  }
  return {
    state: createInitialState(now),
    note: `${decoded.error} The unreadable save was quarantined and a new expedition was started.`,
    quarantined: true,
  };
}

export function describeImport(state: GameState): string {
  const hours = Math.floor(state.elapsed / 3600);
  const minutes = Math.floor((state.elapsed % 3600) / 60);
  return `Act ${state.act} · ${Math.floor(state.flock)} birds · ${state.wins} win${state.wins === 1 ? "" : "s"} · ${state.marks} marks · ${hours}h ${minutes}m in the field`;
}

function quarantine(store: KeyValueStore, raw: string): void {
  const previous = store.getItem(QUARANTINE_KEY);
  const entry = JSON.stringify({ at: Date.now(), raw });
  const combined = previous ? `${entry}\n${previous}` : entry;
  store.setItem(QUARANTINE_KEY, combined.slice(0, MAX_SAVE_CHARS * 2));
}

function stateForDisk(state: GameState): GameState {
  return {
    ...state,
    version: SAVE_VERSION,
    resources: { ...state.resources },
    roles: { ...state.roles },
    counts: { ...state.counts },
    flags: [...state.flags],
    ranks: { ...state.ranks },
    techs: [...state.techs],
    seenEvents: [...state.seenEvents],
    eventQueue: [...state.eventQueue],
    effects: state.effects.map((effect) => ({ ...effect })),
    logs: state.logs.map((entry) => ({ ...entry })),
    notebook: {
      intro: state.notebook.intro,
      seen: [...state.notebook.seen],
      quiet: state.notebook.quiet,
    },
    doctrinesWon: [...state.doctrinesWon],
    cooldowns: { ...state.cooldowns },
    active: state.active ? { ...state.active } : null,
    offlineReport: state.offlineReport
      ? { ...state.offlineReport, gained: { ...state.offlineReport.gained } }
      : null,
  };
}

function upgradePayload(
  value: unknown,
  version: number,
): { ok: true; value: unknown } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "The save state was not an object." };
  }
  const data = value as Record<string, unknown>;
  if (version === 1) {
    const ranks: Record<string, number> = {};
    if (Array.isArray(data.upgrades)) {
      for (const item of data.upgrades) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        if (typeof record.id === "string" && typeof record.rank === "number") {
          ranks[record.id] = record.rank;
        }
      }
    }
    const existing =
      data.ranks && typeof data.ranks === "object" && !Array.isArray(data.ranks)
        ? (data.ranks as Record<string, number>)
        : {};
    const merged = Object.keys(existing).length > 0 ? existing : ranks;
    return {
      ok: true,
      value: {
        ...data,
        version: SAVE_VERSION,
        ranks: merged,
        eventQueue: Array.isArray(data.eventQueue) ? data.eventQueue : [],
      },
    };
  }
  return { ok: true, value: data };
}

function normalizeState(
  value: unknown,
  now: number,
): { ok: true; state: GameState } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "The save state was not an object." };
  }
  const data = value as Record<string, unknown>;
  const base = createInitialState(now);
  const act = data.act;
  if (act !== 1 && act !== 2 && act !== 3 && act !== 4 && act !== 5) {
    return { ok: false, error: "The save has no recognizable act." };
  }
  const elapsed = finite(data.elapsed);
  if (elapsed === null || elapsed < 0 || elapsed > 60 * 60 * 24 * 365 * 20) {
    return { ok: false, error: "The save's field time is damaged." };
  }
  const flock = finite(data.flock);
  if (flock === null || flock < 0 || flock > 1_000_000) {
    return { ok: false, error: "The save's flock count is damaged." };
  }
  const resources = readResources(data.resources);
  if (!resources) return { ok: false, error: "The save's stores are damaged." };
  const roles = readRoles(data.roles);
  if (!roles) return { ok: false, error: "The save's roles are damaged." };
  const doctrine = data.doctrine;
  if (doctrine !== null && doctrine !== undefined && !DOCTRINES.includes(doctrine as DoctrineId)) {
    return { ok: false, error: "The save's doctrine is not one this flock knows." };
  }
  const flags = readStrings(data.flags, 300);
  const techs = readStrings(data.techs, 40);
  const seenEvents = readStrings(data.seenEvents, 40);
  const eventQueue = readStrings(data.eventQueue, 8);
  if (!flags || !techs || !seenEvents || !eventQueue) {
    return { ok: false, error: "The save's notes are damaged." };
  }
  const counts = readNumberRecord(data.counts, 40);
  const ranks = readNumberRecord(data.ranks, 20);
  const cooldowns = readNumberRecord(data.cooldowns, 20);
  if (!counts || !ranks || !cooldowns) {
    return { ok: false, error: "The save's counts are damaged." };
  }
  const marks = finite(data.marks) ?? 0;
  const migrations = finite(data.migrations) ?? 0;
  const wins = finite(data.wins) ?? 0;
  if (marks < 0 || marks > 10_000 || migrations < 0 || wins < 0) {
    return { ok: false, error: "The save's flyway record is damaged." };
  }
  const doctrinesWon = readStrings(data.doctrinesWon, 4);
  if (!doctrinesWon || doctrinesWon.some((item) => !DOCTRINES.includes(item as DoctrineId))) {
    return { ok: false, error: "The save's past doctrines are damaged." };
  }
  const lastTickAt = finite(data.lastTickAt);
  const logs = readLogs(data.logs);
  const active = readActive(data.active);
  if (active === "bad") return { ok: false, error: "The save's active expedition is damaged." };
  const pending = data.pendingEvent;
  if (pending !== null && pending !== undefined && typeof pending !== "string") {
    return { ok: false, error: "The save's open choice is damaged." };
  }

  const state: GameState = {
    ...base,
    version: SAVE_VERSION,
    act,
    actStartedAt: Math.min(elapsed, Math.max(0, finite(data.actStartedAt) ?? 0)),
    elapsed,
    lastTickAt: lastTickAt && lastTickAt > 0 && lastTickAt <= now + 1000 ? lastTickAt : now,
    paused: data.paused === true,
    resources,
    flock,
    roles,
    counts,
    flags,
    routes: clampCount(finite(data.routes) ?? 0, 100),
    systems: clampCount(finite(data.systems) ?? 0, 100),
    morale: Math.min(1, Math.max(0.5, finite(data.morale) ?? 0.84)),
    doctrine: (doctrine as DoctrineId | null) ?? null,
    doctrineChanges: clampCount(finite(data.doctrineChanges) ?? 0, 5),
    techs,
    cooldowns,
    active,
    pendingEvent: typeof pending === "string" ? pending : null,
    eventQueue,
    seenEvents,
    effects: readEffects(data.effects),
    logs: logs ?? base.logs,
    logSeq: clampCount(finite(data.logSeq) ?? logs?.at(-1)?.id ?? 1, 1_000_000),
    won: data.won === true,
    marks,
    ranks,
    migrations,
    wins,
    doctrinesWon: doctrinesWon as DoctrineId[],
    bestTime: finite(data.bestTime),
    offlineReport: null,
    notebook: readNotebook(data),
  };
  if (state.won) state.act = 5;
  return { ok: true, state };
}

function wake(state: GameState, now: number): GameState {
  if (state.notebook.intro === "pending") {
    return { ...state, lastTickAt: now, offlineReport: null };
  }
  return catchUp(state, now, { enqueueEvents: true });
}

function readNotebook(data: Record<string, unknown>): GameState["notebook"] {
  const raw = data.notebook;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const record = raw as Record<string, unknown>;
    const seen = Array.isArray(record.seen)
      ? record.seen.filter((item): item is string => typeof item === "string").slice(0, 40)
      : [];
    return {
      intro: record.intro === "pending" ? "pending" : "done",
      seen,
      quiet: record.quiet === true,
    };
  }
  const elapsed = finite(data.elapsed) ?? 0;
  const flags = Array.isArray(data.flags) ? data.flags.length : 0;
  const act = data.act;
  const progressed =
    elapsed > 0 ||
    flags > 0 ||
    act === 2 ||
    act === 3 ||
    act === 4 ||
    act === 5 ||
    (finite(data.migrations) ?? 0) > 0 ||
    (finite(data.wins) ?? 0) > 0 ||
    data.won === true ||
    (Array.isArray(data.techs) && data.techs.length > 0) ||
    (typeof data.doctrine === "string");
  return notebookForOlderSave(progressed);
}

function finite(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function clampCount(value: number, max: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(max, value);
}

function readResources(value: unknown): GameState["resources"] | null {
  const empty = { seeds: 0, twigs: 0, knowledge: 0, influence: 0, starlight: 0 };
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of RESOURCES) {
    const amount = finite(record[key]);
    if (amount === null || amount < 0 || amount > 1e15) return null;
    empty[key] = clampResource(amount);
  }
  return empty;
}

function readRoles(value: unknown): GameState["roles"] | null {
  const roles = {
    foragers: 0,
    weavers: 0,
    scouts: 0,
    broodkeepers: 0,
    scholars: 0,
    envoys: 0,
    navigators: 0,
  };
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of ROLES) {
    const amount = finite(record[key]);
    if (amount === null || amount < 0 || amount > 1_000_000 || !Number.isInteger(amount)) return null;
    roles[key] = amount;
  }
  return roles;
}

function readStrings(value: unknown, max: number): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > max) return null;
  if (!value.every((item) => typeof item === "string" && item.length < 80)) return null;
  return value;
}

function readNumberRecord(value: unknown, max: number): Record<string, number> | null {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > max) return null;
  const result: Record<string, number> = {};
  for (const [key, amount] of entries) {
    if (key.length > 40) return null;
    const parsed = finite(amount);
    if (parsed === null || parsed < 0 || parsed > 1_000_000) return null;
    result[key] = parsed;
  }
  return result;
}

function readLogs(value: unknown): GameState["logs"] | null {
  if (!Array.isArray(value)) return null;
  const logs: GameState["logs"] = [];
  for (const item of value.slice(-80)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.text !== "string" || typeof record.id !== "number") continue;
    const tone = record.tone;
    logs.push({
      id: record.id,
      at: finite(record.at) ?? 0,
      text: record.text.slice(0, 400),
      tone: tone === "good" || tone === "warning" || tone === "story" ? tone : undefined,
    });
  }
  return logs;
}

function readEffects(value: unknown): GameState["effects"] {
  if (!Array.isArray(value)) return [];
  const effects: GameState["effects"] = [];
  for (const item of value.slice(0, 12)) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string") continue;
    const until = finite(record.until);
    if (until === null) continue;
    effects.push({ id: record.id.slice(0, 40), until });
  }
  return effects;
}

function readActive(value: unknown): GameState["active"] | "bad" {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") return "bad";
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string") return "bad";
  const remaining = finite(record.remaining);
  const duration = finite(record.duration);
  const birds = finite(record.birds);
  if (remaining === null || duration === null || birds === null) return "bad";
  if (remaining < 0 || duration < 0 || birds < 0 || birds > 100) return "bad";
  return { id: record.id.slice(0, 40), remaining, duration, birds };
}
