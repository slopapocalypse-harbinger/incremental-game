import { describe, expect, it } from "vitest";

import { DOCTRINES, EVENTS, PROJECTS, SEASONS } from "../src/game/content";
import { INTRO_BEATS } from "../src/game/guide";
import {
  FLOCK_VOICES,
  doctrineRemark,
  eventRemark,
  introRemark,
  knownVoice,
  planFlavor,
  projectRemark,
  remarkVariants,
  repeatRemark,
  seasonRemark,
} from "../src/game/voice";

const NAMES = FLOCK_VOICES.map((bird) => bird.name);

describe("flock voice", () => {
  it("keeps four named goldfinches", () => {
    expect(NAMES).toEqual(["Pip", "Bram", "Nell", "Quill"]);
  });

  it("gives every plan, event, season, and doctrine a short line", () => {
    for (const project of PROJECTS) {
      const flavor = planFlavor(project.id);
      const remark = projectRemark(project.id);
      expect(flavor.length, project.id).toBeGreaterThan(0);
      expect(remark.length, project.id).toBeGreaterThan(0);
      expect(flavor.length, project.id).toBeLessThan(80);
      expect(remark.length, project.id).toBeLessThan(48);
      expect(knownVoice(remark), remark).toBe(true);
      expect(NAMES.some((name) => flavor.includes(name)), flavor).toBe(true);
    }
    for (const event of EVENTS) {
      const line = eventRemark(event.id);
      expect(line.length, event.id).toBeGreaterThan(0);
      expect(line.length, event.id).toBeLessThan(90);
      expect(NAMES.some((name) => line.includes(name)), line).toBe(true);
    }
    for (const doctrine of DOCTRINES) {
      expect(knownVoice(doctrineRemark(doctrine.id))).toBe(true);
    }
    for (const season of SEASONS) {
      expect(knownVoice(seasonRemark(season.id))).toBe(true);
    }
    for (const beat of INTRO_BEATS) {
      expect(knownVoice(introRemark(beat.id))).toBe(true);
    }
  });

  it("does not change a line between reads", () => {
    expect(projectRemark("seed-cache")).toBe(projectRemark("seed-cache"));
    expect(eventRemark("cuckoo")).toBe(eventRemark("cuckoo"));
  });

  it("varies lines that repeat", () => {
    const broods = remarkVariants("brood");
    expect(broods.length).toBeGreaterThan(2);
    expect(new Set(broods).size).toBe(broods.length);
    expect(repeatRemark("brood", 1)).not.toBe(repeatRemark("brood", 2));
    expect(repeatRemark("brood", 1)).toBe(repeatRemark("brood", 1));
    for (const id of ["brood", "nest", "archive", "beacon", "seedfall"]) {
      for (const line of remarkVariants(id)) {
        expect(line.length, line).toBeLessThan(48);
        expect(knownVoice(line), line).toBe(true);
      }
    }
  });
});
