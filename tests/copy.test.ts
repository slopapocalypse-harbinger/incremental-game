import { describe, expect, it } from "vitest";

import contentSource from "../src/game/content.ts?raw";
import voiceSource from "../src/game/voice.ts?raw";
import { createInitialState, chooseDoctrine, startProject, tick } from "../src/game/engine";
import { DOCTRINES, EVENTS, PROJECTS, SEASONS } from "../src/game/content";
import { INTRO_BEATS } from "../src/game/guide";
import {
  doctrineRemark,
  eventRemark,
  introRemark,
  isBirdLine,
  planFlavor,
  projectRemark,
  remarkVariants,
  repeatRemark,
  roleArrival,
  seasonRemark,
} from "../src/game/voice";
import type { GameState } from "../src/game/types";

const WORD_CAP = 14;

function words(line: string): string[] {
  return line.trim().split(/\s+/).filter(Boolean);
}

function sourceStrings(source: string): string[] {
  const out: string[] = [];
  for (const match of source.matchAll(/"((?:\\.|[^"\\])*)"/g)) {
    out.push(JSON.parse(`"${match[1]}"`) as string);
  }
  for (const match of source.matchAll(/`((?:\\.|[^`\\])*)`/g)) {
    out.push(match[1] ?? "");
  }
  return out;
}

function finish(state: GameState, id: string): GameState {
  const started = startProject(
    {
      ...state,
      resources: { seeds: 8000, twigs: 4000, knowledge: 4000, influence: 2000, starlight: 2000 },
      flock: Math.max(state.flock, 40),
      roles: { ...state.roles, foragers: 2 },
    },
    id,
  );
  if (!started.active) return started;
  return tick(started, started.active.duration * 3 + 5, { enqueueEvents: false });
}

function expectUnstacked(logs: GameState["logs"]): void {
  for (let i = 1; i < logs.length; i += 1) {
    const previous = logs[i - 1]?.text ?? "";
    const current = logs[i]?.text ?? "";
    expect(isBirdLine(previous) && isBirdLine(current), `${previous} || ${current}`).toBe(false);
  }
}

describe("copy", () => {
  it("keeps every voice line in voice.ts and content.ts to 14 words", () => {
    expect(voiceSource.includes("`")).toBe(false);
    const voiceLines = sourceStrings(voiceSource).filter((line) => line.includes(" ") || line.includes(":"));
    expect(voiceLines.length).toBeGreaterThan(40);
    for (const line of voiceLines) {
      expect(words(line).length, line).toBeLessThanOrEqual(WORD_CAP);
    }
    const spoken = sourceStrings(contentSource).filter((line) => /\b(Pip|Bram|Nell|Quill):/.test(line));
    for (const line of spoken) {
      expect(words(line).length, line).toBeLessThanOrEqual(WORD_CAP);
    }
    const runtime = [
      ...PROJECTS.flatMap((project) => [
        planFlavor(project.id),
        projectRemark(project.id),
        ...remarkVariants(project.id),
        repeatRemark(project.id, 1),
        repeatRemark(project.id, 2),
        repeatRemark(project.id, 3),
      ]),
      ...EVENTS.map((event) => eventRemark(event.id)),
      ...DOCTRINES.map((doctrine) => doctrineRemark(doctrine.id)),
      ...SEASONS.map((season) => seasonRemark(season.id)),
      ...INTRO_BEATS.map((beat) => introRemark(beat.id)),
      roleArrival("weavers"),
      roleArrival("scouts"),
      roleArrival("broodkeepers"),
      roleArrival("scholars"),
      roleArrival("envoys"),
      roleArrival("navigators"),
    ];
    for (const line of runtime) {
      expect(words(line).length, line).toBeLessThanOrEqual(WORD_CAP);
    }
  });

  it("never shows two bird lines back to back", () => {
    let state = createInitialState(0);
    expectUnstacked(state.logs);
    for (const id of ["seed-cache", "first-nest", "nest", "survey", "roost", "archive", "brood"]) {
      const before = state.logs.length;
      state = finish(state, id);
      expect(state.logs.length, id).toBeLessThanOrEqual(before + 2);
      expectUnstacked(state.logs);
    }
    state = chooseDoctrine(state, "stewardship");
    expectUnstacked(state.logs);

    let rushed = createInitialState(0);
    rushed = finish(rushed, "seed-cache");
    rushed = finish(rushed, "first-nest");
    rushed = { ...rushed, counts: { ...rushed.counts, nest: 2 } };
    rushed = finish(rushed, "survey");
    rushed = finish(rushed, "roost");
    expect(rushed.logs.map((entry) => entry.text).join("\n")).toContain(roleArrival("broodkeepers"));
    expect(rushed.logs.map((entry) => entry.text).join("\n")).toContain(roleArrival("scholars"));
    expectUnstacked(rushed.logs);
  });
});
