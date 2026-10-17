import { useEffect, useRef, useState } from "react";

import { catchUp } from "../game/engine";
import { loadGame, saveGame, type LoadResult } from "../game/save";
import type { GameState } from "../game/types";

const NOTE_KEY = "bve.note.dismissed";

export function useCampaign() {
  const [game, setGame] = useState<GameState | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const ref = useRef<GameState | null>(null);

  useEffect(() => {
    const loaded = loadGame(window.localStorage, Date.now());
    ref.current = loaded.state;
    saveGame(window.localStorage, loaded.state, Date.now());
    setGame(loaded.state);
    setNote(freshNote(loaded));
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;
    const tickNow = () => {
      const current = ref.current;
      if (!current) return;
      const next = catchUp(current, Date.now(), {
        enqueueEvents: document.visibilityState === "visible",
      });
      ref.current = next;
      setGame(next);
    };
    const persist = () => {
      if (ref.current) saveGame(window.localStorage, ref.current, Date.now());
    };
    const timer = window.setInterval(tickNow, 250);
    const saver = window.setInterval(persist, 4000);
    document.addEventListener("visibilitychange", tickNow);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(saver);
      document.removeEventListener("visibilitychange", tickNow);
      window.removeEventListener("pagehide", persist);
      persist();
    };
  }, [booted]);

  function apply(update: (state: GameState) => GameState): void {
    const current = ref.current;
    if (!current) return;
    const next = update(current);
    ref.current = next;
    setGame(next);
  }

  function commit(next: GameState): void {
    ref.current = next;
    setGame(next);
    saveGame(window.localStorage, next, Date.now());
  }

  function dismissNote(): void {
    if (note) window.localStorage.setItem(NOTE_KEY, note);
    setNote(null);
  }

  return { game, note, apply, commit, dismissNote };
}

function freshNote(loaded: LoadResult): string | null {
  if (!loaded.note) return null;
  try {
    if (window.localStorage.getItem(NOTE_KEY) === loaded.note) return null;
  } catch {
    return loaded.note;
  }
  return loaded.note;
}
