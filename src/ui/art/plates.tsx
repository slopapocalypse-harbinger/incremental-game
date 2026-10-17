import type { ReactNode } from "react";

import {
  Chevron,
  Cuckoo,
  Goldfinch,
  GOLDFINCH_MIRROR,
  NestCup,
  QuillMark,
  SeedHead,
  Star,
  type Plumage,
} from "./marks";

/** Small illustrations for the opening, events, doctrine, and the leaving. */
export function Plate({ id }: { id: string }) {
  const tone = plateTone(id);
  return (
    <svg
      className={`plate ${tone}`}
      viewBox="0 0 320 132"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="320" height="132" fill="var(--sky-bottom)" />
      <rect width="320" height="78" fill="var(--sky-top)" />
      {bodyFor(id)}
    </svg>
  );
}

function plateTone(id: string): string {
  if (id === "quiet-signal" || id === "win") return "scenery-crossing";
  if (id === "night-frost" || id === "storm-year") return "season-dearth";
  if (id === "summer-gale" || id === "headwind") return "season-crosswind";
  if (id === "garden-treaty") return "season-rain";
  return "season-sunlit";
}

function bodyFor(id: string): ReactNode {
  switch (id) {
    case "canopy":
      return (
        <g>
          <Branch />
          <SeedHead x={36} y={70} />
          <SeedHead x={92} y={74} />
          <SeedHead x={148} y={68} />
          <Bird x={18} y={78} pose="feed" />
          <Bird x={74} y={80} pose="feed" sex="female" />
          <Bird x={128} y={76} pose="feed" />
          <Bird x={186} y={82} />
          <Bird x={230} y={80} faceLeft sex="female" />
          <Bird x={274} y={84} />
        </g>
      );
    case "appetite":
      return (
        <g>
          <Branch />
          <SeedHead x={86} y={80} />
          <Bird x={150} y={84} pose="feed" />
          <ellipse cx="214" cy="78" rx="4" ry="2.4" fill="var(--seed)" />
          <Bird x={230} y={86} sex="female" />
          <IdleSeed />
        </g>
      );
    case "leaving":
      return (
        <g>
          <Branch short />
          <NestCup x={36} y={96} scale={0.7} />
          <path className="route-line" d="M90 88 C 150 70, 210 78, 300 60" />
          <g transform="translate(196 48)">
            <Goldfinch pose="fly" />
          </g>
        </g>
      );
    case "summer-gale":
      return (
        <g>
          <Branch bent />
          <Wind />
          <Bird x={70} y={90} />
          <NestCup x={140} y={96} scale={0.65} />
          <g transform="translate(210 46)">
            <Goldfinch pose="fly" />
          </g>
        </g>
      );
    case "night-frost":
      return (
        <g>
          <Branch />
          <Frost />
          <Bird x={120} y={88} plumage="basic" />
          <Bird x={168} y={90} faceLeft sex="female" plumage="basic" />
        </g>
      );
    case "garden-treaty":
      return (
        <g>
          <Branch />
          <ellipse cx="70" cy="112" rx="22" ry="8" fill="var(--seed)" />
          <ellipse cx="62" cy="110" rx="3" ry="2" fill="var(--ochre-deep)" />
          <ellipse cx="76" cy="111" rx="2.4" ry="1.6" fill="var(--cream)" />
          <Bird x={150} y={86} />
          <Bird x={230} y={78} faceLeft sex="female" />
        </g>
      );
    case "cuckoo":
      return (
        <g>
          <Branch />
          <Bird x={40} y={86} />
          <g transform="translate(150 78) scale(0.85)">
            <Cuckoo />
          </g>
          <NestCup x={250} y={98} scale={0.6} />
        </g>
      );
    case "song-school":
      return (
        <g>
          <Branch />
          <Bird x={80} y={88} sex="female" />
          <Bird x={140} y={86} pose="feed" />
          <g transform="translate(210 96)">
            <path d="M0 0 16 -10" stroke="var(--bark)" strokeWidth="2" strokeLinecap="round" />
          </g>
          <Bird x={230} y={88} faceLeft />
        </g>
      );
    case "civic-doubt":
      return (
        <g>
          <Branch />
          <path d="M250 112 V62" stroke="var(--bark)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="250" cy="54" r="7" fill="var(--bird)" />
          <Bird x={70} y={86} />
          <Bird x={120} y={88} faceLeft sex="female" />
          <Bird x={180} y={84} />
        </g>
      );
    case "storm-year":
      return (
        <g>
          <Branch />
          <SeedHead x={56} y={84} closed />
          <SeedHead x={96} y={86} closed />
          <rect x="180" y="96" width="28" height="20" rx="3" fill="var(--ochre-deep)" />
          <Bird x={230} y={86} plumage="basic" />
        </g>
      );
    case "rival-aerie":
      return (
        <g>
          <Branch />
          <path className="route-line" d="M16 70 H300" />
          <Bird x={36} y={86} />
          <Bird x={78} y={84} sex="female" />
          <Bird x={200} y={86} faceLeft />
          <Bird x={246} y={84} faceLeft sex="female" />
        </g>
      );
    case "quiet-signal":
      return (
        <g>
          <Star x={210} y={36} r={4} />
          <circle cx="236" cy="36" r="2" fill="var(--star)" />
          <circle cx="254" cy="36" r="2" fill="var(--star)" />
          <circle cx="272" cy="36" r="2" fill="var(--star)" />
          <Branch />
          <g transform="translate(70 70)">
            <Goldfinch pose="fly" />
          </g>
        </g>
      );
    case "headwind":
      return (
        <g>
          <Wind />
          <Branch />
          <Bird x={150} y={84} />
        </g>
      );
    case "last-ground":
      return (
        <g>
          <Branch short />
          <SeedHead x={200} y={78} />
          <SeedHead x={236} y={82} />
          <SeedHead x={272} y={76} />
          <Bird x={40} y={86} />
        </g>
      );
    case "doctrine-choice":
      return (
        <g>
          <Branch />
          <NestCup x={28} y={96} scale={0.62} />
          <Bird x={78} y={86} />
          <QuillMark x={150} y={70} />
          <Bird x={168} y={86} sex="female" />
          <path className="route-line" d="M240 100 C 270 80, 290 70, 312 58" />
          <g transform="translate(250 48)">
            <Goldfinch pose="fly" />
          </g>
        </g>
      );
    case "migrate":
      return (
        <g>
          <Branch short />
          <path className="route-line" d="M78 90 C 140 78, 200 84, 300 62" />
          <g transform="translate(150 58)">
            <Goldfinch pose="fly" />
          </g>
        </g>
      );
    case "win":
      return (
        <g>
          <Branch short />
          <Star x={40} y={28} r={2} />
          <Star x={80} y={18} r={1.6} />
          <Star x={250} y={24} r={2.2} />
          <Star x={290} y={40} r={1.5} />
          <Chevron x={120} y={30} />
          <Chevron x={150} y={22} />
          <Chevron x={182} y={18} />
          <Chevron x={214} y={26} />
          <Chevron x={244} y={36} />
          <g transform="translate(150 70) scale(0.8)">
            <Goldfinch pose="fly" />
          </g>
        </g>
      );
    default:
      return <Branch />;
  }
}

