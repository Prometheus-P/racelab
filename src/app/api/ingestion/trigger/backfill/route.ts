import { NextRequest, NextResponse } from 'next/server';
import { withIngestionAuth } from '@/lib/api-helpers/ingestionAuth';
import {
  runHistoricalBackfill,
  checkBackfillStatus,
  quickBackfill,
} from '@/ingestion/jobs/historicalBackfill';
import type { RaceType } from '@/types/db';

/**
 * POST /api/ingestion/trigger/backfill
 *
 * Trigger historical data backfill for a date range.
 * Requires X-Ingestion-Key header for authentication.
 *
 * Body:
 * {
 *   dateFrom: "2024-01-01",   // required
 *   dateTo: "2024-12-31",     // required
 *   raceTypes?: ["horse"],    // optional, default: ["horse"]
 *   batchSize?: 7,            // optional, default: 7
 *   delayMs?: 1000,           // optional, default: 1000
 *   skipExisting?: true,      // optional, default: true
 * }
 */
export const POST = withIngestionAuth(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));

    const { dateFrom, dateTo, raceTypes, batchSize, delayMs, skipExisting } = body;

    // Validate required fields
    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'dateFrom and dateTo are required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateFrom) || !dateRegex.test(dateTo)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Dates must be in YYYY-MM-DD format',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log(`[API] Trigger backfill from ${dateFrom} to ${dateTo}`);

    const result = await runHistoricalBackfill({
      dateFrom,
      dateTo,
      raceTypes: raceTypes as RaceType[] | undefined,
      batchSize,
      delayMs,
      skipExisting,
    });

    return NextResponse.json(
      {
        success: result.success,
        data: {
          progress: {
            totalDays: result.progress.totalDays,
            processedDays: result.progress.processedDays,
            racesCollected: result.progress.racesCollected,
            entriesCollected: result.progress.entriesCollected,
            resultsCollected: result.progress.resultsCollected,
            errors: result.progress.errors,
            skipped: result.progress.skipped,
          },
        },
        error: result.error,
        timestamp: new Date().toISOString(),
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('[API] Backfill trigger error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});

/**
 * GET /api/ingestion/trigger/backfill
 *
 * Check backfill status for a date range.
 *
 * Query params:
 * - dateFrom: Start date (YYYY-MM-DD)
 * - dateTo: End date (YYYY-MM-DD)
 * - quick: "true" to run quick backfill (last 7 days)
 */
export const GET = withIngestionAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const quick = searchParams.get('quick');

    // Quick backfill mode
    if (quick === 'true') {
      console.log('[API] Running quick backfill (last 7 days)');
      const result = await quickBackfill(7);

      return NextResponse.json(
        {
          success: result.success,
          data: {
            mode: 'quick',
            progress: result.progress,
          },
          timestamp: new Date().toISOString(),
        },
        { status: result.success ? 200 : 500 }
      );
    }

    // Status check mode
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'dateFrom and dateTo query params are required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const status = await checkBackfillStatus(dateFrom, dateTo);

    return NextResponse.json(
      {
        success: true,
        data: {
          dateFrom,
          dateTo,
          ...status,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Backfill status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});
