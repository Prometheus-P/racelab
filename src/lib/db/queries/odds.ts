/**
 * Odds Query Functions
 *
 * Database queries for odds time-series data.
 * Uses TimescaleDB continuous aggregates for efficient queries.
 */

import { db } from '@/lib/db/client';
import { oddsSnapshots } from '@/lib/db/schema';
import { eq, and, gte, lte, asc, sql } from 'drizzle-orm';
import type { OddsSnapshot } from '@/lib/db/schema';

export interface OddsHistoryOptions {
  entryNo?: number;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

/**
 * Get odds history for a race
 *
 * @param raceId - Race ID
 * @param options - Filter options
 * @returns Array of odds snapshots
 */
export async function getOddsHistory(
  raceId: string,
  options: OddsHistoryOptions = {}
): Promise<OddsSnapshot[]> {
  const { entryNo, startTime, endTime, limit = 1000 } = options;

  const conditions = [eq(oddsSnapshots.raceId, raceId)];

  if (entryNo !== undefined) {
    conditions.push(eq(oddsSnapshots.entryNo, entryNo));
  }

  if (startTime) {
    conditions.push(gte(oddsSnapshots.time, startTime));
  }

  if (endTime) {
    conditions.push(lte(oddsSnapshots.time, endTime));
  }

  return db
    .select()
    .from(oddsSnapshots)
    .where(and(...conditions))
    .orderBy(asc(oddsSnapshots.time))
    .limit(limit);
}

/**
 * Get odds summary statistics for a race
 *
 * @param raceId - Race ID
 * @returns Summary statistics per entry
 */
export async function getOddsSummary(
  raceId: string
): Promise<
  Array<{
    entryNo: number;
    minWinOdds: number;
    maxWinOdds: number;
    avgWinOdds: number;
    snapshotCount: number;
  }>
> {
  return db
    .select({
      entryNo: oddsSnapshots.entryNo,
      minWinOdds: sql<number>`min(${oddsSnapshots.oddsWin})`,
      maxWinOdds: sql<number>`max(${oddsSnapshots.oddsWin})`,
      avgWinOdds: sql<number>`avg(${oddsSnapshots.oddsWin})`,
      snapshotCount: sql<number>`count(*)::int`,
    })
    .from(oddsSnapshots)
    .where(eq(oddsSnapshots.raceId, raceId))
    .groupBy(oddsSnapshots.entryNo)
    .orderBy(oddsSnapshots.entryNo);
}

/**
 * Get latest odds for each entry in a race
 *
 * Uses DISTINCT ON for efficient latest row retrieval
 *
 * @param raceId - Race ID
 * @returns Latest odds per entry
 */
export async function getLatestOdds(
  raceId: string
): Promise<Array<{ entryNo: number; winOdds: number; plcOdds: number | null; time: Date }>> {
  // Using raw SQL for DISTINCT ON (PostgreSQL specific)
  const result = await db.execute<{
    entry_no: number;
    odds_win: number;
    odds_place: number | null;
    time: Date;
  }>(sql`
    SELECT DISTINCT ON (entry_no)
      entry_no,
      odds_win,
      odds_place,
      time
    FROM odds_snapshots
    WHERE race_id = ${raceId}
    ORDER BY entry_no, time DESC
  `);

  return result.rows.map((row) => ({
    entryNo: row.entry_no,
    winOdds: Number(row.odds_win),
    plcOdds: row.odds_place ? Number(row.odds_place) : null,
    time: new Date(row.time),
  }));
}

/**
 * Get time-series odds data with time bucketing
 *
 * Uses TimescaleDB time_bucket for efficient aggregation
 *
 * @param raceId - Race ID
 * @param options - Bucket options
 * @returns Time-bucketed odds data
 */
export async function getOddsTimeSeries(
  raceId: string,
  options: { bucketMinutes?: number; entryNo?: number } = {}
): Promise<Array<{ bucket: Date; entryNo: number; avgWinOdds: number; avgPlcOdds: number | null }>> {
  const { bucketMinutes = 5, entryNo } = options;

  const entryFilter = entryNo !== undefined ? sql`AND entry_no = ${entryNo}` : sql``;

  const result = await db.execute<{
    bucket: Date;
    entry_no: number;
    avg_odds_win: number;
    avg_odds_place: number | null;
  }>(sql`
    SELECT
      time_bucket(${bucketMinutes + ' minutes'}::interval, time) AS bucket,
      entry_no,
      avg(odds_win) AS avg_odds_win,
      avg(odds_place) AS avg_odds_place
    FROM odds_snapshots
    WHERE race_id = ${raceId} ${entryFilter}
    GROUP BY bucket, entry_no
    ORDER BY bucket, entry_no
  `);

  return result.rows.map((row) => ({
    bucket: new Date(row.bucket),
    entryNo: row.entry_no,
    avgWinOdds: Number(row.avg_odds_win),
    avgPlcOdds: row.avg_odds_place ? Number(row.avg_odds_place) : null,
  }));
}

/**
 * Get odds change (drift) for each entry
 *
 * Calculates the difference between first and last odds
 *
 * @param raceId - Race ID
 * @returns Odds drift per entry
 */
export async function getOddsDrift(
  raceId: string
): Promise<Array<{ entryNo: number; firstOdds: number; lastOdds: number; drift: number }>> {
  const result = await db.execute<{
    entry_no: number;
    first_odds: number;
    last_odds: number;
  }>(sql`
    WITH first_last AS (
      SELECT
        entry_no,
        first_value(odds_win) OVER (PARTITION BY entry_no ORDER BY time ASC) AS first_odds,
        first_value(odds_win) OVER (PARTITION BY entry_no ORDER BY time DESC) AS last_odds
      FROM odds_snapshots
      WHERE race_id = ${raceId}
    )
    SELECT DISTINCT
      entry_no,
      first_odds,
      last_odds
    FROM first_last
    ORDER BY entry_no
  `);

  return result.rows.map((row) => ({
    entryNo: row.entry_no,
    firstOdds: Number(row.first_odds),
    lastOdds: Number(row.last_odds),
    drift: Number(row.last_odds) - Number(row.first_odds),
  }));
}

/**
 * Get snapshot count for a race (diagnostic)
 *
 * @param raceId - Race ID
 * @returns Total snapshot count
 */
export async function getSnapshotCount(raceId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(oddsSnapshots)
    .where(eq(oddsSnapshots.raceId, raceId));

  return result[0]?.count ?? 0;
}

// ====================================================
// Streaming Queries for B2B API
// ====================================================

/**
 * Options for streaming odds history
 */
export interface StreamingOddsOptions extends OddsHistoryOptions {
  batchSize?: number;
}

/**
 * Get odds history as an async generator for streaming
 *
 * Uses cursor-based pagination for memory-efficient streaming of large datasets.
 * Ideal for B2B API endpoints that need to stream thousands of records.
 *
 * @param raceId - Race ID
 * @param options - Streaming options
 * @yields OddsSnapshot records in batches
 */
export async function* getOddsHistoryStream(
  raceId: string,
  options: StreamingOddsOptions = {}
): AsyncGenerator<OddsSnapshot, void, unknown> {
  const { entryNo, startTime, endTime, limit, batchSize = 1000 } = options;

  // Cursor-based pagination: use (time, entryNo) as cursor for efficient O(1) seek
  // oddsSnapshots uses composite PK (time, raceId, entryNo)
  let cursor: { time: Date; entryNo: number } | null = null;
  let hasMore = true;
  let totalYielded = 0;
  const maxRecords = limit ?? Infinity;

  while (hasMore && totalYielded < maxRecords) {
    const conditions = [eq(oddsSnapshots.raceId, raceId)];

    if (entryNo !== undefined) {
      conditions.push(eq(oddsSnapshots.entryNo, entryNo));
    }

    if (startTime) {
      conditions.push(gte(oddsSnapshots.time, startTime));
    }

    if (endTime) {
      conditions.push(lte(oddsSnapshots.time, endTime));
    }

    // Cursor condition: seek past the last record using composite key order
    if (cursor) {
      conditions.push(
        sql`(${oddsSnapshots.time} > ${cursor.time} OR (${oddsSnapshots.time} = ${cursor.time} AND ${oddsSnapshots.entryNo} > ${cursor.entryNo}))`
      );
    }

    // Calculate batch size respecting overall limit
    const remainingLimit = maxRecords - totalYielded;
    const currentBatchSize = Math.min(batchSize, remainingLimit);

    const batch = await db
      .select()
      .from(oddsSnapshots)
      .where(and(...conditions))
      .orderBy(asc(oddsSnapshots.time), asc(oddsSnapshots.entryNo))
      .limit(currentBatchSize);

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const record of batch) {
      yield record;
      totalYielded++;
      if (totalYielded >= maxRecords) {
        break;
      }
    }

    // Update cursor to last record
    const lastRecord = batch[batch.length - 1];
    cursor = { time: lastRecord.time, entryNo: lastRecord.entryNo };
    hasMore = batch.length === currentBatchSize;
  }
}

