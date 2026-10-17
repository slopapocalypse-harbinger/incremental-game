import type { GameState, Notebook } from "./types";

export type TabId = "flock" | "plans" | "study" | "world" | "log";

export interface StoryBeat {
  id: string;
  title: string;
  body: string;
}

export interface Tip {
  id: string;
  title: string;
  body: string;
  tabs: TabId[];
  when: (state: GameState) => boolean;
}

export const INTRO_BEATS: StoryBeat[] = [
  {
    id: "canopy",
    title: "Six birds, one tree",
    body: "Six birds share a tree in the sunward canopy. Three are already working.",
  },
  {
    id: "appetite",
    title: "They eat anyway",
    body: "Idle birds gather nothing, and they still eat.",
  },
  {
    id: "leaving",
    title: "Home is a heading",
    body: "This tree is a start. The flock will leave once the route outgrows it.",
  },
];

export const TIPS: Tip[] = [
  {
    id: "plans",
    title: "Plans",
    body: "One plan at a time. Starting spends stores and borrows birds.",
    tabs: ["plans"],
    when: () => true,
  },
  {
    id: "study",
    title: "Study",
    body: "Knowledge changes a rate or a store. Nothing here is a hidden key.",
    tabs: ["plans", "flock", "study", "world", "log"],
    when: (state) => state.flags.includes("first-nest"),
  },
  {
    id: "seasons",
    title: "Seasons",
    body: "Weather changes gathering. Launches take the same time.",
    tabs: ["world"],
    when: (state) => state.flags.includes("seed-cache"),
  },
  {
    id: "doctrine",
    title: "Doctrine",
    body: "Pick one identity. All three can finish. More lists what you feel now.",
    tabs: ["study"],
    when: (state) => state.act >= 2 && state.doctrine === null,
  },
  {
    id: "events",
    title: "A choice",
    body: "One option is free. The other waits until you can pay.",
    tabs: [],
    when: (state) => state.pendingEvent !== null,
  },
  {
    id: "migration",
    title: "Migration",
    body: "You can leave. A win pays 8 or more. The confirm line states the payout.",
    tabs: ["plans"],
    when: (state) => state.act >= 2 || state.won,
  },
];

const TAB_ORDER: TabId[] = ["flock", "plans", "study", "world", "log"];

export function visibleTabs(state: GameState): TabId[] {
  return TAB_ORDER.filter((tab) => tabAccess(state, tab).open);
}

/** Arrival notices share the notebook's seen list. Starter surfaces are never new. */
export function arrivalId(kind: "tab" | "role", id: string): string {
  return `new:${kind}:${id}`;
}

export function isNewArrival(state: GameState, kind: "tab" | "role", id: string): boolean {
  if (kind === "tab" && (id === "flock" || id === "plans")) return false;
  if (kind === "role" && id === "foragers") return false;
  return !state.notebook.seen.includes(arrivalId(kind, id));
}

export function acknowledgeArrival(state: GameState, kind: "tab" | "role", id: string): GameState {
  return dismissTip(state, arrivalId(kind, id));
}

export function acknowledgeArrivals(
  state: GameState,
  kind: "tab" | "role",
  ids: readonly string[],
): GameState {
  return ids.reduce((next, id) => acknowledgeArrival(next, kind, id), state);
}

export function tabAccess(state: GameState, tab: TabId): { open: boolean; reason: string } {
  if (tab === "plans" || tab === "flock") return { open: true, reason: "" };
  if (tab === "world") {
    const open = state.flags.includes("seed-cache");
    return {
      open,
      reason: open ? "" : "World opens after the seed cache.",
    };
  }
  if (tab === "log") {
    const open = state.flags.length > 0;
    return {
      open,
      reason: open ? "" : "The log opens after the first plan.",
    };
  }
  const open = state.flags.includes("first-nest");
  return {
    open,
    reason: open ? "" : "Study opens after the first nest.",
  };
}

export function currentTip(state: GameState, tab: TabId): Tip | null {
  if (!tipsAllowed(state)) return null;
  return (
    TIPS.find(
      (tip) => tip.tabs.includes(tab) && !state.notebook.seen.includes(tip.id) && tip.when(state),
    ) ?? null
  );
}

export function eventTip(state: GameState): Tip | null {
  if (!tipsAllowed(state)) return null;
  const tip = TIPS.find((item) => item.id === "events");
  if (!tip || state.notebook.seen.includes(tip.id) || !tip.when(state)) return null;
  return tip;
}

export function finishIntro(state: GameState): GameState {
  if (state.notebook.intro === "done") return state;
  return { ...state, notebook: { ...state.notebook, intro: "done" } };
}

export function replayIntro(state: GameState): GameState {
  return { ...state, notebook: { ...state.notebook, intro: "pending" } };
}

export function skipAllTips(state: GameState): GameState {
  return {
    ...state,
    notebook: { intro: "done", seen: state.notebook.seen, quiet: true },
  };
}

export function dismissTip(state: GameState, id: string): GameState {
  if (state.notebook.seen.includes(id)) return state;
  return { ...state, notebook: { ...state.notebook, seen: [...state.notebook.seen, id] } };
}

export function freshNotebook(): Notebook {
  return { intro: "pending", seen: [], quiet: false };
}

export function notebookForOlderSave(progressed: boolean): Notebook {
  if (!progressed) return freshNotebook();
  return { intro: "done", seen: [], quiet: true };
}

function tipsAllowed(state: GameState): boolean {
  return state.notebook.intro === "done" && !state.notebook.quiet;
}
