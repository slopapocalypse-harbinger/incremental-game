/** Whether the canopy should animate. Reduced motion and a hidden tab both stop it. */
export function animationsActive(reducedMotion: boolean, tabHidden: boolean): boolean {
  return !reducedMotion && !tabHidden;
}