/**
 * Get time-bucketed odds as an async generator for streaming
 *
 * @param raceId - Race ID
 * @param options - Bucket options
 * @yields Time-bucketed aggregated data
 */
export async function* getOddsTimeSeriesStream(
  raceId: string,
  options: { bucketMinutes?: number; entryNo?: number; batchSize?: number } = {}
): AsyncGenerator<
  { bucket: Date; entryNo: number; avgWinOdds: number; avgPlcOdds: number | null },
  void,
  unknown
> {
  const { bucketMinutes = 5, entryNo, batchSize = 500 } = options;

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const entryFilter = entryNo !== undefined ? sql`AND entry_no = ${entryNo}` : sql``;

    const result = await db.execute<{
      bucket: Date;
      entry_no: number;
      avg_odds_win: number;
      avg_odds_place: number | null;
    }>(sql`
      SELECT
        time_bucket(${bucketMinutes + ' minutes'}::interval, time) AS bucket,
        entry_no,
        avg(odds_win) AS avg_odds_win,
        avg(odds_place) AS avg_odds_place
      FROM odds_snapshots
      WHERE race_id = ${raceId} ${entryFilter}
      GROUP BY bucket, entry_no
      ORDER BY bucket, entry_no
      LIMIT ${batchSize}
      OFFSET ${offset}
    `);

    if (result.rows.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of result.rows) {
      yield {
        bucket: new Date(row.bucket),
        entryNo: row.entry_no,
        avgWinOdds: Number(row.avg_odds_win),
        avgPlcOdds: row.avg_odds_place ? Number(row.avg_odds_place) : null,
      };
    }

    offset += result.rows.length;
    hasMore = result.rows.length === batchSize;
  }
}

