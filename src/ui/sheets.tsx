import { useEffect, useState, type ReactNode } from "react";

import { EVENTS, RESOURCE_LABEL, UPGRADES } from "../game/content";
import {
  canChooseOption,
  capBreakdown,
  formatCosts,
  marksForRun,
  migrate,
} from "../game/engine";
import { formatAmount, formatBirds, formatDuration } from "../game/number";
import { eventTip, replayIntro, skipAllTips } from "../game/guide";
import { decodeSave, describeImport, encodeSave } from "../game/save";
import type { GameState, ResourceId } from "../game/types";

export function EventSheet({
  game,
  onChoose,
}: {
  game: GameState;
  onChoose: (optionId: string) => void;
}) {
  const event = EVENTS.find((item) => item.id === game.pendingEvent);
  if (!event) return null;
  const waiting = game.eventQueue.length;
  const intro = eventTip(game);
  return (
    <Sheet title={event.title} eyebrow={event.eyebrow} testId="event-sheet">
      {intro ? (
        <p className="tip inline" data-testid="event-tip">
          <strong>{intro.title}.</strong> {intro.body}
        </p>
      ) : null}
      <p>{event.text}</p>
      <ul className="options">
        {event.options.map((option) => {
          const readiness = canChooseOption(game, event.id, option.id);
          return (
            <li key={option.id}>
              <button
                type="button"
                className="btn wide"
                data-testid={`event-${option.id}`}
                disabled={!readiness.ok}
                onClick={() => onChoose(option.id)}
              >
                {option.name}
              </button>
              <p className="forecast">{option.effect}</p>
              {option.cost ? <p className="reason">Costs {formatCosts(option.cost)}.</p> : <p className="reason">No stores spent.</p>}
              {!readiness.ok ? <p className="reason">{readiness.reason}</p> : null}
            </li>
          );
        })}
      </ul>
      {waiting > 0 ? (
        <p className="aside">
          {waiting} more moment{waiting === 1 ? "" : "s"} waiting after this one. The flock keeps working underneath.
        </p>
      ) : (
        <p className="aside">The flock keeps working while you choose.</p>
      )}
    </Sheet>
  );
}

export function CapSheet({
  game,
  id,
  onClose,
}: {
  game: GameState;
  id: ResourceId | "flock";
  onClose: () => void;
}) {
  const lines = capBreakdown(game, id);
  const title = id === "flock" ? "Flock capacity" : `${RESOURCE_LABEL[id]} cap`;
  const held = id === "flock" ? formatBirds(game.flock) : formatAmount(game.resources[id], 1);
  return (
    <Sheet title={title} eyebrow="Why it stops here" onClose={onClose} testId={`cap-${id}`}>
      <p className="stat">
        <strong>{held}</strong> on hand
      </p>
      <ul className="breakdown">
        {lines.map((line) => (
          <li key={`${line.label}-${line.value}`}>
            <span>{line.label}</span>
            <strong>{line.value}</strong>
          </li>
        ))}
      </ul>
      <p className="aside">A full store stops that income. Spending, or building a larger hold, is how it moves again.</p>
    </Sheet>
  );
}

export function SettingsSheet({
  game,
  onClose,
  commit,
  onMigrate,
}: {
  game: GameState;
  onClose: () => void;
  commit: (next: GameState) => void;
  onMigrate: () => void;
}) {
  const [exported, setExported] = useState("");
  const [incoming, setIncoming] = useState("");
  const [review, setReview] = useState<{ state: GameState; summary: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function publishExport(): void {
    const text = encodeSave(game, Date.now());
    setExported(text);
    setCopied(false);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => setCopied(true),
        () => setCopied(false),
      );
    }
  }

  function reviewImport(): void {
    const decoded = decodeSave(incoming, Date.now());
    if (!decoded.ok) {
      setReview(null);
      setError(decoded.error);
      return;
    }
    setError(null);
    setReview({ state: decoded.state, summary: describeImport(decoded.state) });
  }

  return (
    <Sheet title="Notebook tools" eyebrow="Save" onClose={onClose} testId="settings-sheet">
      <dl className="facts">
        <div>
          <dt>Field time</dt>
          <dd>{formatDuration(game.elapsed)}</dd>
        </div>
        <div>
          <dt>Migrations</dt>
          <dd>{game.migrations}</dd>
        </div>
        <div>
          <dt>Wins</dt>
          <dd>{game.wins}</dd>
        </div>
        <div>
          <dt>Best flight</dt>
          <dd>{game.bestTime === null ? "None yet" : formatDuration(game.bestTime)}</dd>
        </div>
      </dl>

      <h3>Export</h3>
      <p>Copy the whole block. A partial paste will fail the checksum on purpose.</p>
      <button type="button" className="btn" onClick={publishExport}>
        {copied ? "Copied" : "Prepare export"}
      </button>
      {exported ? (
        <textarea className="save-box" readOnly value={exported} aria-label="Exported save" onFocus={(event) => event.currentTarget.select()} />
      ) : null}

      <h3>Import</h3>
      <p>Paste a full export. Nothing changes until you confirm the review.</p>
      <textarea
        className="save-box"
        value={incoming}
        aria-label="Save to import"
        placeholder="Paste an export here"
        onChange={(event) => {
          setIncoming(event.target.value);
          setReview(null);
          setError(null);
        }}
      />
      <button type="button" className="btn" onClick={reviewImport} disabled={incoming.trim().length === 0}>
        Review import
      </button>
      {error ? <p className="reason warn">{error}</p> : null}
      {review ? (
        <div className="review" data-testid="import-review">
          <p>{review.summary}</p>
          <button
            type="button"
            className="btn"
            data-testid="confirm-import"
            onClick={() => {
              commit(review.state);
              onClose();
            }}
          >
            Replace this expedition
          </button>
        </div>
      ) : null}

      <h3>Opening</h3>
      <p>The opening can be read again. Tips stay quiet once you skip them.</p>
      <div className="card-actions">
        <button
          type="button"
          className="btn ghost"
          data-testid="replay-intro"
          onClick={() => {
            commit(replayIntro(game));
            onClose();
          }}
        >
          Replay the opening
        </button>
        <button
          type="button"
          className="btn ghost"
          data-testid="skip-tips"
          disabled={game.notebook.quiet}
          onClick={() => commit(skipAllTips(game))}
        >
          {game.notebook.quiet ? "Tips are off" : "Skip all tips"}
        </button>
      </div>

      <h3>Leave the flight</h3>
      <p>Migration spends marks and starts a new flock. It does not erase the export you already copied.</p>
      <button type="button" className="btn ghost" onClick={onMigrate} disabled={game.act < 2 && !game.won}>
        {game.act < 2 && !game.won ? "Migration opens after the roost" : "Open migration"}
      </button>
    </Sheet>
  );
}

