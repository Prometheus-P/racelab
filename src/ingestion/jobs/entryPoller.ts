/**
 * Entry Poller Job
 *
 * Fetches race entries (출주표) from KRA/KSPO APIs and saves to database.
 * Typically runs 2 hours before each race start.
 */

import { db } from '@/lib/db/client';
import { entries, races } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { fetchKraEntries } from '../clients/kraClient';
import { fetchKspoEntries } from '../clients/kspoClient';
import { mapKraEntries, mapKspoEntries } from '../mappers/entryMapper';
import type { IngestionResult } from '@/types/db';
import { withRetryAndLogging } from '../utils/retry';

export interface PollEntriesOptions {
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
 * Poll and save entries for specified race IDs
 *
 * @param options - Polling options with race IDs
 * @returns Result with counts of collected, skipped, and errors
 */
export async function pollEntries(options: PollEntriesOptions): Promise<IngestionResult> {
  const { raceIds } = options;

  const result: IngestionResult = {
    collected: 0,
    skipped: 0,
    errors: 0,
  };

  if (raceIds.length === 0) {
    console.log('[EntryPoller] No race IDs provided');
    return result;
  }

  console.log(`[EntryPoller] Polling entries for ${raceIds.length} races`);

  for (const raceId of raceIds) {
    const parsed = parseRaceId(raceId);
    if (!parsed) {
      console.warn(`[EntryPoller] Invalid race ID format: ${raceId}`);
      result.skipped += 1;
      continue;
    }

    const { raceType, trackCode, raceNo, date } = parsed;

    try {
      let mappedEntries;

      if (raceType === 'horse') {
        const items = await withRetryAndLogging(
          () => fetchKraEntries(trackCode, raceNo, date),
          {
            jobType: 'entry_poll',
            entityType: 'entry',
            entityId: raceId,
            maxRetries: 2,
            initialDelay: 500,
          }
        );
        if (!items.success || !items.data) {
          result.errors += 1;
          continue;
        }
        mappedEntries = mapKraEntries(items.data, raceId);
      } else {
        const items = await withRetryAndLogging(
          () => fetchKspoEntries(trackCode, raceNo, date, raceType),
          {
            jobType: 'entry_poll',
            entityType: 'entry',
            entityId: raceId,
            maxRetries: 2,
            initialDelay: 500,
          }
        );
        if (!items.success || !items.data) {
          result.errors += 1;
          continue;
        }
        mappedEntries = mapKspoEntries(items.data, raceId, raceType);
      }

      if (mappedEntries.length > 0) {
        // Use transaction to ensure entries insert and race status update are atomic
        // If either operation fails, both are rolled back to prevent data inconsistency
        await db.transaction(async (tx) => {
          await tx
            .insert(entries)
            .values(mappedEntries)
            .onConflictDoUpdate({
              target: [entries.raceId, entries.entryNo],
              set: {
                name: entries.name,
                jockeyName: entries.jockeyName,
                weight: entries.weight,
                rating: entries.rating,
                status: entries.status,
              },
            });

          // Update race status to 'upcoming'
          await tx
            .update(races)
            .set({ status: 'upcoming', updatedAt: new Date() })
            .where(eq(races.id, raceId));
        });

        result.collected += mappedEntries.length;
        console.log(`[EntryPoller] Collected ${mappedEntries.length} entries for ${raceId}`);
      } else {
        result.skipped += 1;
        console.log(`[EntryPoller] No entries found for ${raceId}`);
      }
    } catch (error) {
      console.error(`[EntryPoller] Error fetching entries for ${raceId}:`, error);
      result.errors += 1;
    }
  }

  console.log(
    `[EntryPoller] Complete: collected=${result.collected}, skipped=${result.skipped}, errors=${result.errors}`
  );

  return result;
}
