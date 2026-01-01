/**
 * Status Service
 *
 * Provides ingestion status and monitoring data.
 */

import { db } from '@/lib/db/client';
import { races, entries, results, ingestionFailures } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export interface IngestionStatus {
  date: string;
  races: {
    total: number;
    scheduled: number;
    inProgress: number;
    finished: number;
    cancelled: number;
  };
  byType: {
    horse: number;
    cycle: number;
    boat: number;
  };
  entries: {
    total: number;
  };
  results: {
    total: number;
  };
  successRate: number;
  lastUpdated: string;
}

export interface OddsCollectionStatus {
  totalSnapshots: number;
  uniqueRaces: number;
  avgSnapshotsPerRace: number;
  lastCollectionTime: string | null;
}

export interface FailureStatus {
  pending: number;
  retrying: number;
  resolved: number;
  maxRetriesExceeded: number;
  total: number;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: boolean;
  lastCheck: string;
  issues: string[];
}

/**
 * Get today's ingestion status
 *
 * @param date - Optional date (default: today)
 * @returns Ingestion status summary
 */
export async function getIngestionStatus(date?: string): Promise<IngestionStatus> {
  const targetDate = date ?? new Date().toISOString().split('T')[0];

  // Get race counts by status (compare with date string)
  const racesByStatus = await db
    .select({
      status: races.status,
      count: sql<number>`count(*)::int`,
    })
    .from(races)
    .where(eq(races.raceDate, targetDate))
    .groupBy(races.status);

  // Get race counts by type
  const racesByType = await db
    .select({
      raceType: races.raceType,
      count: sql<number>`count(*)::int`,
    })
    .from(races)
    .where(eq(races.raceDate, targetDate))
    .groupBy(races.raceType);

  // Get entry count
  const entryCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(entries)
    .innerJoin(races, eq(entries.raceId, races.id))
    .where(eq(races.raceDate, targetDate));

  // Get result count
  const resultCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(results)
    .innerJoin(races, eq(results.raceId, races.id))
    .where(eq(races.raceDate, targetDate));

  // Process race status counts
  const statusCounts = racesByStatus.reduce(
    (acc, r) => {
      acc[r.status as keyof typeof acc] = r.count;
      return acc;
    },
    { scheduled: 0, in_progress: 0, finished: 0, cancelled: 0 }
  );

  // Process race type counts
  const typeCounts = racesByType.reduce(
    (acc, r) => {
      acc[r.raceType as keyof typeof acc] = r.count;
      return acc;
    },
    { horse: 0, cycle: 0, boat: 0 }
  );

  const total =
    statusCounts.scheduled +
    statusCounts.in_progress +
    statusCounts.finished +
    statusCounts.cancelled;
  const successRate = total > 0 ? (statusCounts.finished / total) * 100 : 0;

  return {
    date: targetDate,
    races: {
      total,
      scheduled: statusCounts.scheduled,
      inProgress: statusCounts.in_progress,
      finished: statusCounts.finished,
      cancelled: statusCounts.cancelled,
    },
    byType: typeCounts,
    entries: {
      total: entryCount[0]?.count ?? 0,
    },
    results: {
      total: resultCount[0]?.count ?? 0,
    },
    successRate: Math.round(successRate * 100) / 100,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get odds collection status for today
 *
 * @returns Odds collection metrics
 */
export async function getOddsCollectionStatus(): Promise<OddsCollectionStatus> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db.execute<{
    total_snapshots: number;
    unique_races: number;
    last_time: Date | null;
  }>(sql`
    SELECT
      count(*)::int AS total_snapshots,
      count(DISTINCT race_id)::int AS unique_races,
      max(time) AS last_time
    FROM odds_snapshots
    WHERE time >= ${today}
  `);

  const row = result.rows[0];
  const totalSnapshots = row?.total_snapshots ?? 0;
  const uniqueRaces = row?.unique_races ?? 0;

  return {
    totalSnapshots,
    uniqueRaces,
    avgSnapshotsPerRace: uniqueRaces > 0 ? Math.round(totalSnapshots / uniqueRaces) : 0,
    lastCollectionTime: row?.last_time ? new Date(row.last_time).toISOString() : null,
  };
}

/**
 * Get failure status summary
 *
 * @returns Failure counts by status
 */
export async function getFailureStatus(): Promise<FailureStatus> {
  const statusCounts = await db
    .select({
      status: ingestionFailures.status,
      count: sql<number>`count(*)::int`,
    })
    .from(ingestionFailures)
    .groupBy(ingestionFailures.status);

  const counts = statusCounts.reduce(
    (acc, r) => {
      acc[r.status as keyof Omit<FailureStatus, 'total'>] = r.count;
      return acc;
    },
    { pending: 0, retrying: 0, resolved: 0, maxRetriesExceeded: 0 }
  );

  return {
    ...counts,
    total: counts.pending + counts.retrying + counts.resolved + counts.maxRetriesExceeded,
  };
}

/**
 * Perform health check
 *
 * @returns System health status
 */
export async function getHealthCheck(): Promise<HealthCheck> {
  const issues: string[] = [];
  let databaseOk = false;

  try {
    // Check database connectivity
    await db.execute(sql`SELECT 1`);
    databaseOk = true;
  } catch {
    issues.push('Database connection failed');
  }

  // Check for high pending failures
  try {
    const failureStatus = await getFailureStatus();
    if (failureStatus.pending > 10) {
      issues.push(`High number of pending failures: ${failureStatus.pending}`);
    }
    if (failureStatus.maxRetriesExceeded > 0) {
      issues.push(`Failures exceeded max retries: ${failureStatus.maxRetriesExceeded}`);
    }
  } catch (error) {
    // Log failure check error - don't mark unhealthy but note the issue
    console.error('[statusService] Failed to check failure status:', error);
    issues.push('Unable to check failure queue');
  }

  let status: HealthCheck['status'] = 'healthy';
  if (!databaseOk) {
    status = 'unhealthy';
  } else if (issues.length > 0) {
    status = 'degraded';
  }

  return {
    status,
    database: databaseOk,
    lastCheck: new Date().toISOString(),
    issues,
  };
}

/**
 * Get comprehensive dashboard data
 *
 * @returns Combined status for dashboard display
 */
export async function getDashboardStatus(): Promise<{
  ingestion: IngestionStatus;
  odds: OddsCollectionStatus;
  failures: FailureStatus;
  health: HealthCheck;
}> {
  const [ingestion, odds, failures, health] = await Promise.all([
    getIngestionStatus(),
    getOddsCollectionStatus(),
    getFailureStatus(),
    getHealthCheck(),
  ]);

  return { ingestion, odds, failures, health };
}
