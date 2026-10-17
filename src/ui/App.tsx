import { useState } from "react";

import {
  actName,
  calculateRates,
  dismissReport,
  getCapacity,
  getObjective,
  getSeason,
  getStorage,
  isResourceUnlocked,
  pauseGame,
  resolveEvent,
  seasonLength,
} from "../game/engine";
import { formatAmount, formatBirds, formatDuration, formatRate } from "../game/number";
import type { GameState, ResourceId } from "../game/types";
import { FlockPanel, LogPanel, PlansPanel, StudyPanel, WorldPanel } from "./panels";
import { CapSheet, EventSheet, MigrateSheet, SettingsSheet } from "./sheets";
import { useCampaign } from "./useCampaign";

type Tab = "flock" | "plans" | "study" | "world" | "log";
type Sheet =
  | null
  | "settings"
  | "migrate"
  | { kind: "cap"; id: ResourceId | "flock" };

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "flock", label: "Flock" },
  { id: "plans", label: "Plans" },
  { id: "study", label: "Study" },
  { id: "world", label: "World" },
  { id: "log", label: "Log" },
];

export function App() {
  const { game, note, legacyPresent, apply, commit, dismissNote } = useCampaign();
  const [tab, setTab] = useState<Tab>("plans");
  const [sheet, setSheet] = useState<Sheet>(null);
  const playtest = import.meta.env.BASE_URL.includes("/next/");

  if (!game) {
    return (
      <main className="boot">
        <p>Opening the notebook…</p>
      </main>
    );
  }

  const season = getSeason(game);
  const left = seasonLength(game) - (game.elapsed % seasonLength(game));
  const objective = getObjective(game);
  const modeClass = tab === "study" ? "mode-study" : tab === "log" ? "mode-log" : "mode-plans";

  return (
    <main className={`app ${modeClass}${game.won ? " won" : ""}`}>
      {playtest ? (
        <p className="playtest">
          Playtest build. The live game is unchanged at the site root.
        </p>
      ) : null}
      <header className="header">
        <div className="brand">
          <p className="eyebrow">
            Act {Math.min(game.act, 5)} · {actName(game.act)}
          </p>
          <h1>Birds vs. Everything</h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={game.paused ? "Resume the expedition" : "Pause the expedition"}
            onClick={() => apply((state) => pauseGame(state, !state.paused, Date.now()))}
          >
            {game.paused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Open settings and save tools"
            data-testid="settings"
            onClick={() => setSheet("settings")}
          >
            Save
          </button>
        </div>
        <p className="season-line" data-testid="season">
          <strong>{season.name}</strong>
          <span>{formatDuration(left)}</span>
          <span className="season-mods">{seasonMods(season)}</span>
        </p>
      </header>

      <ResourceRow
        game={game}
        onOpen={(id) => setSheet({ kind: "cap", id })}
      />

      <section className="objective" data-testid="objective">
        <div className="objective-copy">
          <p className="eyebrow">Now</p>
          <h2>{objective.title}</h2>
          <p>{objective.detail}</p>
        </div>
        <div className="meter" aria-hidden="true">
          <i style={{ width: `${Math.min(100, objective.progress * 100)}%` }} />
        </div>
        <p className="next-action">{objective.next}</p>
      </section>

      {note ? (
        <aside className="note">
          <p>{note}</p>
          <button type="button" className="btn ghost" onClick={dismissNote}>
            Dismiss
          </button>
        </aside>
      ) : null}

      {game.offlineReport ? (
        <aside className="note report" data-testid="offline-report">
          <p>
            <strong>While you were away · {formatDuration(game.offlineReport.seconds)}</strong>
            {game.offlineReport.capped
              ? " The twilight limit clipped the rest."
              : ""}
          </p>
          <p>{reportText(game)}</p>
          <button type="button" className="btn ghost" onClick={() => apply(dismissReport)}>
            Close
          </button>
        </aside>
      ) : null}

      <div className="stage">
        <FlockPanel game={game} active={tab === "flock"} apply={apply} />
        <WorldPanel game={game} active={tab === "world"} />
        <PlansPanel
          game={game}
          active={tab === "plans"}
          apply={apply}
          onMigrate={() => setSheet("migrate")}
          onStudy={() => setTab("study")}
        />
        <StudyPanel
          game={game}
          active={tab === "study"}
          apply={apply}
          onMigrate={() => setSheet("migrate")}
          onPlans={() => setTab("plans")}
        />
        <LogPanel game={game} active={tab === "log"} onPlans={() => setTab("plans")} />
      </div>

      <nav className="tabs" aria-label="Notebook sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "on" : ""}
            aria-current={tab === item.id ? "page" : undefined}
            data-testid={`tab-${item.id}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {game.pendingEvent ? (
        <EventSheet
          game={game}
          onChoose={(optionId) =>
            apply((state) => {
              const pending = state.pendingEvent;
              if (!pending) return state;
              return resolveEvent(state, pending, optionId);
            })
          }
        />
      ) : null}
      {sheet === "settings" ? (
        <SettingsSheet
          game={game}
          legacyPresent={legacyPresent}
          onClose={() => setSheet(null)}
          commit={commit}
          onMigrate={() => setSheet("migrate")}
        />
      ) : null}
      {sheet === "migrate" ? (
        <MigrateSheet game={game} onClose={() => setSheet(null)} commit={commit} />
      ) : null}
      {sheet && typeof sheet === "object" ? (
        <CapSheet game={game} id={sheet.id} onClose={() => setSheet(null)} />
      ) : null}
    </main>
  );
}

function ResourceRow({
  game,
  onOpen,
}: {
  game: GameState;
  onOpen: (id: ResourceId | "flock") => void;
}) {
  const rates = calculateRates(game);
  const chips: Array<{ id: ResourceId | "flock"; hidden?: boolean }> = [
    { id: "seeds" },
    { id: "twigs", hidden: !isResourceUnlocked(game, "twigs") },
    { id: "knowledge", hidden: !isResourceUnlocked(game, "knowledge") },
    { id: "influence", hidden: !isResourceUnlocked(game, "influence") },
    { id: "starlight", hidden: !isResourceUnlocked(game, "starlight") },
    { id: "flock" },
  ];
  return (
    <div className="resources" aria-label="Stores">
      {chips
        .filter((chip) => !chip.hidden)
        .map((chip) => (
          <ResourceChip key={chip.id} game={game} id={chip.id} rates={rates} onOpen={onOpen} />
        ))}
    </div>
  );
}

function ResourceChip({
  game,
  id,
  rates,
  onOpen,
}: {
  game: GameState;
  id: ResourceId | "flock";
  rates: ReturnType<typeof calculateRates>;
  onOpen: (id: ResourceId | "flock") => void;
}) {
  const value = id === "flock" ? game.flock : game.resources[id];
  const rate = id === "flock" ? rates.population : rates[id];
  const cap = id === "flock" ? capOfFlock(game) : capOf(game, id);
  const ratio = cap > 0 ? Math.min(1, value / cap) : 0;
  const capped = value >= cap - 0.05;
  const label = id === "flock" ? "Flock" : id[0].toUpperCase() + id.slice(1);
  const shown = id === "flock" ? formatBirds(value) : formatAmount(value, value < 100 ? 1 : 0);
  return (
    <button
      type="button"
      className={`chip${capped ? " capped" : ""}`}
      data-testid={`resource-${id}`}
      onClick={() => onOpen(id)}
    >
      <span className="chip-label">
        {label}
        {capped ? <b>Full</b> : null}
      </span>
      <span className="chip-value">
        <strong>{shown}</strong>
        <small>{formatRate(rate)}</small>
      </span>
      <span className="chip-cap">Cap {formatAmount(cap, 0)}</span>
      <span className="meter thin" aria-hidden="true">
        <i style={{ width: `${ratio * 100}%` }} />
      </span>
    </button>
  );
}

function capOf(game: GameState, id: ResourceId): number {
  return getStorage(game)[id];
}

function capOfFlock(game: GameState): number {
  return getCapacity(game);
}

function seasonMods(season: ReturnType<typeof getSeason>): string {
  return `Seeds ×${season.seed} · twigs ×${season.twig} · launches ×${season.expedition}`;
}

function reportText(game: GameState): string {
  const report = game.offlineReport;
  if (!report) return "";
  const gains = Object.entries(report.gained)
    .filter((entry): entry is [ResourceId, number] => typeof entry[1] === "number")
    .map(([key, amount]) => `${amount >= 0 ? "+" : ""}${formatAmount(amount, 0)} ${key}`);
  const bits = [
    ...gains,
    report.flockGained >= 0.5 ? `+${formatBirds(report.flockGained)} birds` : "",
    report.finished.length ? `Finished: ${report.finished.join(", ")}` : "",
    report.eventsWaiting ? `${report.eventsWaiting} choice${report.eventsWaiting === 1 ? "" : "s"} waiting` : "",
  ].filter(Boolean);
  return bits.join(" · ") || "The flock kept its watch. Nothing in the stores moved enough to note.";
}
