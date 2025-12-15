/**
 * Odds Poller Job
 *
 * Fetches current odds from KRA/KSPO APIs and saves to TimescaleDB.
 * Supports variable collection intervals based on time to race start.
 */

import { db } from '@/lib/db/client';
import { oddsSnapshots, races, type NewOddsSnapshot } from '@/lib/db/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { fetchKraOdds } from '../clients/kraClient';
import { fetchKspoOdds } from '../clients/kspoClient';
import { mapKraOddsBatch, mapKspoOddsBatch } from '../mappers/oddsMapper';

export interface PollOddsOptions {
  raceIds: string[];
}

export interface OddsIngestionResult {
  snapshots: number;
  races: number;
  errors: number;
}

const LIVE_INTERVAL_MS = 30 * 1000;
const IDLE_INTERVAL_MS = 5 * 60 * 1000;
const LIVE_WINDOW_LEAD_MS = 10 * 60 * 1000;
const LIVE_WINDOW_LAG_MS = 5 * 60 * 1000;
const COMPLETED_STATUSES = new Set(['finished', 'canceled', 'cancelled', 'postponed']);

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
 * Poll and save odds for specified race IDs
 *
 * @param options - Polling options with race IDs
 * @returns Result with counts of snapshots and errors
 */
export async function pollOdds(options: PollOddsOptions): Promise<OddsIngestionResult> {
  const { raceIds } = options;
  const timestamp = new Date();

  const result: OddsIngestionResult = {
    snapshots: 0,
    races: 0,
    errors: 0,
  };

  if (raceIds.length === 0) {
    console.log('[OddsPoller] No race IDs provided');
    return result;
  }

  console.log(`[OddsPoller] Polling odds for ${raceIds.length} races at ${timestamp.toISOString()}`);

  const raceMetadataRows = await db
    .select({
      id: races.id,
      raceDate: races.raceDate,
      startTime: races.startTime,
      status: races.status,
    })
    .from(races)
    .where(inArray(races.id, raceIds));

  const raceMetadata = new Map(raceMetadataRows.map((race) => [race.id, race]));

  for (const raceId of raceIds) {
    const parsed = parseRaceId(raceId);
    if (!parsed) {
      console.warn(`[OddsPoller] Invalid race ID format: ${raceId}`);
      continue;
    }

    const raceInfo = raceMetadata.get(raceId);

    if (!raceInfo) {
      console.warn(`[OddsPoller] No race metadata found for ${raceId}, skipping`);
      continue;
    }

    if (COMPLETED_STATUSES.has((raceInfo.status ?? '').toLowerCase())) {
      console.log(`[OddsPoller] ${raceId} already ${raceInfo.status}, skipping polling`);
      continue;
    }

    const startDateTime = getRaceStartDateTime(raceInfo.raceDate, raceInfo.startTime);

    if (!startDateTime) {
      console.log(`[OddsPoller] ${raceId} has no start time, falling back to idle interval`);
    }

    const { intervalMs, mode } = getPollingInterval(timestamp, startDateTime);
    const lastSnapshotTime = await getLatestSnapshotTime(raceId);

    if (lastSnapshotTime) {
      const elapsed = timestamp.getTime() - lastSnapshotTime.getTime();
      if (elapsed < intervalMs) {
        const waitMs = intervalMs - elapsed;
        console.log(
          `[OddsPoller] ${raceId} in ${mode} window - skipping (wait ${Math.ceil(waitMs / 1000)}s more)`
        );
        continue;
      }
    }

    const { raceType, trackCode, raceNo, date } = parsed;

    try {
      let mappedSnapshots: NewOddsSnapshot[] = [];

      if (raceType === 'horse') {
        const items = await fetchKraOdds(trackCode, raceNo, date);
        mappedSnapshots = mapKraOddsBatch(items, raceId, timestamp);
      } else {
        const items = await fetchKspoOdds(trackCode, raceNo, date, raceType);
        mappedSnapshots = mapKspoOddsBatch(items, raceId, timestamp);
      }

      if (mappedSnapshots.length > 0) {
        const previousSnapshotSignatures = lastSnapshotTime
          ? await getSnapshotEntrySignatures(raceId, lastSnapshotTime)
          : null;

        const hasChanges = previousSnapshotSignatures
          ? snapshotsChanged(mappedSnapshots, previousSnapshotSignatures)
          : true;

        if (!hasChanges) {
          console.log(`[OddsPoller] ${raceId} odds unchanged, skipping insert to reduce churn`);
          continue;
        }

        // Use onConflictDoNothing since (time, race_id, entry_no) is primary key
        // Duplicate timestamps for same race/entry should be ignored
        await db.insert(oddsSnapshots).values(mappedSnapshots).onConflictDoNothing();

        result.snapshots += mappedSnapshots.length;
        result.races += 1;
        console.log(`[OddsPoller] Collected ${mappedSnapshots.length} odds for ${raceId}`);
      }
    } catch (error) {
      console.error(`[OddsPoller] Error fetching odds for ${raceId}:`, error);
      result.errors += 1;
    }
  }

  console.log(
    `[OddsPoller] Complete: snapshots=${result.snapshots}, races=${result.races}, errors=${result.errors}`
  );

  return result;
}

