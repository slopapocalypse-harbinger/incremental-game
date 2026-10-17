export type Sex = "male" | "female";
export type Pose = "perch" | "feed" | "fly";

/** Breeding American goldfinch. Cap, wing bar, notched tail, conical bill. */
export function Goldfinch({ sex = "male", pose = "perch" }: { sex?: Sex; pose?: Pose }) {
  if (pose === "fly") return <Flyer sex={sex} />;
  return <Perched sex={sex} feeding={pose === "feed"} />;
}

function Perched({ sex, feeding }: { sex: Sex; feeding: boolean }) {
  const body = sex === "male" ? "var(--bird)" : "var(--bird-soft)";
  const wing = sex === "male" ? "var(--ink)" : "var(--bark-deep)";
  return (
    <g>
      <path d="M2 16.5 16 13.2 16 18.4 3.2 19.2Z" fill="var(--ink)" />
      <path d="M2.4 22.4 16 19.2 16 24.6 3.4 24.2Z" fill="var(--ink)" />
      <path d="M6 17.2h5.2M6.4 22.2h5" stroke="var(--cream)" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="30" cy="18" rx="14" ry="9" fill={body} />
      <ellipse cx="18" cy="21" rx="5" ry="3.4" fill="var(--cream)" />
      <path d="M22 13.5c6-3.2 14-1.6 18 4.2-6-.2-12 .6-16.5 3.6-1.4-2.4-1.8-5-1.5-7.8Z" fill={wing} />
      <path d="M26 15.2h12.5c-.4 2.4-1.2 3.6-2.2 4.2H27.2c-.6-1.2-.8-2.6-1.2-4.2Z" fill="var(--cream)" />
      <circle cx="42" cy="14.5" r="6.6" fill={body} />
      {sex === "male" ? (
        <path d="M36.4 12.2c2.2-4.6 8.2-5.2 11.2-.8-3.2-1.4-7.2-.6-11.2.8Z" fill="var(--ink)" />
      ) : null}
      <path d="M47.6 14.8 58.5 17.2 48.2 19.6Z" fill="var(--bill)" />
      <circle cx="44.2" cy="13.6" r="1.15" fill="var(--ink)" />
      <circle cx="44.6" cy="13.2" r="0.38" fill="var(--cream)" />
      <path
        d="M24 26.2 22.2 34.5M31 26.6 33.2 34.8"
        fill="none"
        stroke="var(--bark)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M20 34.5h4.4M31.2 34.8h4.2" stroke="var(--bark)" strokeWidth="1.2" strokeLinecap="round" />
      {feeding ? <ellipse cx="59.2" cy="18.4" rx="2.2" ry="1.3" fill="var(--seed)" /> : null}
    </g>
  );
}

function Flyer({ sex }: { sex: Sex }) {
  const body = sex === "male" ? "var(--bird)" : "var(--bird-soft)";
  const wing = sex === "male" ? "var(--ink)" : "var(--bark-deep)";
  return (
    <g>
      <path d="M4 22 20 18.4 20 23.2 5 24.2Z" fill="var(--ink)" />
      <path d="M4.6 26.6 20 23.4 20 28.2 5.4 27.6Z" fill="var(--ink)" />
      <path d="M22 20 8 6 26 18Z" fill={wing} />
      <path d="M28 18 46 4 38 20Z" fill={wing} />
      <path d="M12 10.5 18 15" stroke="var(--cream)" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M32 10 38 16" stroke="var(--cream)" strokeWidth="2.1" strokeLinecap="round" />
      <ellipse cx="32" cy="22" rx="13" ry="6.2" fill={body} />
      <ellipse cx="22" cy="23.4" rx="4" ry="2.4" fill="var(--cream)" />
      <circle cx="44" cy="19.2" r="5.4" fill={body} />
      {sex === "male" ? (
        <path d="M39.6 16.8c1.8-3.4 6.2-3.8 8.4-.4-2.4-1-5.4-.4-8.4.4Z" fill="var(--ink)" />
      ) : null}
      <path d="M48.6 19.4 57.4 21.2 49 22.8Z" fill="var(--bill)" />
      <circle cx="45.6" cy="18.4" r="1" fill="var(--ink)" />
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
        <path d="M0 0 V36" stroke="var(--leaf)" strokeWidth="1.8" strokeLinecap="round" />
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
        <ellipse cx="0" cy="-11" rx="5" ry="11" fill="var(--leaf)" />
        <ellipse cx="0" cy="-12" rx="1.1" ry="8" fill="var(--leaf-pale)" opacity="0.7" />
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
      <path d="M55.4 13.6 63 15.2 55.6 16.8Z" fill="var(--bill)" />
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
