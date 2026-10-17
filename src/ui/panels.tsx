import { useState } from "react";

import { DOCTRINES, ROLE_DEFS, TECHS, UPGRADES, projectById, type ProjectDef } from "../game/content";
import { sceneFromState } from "../game/scene";
import { planFlavor, seasonRemark } from "../game/voice";
import {
  assignRole,
  buyTech,
  canBuyTech,
  canStart,
  chooseDoctrine,
  expeditionSpeed,
  formatCosts,
  formatMissing,
  getCapacity,
  getIdleBirds,
  getObjective,
  getSeason,
  isRoleUnlocked,
  listProjects,
  marksForRun,
  recallProject,
  respecDoctrine,
  roleYield,
  startProject,
  timeToAfford,
  wallTime,
} from "../game/engine";
import { formatAmount, formatBirds, formatDuration } from "../game/number";
import type { DoctrineId, GameState, RoleId } from "../game/types";
import { LivingScene } from "./art/canopy";
import { Icon, categoryIcon } from "./art/icons";
import { Plate } from "./art/plates";

type Apply = (update: (state: GameState) => GameState) => void;

const EFFECT_LABEL: Record<string, string> = {
  seedfall: "Seedfall",
  huddle: "Huddled",
  burn: "Hot launch",
  tailwind: "Tailwind",
  cuckoo: "Cuckoo week",
};

export function FlockPanel({
  game,
  active,
  apply,
}: {
  game: GameState;
  active: boolean;
  apply: Apply;
}) {
  const idle = getIdleBirds(game);
  const capacity = getCapacity(game);
  const out = game.active?.birds ?? 0;
  return (
    <section className={`panel panel-flock${active ? " on" : ""}`} aria-label="Flock">
      <header className="panel-head">
        <div>
          <p className="eyebrow">Who is working</p>
          <h2>The flock</h2>
        </div>
        <p className="stat">
          <strong>{formatBirds(idle)}</strong> idle
          <span>
            {formatBirds(game.flock)} / {formatAmount(capacity, 0)} housed
            {out > 0 ? ` · ${out} out` : ""}
          </span>
        </p>
      </header>
      <ul className="role-list">
        {ROLE_DEFS.map((role) => (
          <RoleRow key={role.id} game={game} role={role.id} name={role.name} blurb={role.blurb} apply={apply} />
        ))}
      </ul>
    </section>
  );
}

function RoleRow({
  game,
  role,
  name,
  blurb,
  apply,
}: {
  game: GameState;
  role: RoleId;
  name: string;
  blurb: string;
  apply: Apply;
}) {
  if (!isRoleUnlocked(game, role)) {
    return (
      <li className="role locked">
        <div>
          <h3>
            <Icon name={role} />
            {name}
          </h3>
          <p>{unlockHint(role)}</p>
        </div>
      </li>
    );
  }
  const count = Math.floor(game.roles[role]);
  const idle = getIdleBirds(game);
  return (
    <li className="role">
      <div className="role-copy">
        <h3>
          <Icon name={role} />
          {name}
        </h3>
        <p>{blurb}</p>
        <p className="yield">{roleYield(game, role)}</p>
      </div>
      <div className="stepper" aria-label={`${name} assigned`}>
        <button
          type="button"
          aria-label={`Recall one ${name.toLowerCase()}`}
          disabled={count < 1}
          onClick={() => apply((state) => assignRole(state, role, -1))}
        >
          −
        </button>
        <strong>{count}</strong>
        <button
          type="button"
          aria-label={`Assign one ${name.toLowerCase()}`}
          disabled={idle < 1}
          onClick={() => apply((state) => assignRole(state, role, 1))}
        >
          +
        </button>
      </div>
    </li>
  );
}

function unlockHint(role: RoleId): string {
  if (role === "weavers") return "Opens when the seed cache is lined.";
  if (role === "scouts") return "Opens after the canopy survey.";
  if (role === "broodkeepers" || role === "scholars") return "Opens with the aerie, in Act II.";
  if (role === "envoys") return "Opens with dominion, in Act III.";
  return "Opens on the crossing, in Act IV.";
}

