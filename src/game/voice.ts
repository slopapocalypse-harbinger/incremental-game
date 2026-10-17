import type { DoctrineId, SeasonId } from "./types";

/** American goldfinches. Same four birds, all expedition. */
export const FLOCK_VOICES = [
  { id: "pip", name: "Pip", temper: "Counts the seed, then counts it again." },
  { id: "bram", name: "Bram", temper: "Judges a nest by the rim, and says so." },
  { id: "nell", name: "Nell", temper: "Already describing a tree she has not landed in." },
  { id: "quill", name: "Quill", temper: "Writes it down, then has the opinion." },
] as const;

const NAMES = FLOCK_VOICES.map((bird) => bird.name);

export function knownVoice(line: string): boolean {
  return NAMES.some((name) => line.startsWith(`${name}:`));
}

export function introRemark(id: string): string {
  switch (id) {
    case "canopy":
      return "Pip: Six. Three working, three watching.";
    case "appetite":
      return "Bram: An idle bird still takes a seed.";
    case "leaving":
      return "Nell: The tree is a start, not an address.";
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

export function eventRemark(id: string): string {
  return EVENT_REMARK[id] ?? "";
}

export function doctrineRemark(id: DoctrineId): string {
  switch (id) {
    case "stewardship":
      return "Bram: Keep more than you spend. The cups last longer.";
    case "ingenuity":
      return "Quill: Write it down, then go faster than is comfortable.";
    case "wanderlust":
      return "Nell: The route is the point. A nest is a rest.";
  }
}

export function seasonRemark(id: SeasonId): string {
  switch (id) {
    case "sunlit":
      return "Pip: The heads are open. This is the good part.";
    case "crosswind":
      return "Nell: The wind is useful. Bram disagrees.";
    case "rain":
      return "Quill: Good weather for a note. The seed can wait.";
    case "dearth":
      return "Pip: Live on the cache. I mentioned this.";
  }
}

const PLAN_FLAVOR: Record<string, string> = {
  "seed-cache": "Pip has already named the hollow.",
  "first-nest": "Bram wants the rim even. He will check.",
  survey: "Nell is describing trees she has not landed in.",
  nest: "Another cup. Bram measures it with his feet.",
  seedfall: "Pip calls a scramble a plan.",
  roost: "Quill opens a page. The tree is a place now.",
  archive: "A note that outlives the bird is Quill's whole faith.",
  brood: "Three more beaks. Pip is doing the sum.",
  corridor: "Nell flies it twice, so the rest can call it obvious.",
  council: "Quill says an argument is a kind of nest.",
  beacon: "Nell: A post, for when the song gives out.",
  treaty: "Quill: Someone has to be polite up here.",
  granary: "Pip wanted this before it had a name.",
  academy: "Quill's shelf, and the arguments on it.",
  eyrie: "Bram builds the ledge, then stands on the edge.",
  accord: "Nell's heading gets a name. She pretends it had one.",
  solar: "Bram: A bright pause between glides.",
  ark: "A nest with range. Nell packs light and loses the vote.",
  scan: "Quill would rather copy a star than sit under it.",
  murmur: "Nell: After this, home is a heading.",
};

const PROJECT_REMARK: Record<string, string> = {
  "seed-cache": "Pip: It stays. I counted.",
  "first-nest": "Bram: The rim is even enough.",
  survey: "Nell: Two branches. I wanted four.",
  nest: "Bram: Don't sit on the rim.",
  seedfall: "Pip: Keep eating. This will not last.",
  roost: "Quill: The record is open.",
  archive: "Quill: A note can outlive you.",
  brood: "Pip: Three more mouths.",
  corridor: "Nell: Flown twice. It is a route.",
  council: "Quill: We sat. We did not agree.",
  beacon: "Nell: They can see us now.",
  treaty: "Quill: Polite, and too loud.",
  granary: "Pip: Full is a moral good.",
  academy: "Quill: The arguments have a shelf.",
  eyrie: "Bram: More room. Don't fall off.",
  accord: "Nell: The sun is a destination.",
  solar: "Bram: A bright ledge. Don't molt there.",
  ark: "Nell: A nest that can leave.",
  scan: "Quill: One star, copied down.",
  murmur: "Nell: Home is a heading. Keep up.",
};

const EVENT_REMARK: Record<string, string> = {
  "summer-gale": "Nell wants the wind. Bram wants the cups left alone.",
  "night-frost": "Pip is already sitting on his feet.",
  "garden-treaty": "Quill says being seen is a kind of cost.",
  cuckoo: "Bram counted the clutch twice and dislikes the number.",
  "song-school": "Quill: They repeat the song you finish.",
  "civic-doubt": "Quill wants this in writing. The outer roosts do not.",
  "storm-year": "Pip looks at the cache, then at everyone else.",
  "rival-aerie": "Nell knows the corridor. She is not in a sharing mood.",
  "quiet-signal": "Quill wants the pattern. Nell wants the heading.",
  headwind: "The fix is short. Nell has said so.",
  "last-ground": "Pip sees seed. Quill sees the last line of the page.",
};
