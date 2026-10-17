import type { DoctrineId, RoleId, SeasonId } from "./types";

/** American goldfinches. Same four birds, all expedition. */
export const FLOCK_VOICES = [
  { id: "pip", name: "Pip", temper: "Eager. Counts everything twice." },
  { id: "bram", name: "Bram", temper: "Grumpy, and usually right." },
  { id: "nell", name: "Nell", temper: "Deadpan worrier." },
  { id: "quill", name: "Quill", temper: "Know-it-all. Writes it down first." },
] as const;

const NAMES = FLOCK_VOICES.map((bird) => bird.name);

export function knownVoice(line: string): boolean {
  return NAMES.some((name) => line.startsWith(name + ":"));
}

/** A line where a bird is speaking, including one tucked after a short lead. */
export function isBirdLine(line: string): boolean {
  return /\b(Pip|Bram|Nell|Quill):/.test(line);
}

export function introRemark(id: string): string {
  switch (id) {
    case "canopy":
      return "Pip: Six! Three working, three watching.";
    case "appetite":
      return "Bram: Idle birds still eat. Of course.";
    case "leaving":
      return "Nell: Nice tree. We should leave.";
    default:
      return "";
  }
}

export function planFlavor(id: string): string {
  return PLAN_FLAVOR[id] ?? "";
}

export function projectRemark(id: string): string {
  return PROJECT_REMARK[id] ?? "";
}

/** Varied lines for plans that can finish more than once. nth starts at 1. */
export function repeatRemark(id: string, nth: number): string {
  const lines = REPEAT_REMARKS[id];
  if (!lines || lines.length === 0) return projectRemark(id);
  const index = (Math.max(1, nth) - 1) % lines.length;
  return lines[index] ?? projectRemark(id);
}

export function remarkVariants(id: string): readonly string[] {
  return REPEAT_REMARKS[id] ?? (PROJECT_REMARK[id] ? [PROJECT_REMARK[id]] : []);
}

export function eventRemark(id: string): string {
  return EVENT_REMARK[id] ?? "";
}

export function doctrineRemark(id: DoctrineId): string {
  switch (id) {
    case "stewardship":
      return "Bram: Spend less. The cups last longer.";
    case "ingenuity":
      return "Quill: I wrote it down. Now hurry.";
    case "wanderlust":
      return "Nell: The route matters. Nests are naps.";
  }
}

export function roleArrival(id: RoleId): string {
  switch (id) {
    case "weavers":
      return "Bram: Weavers. Twigs don't fetch themselves.";
    case "scouts":
      return "Nell: Scouts bring knowledge. I wanted four.";
    case "broodkeepers":
      return "Pip: Broodkeepers grow the flock.";
    case "scholars":
      return "Quill: Scholars. Write it down. Obviously.";
    case "envoys":
      return "Nell: Envoys. Songs don't travel far.";
    case "navigators":
      return "Quill: Navigators. The sun is a coordinate.";
    default:
      return "";
  }
}

export function seasonRemark(id: SeasonId): string {
  switch (id) {
    case "sunlit":
      return "Pip: Heads are open. Best part!";
    case "crosswind":
      return "Nell: Useful wind. Bram says we die.";
    case "rain":
      return "Quill: Good note weather. Seed can wait.";
    case "dearth":
      return "Bram: Live on the cache. I warned you.";
  }
}

const PLAN_FLAVOR: Record<string, string> = {
  "seed-cache": "Pip already named the hollow.",
  "first-nest": "Bram will check that rim.",
  survey: "Nell is naming trees she hasn't landed on.",
  nest: "Bram measures every cup with his feet.",
  seedfall: "Pip calls a scramble a plan.",
  roost: "Quill opened a page. We're official.",
  archive: "Quill's notes outlive the rest of us.",
  brood: "Pip is already adding them up.",
  corridor: "Nell flew it twice, so it's real.",
  council: "Quill calls arguing a kind of nest.",
  beacon: "Nell wants a post when the song dies.",
  treaty: "Quill will be polite. Loudly.",
  granary: "Pip wanted this before it had a name.",
  academy: "Quill brought a shelf for the arguments.",
  eyrie: "Bram built the ledge, then stood on it.",
  accord: "Nell named the heading. She shrugs.",
  solar: "Bram calls it a bright pause.",
  ark: "Nell packs light and loses the vote.",
  scan: "Quill would rather copy the star.",
  murmur: "Nell says home is just a heading.",
};

