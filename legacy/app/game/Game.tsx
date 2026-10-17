"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ACT_NAMES,
  COMMITMENTS,
  DOCTRINES,
  EVENTS,
  ROLE_DEFS,
  TECHS,
  advanceGame,
  assignRole,
  calculateRates,
  canPurchaseTech,
  canStartCommitment,
  canCompleteOnboardingStep,
  chooseDoctrine,
  completeOnboardingStep,
  createInitialState,
  formatBirds,
  formatCosts,
  formatDuration,
  formatMissingCosts,
  formatNumber,
  getAvailableCommitments,
  getCapSources,
  getCapacity,
  getCommitmentDuration,
  getCondition,
  getIdleBirds,
  getOnboardingStep,
  getObjective,
  getRoleYield,
  getStorage,
  hydrateState,
  isResourceUnlocked,
  isRoleUnlocked,
  purchaseTech,
  recallCommitment,
  resolveEvent,
  startCommitment,
  tickGame,
  type CommitmentDefinition,
  type DoctrineId,
  type GameState,
  type ResourceId,
  type RoleId,
} from "./engine";

const SAVE_KEY = "birds-vs-everything-v3";
type Drawer = "chronicle" | "settings" | null;
type ProgressView = "plans" | "research";

function EvolvingWorld({ game }: { game: GameState }) {
  const activeDefinition = game.active
    ? COMMITMENTS.find((item) => item.id === game.active?.id)
    : null;
  const progress = game.active
    ? 1 - game.active.remaining / game.active.duration
    : 0;
  const resourceMass =
    game.resources.seeds +
    game.resources.twigs +
    game.resources.knowledge * 2 +
    game.resources.influence * 8 +
    game.resources.starlight * 5;
  const birdActivity = Math.min(
    18,
    2 + Math.floor(Math.log10(1 + resourceMass) * 2) + game.act,
  );
  const moteActivity = Math.min(
    14,
    Math.floor(Math.log10(1 + game.resources.seeds + game.resources.twigs) * 3),
  );
  const completedPlans = COMMITMENTS.filter((commitment) =>
    game.completed.includes(commitment.id),
  ).slice(-7);
  const completedResearch = game.techs.slice(-7);

  return (
    <div
      className={`world-scene act-${game.act}`}
      role="img"
      aria-label={`Living atlas for Act ${game.act}, ${ACT_NAMES[game.act]}. ${
        game.nests
      } nests, ${game.roosts} roosts, ${game.systems.toFixed(1)} star systems.`}
    >
      <div className="atlas-grid" aria-hidden="true" />
      <div className="wildlife-layer" aria-hidden="true">
        {Array.from({ length: birdActivity }).map((_, index) => (
          <i
            className="flying-bird"
            key={`flying-bird-${index}`}
            style={
              {
                "--flight-delay": `${-index * 1.37}s`,
                "--flight-duration": `${8 + (index % 6) * 1.15}s`,
                "--flight-top": `${9 + ((index * 17) % 61)}%`,
                "--flight-scale": `${0.62 + (index % 4) * 0.16}`,
              } as CSSProperties
            }
          />
        ))}
        {Array.from({ length: moteActivity }).map((_, index) => (
          <b
            className="resource-mote"
            key={`resource-mote-${index}`}
            style={
              {
                "--mote-left": `${12 + ((index * 23) % 76)}%`,
                "--mote-delay": `${-index * 0.73}s`,
                "--mote-duration": `${4.8 + (index % 5) * 0.8}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      {game.act <= 2 && (
        <div className="habitat-art" aria-hidden="true">
          <div className="sun-disc" />
          <div className="tree-crown crown-a" />
          <div className="tree-crown crown-b" />
          <div className="tree-crown crown-c" />
          <div className="tree-trunk" />
          <div className="tree-branch branch-left" />
          <div className="tree-branch branch-right" />
          {game.nests > 0 ? (
            <div className="main-nest">
              <span />
            </div>
          ) : null}
          {Array.from({ length: Math.min(7, game.nests) }).map((_, index) => (
            <i
              className={`small-nest nest-${index + 1}`}
              key={`nest-${index}`}
            />
          ))}
          {game.roosts > 0 && <div className="roost-platform" />}
          {game.archives > 0 && (
            <div className="archive-tower">
              <i />
              <i />
              <i />
            </div>
          )}
          {game.act >= 2 && <div className="settlement-path" />}
        </div>
      )}
      {game.act === 3 && (
        <div className="planet-art" aria-hidden="true">
          <div className="planet-orbit orbit-a" />
          <div className="planet-orbit orbit-b" />
          <div className="planet-core">
            <i className="continent one" />
            <i className="continent two" />
            <i className="continent three" />
            {Array.from({ length: Math.max(1, game.beacons) }).map((_, index) => (
              <b className={`beacon beacon-${index + 1}`} key={`beacon-${index}`} />
            ))}
          </div>
          <div className="murmuration-cloud" />
        </div>
      )}
      {game.act >= 4 && (
        <div className="galaxy-art" aria-hidden="true">
          <div className="home-star" />
          <div className="galaxy-orbit orbit-one" />
          <div className="galaxy-orbit orbit-two" />
          <div className="galaxy-orbit orbit-three" />
          {Array.from({ length: Math.max(1, Math.min(10, Math.floor(game.systems))) }).map(
            (_, index) => (
              <i
                className={`star-node star-${index + 1}`}
                key={`star-${index}`}
              >
                <span />
              </i>
            ),
          )}
          {Array.from({ length: Math.max(0, game.solarNests) }).map((_, index) => (
            <b className={`solar-nest solar-${index + 1}`} key={`solar-${index}`} />
          ))}
          <div className="migration-arc" />
        </div>
      )}
      {completedPlans.length || completedResearch.length ? (
        <div className="completion-garland" aria-hidden="true">
          {completedPlans.map((plan) => (
            <i className="plan-token" key={`plan-token-${plan.id}`} />
          ))}
          {completedResearch.map((techId) => (
            <i className="research-token" key={`research-token-${techId}`} />
          ))}
        </div>
      ) : null}

      {game.active ? (
        <div className="commitment-float" aria-live="polite">
          <span className="eyebrow">Watch · active commitment</span>
          <div className="commitment-title-row">
            <h3>{activeDefinition?.name ?? "The flock is at work"}</h3>
            <strong>{formatDuration(game.active.remaining)}</strong>
          </div>
          <div className="commitment-progress">
            <i style={{ width: `${Math.max(2, progress * 100)}%` }} />
          </div>
          <div className="commitment-meta">
            <span>{game.active.birds} birds committed</span>
            <span>{activeDefinition?.forecast}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResourceChip({
  id,
  value,
  rate,
  cap,
  capSources,
  hidden,
}: {
  id: ResourceId | "flock";
  value: number;
  rate: number;
  cap?: number;
  capSources?: string[];
  hidden?: boolean;
}) {
  if (hidden) return null;
  const label = id === "flock" ? "Flock" : id[0].toUpperCase() + id.slice(1);
  const capRatio = cap ? Math.min(1, value / cap) : 0;
  const capped = Boolean(cap && value >= cap - 0.05);
  return (
    <div
      className={`resource-chip resource-${id}${capped ? " capped" : ""}`}
      tabIndex={0}
      aria-label={`${label}: ${
        id === "flock" ? formatBirds(value) : formatNumber(value, value < 100 ? 1 : 0)
      } of ${formatNumber(cap ?? 0, 0)}. ${capped ? "At cap." : ""}`}
    >
      <span className="resource-label">
        <i />
        {label}
        {capped ? <b>At cap</b> : null}
      </span>
      <div>
        <strong>
          {id === "flock"
            ? formatBirds(value)
            : formatNumber(value, value < 100 ? 1 : 0)}
        </strong>
        <small>
          {rate >= 0 ? "+" : ""}
          {formatNumber(rate, 2)}/s
        </small>
      </div>
      <span className="resource-cap-readout">
        Cap {formatNumber(cap ?? 0, 0)}
      </span>
      {cap ? (
        <span className="capacity-line" aria-label={`${Math.round(capRatio * 100)}% full`}>
          <i style={{ width: `${capRatio * 100}%` }} />
        </span>
      ) : null}
      {capSources?.length ? (
        <div className="cap-tooltip" role="tooltip">
          <strong>{label} cap comes from</strong>
          {capSources.map((source) => (
            <span key={source}>{source}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DecisionCard({
  commitment,
  game,
  selected,
  onSelect,
}: {
  commitment: CommitmentDefinition;
  game: GameState;
  selected: boolean;
  onSelect: () => void;
}) {
  const readiness = canStartCommitment(game, commitment);
  return (
    <button
      className={`decision-card${selected ? " selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="decision-topline">
        <small>{commitment.category}</small>
        <small>
          {selected ? "Selected · " : ""}
          {formatDuration(getCommitmentDuration(game, commitment))}
        </small>
      </span>
      <span className="decision-title">{commitment.name}</span>
      <span className="decision-description">{commitment.description}</span>
      <span className="decision-cost">{formatCosts(commitment.costs)}</span>
      <span className="decision-forecast">
        ↗ {commitment.forecast} · {commitment.birds} birds
      </span>
      {!readiness.ok && selected ? (
        <span className="decision-warning">{readiness.reason}</span>
      ) : null}
    </button>
  );
}

function ResearchPanel({
  game,
  onPurchase,
}: {
  game: GameState;
  onPurchase: (techId: string) => void;
}) {
  const visibleTechs = TECHS.filter((tech) => tech.act <= game.act);
  return (
    <>
      <span className="eyebrow">Develop · permanent improvements</span>
      <h2 id="decision-heading">Research the Next Advantage</h2>
      <p className="decision-intro">
        Research permanently changes production, storage, or project pacing.
      </p>
      <div className="research-list">
        {visibleTechs.map((tech) => {
          const owned = game.techs.includes(tech.id);
          const available = canPurchaseTech(game, tech);
          return (
            <article
              className={`research-card${owned ? " owned" : ""}`}
              key={tech.id}
            >
              <span>{owned ? "Learned" : `Act ${tech.act} research`}</span>
              <h3>{tech.name}</h3>
              <p>{tech.description}</p>
              <small>{formatCosts(tech.cost)}</small>
              {!owned && !available ? (
                <small className="research-missing">
                  {formatMissingCosts(game, tech.cost)}
                </small>
              ) : null}
              <button
                className={available ? "primary-button" : "secondary-button"}
                disabled={owned || !available}
                onClick={() => onPurchase(tech.id)}
              >
                {owned ? "Researched" : `Research ${tech.name}`}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function Game() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>("survey-canopy");
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [progressView, setProgressView] = useState<ProgressView>("plans");
  const [transfer, setTransfer] = useState("");
  const [resetArmed, setResetArmed] = useState(false);
  const lastTick = useRef(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const now = Date.now();
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          const parsed = hydrateState(saved);
          const offlineSeconds = Math.max(
            0,
            Math.min(
              4 * 60 * 60,
              (now - Number(saved.lastSavedAt || now)) / 1000,
            ),
          );
          setGame(advanceGame(parsed, offlineSeconds));
        }
      } catch {
        localStorage.removeItem(SAVE_KEY);
      }
      lastTick.current = now;
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.min(2, (now - lastTick.current) / 1000);
      lastTick.current = now;
      setGame((current) => tickGame(current, delta));
    }, 250);
    return () => window.clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      setGame((current) => {
        const saved = { ...current, lastSavedAt: Date.now() };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
        return saved;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [ready]);

  const rates = useMemo(() => calculateRates(game), [game]);
  const storage = useMemo(() => getStorage(game), [game]);
  const objective = useMemo(() => getObjective(game), [game]);
  const onboarding = useMemo(() => getOnboardingStep(game), [game]);
  const decisions = useMemo(() => getAvailableCommitments(game), [game]);
  const visibleTechs = useMemo(
    () => TECHS.filter((tech) => tech.act <= game.act),
    [game.act],
  );
  const visibleResearchOwned = visibleTechs.filter((tech) =>
    game.techs.includes(tech.id),
  ).length;
  const affordableResearch = visibleTechs.filter(
    (tech) => !game.techs.includes(tech.id) && canPurchaseTech(game, tech),
  ).length;
  const condition = useMemo(() => getCondition(game), [game]);
  const activeEffects = game.effects.filter(
    (effect) => effect.until > game.elapsed,
  );
  const activeDefinition = game.active
    ? COMMITMENTS.find((item) => item.id === game.active?.id) ?? null
    : null;
  const pendingEvent = EVENTS.find((event) => event.id === game.pendingEvent);
  const effectiveSelection =
    selected && decisions.some((decision) => decision.id === selected)
      ? selected
      : decisions[0]?.id ?? null;
  const selectedDefinition = decisions.find(
    (decision) => decision.id === effectiveSelection,
  );
  const readiness = selectedDefinition
    ? canStartCommitment(game, selectedDefinition)
    : { ok: false, reason: "Choose a plan." };

  function commitSelected() {
    if (!selectedDefinition) return;
    setGame((current) => startCommitment(current, selectedDefinition.id));
  }

  function importSave() {
    try {
      const parsed = hydrateState(JSON.parse(transfer));
      setGame(parsed);
      localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
      setDrawer(null);
    } catch {
      setTransfer("That save could not be read.");
    }
  }

  function hardReset() {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    const fresh = createInitialState();
    localStorage.removeItem(SAVE_KEY);
    setGame(fresh);
    setSelected("survey-canopy");
    setProgressView("plans");
    setResetArmed(false);
    setDrawer(null);
  }

  return (
    <main className={`game-root${game.won ? " game-won" : ""}`}>
      <header className="topbar">
        <div className="brand-lockup">
          <span className="eyebrow">
            Act {Math.min(4, game.act)} · {ACT_NAMES[game.act]}
          </span>
          <h1>Birds vs. Everything</h1>
        </div>
        <div className="resource-strip" aria-label="Current resources">
          <ResourceChip
            id="seeds"
            value={game.resources.seeds}
            rate={rates.seeds}
            cap={storage.seeds}
            capSources={getCapSources(game, "seeds")}
          />
          <ResourceChip
            id="twigs"
            value={game.resources.twigs}
            rate={rates.twigs}
            cap={storage.twigs}
            capSources={getCapSources(game, "twigs")}
            hidden={!isResourceUnlocked(game, "twigs")}
          />
          <ResourceChip
            id="knowledge"
            value={game.resources.knowledge}
            rate={rates.knowledge}
            cap={storage.knowledge}
            capSources={getCapSources(game, "knowledge")}
            hidden={!isResourceUnlocked(game, "knowledge")}
          />
          <ResourceChip
            id="influence"
            value={game.resources.influence}
            rate={rates.influence}
            cap={100}
            capSources={getCapSources(game, "influence")}
            hidden={!isResourceUnlocked(game, "influence")}
          />
          <ResourceChip
            id="starlight"
            value={game.resources.starlight}
            rate={rates.starlight}
            cap={storage.starlight}
            capSources={getCapSources(game, "starlight")}
            hidden={!isResourceUnlocked(game, "starlight")}
          />
          <ResourceChip
            id="flock"
            value={game.flock}
            rate={rates.population}
            cap={getCapacity(game)}
            capSources={getCapSources(game, "flock")}
            hidden={!game.completed.includes("first-nest")}
          />
        </div>
        <div className="top-actions">
          <button
            className="icon-button"
            onClick={() => setGame((current) => ({ ...current, paused: !current.paused }))}
            aria-label={game.paused ? "Resume simulation" : "Pause simulation"}
          >
            {game.paused ? "▶" : "Ⅱ"}
          </button>
          <button
            className="icon-button"
            onClick={() => setDrawer("settings")}
            aria-label="Open settings and save tools"
          >
            ⚙
          </button>
        </div>
      </header>

      <section className="game-workspace">
        <aside className="roles-panel" aria-labelledby="roles-heading">
          <span className="eyebrow">Plan</span>
          <h2 id="roles-heading">Flock Roles</h2>
          <div className="idle-callout">
            <strong>{formatBirds(getIdleBirds(game))} idle birds</strong>
            <span>
              Reassign them to change what the living atlas produces next.
            </span>
          </div>
          <div className="role-list">
            {ROLE_DEFS.filter((role) => isRoleUnlocked(game, role.id)).map((role) => (
              <div className="role-row" key={role.id}>
                <span className={`role-mark ${role.color}`} aria-hidden="true" />
                <div className="role-copy">
                  <strong>{role.name}</strong>
                  <small>{role.description}</small>
                  <small className="role-yield">
                    {getRoleYield(game, role.id)}
                  </small>
                </div>
                <div className="stepper">
                  <button
                    onClick={() =>
                      setGame((current) =>
                        assignRole(current, role.id as RoleId, -1),
                      )
                    }
                    disabled={game.roles[role.id] <= 0}
                    aria-label={`Remove one ${role.name}`}
                  >
                    −
                  </button>
                  <strong>{game.roles[role.id]}</strong>
                  <button
                    onClick={() =>
                      setGame((current) =>
                        assignRole(current, role.id as RoleId, 1),
                      )
                    }
                    disabled={Math.floor(getIdleBirds(game) + 1e-6) < 1}
                    aria-label={`Assign one ${role.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="panel-footnote">
            <span>Morale</span>
            <div className="morale-track">
              <i style={{ width: `${game.morale * 100}%` }} />
            </div>
            <strong>{Math.round(game.morale * 100)}%</strong>
          </div>
        </aside>

        <section className="atlas-column" aria-labelledby="atlas-heading">
          <div className="atlas-heading">
            <div>
              <span className="eyebrow">Observe</span>
              <h2 id="atlas-heading">
                {game.act === 1
                  ? "The Sunward Canopy"
                  : game.act === 2
                    ? "The Growing Aerie"
                    : game.act === 3
                      ? "The Open-Sky World"
                      : game.act === 4
                        ? "The Stellar Flyways"
                        : "A Living Galaxy"}
              </h2>
            </div>
            <div className="atlas-legend">
              <span>
                <i className="flow-key" /> {game.nests} nests
              </span>
              <span>
                <i className="forecast-key" /> {game.roosts} roosts
              </span>
            </div>
          </div>
          <EvolvingWorld game={game} />
          <div
            className={`atlas-status-bar${
              game.completed.includes("first-nest") ? "" : " single"
            }`}
            aria-label="Living atlas status"
          >
            <div>
              <span className="eyebrow">Weather now</span>
              <strong>{condition.name}</strong>
              <small>
                Foragers {condition.seed >= 1 ? "+" : ""}
                {Math.round((condition.seed - 1) * 100)}%
                {isRoleUnlocked(game, "weavers") ? (
                  <>
                    {" "}
                    · Weavers {condition.twig >= 1 ? "+" : ""}
                    {Math.round((condition.twig - 1) * 100)}%
                  </>
                ) : null}
              </small>
            </div>
            {game.completed.includes("first-nest") ? (
              <div>
                <span className="eyebrow">Temporary effects</span>
                {activeEffects.length ? (
                  activeEffects.map((effect) => (
                    <strong key={effect.id}>
                      {effect.id === "seedfall"
                        ? "Great Seedfall"
                        : "Diplomatic Tailwind"}{" "}
                      · {formatDuration(effect.until - game.elapsed)}
                    </strong>
                  ))
                ) : (
                  <strong>No active boost</strong>
                )}
                <small>Field plans can create timed production synergies.</small>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="decision-panel" aria-labelledby="decision-heading">
          {pendingEvent ? (
            <>
              <span className="eyebrow">{pendingEvent.eyebrow}</span>
              <h2 id="decision-heading">{pendingEvent.title}</h2>
              <p className="decision-intro">{pendingEvent.text}</p>
              <div className="event-graphic" aria-hidden="true">
                <i />
                <i />
                <i />
                <span />
              </div>
              <div className="event-options">
                {pendingEvent.options.map((option) => (
                  <button
                    className="event-option"
                    key={option.id}
                    onClick={() =>
                      setGame((current) =>
                        resolveEvent(current, pendingEvent.id, option.id),
                      )
                    }
                  >
                    <strong>{option.name}</strong>
                    <span>{option.effect}</span>
                  </button>
                ))}
              </div>
            </>
          ) : game.act >= 2 && !game.doctrine ? (
            <>
              <span className="eyebrow">Adapt · choose once</span>
              <h2 id="decision-heading">Choose a Flight Doctrine</h2>
              <p className="decision-intro">
                This changes the shape of the entire campaign, including its
                ending.
              </p>
              <div className="doctrine-list">
                {DOCTRINES.map((doctrine) => (
                  <button
                    key={doctrine.id}
                    className="doctrine-card"
                    onClick={() =>
                      setGame((current) =>
                        chooseDoctrine(current, doctrine.id as DoctrineId),
                      )
                    }
                  >
                    <strong>{doctrine.name}</strong>
                    <span>{doctrine.description}</span>
                    <small>{doctrine.tradeoff}</small>
                  </button>
                ))}
              </div>
            </>
          ) : game.won ? (
            <div className="ending-panel">
              <span className="eyebrow">The feathered finale</span>
              <h2 id="decision-heading">Everything has become a flyway</h2>
              <div className="ending-sun" aria-hidden="true">
                <i />
              </div>
              <p>{objective.detail}</p>
              <button className="primary-button" onClick={() => setDrawer("chronicle")}>
                Read the completed chronicle
              </button>
            </div>
          ) : onboarding ? (
            <div className="onboarding-panel">
              <span className="eyebrow">
                Learn · foundation {onboarding.id === "seed-cache" ? "1" : "2"} of 2
              </span>
              <h2 id="decision-heading">{onboarding.title}</h2>
              <p className="decision-intro">{onboarding.description}</p>
              <div className={`onboarding-graphic ${onboarding.id}`} aria-hidden="true">
                <i />
                <i />
                <span />
              </div>
              <div className="unlock-preview">
                <span>Completing this foundation</span>
                <strong>{onboarding.result}</strong>
              </div>
              <div className="onboarding-cost">
                <span>Required</span>
                <strong>{formatCosts(onboarding.costs)}</strong>
              </div>
              <button
                className="primary-button onboarding-action"
                disabled={!canCompleteOnboardingStep(game, onboarding).ok}
                onClick={() =>
                  setGame((current) =>
                    completeOnboardingStep(current, onboarding.id),
                  )
                }
              >
                {onboarding.action}
              </button>
              {!canCompleteOnboardingStep(game, onboarding).ok ? (
                <small className="onboarding-guidance">
                  {canCompleteOnboardingStep(game, onboarding).reason}
                </small>
              ) : (
                <small className="onboarding-guidance">
                  Ready. This is an instant foundational build—not a field plan.
                </small>
              )}
            </div>
          ) : (
            <>
              <div className="progress-tabs" aria-label="Plans and research">
                <button
                  className={progressView === "plans" ? "active" : ""}
                  onClick={() => setProgressView("plans")}
                >
                  Field plans
                  <span>{game.active ? "1 active" : decisions.length}</span>
                </button>
                <button
                  className={progressView === "research" ? "active" : ""}
                  onClick={() => setProgressView("research")}
                >
                  Research
                  <span>
                    {affordableResearch > 0 ? (
                      <b
                        className="research-alert"
                        aria-label={`${affordableResearch} affordable research ${
                          affordableResearch === 1 ? "item" : "items"
                        }`}
                      >
                        !
                      </b>
                    ) : null}
                    {visibleResearchOwned}/{visibleTechs.length}
                  </span>
                </button>
              </div>
              {progressView === "research" ? (
                <ResearchPanel
                  game={game}
                  onPurchase={(techId) =>
                    setGame((current) => purchaseTech(current, techId))
                  }
                />
              ) : (
                <>
                  <span className="eyebrow">Adapt · one plan at a time</span>
                  <h2 id="decision-heading">Choose a Field Plan</h2>
                  <p className="decision-intro">
                    Every field plan is a singular turning point with a permanent
                    consequence for the flock.
                  </p>
                  <div className="decision-list">
                    {decisions.map((commitment) => (
                      <DecisionCard
                        key={commitment.id}
                        commitment={commitment}
                        game={game}
                        selected={effectiveSelection === commitment.id}
                        onSelect={() => setSelected(commitment.id)}
                      />
                    ))}
                  </div>
                  <div className="commit-bar">
                    {game.active ? (
                      <>
                        <div>
                          <span>Plan underway</span>
                          <strong>{activeDefinition?.name}</strong>
                        </div>
                        <button
                          className="secondary-button"
                          onClick={() => setGame(recallCommitment)}
                        >
                          Recall birds
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <span>Selected plan</span>
                          <strong>
                            {selectedDefinition?.name ?? "No plan selected"}
                          </strong>
                        </div>
                        <button
                          className="primary-button commit-button"
                          onClick={commitSelected}
                          disabled={!readiness.ok}
                        >
                          {selectedDefinition
                            ? `Start “${selectedDefinition.name}”`
                            : "Select a plan above"}
                        </button>
                        {!readiness.ok ? <small>{readiness.reason}</small> : null}
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </aside>
      </section>

      <footer className="story-footer">
        <div className="objective-summary">
          <span className="eyebrow">Current objective</span>
          <strong>{objective.title}</strong>
          <div className="objective-track">
            <i style={{ width: `${Math.min(100, objective.progress * 100)}%` }} />
          </div>
          <small>{objective.next}</small>
        </div>
        <div className="chronicle-latest">
          <span className="eyebrow">
            Day {Math.floor(game.elapsed / 180) + 1} ·{" "}
            {formatDuration(game.elapsed)}
          </span>
          <strong>From the field chronicle</strong>
          <p>{game.logs.at(-1)?.text}</p>
        </div>
        <nav className="footer-nav" aria-label="Game information">
          <button onClick={() => setDrawer("chronicle")}>
            Chronicle
            <span>{game.logs.length}</span>
          </button>
          <button onClick={() => setDrawer("settings")}>
            Save & settings
            <span>Local</span>
          </button>
        </nav>
      </footer>

      {drawer ? (
        <div className="drawer-backdrop" role="presentation">
          <section
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="drawer-heading">
              <div>
                <span className="eyebrow">
                  {drawer === "chronicle"
                      ? "A history of choices"
                      : "Local game controls"}
                </span>
                <h2 id="drawer-title">
                  {drawer === "chronicle"
                      ? "Chronicle"
                      : "Save & Settings"}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setDrawer(null)}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>
            {drawer === "chronicle" ? (
              <ol className="chronicle-list">
                {[...game.logs].reverse().map((entry) => (
                  <li key={entry.id} className={entry.tone ?? "good"}>
                    <span>{formatDuration(entry.at)}</span>
                    <p>{entry.text}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="settings-content">
                <div className="settings-row">
                  <div>
                    <strong>Simulation</strong>
                    <span>
                      The campaign now uses one tuned pace. Pause whenever you
                      want time to plan.
                    </span>
                  </div>
                  <div className="button-group">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        setGame((current) => ({ ...current, paused: !current.paused }))
                      }
                    >
                      {game.paused ? "Resume" : "Pause"}
                    </button>
                  </div>
                </div>
                <label className="transfer-label" htmlFor="save-transfer">
                  Export or import a v3 save
                </label>
                <textarea
                  id="save-transfer"
                  value={transfer}
                  onChange={(event) => setTransfer(event.target.value)}
                  placeholder="Choose Export, or paste a v3 save here."
                />
                <div className="button-group">
                  <button
                    className="secondary-button"
                    onClick={() => setTransfer(JSON.stringify(game))}
                  >
                    Export save
                  </button>
                  <button className="secondary-button" onClick={importSave}>
                    Import save
                  </button>
                </div>
                <div className="danger-zone">
                  <div>
                    <strong>Begin again</strong>
                    <span>This clean-slate campaign has no legacy migration.</span>
                  </div>
                  <button className="danger-button" onClick={hardReset}>
                    {resetArmed ? "Confirm reset" : "Reset campaign"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
