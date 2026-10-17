export type Sex = "male" | "female";
export type Pose = "perch" | "feed" | "fly";
export type Plumage = "breeding" | "basic";

/** Width of a perched goldfinch, used when mirroring one to face left. */
export const GOLDFINCH_MIRROR = 66;

/**
 * American goldfinch. Breeding males are lemon yellow with a small black
 * forehead cap. Females and basic (autumn/winter) birds are olive or buff,
 * uncapped, and share the black wings, white bars, short pink bill, and
 * notched tail.
 */
export function Goldfinch({
  sex = "male",
  pose = "perch",
  plumage = "breeding",
}: {
  sex?: Sex;
  pose?: Pose;
  plumage?: Plumage;
}) {
  if (pose === "fly") return <Flyer sex={sex} plumage={plumage} />;
  return <Perched sex={sex} feeding={pose === "feed"} plumage={plumage} />;
}

function palette(sex: Sex, plumage: Plumage) {
  const breeding = plumage === "breeding";
  return {
    body: !breeding
      ? sex === "female"
        ? "var(--bird-buff)"
        : "var(--bird-basic)"
      : sex === "male"
        ? "var(--bird)"
        : "var(--bird-soft)",
    bill: breeding ? "var(--bill)" : "var(--bill-pale)",
    cap: breeding && sex === "male",
  };
}

function Perched({ sex, feeding, plumage }: { sex: Sex; feeding: boolean; plumage: Plumage }) {
  const { body, bill, cap } = palette(sex, plumage);
  return (
    <g>
      <path d="M7 14.8 18 16.2 18 18.4 8 17.6Z" fill="var(--wing)" />
      <path d="M7.4 22.8 18 18.8 18 21.4 8.2 22.2Z" fill="var(--wing)" />
      <path d="M7.2 15 17 16.2" stroke="var(--cream)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.6 22.6 17.2 21.2" stroke="var(--cream)" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="33" cy="20" rx="15" ry="8.4" fill={body} />
      <path d="M22 15.6 Q33 13.4 41 16.8 Q33 19.2 24 22.2 Q22 18.8 22 15.6 Z" fill="var(--wing)" />
      <rect x="24" y="15.2" width="14.5" height="3.8" rx="1.7" fill="var(--cream)" />
      <rect x="27" y="19.6" width="9.2" height="2.3" rx="1.1" fill="var(--cream)" />
      <ellipse cx="17" cy="22.6" rx="5" ry="3" fill="var(--cream)" />
      <circle cx="48" cy="15.6" r="7" fill={body} />
      {cap ? (
        <path
          className="forecap"
          d="M49.2 12.8 C50.6 9.8 53.8 9.9 54.4 12.8 C52.8 13.6 50.6 13.6 49.2 12.8 Z"
          fill="var(--wing)"
        />
      ) : null}
      <path
        className={plumage === "basic" ? "bill bill-pale" : "bill"}
        d="M54 14.8 58.2 16.8 54 18.8Z"
        fill={bill}
      />
      <circle cx="49.6" cy="16" r="1.05" fill="var(--wing)" />
      <circle cx="49.9" cy="15.7" r="0.34" fill="var(--cream)" />
      <path
        d="M28 27.6 26.6 34.2M36 27.8 37.6 34.6"
        fill="none"
        stroke="var(--bark)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M24.8 34.2h3.6M35.8 34.6h3.4" stroke="var(--bark)" strokeWidth="1.15" strokeLinecap="round" />
      {feeding ? <ellipse cx="59.2" cy="17.2" rx="1.4" ry="0.95" fill="var(--seed)" /> : null}
    </g>
  );
}

function Flyer({ sex, plumage }: { sex: Sex; plumage: Plumage }) {
  const { body, bill, cap } = palette(sex, plumage);
  return (
    <g>
      <path d="M6 21.6 17 19.6 17 22.6 7 23.2Z" fill="var(--wing)" />
      <path d="M6.6 25.8 17 23 17 26.4 7.4 26.2Z" fill="var(--wing)" />
      <path d="M6.2 21.6 16.2 19.6" stroke="var(--cream)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 26.2 16.4 25.6" stroke="var(--cream)" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="30" cy="22.6" rx="12" ry="6" fill={body} />
      <ellipse cx="17.2" cy="24.2" rx="3.8" ry="2.2" fill="var(--cream)" />
      <path d="M22 20 8 5 26 17Z" fill="var(--wing)" />
      <path d="M28 18 46 3 38 19Z" fill="var(--wing)" />
      <path d="M11 10.2 18.5 15.2" stroke="var(--cream)" strokeWidth="3" strokeLinecap="round" />
      <path d="M32.5 8.8 39.5 15.4" stroke="var(--cream)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="41.5" cy="19.4" r="5.6" fill={body} />
      {cap ? (
        <path
          className="forecap"
          d="M42.6 16.8 C43.6 14.8 46.2 14.8 46.8 16.8 C45.6 17.4 43.8 17.4 42.6 16.8 Z"
          fill="var(--wing)"
        />
      ) : null}
      <path
        className={plumage === "basic" ? "bill bill-pale" : "bill"}
        d="M46.4 19.2 49.8 20.4 46.4 21.6Z"
        fill={bill}
      />
      <circle cx="42.8" cy="19.5" r="0.9" fill="var(--wing)" />
    </g>
  );
}

