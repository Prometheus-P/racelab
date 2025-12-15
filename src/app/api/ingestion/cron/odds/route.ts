/**
 * Odds Collection Cron Route
 *
 * GET /api/ingestion/cron/odds
 * Called by Vercel Cron every minute to collect odds for upcoming races.
 *
 * Uses smart scheduling to determine collection intervals:
 * - T-60 to T-15: Every 5 minutes
 * - T-15 to T-5: Every 1 minute
 * - T-5 to T-0: Every 30 seconds (requires second pass within same minute)
 *
 * Protected by CRON_SECRET for Vercel Cron authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { races } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { pollOdds } from '@/ingestion/jobs/oddsPoller';
import {
  getUpcomingRacesForCollection,
  shouldCollectNow,
  needsSecondPass,
  sleep,
} from '@/ingestion/utils/smartScheduler';
import {
  getFallbackState,
  isFallbackMode,
  markFallbackCollection,
  shouldThrottleFallback,
} from '@/ingestion/utils/fallbackMode';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for odds collection

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify Vercel Cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  const now = new Date();
  console.log(`[Cron/Odds] Starting odds collection at ${now.toISOString()}`);

  const initialFallbackState = getFallbackState(now);
  if (initialFallbackState.active) {
    console.log(
      `[Cron/Odds] Fallback mode active (source=${initialFallbackState.source}, reason=${initialFallbackState.reason}). Enforcing ${
        initialFallbackState.intervalMs / (60 * 1000)
      }-minute interval`
    );
    if (shouldThrottleFallback(now)) {
      return NextResponse.json({
        success: true,
        data: {
          racesChecked: 0,
          racesInWindow: 0,
          racesCollected: 0,
          firstPassSnapshots: 0,
          secondPassSnapshots: 0,
          totalSnapshots: 0,
          errors: 0,
          fallbackActive: true,
          nextWindow: new Date(now.getTime() + initialFallbackState.intervalMs).toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  try {
    // Get today's date string for querying races
    const todayStr = now.toISOString().split('T')[0];

    // Query races scheduled for today with start times
    const todayRaces = await db
      .select({
        id: races.id,
        startTime: races.startTime,
      })
      .from(races)
      .where(
        and(
          isNotNull(races.startTime),
          eq(races.raceDate, todayStr),
          eq(races.status, 'scheduled')
        )
      );

    console.log(`[Cron/Odds] Found ${todayRaces.length} scheduled races today`);

    // Filter to races within collection window (60 minutes before start)
    const upcomingRaces = getUpcomingRacesForCollection(todayRaces, now);

    if (upcomingRaces.length === 0) {
      console.log('[Cron/Odds] No races within collection window');
      return NextResponse.json({
        success: true,
        data: {
          racesChecked: todayRaces.length,
          racesInWindow: 0,
          firstPassSnapshots: 0,
          secondPassSnapshots: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[Cron/Odds] ${upcomingRaces.length} races in collection window`);

    // Filter to races that should be collected at this minute boundary
    const racesToCollect = upcomingRaces.filter((race) => shouldCollectNow(race.minutesToStart));

    if (racesToCollect.length === 0) {
      console.log('[Cron/Odds] No races need collection at this interval');
      return NextResponse.json({
        success: true,
        data: {
          racesChecked: todayRaces.length,
          racesInWindow: upcomingRaces.length,
          firstPassSnapshots: 0,
          secondPassSnapshots: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // First pass: collect odds for all eligible races
    const raceIds = racesToCollect.map((r) => r.id);
    console.log(`[Cron/Odds] First pass: collecting for ${raceIds.length} races`);

    const firstPassResult = await pollOdds({ raceIds });
    let secondPassSnapshots = 0;

    // Check if any races need a second pass (T-5 window with 30-sec interval)
    const racesNeedingSecondPass = racesToCollect.filter((race) =>
      needsSecondPass(race.minutesToStart)
    );

    if (racesNeedingSecondPass.length > 0) {
      console.log(
        `[Cron/Odds] ${racesNeedingSecondPass.length} races need second pass in 30 seconds`
      );

      // Wait 30 seconds for second collection
      await sleep(30 * 1000);

      const secondPassRaceIds = racesNeedingSecondPass.map((r) => r.id);
      const secondPassResult = await pollOdds({ raceIds: secondPassRaceIds });
      secondPassSnapshots = secondPassResult.snapshots;

      console.log(`[Cron/Odds] Second pass collected ${secondPassSnapshots} snapshots`);
    }

    const totalSnapshots = firstPassResult.snapshots + secondPassSnapshots;
    console.log(`[Cron/Odds] Complete: ${totalSnapshots} total snapshots collected`);

    const postRunFallbackState = getFallbackState(now);
    if (isFallbackMode(now)) {
      markFallbackCollection(now);
    }

    return NextResponse.json({
      success: true,
      data: {
        racesChecked: todayRaces.length,
        racesInWindow: upcomingRaces.length,
        racesCollected: racesToCollect.length,
        firstPassSnapshots: firstPassResult.snapshots,
        secondPassSnapshots,
        totalSnapshots,
        errors: firstPassResult.errors,
        fallbackActive: postRunFallbackState.active,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron/Odds] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to collect odds',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
