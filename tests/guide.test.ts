import { describe, expect, it } from "vitest";

import { createInitialState, migrate } from "../src/game/engine";
import {
  INTRO_BEATS,
  currentTip,
  dismissTip,
  eventTip,
  finishIntro,
  replayIntro,
  skipAllTips,
  tabAccess,
} from "../src/game/guide";
import { checksumOf, decodeSave, encodeSave, loadGame, saveGame, type KeyValueStore } from "../src/game/save";
import type { GameState } from "../src/game/types";

class MemoryStore implements KeyValueStore {
  readonly map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

describe("opening", () => {
  it("shows the intro on a fresh save and not after a reload", () => {
    const store = new MemoryStore();
    const now = 1_000_000;
    const first = loadGame(store, now);
    expect(first.state.notebook.intro).toBe("pending");
    expect(INTRO_BEATS.length).toBeGreaterThanOrEqual(3);
    expect(INTRO_BEATS.map((beat) => beat.body).join(" ")).toMatch(/tree|canopy/i);
    expect(INTRO_BEATS.map((beat) => beat.body).join(" ")).toMatch(/leave|outgrows|heading/i);

    saveGame(store, finishIntro(first.state), now);
    const again = loadGame(store, now + 20_000);
    expect(again.state.notebook.intro).toBe("done");
  });

  it("can skip the intro and every tip", () => {
    const store = new MemoryStore();
    const now = 2_000_000;
    const skipped = skipAllTips(createInitialState(now));
    expect(skipped.notebook.intro).toBe("done");
    expect(skipped.notebook.quiet).toBe(true);
    expect(currentTip(skipped, "plans")).toBeNull();
    expect(currentTip(skipped, "flock")).toBeNull();
    saveGame(store, skipped, now);
    const loaded = loadGame(store, now + 5_000);
    expect(loaded.state.notebook.quiet).toBe(true);
    expect(loaded.state.notebook.intro).toBe("done");
    expect(currentTip(loaded.state, "plans")).toBeNull();
  });

  it("replays only the opening", () => {
    let state = dismissTip(finishIntro(createInitialState(0)), "plans");
    state = replayIntro(state);
    expect(state.notebook.intro).toBe("pending");
    expect(state.notebook.seen).toContain("plans");
    state = finishIntro(state);
    expect(currentTip(state, "plans")).toBeNull();
    expect(currentTip(state, "flock")?.id).toBe("staffing");
  });

  it("unlocks tabs as the expedition advances and introduces each one once", () => {
    const fresh = finishIntro(createInitialState(0));
    expect(tabAccess(fresh, "plans").open).toBe(true);
    expect(tabAccess(fresh, "flock").open).toBe(true);
    expect(tabAccess(fresh, "world").open).toBe(false);
    expect(tabAccess(fresh, "log").open).toBe(false);
    expect(tabAccess(fresh, "study").open).toBe(false);
    expect(currentTip(fresh, "plans")?.id).toBe("plans");
    expect(currentTip(fresh, "flock")?.id).toBe("staffing");
    expect(currentTip(fresh, "world")).toBeNull();

    const cached: GameState = { ...fresh, flags: ["seed-cache"] };
    expect(tabAccess(cached, "world").open).toBe(true);
    expect(tabAccess(cached, "log").open).toBe(true);
    expect(tabAccess(cached, "study").open).toBe(false);
    expect(currentTip(dismissTip(cached, "plans"), "world")?.id).toBe("seasons");
    expect(currentTip(cached, "log")?.id).toBe("log");

    const nested: GameState = { ...cached, flags: ["seed-cache", "first-nest"] };
    expect(tabAccess(nested, "study").open).toBe(true);
    expect(currentTip(nested, "study")?.id).toBe("study");

    const aerie: GameState = { ...nested, act: 2, flags: [...nested.flags, "survey", "roost"] };
    const studying = dismissTip(aerie, "study");
    expect(currentTip(studying, "study")?.id).toBe("doctrine");
    const leaving = dismissTip(dismissTip(studying, "doctrine"), "plans");
    expect(currentTip(leaving, "plans")?.id).toBe("migration");

    const choosing: GameState = { ...fresh, pendingEvent: "garden-treaty" };
    expect(eventTip(choosing)?.id).toBe("events");
    expect(eventTip(skipAllTips(choosing))).toBeNull();
  });

  it("keeps a dismissed opening across a version-2 notebook", () => {
    const now = 3_000_000;
    const played = finishIntro(createInitialState(now));
    played.elapsed = 40;
    played.flags = ["seed-cache"];
    const encoded = JSON.parse(encodeSave(played, now)) as {
      version: number;
      state: GameState;
      checksum: string;
    };
    encoded.version = 2;
    delete (encoded.state as Partial<GameState>).notebook;
    encoded.checksum = checksumOf(encoded.state);
    const decoded = decodeSave(JSON.stringify(encoded), now);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.migrated).toBe(true);
      expect(decoded.state.notebook.intro).toBe("done");
      expect(decoded.state.notebook.quiet).toBe(true);
      expect(currentTip(decoded.state, "plans")).toBeNull();
    }
  });

  it("does not replay the opening after a migration", () => {
    const won = {
      ...finishIntro(createInitialState(0)),
      won: true,
      act: 5 as const,
      doctrine: "ingenuity" as const,
      notebook: { intro: "done" as const, seen: ["plans", "migration"], quiet: true },
    };
    const next = migrate(won, 10, {});
    expect(next.ok).toBe(true);
    if (next.ok) {
      expect(next.state.notebook.intro).toBe("done");
      expect(next.state.notebook.quiet).toBe(true);
      expect(next.state.notebook.seen).toEqual(["plans", "migration"]);
    }
  });
});
