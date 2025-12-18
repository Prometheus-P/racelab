/**
 * Schedule Poller Job
 *
 * Fetches race schedules from KRA/KSPO APIs and saves to database.
 * Typically runs daily at 06:00 via Vercel Cron.
 */

import { db } from '@/lib/db/client';
import { races } from '@/lib/db/schema';
import { fetchKraSchedules } from '../clients/kraClient';
import { fetchKspoSchedules } from '../clients/kspoClient';
import { mapKraSchedules, mapKspoSchedules } from '../mappers/scheduleMapper';
import type { RaceType, IngestionResult } from '@/types/db';
import { withRetryAndLogging } from '../utils/retry';

export interface PollSchedulesOptions {
  date?: string;
  raceTypes?: RaceType[];
}

/**
 * Poll and save race schedules for a given date
 *
 * @param options - Polling options (date, race types)
 * @returns Result with counts of collected, skipped, and errors
 */
export async function pollSchedules(
  options: PollSchedulesOptions = {}
): Promise<IngestionResult> {
  const date = options.date || new Date().toISOString().split('T')[0];
  const raceTypes = options.raceTypes || ['horse', 'cycle', 'boat'];

  const result: IngestionResult = {
    collected: 0,
    skipped: 0,
    errors: 0,
  };

  console.log(`[SchedulePoller] Polling schedules for ${date}, types: ${raceTypes.join(', ')}`);

  // Poll horse racing (KRA)
  if (raceTypes.includes('horse')) {
    try {
      const kraFetch = await withRetryAndLogging(() => fetchKraSchedules(date), {
        jobType: 'schedule_poll',
        entityType: 'race',
        entityId: `horse-${date}`,
        maxRetries: 2,
        initialDelay: 500,
        notifyOnFailure: false,
      });

      if (!kraFetch.success || !kraFetch.data) {
        result.errors += 1;
        console.warn('[SchedulePoller] Horse schedule fetch failed');
      } else {
        const mappedRaces = mapKraSchedules(kraFetch.data, date);

        if (mappedRaces.length > 0) {
          await db
            .insert(races)
            .values(mappedRaces)
            .onConflictDoUpdate({
              target: races.id,
              set: {
                startTime: races.startTime,
                weather: races.weather,
                trackCondition: races.trackCondition,
                updatedAt: new Date(),
              },
            });

          result.collected += mappedRaces.length;
          console.log(`[SchedulePoller] Collected ${mappedRaces.length} horse races`);
        }
      }
    } catch (error) {
      console.error('[SchedulePoller] KRA fetch error:', error);
      result.errors += 1;
    }
  }

  // Poll cycle racing (KSPO)
  if (raceTypes.includes('cycle')) {
    try {
      const kspoItems = await withRetryAndLogging(() => fetchKspoSchedules(date, 'cycle'), {
        jobType: 'schedule_poll',
        entityType: 'race',
        entityId: `cycle-${date}`,
        maxRetries: 2,
        initialDelay: 500,
        notifyOnFailure: false,
      });

      const mappedRaces = kspoItems.success && kspoItems.data ? mapKspoSchedules(kspoItems.data, date, 'cycle') : [];

      if (mappedRaces.length > 0) {
        await db
          .insert(races)
          .values(mappedRaces)
          .onConflictDoUpdate({
            target: races.id,
            set: {
              startTime: races.startTime,
              updatedAt: new Date(),
            },
          });

        result.collected += mappedRaces.length;
        console.log(`[SchedulePoller] Collected ${mappedRaces.length} cycle races`);
      }
    } catch (error) {
      console.error('[SchedulePoller] KSPO cycle fetch error:', error);
      result.errors += 1;
    }
  }

  // Poll boat racing (KSPO)
  if (raceTypes.includes('boat')) {
    try {
      const kspoItems = await withRetryAndLogging(() => fetchKspoSchedules(date, 'boat'), {
        jobType: 'schedule_poll',
        entityType: 'race',
        entityId: `boat-${date}`,
        maxRetries: 2,
        initialDelay: 500,
        notifyOnFailure: false,
      });

      const mappedRaces = kspoItems.success && kspoItems.data ? mapKspoSchedules(kspoItems.data, date, 'boat') : [];

      if (mappedRaces.length > 0) {
        await db
          .insert(races)
          .values(mappedRaces)
          .onConflictDoUpdate({
            target: races.id,
            set: {
              startTime: races.startTime,
              updatedAt: new Date(),
            },
          });

        result.collected += mappedRaces.length;
        console.log(`[SchedulePoller] Collected ${mappedRaces.length} boat races`);
      }
    } catch (error) {
      console.error('[SchedulePoller] KSPO boat fetch error:', error);
      result.errors += 1;
    }
  }

  console.log(
    `[SchedulePoller] Complete: collected=${result.collected}, errors=${result.errors}`
  );

  return result;
}
