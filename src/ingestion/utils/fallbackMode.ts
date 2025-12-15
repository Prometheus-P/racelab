/**
 * Fallback Mode Controller
 *
 * Limits ingestion frequency when external APIs report quota exhaustion.
 * While fallback mode is active, odds collection should run at most once per hour.
 */

export type FallbackSource = 'KRA' | 'KSPO' | 'unknown';

const FALLBACK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

interface FallbackState {
  active: boolean;
  activatedAt: number | null;
  lastRunAt: number | null;
  reason: string | null;
  source: FallbackSource | null;
  day: string | null;
}

const state: FallbackState = {
  active: false,
  activatedAt: null,
  lastRunAt: null,
  reason: null,
  source: null,
  day: null,
};

/**
 * Activate fallback mode to throttle ingestion.
 */
export function activateFallbackMode(source: FallbackSource, reason?: string): void {
  const now = Date.now();
  const today = new Date(now).toISOString().split('T')[0];

  state.active = true;
  state.activatedAt = now;
  state.lastRunAt = now;
  state.reason = reason ?? 'API quota exceeded';
  state.source = source;
  state.day = today;

  console.warn(
    `[FallbackMode] Activated by ${source}. Reason: ${state.reason}. Next collection allowed after ${new Date(
      now + FALLBACK_INTERVAL_MS
    ).toISOString()}`
  );
}

/**
 * Clear fallback mode (typically after quota resets).
 */
export function clearFallbackMode(): void {
  if (!state.active) return;

  state.active = false;
  state.activatedAt = null;
  state.lastRunAt = null;
  state.reason = null;
  state.source = null;
  state.day = null;

  console.log('[FallbackMode] Cleared');
}

/**
 * Reset fallback mode automatically when the date changes.
 */
function resetIfNewDay(now: Date): void {
  if (!state.active || !state.day) return;

  const today = now.toISOString().split('T')[0];
  if (state.day !== today) {
    clearFallbackMode();
  }
}

/**
 * Determine if fallback mode is currently active.
 */
export function isFallbackMode(now: Date = new Date()): boolean {
  resetIfNewDay(now);
  return state.active;
}

/**
 * Should current cron run be throttled due to fallback mode?
 */
export function shouldThrottleFallback(now: Date = new Date()): boolean {
  if (!isFallbackMode(now)) {
    return false;
  }

  if (!state.lastRunAt) {
    return false;
  }

  return now.getTime() - state.lastRunAt < FALLBACK_INTERVAL_MS;
}

/**
 * Mark a completed collection run during fallback mode.
 */
export function markFallbackCollection(now: Date = new Date()): void {
  if (!state.active) {
    return;
  }

  state.lastRunAt = now.getTime();
}

/**
 * Snapshot of fallback state for logging / dashboards.
 */
export function getFallbackState(now: Date = new Date()): {
  active: boolean;
  reason: string | null;
  source: FallbackSource | null;
  activatedAt: string | null;
  lastRunAt: string | null;
  intervalMs: number;
} {
  const active = isFallbackMode(now);

  return {
    active,
    reason: active ? state.reason : null,
    source: active ? state.source : null,
    activatedAt: active && state.activatedAt ? new Date(state.activatedAt).toISOString() : null,
    lastRunAt: active && state.lastRunAt ? new Date(state.lastRunAt).toISOString() : null,
    intervalMs: FALLBACK_INTERVAL_MS,
  };
}

export function getFallbackIntervalMs(): number {
  return FALLBACK_INTERVAL_MS;
}
