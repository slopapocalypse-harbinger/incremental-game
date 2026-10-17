import { useEffect, useState } from "react";

import {
  actName,
  activeBoosts,
  calculateRates,
  dismissReport,
  getCapacity,
  getObjective,
  getSeason,
  getStorage,
  growthPause,
  isResourceUnlocked,
  pauseGame,
  resolveEvent,
  seasonLength,
  visibleRoles,
} from "../game/engine";
import {
  acknowledgeArrival,
  acknowledgeArrivals,
  currentTip,
  dismissTip,
  finishIntro,
  isNewArrival,
  tabAccess,
  visibleTabs,
  type TabId,
} from "../game/guide";
import { formatAmount, formatBirds, formatDuration, formatPopulationRate, formatRate } from "../game/number";
import { sceneFromState } from "../game/scene";
import type { GameState, ResourceId, RoleId } from "../game/types";
import { projectRemark } from "../game/voice";
import { LivingScene } from "./art/canopy";
import { Icon, resourceIcon, tabIcon } from "./art/icons";
import { IntroSheet } from "./intro";
import { FlockPanel, LogPanel, PlansPanel, StudyPanel, WorldPanel } from "./panels";
import { CapSheet, EventSheet, MigrateSheet, SettingsSheet } from "./sheets";
import { useCampaign } from "./useCampaign";
import { useFlourish } from "./useFlourish";
import { useReducedMotion, useWideLayout } from "./useMotion";

type Sheet =
  | null
  | "settings"
  | "migrate"
  | { kind: "cap"; id: ResourceId | "flock" };

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "flock", label: "Flock" },
  { id: "plans", label: "Plans" },
  { id: "study", label: "Study" },
  { id: "world", label: "World" },
  { id: "log", label: "Log" },
];

