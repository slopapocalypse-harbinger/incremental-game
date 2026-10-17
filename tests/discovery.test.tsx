import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ROLE_DEFS } from "../src/game/content";
import { createInitialState, startProject, tick, visibleRoles } from "../src/game/engine";
import {
  acknowledgeArrival,
  finishIntro,
  isNewArrival,
  skipAllTips,
  visibleTabs,
} from "../src/game/guide";
import { SAVE_VERSION } from "../src/game/types";
import { decodeSave, encodeSave } from "../src/game/save";
import type { GameState, RoleId } from "../src/game/types";
import { FlockPanel, StudyPanel } from "../src/ui/panels";
import { roleArrival } from "../src/game/voice";

function rich(state: GameState): GameState {
  return {
    ...state,
    resources: { seeds: 8000, twigs: 4000, knowledge: 4000, influence: 2000, starlight: 2000 },
    flock: Math.max(state.flock, 30),
    roles: { ...state.roles, foragers: 2 },
  };
}

function finish(state: GameState, id: string): GameState {
  const started = startProject(rich(state), id);
  if (!started.active) return started;
  return tick(started, started.active.duration * 3 + 5, { enqueueEvents: false });
}

describe("discovery", () => {
  it("keeps locked tabs and species out of the markup until they unlock", () => {
    const fresh = finishIntro(createInitialState(0));
    const flock = renderToStaticMarkup(
      <FlockPanel game={fresh} active shown freshRoles={[]} apply={() => undefined} />,
    );
    expect(flock).toContain('data-testid="role-foragers"');
    expect(flock).not.toContain("role-weavers");
    expect(flock).not.toContain("role-scouts");
    expect(flock).not.toContain("Opens when");
    expect(flock).not.toContain("???");
    expect(visibleTabs(fresh)).toEqual(["flock", "plans"]);
    expect(visibleRoles(fresh)).toEqual(["foragers"]);

    const cached: GameState = { ...fresh, flags: ["seed-cache"] };
    const opened = renderToStaticMarkup(
      <FlockPanel game={cached} active shown freshRoles={["weavers"]} apply={() => undefined} />,
    );
    expect(opened).toContain('data-testid="role-weavers"');
    expect(opened).toContain('data-testid="new-role-weavers"');
    expect(opened).toContain("reveal");
    expect(opened).not.toContain("role-scouts");
    expect(visibleTabs(cached)).toEqual(["flock", "plans", "world", "log"]);
    expect(visibleRoles(cached)).toEqual(["foragers", "weavers"]);

    const nested: GameState = { ...cached, flags: ["seed-cache", "first-nest"] };
    const study = renderToStaticMarkup(
      <StudyPanel game={nested} active apply={() => undefined} onMigrate={() => undefined} onPlans={() => undefined} />,
    );
    expect(study).toContain("Woven Baskets");
    expect(study).not.toContain("Collective Memory");
    expect(study).not.toContain("Opens in Act");
    expect(study).not.toContain("Migration is closed");
    expect(study).not.toContain("doctrine-stewardship");
    expect(visibleTabs(nested)).toContain("study");

    const aerie: GameState = { ...nested, act: 2, flags: [...nested.flags, "survey", "roost"] };
    const later = renderToStaticMarkup(
      <StudyPanel game={aerie} active apply={() => undefined} onMigrate={() => undefined} onPlans={() => undefined} />,
    );
    expect(later).toContain("Collective Memory");
    expect(later).toContain("doctrine-stewardship");
    expect(later).not.toContain("Heliography");
    expect(later).not.toContain("Opens in Act");
    expect(visibleRoles(aerie)).toEqual([
      "foragers",
      "weavers",
      "scouts",
      "broodkeepers",
      "scholars",
    ]);
  });

  it("clears a new marker on first look and keeps it across a reload", () => {
    expect(SAVE_VERSION).toBe(3);
    let state = finishIntro(createInitialState(0));
    state = { ...state, flags: ["seed-cache"] };
    expect(isNewArrival(state, "tab", "world")).toBe(true);
    expect(isNewArrival(state, "tab", "plans")).toBe(false);
    expect(isNewArrival(state, "role", "weavers")).toBe(true);
    expect(isNewArrival(state, "role", "foragers")).toBe(false);

    state = acknowledgeArrival(state, "tab", "world");
    state = acknowledgeArrival(state, "role", "weavers");
    expect(isNewArrival(state, "tab", "world")).toBe(false);
    expect(isNewArrival(state, "role", "weavers")).toBe(false);
    expect(isNewArrival(state, "tab", "log")).toBe(true);

    const quiet = skipAllTips(state);
    expect(quiet.notebook.seen).toContain("new:tab:world");
    expect(quiet.notebook.seen).toContain("new:role:weavers");
    expect(isNewArrival(quiet, "tab", "world")).toBe(false);

    const decoded = decodeSave(encodeSave(state, 50), 50);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.migrated).toBe(false);
    expect(decoded.state.version).toBe(SAVE_VERSION);
    expect(isNewArrival(decoded.state, "tab", "world")).toBe(false);
    expect(isNewArrival(decoded.state, "role", "weavers")).toBe(false);
    expect(isNewArrival(decoded.state, "tab", "log")).toBe(true);
  });

  it("announces each species in a bird's voice when it unlocks", () => {
    let state = finishIntro(createInitialState(0));
    state = finish(state, "seed-cache");
    expect(texts(state)).toContain(roleArrival("weavers"));

    state = finish(state, "first-nest");
    state = { ...state, counts: { ...state.counts, nest: 2 } };
    state = finish(state, "survey");
    expect(texts(state)).toContain(roleArrival("scouts"));

    state = finish(state, "roost");
    expect(state.act).toBe(2);
    expect(texts(state)).toContain(roleArrival("broodkeepers"));
    expect(texts(state)).toContain(roleArrival("scholars"));

    state = {
      ...state,
      doctrine: "stewardship",
      counts: { ...state.counts, archive: 1 },
      flock: 20,
    };
    state = finish(state, "council");
    expect(state.act).toBe(3);
    expect(texts(state)).toContain(roleArrival("envoys"));

    state = { ...state, counts: { ...state.counts, beacon: 2 }, flock: 24 };
    state = finish(state, "accord");
    expect(state.act).toBe(4);
    expect(texts(state)).toContain(roleArrival("navigators"));

    const announced = ROLE_DEFS.map((role) => role.id).filter((id) => roleArrival(id).length > 0);
    expect(announced).toEqual([
      "weavers",
      "scouts",
      "broodkeepers",
      "scholars",
      "envoys",
      "navigators",
    ] satisfies RoleId[]);
  });
});

function texts(state: GameState): string[] {
  return state.logs.map((entry) => entry.text);
}
