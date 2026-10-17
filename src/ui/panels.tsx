import { useState } from "react";

import {
  DOCTRINES,
  ROLE_DEFS,
  TECHS,
  TUNE,
  UPGRADES,
  projectById,
  projectTitle,
  type ProjectDef,
} from "../game/content";
import { sceneFromState } from "../game/scene";
import { planFlavor, seasonRemark } from "../game/voice";
import {
  actionLabel,
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
  shown = active,
  freshRoles = [],
  apply,
}: {
  game: GameState;
  active: boolean;
  shown?: boolean;
  freshRoles?: RoleId[];
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
          <span className="stat-line">
            <strong>{formatBirds(idle)}</strong> idle
          </span>
          <span>
            {formatBirds(game.flock)} / {formatAmount(capacity, 0)} housed
            {out > 0 ? ` · ${out} out` : ""}
          </span>
        </p>
      </header>
      <ul className="role-list">
        {ROLE_DEFS.map((role) => (
          <RoleRow
            key={role.id}
            game={game}
            role={role.id}
            name={role.name}
            blurb={role.blurb}
            fresh={freshRoles.includes(role.id)}
            shown={shown}
            apply={apply}
          />
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
  fresh,
  shown,
  apply,
}: {
  game: GameState;
  role: RoleId;
  name: string;
  blurb: string;
  fresh: boolean;
  shown: boolean;
  apply: Apply;
}) {
  if (!isRoleUnlocked(game, role)) return null;
  const count = Math.floor(game.roles[role]);
  const idle = getIdleBirds(game);
  return (
    <li
      className={`role${fresh && shown ? " reveal" : ""}`}
      data-testid={`role-${role}`}
      data-new={fresh ? "true" : "false"}
    >
      <div className="role-copy">
        <h3>
          <Icon name={role} />
          {name}
          {fresh ? (
            <span className="new-dot" data-testid={`new-role-${role}`} aria-label="New" />
          ) : null}
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
        ) : null}
      </header>

      {idle >= 1 && !game.won && !game.flags.includes("survey") ? (
        <p className="hint">
          {formatBirds(idle)} idle. Assign them on Flock.
        </p>
      ) : null}

      {game.won ? <EndingCard game={game} onMigrate={onMigrate} /> : null}
      {game.active ? <ActiveCard game={game} apply={apply} /> : null}

      {projects.length === 0 && !game.won ? (
        <p className="empty">Nothing to start. Check Now for the gate.</p>
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
      <h3>{projectTitle(game, project)}</h3>
      <p className="summary">{project.summary}</p>
      <div className={`plan-note${open ? " show" : ""}`}>
        {planFlavor(project.id) ? <p className="flavor">{planFlavor(project.id)}</p> : null}
        <p>{project.forecast}</p>
      </div>
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
          {actionLabel(readiness.reason, readiness.ok, project.duration(game) <= 0)}
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
        {active.birds} birds away. {formatDuration(active.remaining / speed)} left.
      </p>
      <div className="meter" aria-hidden="true">
        <i style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <button type="button" className="btn danger" onClick={() => apply(recallProject)}>
        Recall
      </button>
      <p className="reason">Recall keeps the cost spent.</p>
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
        Leaving carries {carry} mark{carry === 1 ? "" : "s"}
        {game.marks > 0 ? `, plus ${game.marks} banked` : ""}.
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

      {game.act < 2 ? null : (
      <article className="card">
        <p className="eyebrow">Doctrine</p>
          <>
          <Plate id="doctrine-choice" />
          <ul className="doctrines">
            {DOCTRINES.map((doctrine) => (
              <DoctrineRow
                key={doctrine.id}
                game={game}
                id={doctrine.id}
                name={doctrine.name}
                summary={doctrine.summary}
                tradeoff={doctrine.tradeoff}
                canRespec={canRespec}
                apply={apply}
              />
            ))}
          </ul>
          </>
      </article>
      )}

      <article className="card">
        <p className="eyebrow">Field notes</p>
        <h3>Research</h3>
        <ul className="techs">
          {TECHS.map((tech) => {
            if (tech.act > game.act) return null;
            const owned = game.techs.includes(tech.id);
            const ready = canBuyTech(game, tech.id);
            return (
              <li key={tech.id} className={owned ? "owned" : ""} data-testid={`study-${tech.id}`}>
                <div>
                  <h3>{tech.name}</h3>
                  <p>{tech.summary}</p>
                  <p className="forecast">{formatCosts(tech.cost)}</p>
                  {owned ? <p className="reason ready">Learned.</p> : null}
                  {!owned && !ready ? <p className="reason">{formatMissing(game, tech.cost)}</p> : null}
                </div>
                {owned ? null : (
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
          {game.marks} banked. This flight adds {marksForRun(game)}.
          {game.migrations > 0 ? ` ${game.migrations} flight${game.migrations === 1 ? "" : "s"} so far.` : ""}
        </p>
        <RankList game={game} />
        {game.act >= 2 || game.won ? (
          <button type="button" className="btn" onClick={onMigrate}>
            Spend marks
          </button>
        ) : null}
      </article>
    </section>
  );
}

function RankList({ game }: { game: GameState }) {
  const entries = UPGRADES.map((upgrade) => ({ upgrade, rank: game.ranks[upgrade.id] ?? 0 })).filter(
    (entry) => entry.rank > 0,
  );
  if (entries.length === 0) return <p className="reason">Nothing carried forward yet.</p>;
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

function DoctrineRow({
  game,
  id,
  name,
  summary,
  tradeoff,
  canRespec,
  apply,
}: {
  game: GameState;
  id: DoctrineId;
  name: string;
  summary: string;
  tradeoff: string;
  canRespec: boolean;
  apply: Apply;
}) {
  const [open, setOpen] = useState(false);
  const selected = game.doctrine === id;
  const locked = Boolean(game.doctrine) && !canRespec && !selected;
  return (
    <li className={selected ? "doctrine on" : "doctrine"}>
      <h3>
        <Icon name={id} />
        {name}
      </h3>
      <p>{summary}</p>
      <div className={`plan-note${open ? " show" : ""}`}>
        <p className="forecast">{tradeoff}</p>
        {locked ? <p className="reason">Stays unless a later flight bought Second look.</p> : null}
      </div>
      <div className="card-actions">
        {!selected && game.doctrine && canRespec ? (
          <button
            type="button"
            className="btn"
            data-testid={`doctrine-${id}`}
            onClick={() => apply((state) => respecDoctrine(state, id))}
          >
            Turn toward {name}
          </button>
        ) : null}
        {!game.doctrine ? (
          <button
            type="button"
            className="btn"
            data-testid={`doctrine-${id}`}
            onClick={() => apply((state) => chooseDoctrine(state, id))}
          >
            Fly this way
          </button>
        ) : null}
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

export function WorldPanel({
  game,
  active,
  open = true,
}: {
  game: GameState;
  active: boolean;
  open?: boolean;
}) {
  const [details, setDetails] = useState(false);
  const effects = game.effects.filter((effect) => effect.until > game.elapsed);
  const routeBonus = Math.round(TUNE.routeBonus * (game.doctrine === "wanderlust" ? 1.4 : 1) * 100);
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
      ) : null}
      <p className="voice">{seasonRemark(getSeason(game).id)}</p>
      <button
        type="button"
        className="btn ghost more"
        aria-expanded={details}
        onClick={() => setDetails((value) => !value)}
      >
        {details ? "Less" : "More"}
      </button>
      <div className={`plan-note${details ? " show" : ""}`}>
        <p>
          Each route adds {routeBonus}% to seeds and twigs. Morale speeds influence and growth, and it cannot
          stop the flock.
        </p>
        <p>
          {getSeason(game).detail}{" "}
          {game.systems > 0 ? "Stars are harbors and scans." : "The map stays a tree until the accord."}
        </p>
      </div>
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
