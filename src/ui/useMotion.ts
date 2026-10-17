import { useEffect, useState } from "react";

function reducedNow(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when the player asked for reduced motion. A hidden tab pauses the svg separately. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(reducedNow);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/** True at the desktop notebook width, where the flock column stays on screen. */
export function useWideLayout(): boolean {
  const [wide, setWide] = useState(() => wideNow());

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1040px)");
    const sync = () => setWide(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return wide;
}

function wideNow(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(min-width: 1040px)").matches;
}
