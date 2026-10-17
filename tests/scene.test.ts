import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EVENTS, PROJECTS } from "../src/game/content";
import { createInitialState, startProject } from "../src/game/engine";
import { animationsActive } from "../src/game/motion";
import { newlyCompleted, sceneCaption, sceneFromState, sceneryFor, visibleFlock } from "../src/game/scene";
import type { GameState } from "../src/game/types";
import { LivingScene } from "../src/ui/art/canopy";

describe("scene state", () => {
  it("draws the opening flock in a sunlit canopy", () => {
    const scene = sceneFromState(createInitialState(0));
    expect(scene.season).toBe("sunlit");
    expect(scene.scenery).toBe("canopy");
    expect(scene.birds).toBe(6);
    expect(scene.perched).toBe(5);
    expect(scene.flyer).toBe(true);
    expect(scene.nests).toBe(0);
    expect(scene.roost).toBe(false);
    expect(scene.seedHeads).toBe(4);
    expect(scene.seedfall).toBe(false);
    expect(scene.stars).toBe(0);
    expect(sceneCaption(scene)).toMatch(/Sunlit canopy/);
    expect(sceneCaption(scene)).toMatch(/6 goldfinches/);
  });

  it("adds birds, nests, and a roost without inventing extra flocks", () => {
    const base = createInitialState(0);
    const grown: GameState = {
      ...base,
      act: 2,
      flock: 18,
      flags: ["seed-cache", "first-nest", "survey", "roost"],
      counts: { nest: 3, archive: 1 },
      routes: 4,
      elapsed: 180,
    };
    const scene = sceneFromState(grown);
    expect(visibleFlock(18)).toEqual({ birds: 8, perched: 7, flyer: true });
    expect(scene.birds).toBe(8);
    expect(scene.nests).toBe(3);
    expect(scene.roost).toBe(true);
    expect(scene.archives).toBe(1);
    expect(scene.scenery).toBe("aerie");
    expect(scene.season).toBe("crosswind");
    expect(scene.routes).toBe(4);
  });

  it("changes the sky with the act, the season, and a seedfall", () => {
    expect(sceneryFor(3, false)).toBe("dominion");
    expect(sceneryFor(4, false)).toBe("crossing");
    expect(sceneryFor(4, true)).toBe("murmuration");

    const base = createInitialState(0);
    const rain: GameState = { ...base, act: 2, elapsed: 240, flags: ["roost"] };
    expect(sceneFromState(rain).season).toBe("rain");
    expect(sceneFromState(rain).seedHeads).toBe(2);
    expect(sceneFromState(rain).leaves).toBe(4);

    const dearth: GameState = { ...base, act: 2, elapsed: 360, flags: ["roost"] };
    expect(sceneFromState(dearth).season).toBe("dearth");
    expect(sceneFromState(dearth).seedHeads).toBe(1);
    expect(sceneFromState(dearth).leaves).toBe(2);

    const falling: GameState = {
      ...base,
      effects: [{ id: "seedfall", until: 80 }],
      elapsed: 10,
    };
    const scene = sceneFromState(falling);
    expect(scene.seedfall).toBe(true);
    expect(scene.seedHeads).toBe(5);
    expect(sceneCaption(scene)).toMatch(/seed falling/);
  });

  it("shows stars and arks on the crossing, and caps the strip", () => {
    const base = createInitialState(0);
    const crossing: GameState = {
      ...base,
      act: 4,
      flock: 40,
      systems: 6,
      counts: { nest: 9, ark: 4, beacon: 5, archive: 3 },
      flags: ["roost", "accord"],
    };
    const scene = sceneFromState(crossing);
    expect(scene.scenery).toBe("crossing");
    expect(scene.birds).toBe(9);
    expect(scene.nests).toBe(4);
    expect(scene.arks).toBe(3);
    expect(scene.beacons).toBe(3);
    expect(scene.archives).toBe(2);
    expect(scene.stars).toBeGreaterThanOrEqual(4);
    expect(sceneCaption(scene)).toMatch(/stars out/);
  });

  it("is pure for the same save", () => {
    const state = createInitialState(50);
    expect(sceneFromState(state)).toEqual(sceneFromState(state));
  });
});

describe("completions", () => {
  it("treats the first nest as one era goal, not a second nest", () => {
    const before = createInitialState(0);
    const ready: GameState = {
      ...before,
      flags: ["seed-cache"],
      resources: { ...before.resources, seeds: 80, twigs: 40 },
    };
    const after = startProject(ready, "first-nest");
    expect(newlyCompleted(ready, after)).toEqual({ id: "first-nest", era: true });
  });

  it("notices a later nest and ignores an unchanged save", () => {
    const before = createInitialState(0);
    const nested: GameState = {
      ...before,
      flags: ["seed-cache", "first-nest", "survey"],
      counts: { nest: 1 },
    };
    const raised: GameState = { ...nested, counts: { nest: 2 } };
    expect(newlyCompleted(nested, raised)).toEqual({ id: "nest", era: false });
    expect(newlyCompleted(raised, raised)).toBeNull();
  });
});

describe("reduced motion", () => {
  it("runs only when motion is allowed and the tab is visible", () => {
    expect(animationsActive(false, false)).toBe(true);
    expect(animationsActive(true, false)).toBe(false);
    expect(animationsActive(false, true)).toBe(false);
    expect(animationsActive(true, true)).toBe(false);
  });

  it("leaves the strip still when motion is off", () => {
    const model = sceneFromState(createInitialState(0));
    const still = renderToStaticMarkup(
      createElement(LivingScene, { model, motion: false, layout: "strip" }),
    );
    const moving = renderToStaticMarkup(
      createElement(LivingScene, { model, motion: true, layout: "strip" }),
    );
    expect(still).not.toContain("animateTransform");
    expect(moving).toContain("animateTransform");
    expect(still).toContain("Sunlit canopy");
    expect(still).toContain("season-sunlit");
  });
});

describe("content covers the pictures", () => {
  it("has a scene for every act the campaign can reach", () => {
    for (const act of [1, 2, 3, 4, 5] as const) {
      expect(sceneryFor(act, false).length).toBeGreaterThan(0);
    }
    expect(PROJECTS.length).toBeGreaterThan(0);
    expect(EVENTS.length).toBeGreaterThan(0);
  });
});