export function PlansPanel({
  game,
  active,
  apply,
  onMigrate,
  onStudy,
}: {
  game: GameState;
  active: boolean;
  apply: Apply;
  onMigrate: () => void;
  onStudy: () => void;
}) {
  const focus = getObjective(game).projectId;
  const projects = [...listProjects(game)].sort((a, b) => Number(b.id === focus) - Number(a.id === focus));
  const idle = getIdleBirds(game);
  return (
    <section className={`panel panel-plans${active ? " on" : ""}`} aria-label="Plans">
      <header className="panel-head">
        <div>
          <p className="eyebrow">What to spend</p>
          <h2>Plans</h2>
        </div>
        {game.act >= 2 || game.won ? (
          <button type="button" className="btn ghost" onClick={onMigrate}>
            Migrate
          </button>
        ) : (
          <p className="aside">Migration opens after the first roost.</p>
        )}
      </header>

      {idle >= 1 && !game.won && !game.flags.includes("survey") ? (
        <p className="hint">
          {formatBirds(idle)} bird{idle === 1 ? " is" : "s are"} idle. Staff them on the Flock tab, then come back to launch.
        </p>
      ) : null}

      {game.won ? <EndingCard game={game} onMigrate={onMigrate} /> : null}
      {game.active ? <ActiveCard game={game} apply={apply} /> : null}

      {projects.length === 0 && !game.won ? (
        <p className="empty">Nothing new can be started. Check the objective for the gate.</p>
      ) : (
        <ul className="cards">
          {projects.map((project) => (
            <ProjectCard key={project.id} game={game} project={project} apply={apply} />
          ))}
        </ul>
      )}

      {game.flags.includes("first-nest") ? (
        <button type="button" className="btn ghost wide" onClick={onStudy}>
          Open study
        </button>
      ) : null}
    </section>
  );
}

function ProjectCard({
  game,
  project,
  apply,
}: {
  game: GameState;
  project: ProjectDef;
  apply: Apply;
}) {
  const [open, setOpen] = useState(false);
  const costs = project.costs(game);
  const readiness = canStart(game, project.id);
  const seconds = wallTime(game, project);
  const afford = timeToAfford(game, costs);
  return (
    <li className={`card${project.goal ? " goal" : ""}`} data-testid={`project-${project.id}`}>
      <p className="eyebrow">
        <Icon name={categoryIcon(project.category)} />
        {project.category}
        {project.goal ? " · era goal" : ""}
      </p>
      <h3>{project.name}</h3>
      <p className="summary">{project.summary}</p>
      {planFlavor(project.id) ? <p className="flavor">{planFlavor(project.id)}</p> : null}
      <p className={`plan-note${open ? " show" : ""}`}>{project.forecast}</p>
      <p className="meta">
        {formatCosts(costs)}
        {" · "}
        {seconds <= 0 ? "Instant" : formatDuration(seconds)}
        {project.birds > 0 ? ` · ${project.birds} birds` : ""}
      </p>
      <p className={readiness.ok ? "reason ready" : "reason"}>
        {readiness.reason}
        {!readiness.ok && readiness.reason.startsWith("Need") ? ` ${afford}` : ""}
      </p>
      <div className="card-actions">
        <button
          type="button"
          className="btn"
          data-testid={`start-${project.id}`}
          disabled={!readiness.ok}
          onClick={() => apply((state) => startProject(state, project.id))}
        >
          {project.duration(game) <= 0 ? "Build" : "Launch"}
        </button>
        <button
          type="button"
          className="btn ghost more"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Less" : "More"}
        </button>
      </div>
    </li>
  );
}

function ActiveCard({ game, apply }: { game: GameState; apply: Apply }) {
  const active = game.active;
  if (!active) return null;
  const project = projectById(active.id);
  const speed = Math.max(0.2, expeditionSpeed(game));
  const progress = active.duration > 0 ? 1 - active.remaining / active.duration : 1;
  return (
    <article className="card active-plan" data-testid="active-project">
      <p className="eyebrow">Out now</p>
      <h3>{project?.name ?? "Expedition"}</h3>
      <p>
        {active.birds} birds are away. About {formatDuration(active.remaining / speed)} of work remains.
      </p>
      <div className="meter" aria-hidden="true">
        <i style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <button type="button" className="btn danger" onClick={() => apply(recallProject)}>
        Recall
      </button>
      <p className="reason">Recalling does not refund what you spent.</p>
    </article>
  );
}

