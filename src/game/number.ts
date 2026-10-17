/** Resources stay inside the exact integer range of a JS number. */
export const RESOURCE_CEILING = 1e12;

export function clampResource(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= RESOURCE_CEILING) return RESOURCE_CEILING;
  return value;
}

export function formatAmount(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "0";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}t`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}b`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}m`;
  if (abs >= 100_000) return `${sign}${(abs / 1e3).toFixed(1)}k`;
  return sign + group(abs, digits);
}

function group(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  const [whole, frac] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac && digits > 0 ? `${withCommas}.${frac}` : withCommas;
}

export function formatRate(value: number): string {
  if (!Number.isFinite(value) || Math.abs(value) < 0.0005) return "+0/s";
  const digits = Math.abs(value) < 0.1 ? 3 : Math.abs(value) < 10 ? 2 : 1;
  const body = formatAmount(Math.abs(value), digits);
  return value > 0 ? `+${body}/s` : `-${body}/s`;
}

/** Slow flock growth is easier to read as a wait than as a fraction of a bird per second. */
export function formatPopulationRate(value: number): string {
  if (!Number.isFinite(value) || value < 0.0005) return "+0/s";
  if (value >= 0.1) return formatRate(value);
  const seconds = 1 / value;
  if (seconds < 90) return `+1 bird every ~${Math.max(1, Math.round(seconds))}s`;
  const minutes = Math.round((seconds / 60) * 2) / 2;
  const shown = Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1);
  return `+1 bird every ~${shown}m`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0s";
  const safe = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainder = safe % 60;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}:${remainder.toString().padStart(2, "0")}`;
  return `${remainder}s`;
}

export function formatBirds(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const rounded = Math.floor(value * 10 + 1e-6) / 10;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
}