function Branch({ short = false, bent = false }: { short?: boolean; bent?: boolean }) {
  const d = bent
    ? "M0 108 C 80 96, 140 118, 220 92 S 300 100, 320 88"
    : short
      ? "M0 112 C 40 104, 70 116, 110 108"
      : "M0 112 C 80 100, 160 122, 240 108 S 300 116, 320 104";
  return <path className="branch-line" d={d} />;
}

function Bird({
  x,
  y,
  sex = "male",
  pose = "perch",
  faceLeft = false,
  plumage = "breeding",
}: {
  x: number;
  y: number;
  sex?: "male" | "female";
  pose?: "perch" | "feed";
  faceLeft?: boolean;
  plumage?: Plumage;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(0.72)`}>
      <g transform={faceLeft ? `translate(${GOLDFINCH_MIRROR} 0) scale(-1 1)` : undefined}>
        <g transform={pose === "feed" ? "rotate(-14 48 16)" : undefined}>
          <Goldfinch sex={sex} pose={pose} plumage={plumage} />
        </g>
      </g>
    </g>
  );
}

function Wind() {
  return (
    <g fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
      <path d="M180 36 H250" />
      <path d="M150 52 H240" />
      <path d="M200 68 H280" />
    </g>
  );
}

function Frost() {
  return (
    <g stroke="var(--cream)" strokeWidth="1.3" strokeLinecap="round">
      <path d="M40 70 46 78 M44 70 40 78 M70 64 76 74 M74 64 68 74 M250 72 256 82" />
    </g>
  );
}

function IdleSeed() {
  return (
    <g>
      <ellipse cx="40" cy="70" rx="5" ry="3" fill="var(--seed)" />
      <path d="M34 78 c6 6 10 6 14 0" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
    </g>
  );
}