/**
 * Get complete odds data for a race with all entries combined (for export)
 *
 * @param raceId - Race ID
 * @param options - Export options
 * @returns Summary data with all snapshots
 */
export async function getOddsExportData(
  raceId: string,
  options: { startTime?: Date; endTime?: Date } = {}
): Promise<{
  raceId: string;
  exportedAt: string;
  totalSnapshots: number;
  entries: Array<{
    entryNo: number;
    snapshotCount: number;
    firstOdds: number;
    lastOdds: number;
    minOdds: number;
    maxOdds: number;
  }>;
}> {
  const { startTime, endTime } = options;

  let timeFilter = sql``;
  if (startTime && endTime) {
    timeFilter = sql`AND time BETWEEN ${startTime} AND ${endTime}`;
  } else if (startTime) {
    timeFilter = sql`AND time >= ${startTime}`;
  } else if (endTime) {
    timeFilter = sql`AND time <= ${endTime}`;
  }

  // Get aggregated stats per entry
  const result = await db.execute<{
    entry_no: number;
    snapshot_count: number;
    first_odds: number;
    last_odds: number;
    min_odds: number;
    max_odds: number;
  }>(sql`
    WITH entry_stats AS (
      SELECT
        entry_no,
        count(*) AS snapshot_count,
        first_value(odds_win) OVER (PARTITION BY entry_no ORDER BY time ASC) AS first_odds,
        first_value(odds_win) OVER (PARTITION BY entry_no ORDER BY time DESC) AS last_odds,
        min(odds_win) AS min_odds,
        max(odds_win) AS max_odds
      FROM odds_snapshots
      WHERE race_id = ${raceId} ${timeFilter}
    )
    SELECT DISTINCT
      entry_no,
      snapshot_count::int,
      first_odds,
      last_odds,
      min_odds,
      max_odds
    FROM entry_stats
    ORDER BY entry_no
  `);

  const totalSnapshots = result.rows.reduce((sum, row) => sum + row.snapshot_count, 0);

  return {
    raceId,
    exportedAt: new Date().toISOString(),
    totalSnapshots,
    entries: result.rows.map((row) => ({
      entryNo: row.entry_no,
      snapshotCount: row.snapshot_count,
      firstOdds: Number(row.first_odds),
      lastOdds: Number(row.last_odds),
      minOdds: Number(row.min_odds),
      maxOdds: Number(row.max_odds),
    })),
  };
}
