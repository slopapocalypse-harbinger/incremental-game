import { useEffect, useId, useRef } from "react";

import type { SceneModel } from "../../game/scene";
import { sceneCaption } from "../../game/scene";
import {
  ArchiveHut,
  ArkMark,
  BeaconPost,
  Chevron,
  EyrieLedge,
  Goldfinch,
  GranaryMark,
  Leaf,
  NestCup,
  RoostMass,
  SeedHead,
  Star,
  type Sex,
} from "./marks";

const NEST_X = [200, 300, 430, 540];

function perchSlot(index: number, total: number): number {
  if (total <= 1) return 300;
  return 148 + (index * 410) / (total - 1);
}
const LEAF_X = [40, 120, 200, 290, 390, 500, 590];
const STAR_SLOTS = [
  [48, 28],
  [120, 16],
  [196, 34],
  [270, 14],
  [348, 30],
  [430, 18],
  [510, 32],
  [590, 16],
];

export function LivingScene({
  model,
  motion,
  layout,
  celebrating = null,
}: {
  model: SceneModel;
  motion: boolean;
  layout: "strip" | "map";
  celebrating?: "plan" | "era" | null;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const rawId = useId().replace(/:/g, "");
  const skyId = `sky-${rawId}`;

  useEffect(() => {
    if (layout !== "strip") return;
    const svg = ref.current;
    const sync = () => {
      const hidden = document.visibilityState === "hidden";
      document.documentElement.dataset.tabHidden = hidden ? "true" : "false";
      if (!svg || !motion) return;
      if (hidden) svg.pauseAnimations();
      else svg.unpauseAnimations();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      delete document.documentElement.dataset.tabHidden;
    };
  }, [layout, motion]);

  const night = model.scenery === "crossing" || model.scenery === "murmuration";
  const lean = model.season === "crosswind" ? 16 : model.season === "dearth" ? -4 : 0;
  const closed = model.season === "dearth" && !model.seedfall;

  return (
    <svg
      ref={ref}
      className={[
        "living-scene",
        layout,
        `season-${model.season}`,
        `scenery-${model.scenery}`,
        model.seedfall ? "is-seedfall" : "",
        celebrating ? "is-celebrating" : "",
        celebrating === "era" ? "is-era" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 640 168"
      role="img"
      aria-label={sceneCaption(model)}
      preserveAspectRatio={layout === "strip" ? "xMidYMax slice" : "xMidYMid meet"}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky-top)" />
          <stop offset="1" stopColor="var(--sky-bottom)" />
        </linearGradient>
      </defs>
      <rect className="sky" width="640" height="168" fill={`url(#${skyId})`} />
      {model.stars > 0
        ? STAR_SLOTS.slice(0, model.stars).map(([x, y], index) => (
            <Star key={`star-${index}`} x={x} y={y} r={index % 3 === 0 ? 2.6 : 1.7} />
          ))
        : null}
      {!night && (model.season === "sunlit" || model.season === "crosswind") ? (
        <circle cx="586" cy="32" r="14" fill="var(--sun)" />
      ) : null}
      <CanopyMass night={night} />
      {model.routes > 0
        ? Array.from({ length: model.routes }, (_, index) => (
            <path key={`route-${index}`} className="route-line" d={routePath(index)} />
          ))
        : null}
      {model.season === "crosswind" ? <WindLines motion={motion} /> : null}
      {model.season === "rain" ? <Rain motion={motion} /> : null}
      {model.seedfall ? <SeedFall motion={motion} /> : null}
      {model.beacons > 0
        ? Array.from({ length: model.beacons }, (_, index) => (
            <BeaconPost key={`beacon-${index}`} x={300 + index * 78} />
          ))
        : null}
      {model.eyries > 0 ? <EyrieLedge x={500} /> : null}
      <path className="branch-line" d="M8 136 C 120 122, 250 146, 400 128 S 580 138, 636 122" />
      {Array.from({ length: model.leaves }, (_, index) => (
        <Leaf
          key={`leaf-${index}`}
          x={LEAF_X[index % LEAF_X.length]}
          y={118 + (index % 3) * 4}
          motion={motion}
          delay={index * 0.35}
        />
      ))}
      {Array.from({ length: model.seedHeads }, (_, index) => (
        <SeedHead
          key={`head-${index}`}
          x={28 + index * 26}
          y={78}
          lean={lean}
          closed={closed}
          motion={motion}
          delay={index * 0.2}
        />
      ))}
      {Array.from({ length: model.nests }, (_, index) => (
        <NestCup key={`nest-${index}`} x={NEST_X[index]} y={112} scale={0.72} />
      ))}
      {model.roost ? <RoostMass x={470} /> : null}
      {model.archives > 0
        ? Array.from({ length: model.archives }, (_, index) => (
            <ArchiveHut key={`archive-${index}`} x={360 + index * 48} />
          ))
        : null}
      {model.granaries > 0 ? <GranaryMark x={530} /> : null}
      {model.academies > 0 ? <ArchiveHut x={560} /> : null}
      {model.solars > 0 ? <circle cx="600" cy="108" r="8" fill="var(--sun)" /> : null}
      {model.arks > 0
        ? Array.from({ length: model.arks }, (_, index) => (
            <ArkMark key={`ark-${index}`} x={430 + index * 48} y={48 + (index % 2) * 16} />
          ))
        : null}
      {model.scenery === "murmuration" ? <MurmurArc /> : null}
      {Array.from({ length: model.perched }, (_, index) => (
        <PerchedBird
          key={`bird-${index}`}
          x={perchSlot(index, model.perched)}
          sex={index % 3 === 2 ? "female" : "male"}
          pose={index === 0 && model.seedHeads > 0 && !closed ? "feed" : "perch"}
          faceLeft={index % 2 === 1 && index !== 0}
          motion={motion}
          delay={(index % 5) * 0.28}
        />
      ))}
      {model.flyer ? <Flyer motion={motion} /> : null}
      <g className="burst" aria-hidden="true">
        <circle cx="300" cy="70" r="5" fill="var(--seed)" />
        <circle cx="330" cy="54" r="3.5" fill="var(--cream)" />
        <circle cx="276" cy="48" r="3" fill="var(--bird)" />
        <circle cx="348" cy="78" r="4" fill="var(--ochre-deep)" />
      </g>
    </svg>
  );
}

function PerchedBird({
  x,
  sex,
  pose,
  faceLeft,
  motion,
  delay,
}: {
  x: number;
  sex: Sex;
  pose: "perch" | "feed";
  faceLeft: boolean;
  motion: boolean;
  delay: number;
}) {
  return (
    <g transform={`translate(${x} 98)`}>
      <g>
        {motion ? (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 0; 0 -6; 0 0"
            keyTimes="0; 0.7; 0.82; 1"
            dur="3.5s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        ) : null}
        <g transform={faceLeft ? "translate(64 0) scale(-1 1)" : undefined}>
          <g transform={pose === "feed" ? "rotate(-16 50 16)" : undefined}>
            <Goldfinch sex={sex} pose={pose} />
          </g>
        </g>
      </g>
    </g>
  );
}

function Flyer({ motion }: { motion: boolean }) {
  return (
    <g transform={motion ? "translate(-70 40)" : "translate(188 34)"}>
      {motion ? (
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-70 44; 150 28; 320 46; 470 26; 700 40"
          keyTimes="0; 0.25; 0.5; 0.75; 1"
          dur="18s"
          repeatCount="indefinite"
        />
      ) : null}
      <Goldfinch pose="fly" sex="male" />
    </g>
  );
}

function CanopyMass({ night }: { night: boolean }) {
  if (night) {
    return <ellipse cx="78" cy="156" rx="74" ry="26" fill="var(--leaf-deep)" />;
  }
  return (
    <g>
      <ellipse cx="70" cy="158" rx="110" ry="34" fill="var(--leaf-deep)" />
      <ellipse cx="230" cy="156" rx="86" ry="28" fill="var(--leaf)" opacity="0.9" />
      <ellipse cx="520" cy="160" rx="130" ry="32" fill="var(--leaf-deep)" opacity="0.85" />
    </g>
  );
}

function WindLines({ motion }: { motion: boolean }) {
  return (
    <g className="wind" fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" opacity="0.35">
      {[0, 1, 2, 3].map((index) => (
        <g key={index} transform={`translate(${70 + index * 36} ${26 + index * 14})`}>
          <g>
            {motion ? (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="-16 0; 28 0; -16 0"
                dur={`${2.4 + index * 0.35}s`}
                repeatCount="indefinite"
              />
            ) : null}
            <path d="M0 0 H70" />
          </g>
        </g>
      ))}
    </g>
  );
}

function Rain({ motion }: { motion: boolean }) {
  return (
    <g stroke="var(--rain)" strokeWidth="1.6" strokeLinecap="round">
      {Array.from({ length: 9 }, (_, index) => (
        <g key={index} transform={`translate(${40 + index * 68} ${18 + (index % 3) * 10})`}>
          {motion ? (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -16; 0 48"
              dur={`${1.3 + (index % 3) * 0.2}s`}
              begin={`${index * 0.15}s`}
              repeatCount="indefinite"
            />
          ) : null}
          <path d="M0 0 3 16" />
        </g>
      ))}
    </g>
  );
}

function SeedFall({ motion }: { motion: boolean }) {
  return (
    <g>
      {Array.from({ length: 7 }, (_, index) => (
        <g key={index} transform={`translate(${70 + index * 80} ${12 + (index % 2) * 8})`}>
          {motion ? (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -10; 8 50"
              dur={`${1.8 + (index % 3) * 0.25}s`}
              begin={`${index * 0.18}s`}
              repeatCount="indefinite"
            />
          ) : null}
          <ellipse cx="0" cy="0" rx="3.2" ry="1.8" fill="var(--seed)" />
        </g>
      ))}
    </g>
  );
}

function MurmurArc() {
  const spots = [
    [180, 36],
    [210, 28],
    [242, 22],
    [276, 18],
    [312, 20],
    [346, 26],
    [378, 34],
    [406, 44],
    [250, 40],
    [300, 36],
    [348, 46],
  ];
  return (
    <g>
      {spots.map(([x, y], index) => (
        <Chevron key={index} x={x} y={y} />
      ))}
    </g>
  );
}

function routePath(index: number): string {
  const y = 78 - index * 10;
  return `M20 ${y + 36} Q ${200 + index * 24} ${y} ${610 - index * 16} ${y + 28}`;
}
