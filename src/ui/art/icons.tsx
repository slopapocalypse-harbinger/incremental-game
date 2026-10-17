import type { ResourceId, RoleId } from "../../game/types";
import type { TabId } from "../../game/guide";

export type IconName =
  | ResourceId
  | "flock"
  | RoleId
  | "plans"
  | "world"
  | "log"
  | "foundation"
  | "expedition"
  | "structure"
  | "season"
  | "era"
  | "flock-plan"
  | "civic"
  | "diplomacy"
  | "roost"
  | "harbor"
  | "crossing"
  | "stewardship"
  | "ingenuity"
  | "wanderlust";

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <Glyph name={name} />
    </svg>
  );
}

export function resourceIcon(id: ResourceId | "flock"): IconName {
  return id;
}

export function tabIcon(id: TabId): IconName {
  if (id === "plans") return "plans";
  if (id === "study") return "knowledge";
  if (id === "world") return "world";
  if (id === "log") return "log";
  return "flock";
}

export function categoryIcon(category: string): IconName {
  switch (category) {
    case "Foundation":
      return "foundation";
    case "Expedition":
      return "expedition";
    case "Structure":
      return "structure";
    case "Season":
      return "season";
    case "Era":
      return "era";
    case "Knowledge":
      return "knowledge";
    case "Flock":
      return "flock-plan";
    case "Civic":
      return "civic";
    case "Diplomacy":
      return "diplomacy";
    case "Civic roost":
      return "roost";
    case "Harbor":
      return "harbor";
    case "Crossing":
      return "crossing";
    default:
      return "plans";
  }
}

