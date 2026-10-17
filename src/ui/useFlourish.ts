import { useEffect, useRef, useState } from "react";

import { newlyCompleted, type Completion } from "../game/scene";
import type { GameState } from "../game/types";

export function useFlourish(game: GameState | null): Completion | null {
  const prev = useRef(game);
  const timer = useRef<number | null>(null);
  const [hit, setHit] = useState<Completion | null>(null);

  useEffect(() => {
    const before = prev.current;
    prev.current = game;
    if (!game || !before) return;
    const found = newlyCompleted(before, game);
    if (!found) return;
    setHit(found);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHit(null), 2600);
  }, [game]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  return hit;
}
