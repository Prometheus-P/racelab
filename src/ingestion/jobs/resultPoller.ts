/**
 * Result Poller Job
 *
 * Fetches race results from KRA/KSPO APIs and saves to database.
 * Typically runs 5 minutes after each race finishes.
 */

import { db } from '@/lib/db/client';
import { results, races } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fetchKraResults } from '../clients/kraClient';
import { fetchKspoResults } from '../clients/kspoClient';
import { mapKraResults, mapKspoResults } from '../mappers/resultMapper';
import type { IngestionResult } from '@/types/db';
import { withRetryAndLogging } from '../utils/retry';

export interface PollResultsOptions {
  raceIds: string[];
}

/**
 * Parse race ID to extract components
 */
function parseRaceId(raceId: string): {
  raceType: 'horse' | 'cycle' | 'boat';
  trackCode: string;
  raceNo: number;
  date: string;
} | null {
  const parts = raceId.split('-');
  if (parts.length < 4) return null;

  const raceType = parts[0] as 'horse' | 'cycle' | 'boat';
  const trackCode = parts[1];
  const raceNo = parseInt(parts[2], 10);
  const dateRaw = parts[3];
  const date = `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`;

  return { raceType, trackCode, raceNo, date };
}

/**
 * Poll and save results for specified race IDs
 *
 * @param options - Polling options with race IDs
 * @returns Result with counts of collected, skipped, and errors
 */
export async function pollResults(options: PollResultsOptions): Promise<IngestionResult> {
  const { raceIds } = options;

  const result: IngestionResult = {
    collected: 0,
    skipped: 0,
    errors: 0,
  };

  if (raceIds.length === 0) {
    console.log('[ResultPoller] No race IDs provided');
    return result;
  }

  console.log(`[ResultPoller] Polling results for ${raceIds.length} races`);

  for (const raceId of raceIds) {
    const parsed = parseRaceId(raceId);
    if (!parsed) {
      console.warn(`[ResultPoller] Invalid race ID format: ${raceId}`);
      result.skipped += 1;
      continue;
    }

    const { raceType, trackCode, raceNo, date } = parsed;

    try {
      let mappedResults;

      if (raceType === 'horse') {
        const items = await withRetryAndLogging(
          () => fetchKraResults(trackCode, raceNo, date),
          {
            jobType: 'result_poll',
            entityType: 'result',
            entityId: raceId,
            maxRetries: 2,
            initialDelay: 500,
          }
        );
        if (!items.success || !items.data) {
          result.errors += 1;
          continue;
        }
        mappedResults = mapKraResults(items.data, raceId);
      } else {
        const items = await withRetryAndLogging(
          () => fetchKspoResults(trackCode, raceNo, date, raceType),
          {
            jobType: 'result_poll',
            entityType: 'result',
            entityId: raceId,
            maxRetries: 2,
            initialDelay: 500,
          }
        );
        if (!items.success || !items.data) {
          result.errors += 1;
          continue;
        }
        mappedResults = mapKspoResults(items.data, raceId);
      }

      if (mappedResults.length > 0) {
        await db
          .insert(results)
          .values(mappedResults)
          .onConflictDoUpdate({
            target: [results.raceId, results.entryNo],
            set: {
              finishPosition: results.finishPosition,
              time: results.time,
              dividendWin: results.dividendWin,
              dividendPlace: results.dividendPlace,
            },
          });

        result.collected += mappedResults.length;
        console.log(`[ResultPoller] Collected ${mappedResults.length} results for ${raceId}`);

        // Update race status to 'finished'
        await db
          .update(races)
          .set({ status: 'finished', updatedAt: new Date() })
          .where(eq(races.id, raceId));
      } else {
        result.skipped += 1;
        console.log(`[ResultPoller] No results found for ${raceId} (race may not be finished)`);
      }
    } catch (error) {
      console.error(`[ResultPoller] Error fetching results for ${raceId}:`, error);
      result.errors += 1;
    }
  }

  console.log(
    `[ResultPoller] Complete: collected=${result.collected}, skipped=${result.skipped}, errors=${result.errors}`
  );

  return result;
}
