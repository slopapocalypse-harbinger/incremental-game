import { useState } from "react";

import { INTRO_BEATS } from "../game/guide";

export function IntroSheet({ onAdvance, onSkip }: { onAdvance: () => void; onSkip: () => void }) {
  const [index, setIndex] = useState(0);
  const beat = INTRO_BEATS[index] ?? INTRO_BEATS[0];
  const last = index >= INTRO_BEATS.length - 1;

  function next(): void {
    if (last) onAdvance();
    else setIndex((value) => value + 1);
  }

  return (
    <div className="sheet-root intro-root" data-testid="intro">
      <div className="sheet intro-sheet" role="dialog" aria-modal="true" aria-labelledby="intro-title">
        <p className="eyebrow">
          Opening · {index + 1} of {INTRO_BEATS.length}
        </p>
        <button type="button" className="intro-beat" data-testid="intro-beat" onClick={next}>
          <h2 id="intro-title">{beat.title}</h2>
          <p>{beat.body}</p>
        </button>
        <div className="intro-actions">
          <button type="button" className="btn ghost" data-testid="skip-intro" onClick={onSkip}>
            Skip
          </button>
          <button type="button" className="btn" data-testid="intro-continue" onClick={next}>
            {last ? "Begin" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
