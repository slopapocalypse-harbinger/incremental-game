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