function EndingCard({ game, onMigrate }: { game: GameState; onMigrate: () => void }) {
  const carry = marksForRun(game);
  return (
    <article className="card goal">
      <Plate id="win" />
      <p className="eyebrow">The route is written</p>
      <h3>This expedition can migrate</h3>
      <p>
        Leaving now carries {carry} mark{carry === 1 ? "" : "s"}
        {game.marks > 0 ? `, on top of the ${game.marks} already banked` : ""}.
      </p>
      <button type="button" className="btn" onClick={onMigrate}>
        Choose what to carry
      </button>
    </article>
  );
}

export function StudyPanel({
  game,
  active,
  apply,
  onMigrate,
  onPlans,
}: {
  game: GameState;
  active: boolean;
  apply: Apply;
  onMigrate: () => void;
  onPlans: () => void;
}) {
  const canRespec = (game.ranks["second-look"] ?? 0) >= 1 && game.doctrineChanges < 1 && Boolean(game.doctrine);
  return (
    <section className={`panel panel-study${active ? " on" : ""}`} aria-label="Study">
      <header className="panel-head">
        <div>
          <p className="eyebrow">What the flock believes</p>
          <h2>Study</h2>
        </div>
        <button type="button" className="btn ghost" onClick={onPlans}>
          Plans
        </button>
      </header>

      <article className="card">
        <p className="eyebrow">Doctrine</p>
        {game.act < 2 ? (
          <p>The roost has to exist before the flock will argue about how to fly.</p>
        ) : (
          <>
          <Plate id="doctrine-choice" />
          <ul className="doctrines">
            {DOCTRINES.map((doctrine) => {
              const selected = game.doctrine === doctrine.id;
              const locked = Boolean(game.doctrine) && !canRespec && !selected;
              return (
                <li key={doctrine.id} className={selected ? "doctrine on" : "doctrine"}>
                  <h3>
                    <Icon name={doctrine.id} />
                    {doctrine.name}
                  </h3>
                  <p>{doctrine.summary}</p>
                  <p className="forecast">{doctrine.tradeoff}</p>
                  {selected ? <p className="reason ready">This is how the flock flies.</p> : null}
                  {!selected && game.doctrine && canRespec ? (
                    <button
                      type="button"
                      className="btn"
                      data-testid={`doctrine-${doctrine.id}`}
                      onClick={() => apply((state) => respecDoctrine(state, doctrine.id))}
                    >
                      Turn toward {doctrine.name}
                    </button>
                  ) : null}
                  {!game.doctrine ? (
                    <button
                      type="button"
                      className="btn"
                      data-testid={`doctrine-${doctrine.id}`}
                      disabled={game.act < 2}
                      onClick={() => apply((state) => chooseDoctrine(state, doctrine.id as DoctrineId))}
                    >
                      Fly this way
                    </button>
                  ) : null}
                  {locked ? <p className="reason">A doctrine stays unless a later flight bought Second look.</p> : null}
                </li>
              );
            })}
          </ul>
          </>
        )}
      </article>

      <article className="card">
        <p className="eyebrow">Field notes</p>
        <h3>Research</h3>
        <ul className="techs">
          {TECHS.map((tech) => {
            const owned = game.techs.includes(tech.id);
            const future = tech.act > game.act;
            const ready = canBuyTech(game, tech.id);
            return (
              <li key={tech.id} className={owned ? "owned" : ""}>
                <div>
                  <h3>{tech.name}</h3>
                  <p>{tech.summary}</p>
                  <p className="forecast">{formatCosts(tech.cost)}</p>
                  {owned ? <p className="reason ready">Learned.</p> : null}
                  {future ? <p className="reason">Opens in Act {tech.act}.</p> : null}
                  {!owned && !future && !game.flags.includes("first-nest") ? (
                    <p className="reason">The first nest has to exist before anyone writes this down.</p>
                  ) : null}
                  {!owned && !future && game.flags.includes("first-nest") && !ready ? (
                    <p className="reason">{formatMissing(game, tech.cost)}</p>
                  ) : null}
                </div>
                {owned || future ? null : (
                  <button
                    type="button"
                    className="btn"
                    data-testid={`tech-${tech.id}`}
                    disabled={!ready}
                    onClick={() => apply((state) => buyTech(state, tech.id))}
                  >
                    Learn
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </article>

      <article className="card">
        <p className="eyebrow">Carried between flights</p>
        <h3>Flyway ranks</h3>
        <p>
          Banked marks: {game.marks}. This flight would add {marksForRun(game)} if you left now.
          {game.migrations > 0 ? ` ${game.migrations} migration${game.migrations === 1 ? "" : "s"} so far.` : ""}
        </p>
        <RankList game={game} />
        <button type="button" className="btn" onClick={onMigrate} disabled={game.act < 2 && !game.won}>
          {game.act < 2 && !game.won ? "Migration is closed" : "Spend marks"}
        </button>
      </article>
    </section>
  );
}

function RankList({ game }: { game: GameState }) {
  const entries = UPGRADES.map((upgrade) => ({ upgrade, rank: game.ranks[upgrade.id] ?? 0 })).filter(
    (entry) => entry.rank > 0,
  );
  if (entries.length === 0) return <p className="reason">Nothing has been carried forward yet.</p>;
  return (
    <ul className="rank-list">
      {entries.map(({ upgrade, rank }) => (
        <li key={upgrade.id}>
          {upgrade.name} · rank {rank}
        </li>
      ))}
    </ul>
  );
}

export function WorldPanel({
  game,
  active,
  open = true,
}: {
  game: GameState;
  active: boolean;
  open?: boolean;
}) {
  const effects = game.effects.filter((effect) => effect.until > game.elapsed);
  return (
    <section
      className={`panel panel-world${active ? " on" : ""}`}
      data-open={open ? "true" : "false"}
      aria-label="World"
    >
      <header className="panel-head">
        <div>
          <p className="eyebrow">Where they are</p>
          <h2>The route</h2>
        </div>
      </header>
      <div className="scene" data-testid="world">
        <LivingScene model={sceneFromState(game)} motion={false} layout="map" />
        <ul className="scene-facts">
          <li>
            <span>Routes</span>
            <strong>
              {game.routes}
              <small> / 14</small>
            </strong>
          </li>
          <li>
            <span>Systems</span>
            <strong>{game.systems}</strong>
          </li>
          <li>
            <span>Morale</span>
            <strong>{moraleWord(game.morale)}</strong>
          </li>
          <li>
            <span>Doctrine</span>
            <strong>{doctrineName(game.doctrine)}</strong>
          </li>
        </ul>
      </div>
      {effects.length > 0 ? (
        <ul className="effects">
          {effects.map((effect) => (
            <li key={effect.id}>
              {EFFECT_LABEL[effect.id] ?? effect.id}
              <span>{formatDuration(effect.until - game.elapsed)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="aside">No weather is sitting on the flock right now.</p>
      )}
      <p className="aside">
        {getSeason(game).detail}{" "}
        {game.systems > 0
          ? "Stars on the map are harbors and scans, not decoration."
          : "The map stays a tree until the accord opens the dark."}
      </p>
      <p className="voice">{seasonRemark(getSeason(game).id)}</p>
    </section>
  );
}

function moraleWord(morale: number): string {
  if (morale >= 0.95) return "Bright";
  if (morale >= 0.8) return "Steady";
  if (morale >= 0.7) return "Uneasy";
  return "Frayed";
}

function doctrineName(id: DoctrineId | null): string {
  return DOCTRINES.find((item) => item.id === id)?.name ?? "Unchosen";
}

export function LogPanel({
  game,
  active,
  onPlans,
}: {
  game: GameState;
  active: boolean;
  onPlans: () => void;
}) {
  const entries = [...game.logs].reverse();
  return (
    <section className={`panel panel-log${active ? " on" : ""}`} aria-label="Log">
      <header className="panel-head">
        <div>
          <p className="eyebrow">What already happened</p>
          <h2>Notebook</h2>
        </div>
        <button type="button" className="btn ghost" onClick={onPlans}>
          Plans
        </button>
      </header>
      {entries.length === 0 ? (
        <p className="empty">The first page is still blank.</p>
      ) : (
        <ol className="log">
          {entries.map((entry) => (
            <li key={entry.id} className={entry.tone ?? "good"}>
              <time>{formatDuration(entry.at)}</time>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