/**
 * Poll odds for a single race (used by cron job)
 */
export async function pollOddsForRace(raceId: string): Promise<number> {
  const result = await pollOdds({ raceIds: [raceId] });
  return result.snapshots;
}

function getRaceStartDateTime(raceDate: Date | string, startTime: string | null): Date | null {
  if (!startTime) {
    return null;
  }

  const datePart = typeof raceDate === 'string' ? raceDate : raceDate.toISOString().split('T')[0];
  const isoString = `${datePart}T${startTime}`;
  const parsed = new Date(isoString);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPollingInterval(
  now: Date,
  startDateTime: Date | null
): { intervalMs: number; mode: 'live' | 'idle' } {
  if (!startDateTime) {
    return { intervalMs: IDLE_INTERVAL_MS, mode: 'idle' };
  }

  const liveWindowStart = startDateTime.getTime() - LIVE_WINDOW_LEAD_MS;
  const liveWindowEnd = startDateTime.getTime() + LIVE_WINDOW_LAG_MS;
  const nowMs = now.getTime();

  if (nowMs >= liveWindowStart && nowMs <= liveWindowEnd) {
    return { intervalMs: LIVE_INTERVAL_MS, mode: 'live' };
  }

  return { intervalMs: IDLE_INTERVAL_MS, mode: 'idle' };
}

async function getLatestSnapshotTime(raceId: string): Promise<Date | null> {
  const rows = await db
    .select({ time: oddsSnapshots.time })
    .from(oddsSnapshots)
    .where(eq(oddsSnapshots.raceId, raceId))
    .orderBy(desc(oddsSnapshots.time))
    .limit(1);

  return rows[0]?.time ?? null;
}

type SnapshotEntrySignature = {
  oddsWin: string | null;
  oddsPlace: string | null;
  popularityRank: string | null;
  poolTotal: string | null;
  poolWin: string | null;
  poolPlace: string | null;
};

async function getSnapshotEntrySignatures(
  raceId: string,
  snapshotTime: Date
): Promise<Map<number, SnapshotEntrySignature>> {
  const rows = await db
    .select({
      entryNo: oddsSnapshots.entryNo,
      oddsWin: oddsSnapshots.oddsWin,
      oddsPlace: oddsSnapshots.oddsPlace,
      popularityRank: oddsSnapshots.popularityRank,
      poolTotal: oddsSnapshots.poolTotal,
      poolWin: oddsSnapshots.poolWin,
      poolPlace: oddsSnapshots.poolPlace,
    })
    .from(oddsSnapshots)
    .where(and(eq(oddsSnapshots.raceId, raceId), eq(oddsSnapshots.time, snapshotTime)));

  const signatures = new Map<number, SnapshotEntrySignature>();

  for (const row of rows) {
    signatures.set(row.entryNo, {
      oddsWin: normalizeValue(row.oddsWin),
      oddsPlace: normalizeValue(row.oddsPlace),
      popularityRank: normalizeValue(row.popularityRank),
      poolTotal: normalizeValue(row.poolTotal),
      poolWin: normalizeValue(row.poolWin),
      poolPlace: normalizeValue(row.poolPlace),
    });
  }

  return signatures;
}

function snapshotsChanged(
  newSnapshots: NewOddsSnapshot[],
  previousSnapshots: Map<number, SnapshotEntrySignature>
): boolean {
  if (previousSnapshots.size === 0) {
    return true;
  }

  if (previousSnapshots.size !== newSnapshots.length) {
    return true;
  }

  for (const snapshot of newSnapshots) {
    const entryNo = snapshot.entryNo;

    if (entryNo === undefined || entryNo === null) {
      return true;
    }

    const previous = previousSnapshots.get(entryNo);

    if (!previous) {
      return true;
    }

    const currentSignature: SnapshotEntrySignature = {
      oddsWin: normalizeValue(snapshot.oddsWin),
      oddsPlace: normalizeValue(snapshot.oddsPlace),
      popularityRank: normalizeValue(snapshot.popularityRank),
      poolTotal: normalizeValue(snapshot.poolTotal),
      poolWin: normalizeValue(snapshot.poolWin),
      poolPlace: normalizeValue(snapshot.poolPlace),
    };

    if (!signaturesEqual(previous, currentSignature)) {
      return true;
    }
  }

  return false;
}

function normalizeValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function signaturesEqual(a: SnapshotEntrySignature, b: SnapshotEntrySignature): boolean {
  return (
    a.oddsWin === b.oddsWin &&
    a.oddsPlace === b.oddsPlace &&
    a.popularityRank === b.popularityRank &&
    a.poolTotal === b.poolTotal &&
    a.poolWin === b.poolWin &&
    a.poolPlace === b.poolPlace
  );
}
