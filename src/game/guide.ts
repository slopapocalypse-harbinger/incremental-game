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
    body: "The sunward canopy still feeds them. Three are already in the seed heads. Three are waiting on you.",
  },
  {
    id: "appetite",
    title: "They eat anyway",
    body: "An idle bird gathers nothing and still takes a seed. The work is the mix, not the tapping.",
  },
  {
    id: "leaving",
    title: "Home is a heading",
    body: "The tree is where the notebook starts. It is not where the flock means to stay. First a cache. Then a route that outgrows the sky.",
  },
];

export const TIPS: Tip[] = [
  {
    id: "plans",
    title: "Plans",
    body: "Pip does one plan at a time. Starting spends the stores and borrows birds until it is done.",
    tabs: ["plans"],
    when: () => true,
  },
  {
    id: "study",
    title: "Study",
    body: "Study is open. Knowledge bends a rate or a store. None of it is a hidden key.",
    tabs: ["plans", "flock", "study", "world", "log"],
    when: (state) => state.flags.includes("first-nest"),
  },
  {
    id: "seasons",
    title: "Seasons",
    body: "Weather changes the gathering. A launch takes the same time in a crosswind.",
    tabs: ["world"],
    when: (state) => state.flags.includes("seed-cache"),
  },
  {
    id: "doctrine",
    title: "Doctrine",
    body: "One identity for this flight. All three can finish. What you feel now is written on the card.",
    tabs: ["study"],
    when: (state) => state.act >= 2 && state.doctrine === null,
  },
  {
    id: "events",
    title: "A choice",
    body: "One option never asks for something you do not have. The other can wait until you can pay.",
    tabs: [],
    when: (state) => state.pendingEvent !== null,
  },
  {
    id: "migration",
    title: "Migration",
    body: "Nell says you can leave. A win pays 8 or more. The confirm line says what leaving pays now.",
    tabs: ["plans"],
    when: (state) => state.act >= 2 || state.won,
  },
];

export function tabAccess(state: GameState, tab: TabId): { open: boolean; reason: string } {
  if (tab === "plans" || tab === "flock") return { open: true, reason: "" };
  if (tab === "world") {
    const open = state.flags.includes("seed-cache");
    return {
      open,
      reason: open ? "" : "World opens after the seed cache. The weather can wait.",
    };
  }
  if (tab === "log") {
    const open = state.flags.length > 0;
    return {
      open,
      reason: open ? "" : "The log opens once the flock has done something.",
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