const PROJECT_REMARK: Record<string, string> = {
  "seed-cache": "Pip: It stays. I counted twice!",
  "first-nest": "Bram: Rim's even. You're welcome.",
  survey: "Nell: Two branches. I wanted four.",
  nest: "Bram: Don't sit on the rim.",
  seedfall: "Pip: Eat up! This will not last.",
  roost: "Quill: Record's open. Obviously.",
  archive: "Quill: Notes outlive birds. I checked.",
  brood: "Pip: Three more mouths. Wonderful!",
  corridor: "Nell: Flown twice. It's a route.",
  council: "Quill: We sat. Nobody agreed.",
  beacon: "Nell: They can see us. Worrying.",
  treaty: "Quill: Polite, and far too loud.",
  granary: "Pip: Full is a moral good!",
  academy: "Quill: Arguments, now with a shelf.",
  eyrie: "Bram: More room. Don't fall off.",
  accord: "Nell: The sun is a destination.",
  solar: "Bram: Bright ledge. Don't molt there.",
  ark: "Nell: A nest that can leave. Good.",
  scan: "Quill: One star, copied. You're welcome.",
  murmur: "Nell: We're leaving. Try to keep up.",
};

const REPEAT_REMARKS: Record<string, readonly string[]> = {
  brood: [
    "Pip: Three more mouths. Wonderful!",
    "Pip: Three more beaks to fill!",
    "Bram: Three more on the rim. Fine.",
    "Nell: New wings. Already looking out.",
    "Quill: Three names, once I learn them.",
  ],
  nest: [
    "Bram: Don't sit on the rim.",
    "Bram: Another cup. Rim holds.",
    "Pip: More room. I'll fill it!",
  ],
  archive: [
    "Quill: Notes outlive birds. I checked.",
    "Quill: The next shelf is the real one.",
    "Quill: Three rooms. Wind stays out.",
  ],
  beacon: [
    "Nell: They can see us. Worrying.",
    "Nell: Another post. Even farther.",
    "Bram: Higher. Don't fall off.",
  ],
  corridor: [
    "Nell: Flown twice. It's a route.",
    "Nell: Another line someone can fly.",
    "Quill: I wrote the heading down.",
  ],
  seedfall: [
    "Pip: Eat up! This will not last.",
    "Pip: A scramble, then a quiet!",
    "Nell: Found the heads. Wind helped.",
  ],
  ark: [
    "Nell: A nest that can leave. Good.",
    "Nell: Another harbor. New sun.",
    "Pip: Pack the seed. I counted!",
  ],
  scan: [
    "Quill: One star, copied. You're welcome.",
    "Quill: Another fix. Written once.",
    "Nell: Cheaper star. I'll take it.",
  ],
  treaty: [
    "Quill: Polite, and far too loud.",
    "Nell: They heard us. That's new.",
    "Bram: Smile, then check the rim.",
  ],
};

const EVENT_REMARK: Record<string, string> = {
  "summer-gale": "Nell: Ride the wind. Bram says no.",
  "night-frost": "Pip: I'm sitting on my feet already.",
  "garden-treaty": "Quill: Being seen is a kind of cost.",
  cuckoo: "Bram: I counted twice. I hate it.",
  "song-school": "Quill: They copy the song you finish.",
  "civic-doubt": "Quill: Put it in writing. They won't.",
  "storm-year": "Pip: Share the cache? I counted it.",
  "rival-aerie": "Nell: I know the route. Not sharing.",
  "quiet-signal": "Quill: Copy the pattern. Nell wants to go.",
  headwind: "Nell: The fix is short. I checked.",
  "last-ground": "Pip: That's seed. Quill sees a footnote.",
};