export function MigrateSheet({
  game,
  onClose,
  commit,
}: {
  game: GameState;
  onClose: () => void;
  commit: (next: GameState) => void;
}) {
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const earned = marksForRun(game);
  const pool = game.marks + earned;
  const spent = costOf(game, picks);
  const closed = game.act < 2 && !game.won;

  function setPick(id: string, next: number): void {
    setError(null);
    setPicks((current) => ({ ...current, [id]: next }));
  }

  function confirm(): void {
    const result = migrate(game, Date.now(), picks);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    commit(result.state);
    onClose();
  }

  return (
    <Sheet title="Migrate" eyebrow="What travels" onClose={onClose} testId="migrate-sheet">
      {closed ? (
        <p>Finish the first roost before migrating. There is nothing to carry yet.</p>
      ) : (
        <>
          <p data-testid="migrate-payout">{payoutLine(game.won, earned)}</p>
          <p>
            With the bank, you can spend <strong>{pool}</strong>.
          </p>
          <ul className="upgrades">
            {UPGRADES.map((upgrade) => {
              const owned = game.ranks[upgrade.id] ?? 0;
              const add = picks[upgrade.id] ?? 0;
              const maxAdd = upgrade.costs.length - owned;
              const nextCost = add < maxAdd ? upgrade.costs[owned + add] : null;
              return (
                <li key={upgrade.id}>
                  <div>
                    <h3>{upgrade.name}</h3>
                    <p>{upgrade.summary}</p>
                    <p className="reason">
                      Rank {owned}
                      {add > 0 ? ` + ${add}` : ""} / {upgrade.costs.length}
                      {nextCost === null ? ". Fully carried." : `. Next rank costs ${nextCost}.`}
                    </p>
                  </div>
                  <div className="stepper">
                    <button
                      type="button"
                      aria-label={`Buy one fewer ${upgrade.name}`}
                      disabled={add <= 0}
                      onClick={() => setPick(upgrade.id, add - 1)}
                    >
                      −
                    </button>
                    <strong>{add}</strong>
                    <button
                      type="button"
                      aria-label={`Buy one more ${upgrade.name}`}
                      disabled={nextCost === null || spent + (nextCost ?? 0) > pool}
                      onClick={() => setPick(upgrade.id, add + 1)}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="stat">
            <strong>
              {spent} / {pool}
            </strong>
            <span>{pool - spent} marks stay banked</span>
          </p>
          {error ? <p className="reason warn">{error}</p> : null}
          <button type="button" className="btn danger wide" data-testid="confirm-migrate" onClick={confirm}>
            {payoutLine(game.won, earned)}
          </button>
        </>
      )}
    </Sheet>
  );
}

function payoutLine(won: boolean, earned: number): string {
  const marks = `${earned} ${earned === 1 ? "mark" : "marks"}`;
  return won ? `Start the next flight with ${marks}` : `Leave now for ${marks}; a win pays 8+`;
}

function costOf(game: GameState, picks: Record<string, number>): number {
  let total = 0;
  for (const upgrade of UPGRADES) {
    const add = picks[upgrade.id] ?? 0;
    const owned = game.ranks[upgrade.id] ?? 0;
    for (let step = 0; step < add; step += 1) total += upgrade.costs[owned + step] ?? 0;
  }
  return total;
}

function Sheet({
  title,
  eyebrow,
  onClose,
  children,
  testId,
}: {
  title: string;
  eyebrow: string;
  onClose?: () => void;
  children: ReactNode;
  testId: string;
}) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-root">
      {onClose ? (
        <button type="button" className="sheet-backdrop" aria-label="Close" onClick={onClose} />
      ) : (
        <div className="sheet-backdrop locked" />
      )}
      <div role="dialog" aria-modal="true" aria-labelledby={`${testId}-title`} className="sheet" data-testid={testId}>
        <header className="sheet-head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={`${testId}-title`}>{title}</h2>
          </div>
          {onClose ? (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              Close
            </button>
          ) : null}
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