function Glyph({ name }: { name: IconName }) {
  switch (name) {
    case "seeds":
      return (
        <g>
          <ellipse cx="8.5" cy="13" rx="3.6" ry="5.2" fill="var(--ochre)" />
          <ellipse cx="14" cy="11.2" rx="3.3" ry="4.8" fill="var(--ochre)" />
          <ellipse cx="12.2" cy="15.4" rx="2.8" ry="3.6" fill="var(--clay)" />
          <path d="M8.4 9.6c.3 2.2.3 4.2 0 6.2" stroke="var(--ink)" strokeWidth="0.9" fill="none" />
        </g>
      );
    case "twigs":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M5 18 17.5 6.5" />
          <path d="M7 7.5 19 17.5" />
          <path d="M15.5 6.2 18.5 4" />
          <path d="M6.2 9.2 4 7.2" />
        </g>
      );
    case "knowledge":
    case "scholars":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M4 6.5h7v12H4zM13 6.5h7v12h-7z" />
          <path d="M12 6.5v12" />
          <path d="M6.2 10h3M14.8 10h3" stroke="var(--ochre)" strokeLinecap="round" />
        </g>
      );
    case "influence":
    case "envoys":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="6.5" cy="14" r="2.1" fill="var(--ochre)" stroke="none" />
          <path d="M11 15.5c1.4-2.2 1.4-5 0-7.2" />
          <path d="M14.2 16.5c2.2-3.4 2.2-7.2 0-10.6" />
          <path d="M17.6 17.5c2.8-4.2 2.8-9 0-13" />
        </g>
      );
    case "starlight":
    case "navigators":
    case "crossing":
      return <path d="M12 2.2 13.5 9.4 20.8 12 13.5 14.6 12 21.8 10.5 14.6 3.2 12 10.5 9.4Z" fill="var(--ochre)" />;
    case "flock":
    case "foragers":
      return <GoldfinchMark />;
    case "weavers":
    case "structure":
      return (
        <g>
          <path d="M4 10c2.2 7.5 13.8 7.5 16 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7.2 11c1.8 4 7.8 4 9.6 0" fill="var(--ochre)" />
          <path d="M6 10c2-3 4 1 6-2 2 3 4-1 6 2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      );
    case "scouts":
    case "expedition":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M3 16c4-1 7-1 10 1 2-4 5-6 8-7" strokeDasharray="2.2 2.4" />
          <path d="M17.5 7.2 21 9.6 18.2 12" />
        </g>
      );
    case "broodkeepers":
    case "flock-plan":
      return (
        <g>
          <ellipse cx="8" cy="14" rx="3.4" ry="2.3" fill="var(--ochre)" />
          <ellipse cx="15.5" cy="13.2" rx="3.6" ry="2.4" fill="var(--ochre)" />
          <circle cx="11" cy="12.4" r="1.5" fill="var(--ink)" />
          <circle cx="18.4" cy="11.6" r="1.6" fill="var(--ink)" />
          <path d="M18.8 11.8 21.4 12.6 18.8 13.4" fill="var(--clay)" />
          <path d="M4 18c3 2 13 2 17 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      );
    case "plans":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M8 8.5h8M8 12h8M8 15.5h5" />
        </g>
      );
    case "world":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M12 21 V8" />
          <path d="M12 14c-4-1-6-4-7-7 4 1 6 3 7 7Z" fill="var(--leaf)" stroke="none" />
          <path d="M12 12c4-1 6-3 7-6-4 .8-6 2.6-7 6Z" fill="var(--ochre)" stroke="none" />
          <path d="M7 11c2-2 3-2 5 0M12 9c2-2 3-2 5 0" />
        </g>
      );
    case "log":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M6 4.5h10.5A2.5 2.5 0 0 1 19 7v12.5H8.5A2.5 2.5 0 0 1 6 17Z" />
          <path d="M6 7h2.2" />
          <path d="M10 9.5h6M10 12.5h6M10 15.5h4" stroke="var(--ochre)" />
        </g>
      );
    case "foundation":
    case "stewardship":
      return (
        <g>
          <path d="M4 11h16v7.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <ellipse cx="9" cy="14.5" rx="1.6" ry="2" fill="var(--ochre)" />
          <ellipse cx="12.5" cy="14.2" rx="1.5" ry="1.9" fill="var(--ochre)" />
          <ellipse cx="15.4" cy="15" rx="1.4" ry="1.7" fill="var(--clay)" />
        </g>
      );
    case "season":
      return (
        <g>
          <circle cx="12" cy="12" r="3.2" fill="var(--ochre)" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M12 3.2v2.4M12 18.4v2.4M3.2 12h2.4M18.4 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
          </g>
        </g>
      );
    case "era":
    case "roost":
      return (
        <g>
          <path d="M3 12.5 12 5l9 7.5" fill="var(--leaf)" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M6.5 12v6.5h11V12" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 18.5v-3.2h4v3.2" fill="var(--ochre)" stroke="currentColor" strokeWidth="1.2" />
        </g>
      );
    case "civic":
      return (
        <g>
          <path d="M12 20 V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="5.2" r="2.6" fill="var(--ochre)" />
          <circle cx="12" cy="5.2" r="1" fill="var(--cream)" />
        </g>
      );
    case "diplomacy":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h6M14 12h6" />
          <path d="M8 8.5 12.5 12 8 15.5" />
          <path d="M16 8.5 11.5 12 16 15.5" />
        </g>
      );
    case "harbor":
      return (
        <g>
          <circle cx="12" cy="8" r="3" fill="var(--ochre)" />
          <path d="M4 17c2.4 2 13.6 2 16 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M8 17c1.2 2.2 6.8 2.2 8 0" fill="var(--cream)" stroke="currentColor" strokeWidth="1.2" />
        </g>
      );
    case "ingenuity":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M6 19 16 5" />
          <path d="M16 5 19 8.2 14.5 9.2Z" fill="var(--ochre)" stroke="none" />
          <path d="M8.5 15.5 12 12" />
          <circle cx="18.2" cy="15.5" r="1.3" fill="var(--ochre)" stroke="none" />
        </g>
      );
    case "wanderlust":
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M3 15c4-1 8-1 11 2 2-5 5-7 7-8" strokeDasharray="2 2.2" />
          <path d="M17.2 6.2 21 8.4 17.6 11.2" />
          <circle cx="6" cy="13.6" r="1.5" fill="var(--ochre)" stroke="none" />
        </g>
      );
    default:
      return null;
  }
}

function GoldfinchMark() {
  return (
    <g>
      <path d="M2 13.2 6.8 11.8 6.8 15.2Z" fill="currentColor" />
      <ellipse cx="12.2" cy="13.4" rx="5.4" ry="3.5" fill="var(--ochre)" />
      <path d="M9.2 12.2c2.2-.8 4.6-.2 6 1.4-2.2 0-4 .4-6 1.4-.2-1-.2-2 0-2.8Z" fill="currentColor" />
      <path d="M10.2 12.6h3.4" stroke="var(--cream)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="16.4" cy="11.8" r="2.5" fill="var(--ochre)" />
      <path d="M14.6 10.4c.8-1.5 2.6-1.6 3.4 0-1.2-.4-2.4-.1-3.4.5Z" fill="currentColor" />
      <path d="M18.4 11.8 21.6 12.8 18.5 13.8Z" fill="var(--clay)" />
      <circle cx="16.9" cy="11.4" r="0.55" fill="currentColor" />
    </g>
  );
}