export function NestCup({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M2 8 C10 26 38 26 46 8" fill="var(--bark)" />
      <path d="M8 10 C14 20 34 20 40 10" fill="var(--cream)" />
      <path
        d="M4 10 C12 4 18 14 24 6 C30 14 36 4 44 10"
        fill="none"
        stroke="var(--bark-deep)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

export function SeedHead({
  x,
  y,
  lean = 0,
  closed = false,
  motion = false,
  delay = 0,
}: {
  x: number;
  y: number;
  lean?: number;
  closed?: boolean;
  motion?: boolean;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${lean})`}>
      <g>
        {motion ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-3 0 36; 4 0 36; -3 0 36"
            dur="3.6s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        ) : null}
        <path d="M0 0 V34" stroke="var(--leaf-deep)" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="0" cy="-2" rx={closed ? 4 : 9} ry={closed ? 7 : 6} fill="var(--seed)" />
        {closed ? null : (
          <g>
            <ellipse cx="-3" cy="-3" rx="2.1" ry="1.3" fill="var(--ochre-deep)" />
            <ellipse cx="3" cy="0" rx="1.8" ry="1.1" fill="var(--cream)" />
            <ellipse cx="0" cy="2" rx="1.6" ry="1" fill="var(--clay)" />
          </g>
        )}
      </g>
    </g>
  );
}

export function Leaf({
  x,
  y,
  motion = false,
  delay = 0,
}: {
  x: number;
  y: number;
  motion?: boolean;
  delay?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g>
        {motion ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-5 0 0; 6 0 0; -5 0 0"
            dur="4s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        ) : null}
        <path d="M0 10 V0" stroke="var(--leaf-deep)" strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="0" cy="-8" rx="4.2" ry="8.5" fill="var(--leaf)" />
        <path d="M0 -1 V-15" stroke="var(--leaf-pale)" strokeWidth="1.1" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function Star({ x, y, r = 2.2 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="var(--star)" />;
}

export function BeaconPost({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M0 132 V58" stroke="var(--bark)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="52" r="6.5" fill="var(--bird)" />
      <circle cx="0" cy="52" r="2.4" fill="var(--cream)" />
    </g>
  );
}

export function RoostMass({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 102)`}>
      <ellipse cx="0" cy="16" rx="30" ry="16" fill="var(--bark)" />
      <ellipse cx="-2" cy="14" rx="18" ry="9" fill="var(--bark-deep)" />
      <path d="M-16 12 Q0 0 16 12" fill="none" stroke="var(--cream)" strokeWidth="1.5" opacity="0.75" />
      <path d="M-12 18 Q0 8 14 18" fill="none" stroke="var(--leaf-pale)" strokeWidth="1.4" />
    </g>
  );
}

export function ArchiveHut({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 104)`}>
      <path d="M-18 28 V14 H18 V28" fill="var(--bark)" />
      <path d="M-22 15 L0 2 L22 15" fill="var(--leaf-deep)" />
      <rect x="-7" y="17" width="14" height="7" rx="1" fill="var(--cream)" />
    </g>
  );
}

export function GranaryMark({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 108)`}>
      <rect x="-10" y="6" width="20" height="18" rx="3" fill="var(--ochre-deep)" />
      <path d="M-10 12 H10 M-10 17 H10" stroke="var(--bark-deep)" strokeWidth="1.2" />
      <rect x="-4" y="0" width="8" height="8" fill="var(--bark)" />
    </g>
  );
}

export function EyrieLedge({ x }: { x: number }) {
  return (
    <path
      d={`M${x} 132 L${x + 8} 96 L${x + 36} 90`}
      fill="none"
      stroke="var(--bark)"
      strokeWidth="4"
      strokeLinecap="round"
    />
  );
}

export function ArkMark({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 10 C8 20 28 20 36 10" fill="var(--bark)" />
      <path d="M6 11 C12 16 24 16 30 11" fill="var(--cream)" />
      <path d="M18 10 V-2" stroke="var(--bark-deep)" strokeWidth="1.6" />
      <circle cx="18" cy="-6" r="2.4" fill="var(--star)" />
    </g>
  );
}

/** A slim brown bird with a long barred tail. Not a goldfinch. */
export function Cuckoo() {
  return (
    <g>
      <path d="M0 18 30 14.5 30 21.5 2 23Z" fill="var(--bark-deep)" />
      <path d="M6 17.2h8M8 20.4h10" stroke="var(--cream)" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="40" cy="16" rx="12" ry="5.2" fill="var(--bark)" />
      <circle cx="52" cy="13.5" r="4.2" fill="var(--bark)" />
      <path d="M55.4 13.6 62 15.1 55.6 16.6Z" fill="var(--bark-deep)" />
      <circle cx="53.2" cy="12.8" r="0.8" fill="var(--ink)" />
    </g>
  );
}

export function QuillMark({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M4 28 18 4" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M18 4 22 8 16 10Z" fill="var(--cream)" />
      <path d="M8 22 14 16" stroke="var(--ink)" strokeWidth="1" />
    </g>
  );
}

export function Chevron({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y + 5} L${x + 7} ${y} L${x + 14} ${y + 5}`}
      fill="none"
      stroke="var(--bird)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
