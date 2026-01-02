/**
 * Failure Recovery Job
 *
 * Automatically retries failed ingestion jobs based on retry schedule.
 * Uses exponential backoff to avoid overwhelming external APIs.
 */

import {
  getRetryableFailures,
  updateFailureStatus,
  incrementRetryCount,
} from '@/ingestion/utils/failureLogger';
import {
  notifyRecoveryComplete,
  notifyMaxRetriesExceeded,
} from '@/ingestion/services/slackNotifier';
import { pollSchedules } from './schedulePoller';
import { pollEntries } from './entryPoller';
import { pollResults } from './resultPoller';
import { pollOdds } from './oddsPoller';
import type { IngestionFailure } from '@/lib/db/schema';

export interface RecoveryResult {
  processed: number;
  recovered: number;
  failed: number;
  maxRetriesExceeded: number;
}

/**
 * Process retryable failures
 *
 * @param limit - Maximum number of failures to process
 * @returns Recovery results
 */
export async function processFailures(limit: number = 10): Promise<RecoveryResult> {
  const result: RecoveryResult = {
    processed: 0,
    recovered: 0,
    failed: 0,
    maxRetriesExceeded: 0,
  };

  const failures = await getRetryableFailures(limit);

  if (failures.length === 0) {
    console.log('[FailureRecovery] No retryable failures found');
    return result;
  }

  console.log(`[FailureRecovery] Processing ${failures.length} retryable failures`);

  for (const failure of failures) {
    result.processed++;

    try {
      await updateFailureStatus(failure.id, 'retrying');

      const success = await retryFailure(failure);

      if (success) {
        await updateFailureStatus(failure.id, 'resolved');
        result.recovered++;

        await notifyRecoveryComplete({
          failureId: String(failure.id),
          jobType: failure.jobType,
          entityId: failure.entityId,
        });

        console.log(`[FailureRecovery] Recovered: ${failure.id}`);
      } else {
        const updated = await incrementRetryCount(failure.id);
        result.failed++;

        if (updated && updated.retryCount >= updated.maxRetries) {
          result.maxRetriesExceeded++;
          await notifyMaxRetriesExceeded({
            failureId: String(failure.id),
            jobType: failure.jobType,
            entityId: failure.entityId,
            retryCount: updated.retryCount,
          });
        }

        console.log(
          `[FailureRecovery] Retry failed: ${failure.id} (${updated?.retryCount ?? 'unknown'}/${failure.maxRetries})`
        );
      }
    } catch (error) {
      console.error(`[FailureRecovery] Error processing ${failure.id}:`, error);
      await incrementRetryCount(failure.id);
      result.failed++;
    }

    // Small delay between retries to avoid rate limiting
    await sleep(1000);
  }

  console.log(
    `[FailureRecovery] Complete: processed=${result.processed}, recovered=${result.recovered}, failed=${result.failed}`
  );

  return result;
}

/**
 * Retry a single failure
 *
 * @param failure - Failure record to retry
 * @returns true if retry was successful
 */
async function retryFailure(failure: IngestionFailure): Promise<boolean> {
  try {
    switch (failure.jobType) {
      case 'schedule_poll':
        await pollSchedules({
          date: extractDateFromEntityId(failure.entityId),
        });
        return true;

      case 'entry_poll':
        const entryResult = await pollEntries({ raceIds: [failure.entityId] });
        return entryResult.errors === 0;

      case 'result_poll':
        const resultResult = await pollResults({ raceIds: [failure.entityId] });
        return resultResult.errors === 0;

      case 'odds_poll':
        const oddsResult = await pollOdds({ raceIds: [failure.entityId] });
        return oddsResult.errors === 0;

      default:
        console.warn(`[FailureRecovery] Unknown job type: ${failure.jobType}`);
        return false;
    }
  } catch (error) {
    console.error(`[FailureRecovery] Retry error for ${failure.id}:`, error);
    return false;
  }
}

/**
 * Extract date from entity ID
 */
function extractDateFromEntityId(entityId: string): string {
  const parts = entityId.split('-');
  if (parts.length >= 4) {
    const dateStr = parts[3];
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 환경 변수로 설정 가능한 복구 간격 (기본 5분, 최소 1분)
 */
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5분
const MIN_INTERVAL_MS = 60 * 1000; // 최소 1분
const RECOVERY_INTERVAL_MS = Math.max(
  parseInt(process.env.RECOVERY_INTERVAL_MS || '', 10) || DEFAULT_INTERVAL_MS,
  MIN_INTERVAL_MS
);

/**
 * 복구 루프 상태 (모니터링용)
 */
export interface RecoveryLoopStatus {
  isRunning: boolean;
  lastRunAt: Date | null;
  totalIterations: number;
  totalRecovered: number;
  totalFailed: number;
  consecutiveErrors: number;
}

const loopStatus: RecoveryLoopStatus = {
  isRunning: false,
  lastRunAt: null,
  totalIterations: 0,
  totalRecovered: 0,
  totalFailed: 0,
  consecutiveErrors: 0,
};

/**
 * 복구 루프 상태 조회 (모니터링 API용)
 */
export function getRecoveryLoopStatus(): RecoveryLoopStatus {
  return { ...loopStatus };
}

/**
 * Run failure recovery as a background process
 *
 * @param intervalMs - Check interval in milliseconds (default: from env or 5 minutes)
 * @param maxIterations - Maximum iterations (default: unlimited)
 */
export async function runRecoveryLoop(
  intervalMs: number = RECOVERY_INTERVAL_MS,
  maxIterations?: number
): Promise<void> {
  if (loopStatus.isRunning) {
    console.warn('[FailureRecovery] Recovery loop already running');
    return;
  }

  loopStatus.isRunning = true;
  let iterations = 0;

  console.log(`[FailureRecovery] Starting recovery loop (interval: ${intervalMs}ms)`);

  while (maxIterations === undefined || iterations < maxIterations) {
    iterations++;
    loopStatus.totalIterations = iterations;
    loopStatus.lastRunAt = new Date();

    try {
      const result = await processFailures();
      loopStatus.totalRecovered += result.recovered;
      loopStatus.totalFailed += result.failed;
      loopStatus.consecutiveErrors = 0;

      // 주기적 상태 로깅 (매 10회)
      if (iterations % 10 === 0) {
        console.log(`[FailureRecovery] Status - iterations: ${iterations}, recovered: ${loopStatus.totalRecovered}, failed: ${loopStatus.totalFailed}`);
      }
    } catch (error) {
      loopStatus.consecutiveErrors++;
      console.error('[FailureRecovery] Loop error:', error);

      // 연속 에러 5회 이상 시 경고
      if (loopStatus.consecutiveErrors >= 5) {
        console.error(`[FailureRecovery] WARNING: ${loopStatus.consecutiveErrors} consecutive errors`);
      }
    }

    await sleep(intervalMs);
  }

  loopStatus.isRunning = false;
  console.log(`[FailureRecovery] Loop completed after ${iterations} iterations`);
}