export function App() {
  const { game, note, apply, commit, dismissNote } = useCampaign();
  const reducedMotion = useReducedMotion();
  const flourish = useFlourish(game);
  const [tab, setTab] = useState<TabId>("plans");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [glowRoles, setGlowRoles] = useState<RoleId[]>([]);
  const wide = useWideLayout();
  const playtest = import.meta.env.BASE_URL.includes("/next/");
  const flockShown = Boolean(game) && (wide || tab === "flock");

  useEffect(() => {
    if (!game || !flockShown) {
      setGlowRoles((current) => (current.length === 0 ? current : []));
      return;
    }
    const unseen = visibleRoles(game).filter((id) => isNewArrival(game, "role", id));
    if (unseen.length === 0) return;
    setGlowRoles((current) => {
      const merged = [...current];
      for (const id of unseen) {
        if (!merged.includes(id)) merged.push(id);
      }
      return merged.length === current.length ? current : merged;
    });
    commit((state) => acknowledgeArrivals(state, "role", unseen));
  }, [flockShown, game, commit]);

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
  const worldOpen = tabAccess(game, "world").open;
  const tip = currentTip(game, tab);
  const showingIntro = game.notebook.intro === "pending";
  const current = game;
  const freshRoles = visibleRoles(current).filter(
    (id) => glowRoles.includes(id) || isNewArrival(current, "role", id),
  );

  function selectTab(id: TabId): void {
    if (id === "flock") {
      const unseen = visibleRoles(current).filter((role) => isNewArrival(current, "role", role));
      if (unseen.length > 0) {
        setGlowRoles((current) => {
          const merged = [...current];
          for (const role of unseen) {
            if (!merged.includes(role)) merged.push(role);
          }
          return merged.length === current.length ? current : merged;
        });
        commit((state) => acknowledgeArrivals(state, "role", unseen));
      }
    } else if (tab === "flock") {
      setGlowRoles([]);
    }
    setTab(id);
    if (isNewArrival(current, "tab", id)) commit((state) => acknowledgeArrival(state, "tab", id));
  }

  return (
    <main className={`app ${modeClass}${worldOpen ? "" : " world-closed"}${game.won ? " won" : ""}`}>
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
        <div className="canopy-wrap" data-testid="canopy">
          <LivingScene
            model={sceneFromState(game)}
            motion={!reducedMotion}
            layout="strip"
            celebrating={flourish ? (flourish.era ? "era" : "plan") : null}
          />
          {flourish ? (
            <p className="flourish-line" role="status">
              {projectRemark(flourish.id)}
            </p>
          ) : null}
        </div>
      </header>

      <ResourceRow
        game={game}
        onOpen={(id) => setSheet({ kind: "cap", id })}
      />

      <section className="objective" data-testid="objective">
        <h2>{objective.title}</h2>
        <p className="next-action">{game.won ? objective.detail : objective.next}</p>
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

      {tip ? (
        <aside className="tip" data-testid="tip">
          <p>
            <strong>{tip.title}.</strong> {tip.body}
          </p>
          <button
            type="button"
            className="btn ghost"
            data-testid="dismiss-tip"
            onClick={() => commit((state) => dismissTip(state, tip.id))}
          >
            Got it
          </button>
        </aside>
      ) : null}

      <div className="stage">
        <FlockPanel
          game={game}
          active={tab === "flock"}
          shown={flockShown}
          freshRoles={freshRoles}
          apply={apply}
        />
        <WorldPanel game={game} active={tab === "world"} open={worldOpen} />
        <PlansPanel
          game={game}
          active={tab === "plans"}
          apply={apply}
          onMigrate={() => setSheet("migrate")}
          onStudy={() => selectTab("study")}
        />
        <StudyPanel
          game={game}
          active={tab === "study"}
          apply={apply}
          onMigrate={() => setSheet("migrate")}
          onPlans={() => selectTab("plans")}
        />
        <LogPanel game={game} active={tab === "log"} onPlans={() => selectTab("plans")} />
      </div>

      <nav className="tabs" aria-label="Notebook sections">
        {visibleTabs(game).map((id) => {
          const item = TABS.find((entry) => entry.id === id);
          if (!item) return null;
          const selected = tab === item.id;
          const fresh = isNewArrival(game, "tab", item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`${selected ? "on" : ""}${fresh ? " reveal" : ""}`}
              aria-current={selected ? "page" : undefined}
              data-testid={`tab-${item.id}`}
              data-open="true"
              data-new={fresh ? "true" : "false"}
              onClick={() => selectTab(item.id)}
            >
              <Icon name={tabIcon(item.id)} />
              <span>{item.label}</span>
              {fresh ? (
                <span className="new-dot" data-testid={`new-tab-${item.id}`} aria-label="New" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {game.pendingEvent ? (
        <EventSheet
          game={game}
          onChoose={(optionId) =>
            apply((state) => {
              const pending = state.pendingEvent;
              if (!pending) return state;
              const noted = dismissTip(state, "events");
              return resolveEvent(noted, pending, optionId);
            })
          }
        />
      ) : null}
      {sheet === "settings" ? (
        <SettingsSheet
          game={game}
          onClose={() => setSheet(null)}
          commit={commit}
          onMigrate={() => setSheet("migrate")}
        />
      ) : null}
      {sheet === "migrate" ? (
        <MigrateSheet game={game} onClose={() => setSheet(null)} commit={commit} />
      ) : null}
      {sheet && typeof sheet === "object" ? (
        <CapSheet
          game={game}
          id={sheet.id}
          onClose={() => setSheet(null)}
          onStaff={
            sheet.id === "flock"
              ? () => {
                  setSheet(null);
                  selectTab("flock");
                }
              : undefined
          }
        />
      ) : null}
      {showingIntro ? (
        <IntroSheet
          onAdvance={() => commit((state) => finishIntro(state))}
          onSkip={() => commit((state) => finishIntro(state))}
        />
      ) : null}
    </main>
  );
}

function BoostPills({ game }: { game: GameState }) {
  const boosts = activeBoosts(game);
  if (boosts.length === 0) return null;
  return (
    <div className="boosts" data-testid="active-boosts">
      {boosts.map((boost) => (
        <p className="boost-pill" key={boost.id}>
          <Icon name="boost" />
          <span>
            {boost.label} {formatDuration(boost.remaining)}
          </span>
        </p>
      ))}
    </div>
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
      <BoostPills game={game} />
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
  const flock = id === "flock";
  const value = flock ? game.flock : game.resources[id];
  const rate = flock ? rates.population : rates[id];
  const cap = flock ? capOfFlock(game) : capOf(game, id);
  const ratio = cap > 0 ? Math.min(1, value / cap) : 0;
  const showCap = !flock || game.act >= 2;
  const capped = showCap && value >= cap - 0.05;
  const label = flock ? "Flock" : id[0].toUpperCase() + id.slice(1);
  const shown = flock ? formatBirds(value) : formatAmount(value, value < 100 ? 1 : 0);
  const pause = flock ? growthPause(game) : null;
  const rateText = flock ? formatPopulationRate(rate) : formatRate(rate);
  return (
    <button
      type="button"
      className={`chip${flock ? " chip-flock" : ""}${capped ? " capped" : ""}${pause ? " has-note" : ""}`}
      data-testid={`resource-${id}`}
      onClick={() => onOpen(id)}
    >
      <span className="chip-label">
        <span className="chip-name">
          <Icon name={resourceIcon(id)} />
          {label}
        </span>
        {capped ? <b>Full</b> : null}
      </span>
      <span className="chip-value">
        <strong>{shown}</strong>
        {pause && !showCap ? null : (
          <small>
            {pause ? null : (
              <span className="chip-rate" data-testid={flock ? "flock-rate" : undefined}>
                {rateText}
              </span>
            )}
            {showCap ? <span className="chip-inline-cap">cap {formatAmount(cap, 0)}</span> : null}
          </small>
        )}
      </span>
      {pause ? (
        <span className="chip-note" data-testid="flock-growth">
          {pause}
        </span>
      ) : null}
      {showCap ? <span className="chip-cap">Cap {formatAmount(cap, 0)}</span> : null}
      {showCap ? (
        <span className="meter thin" aria-hidden="true">
          <i style={{ width: `${ratio * 100}%` }} />
        </span>
      ) : null}
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
  return `Seeds ×${season.seed} · twigs ×${season.twig} · knowledge ×${season.knowledge}`;
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
