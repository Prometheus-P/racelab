/**
 * B2B Odds History Streaming Endpoint
 *
 * GET /api/v1/data/odds-history/[raceId]
 *
 * Streams odds history data for a specific race.
 *
 * Query Parameters:
 * - format: Output format (json, jsonl, csv) - default: jsonl
 * - startTime: ISO 8601 timestamp for start of range
 * - endTime: ISO 8601 timestamp for end of range
 * - entryNo: Filter by specific entry number
 * - limit: Maximum records to return (default: 10000, max: 100000)
 *
 * Tier Restrictions:
 * - Bronze: JSON only, max 1000 records
 * - Silver: JSON/JSONL/CSV, max 10000 records
 * - Gold: All formats, unlimited records
 */

import { NextResponse } from 'next/server';
import {
  withB2BAuthParams,
  hasPermission,
  createFeatureDeniedResponse,
  type B2BRequest,
} from '@/lib/api-helpers/apiAuth';
import { getOddsHistoryStream, getSnapshotCount } from '@/lib/db/queries';
import {
  createOddsStreamResponse,
  generateOddsFilename,
  type StreamFormat,
} from '@/lib/utils/streamResponse';

export const dynamic = 'force-dynamic';

// Tier-based limits
const TIER_LIMITS = {
  Bronze: 1000,
  Silver: 10000,
  Gold: 100000,
  QuantLab: 500000, // Higher limit for QuantLab tier
};

type RouteParams = { raceId: string };

async function handler(
  request: B2BRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { raceId } = await params;
  const client = request.b2bClient!;

  const url = new URL(request.url);

  // Parse format parameter
  const formatParam = url.searchParams.get('format') ?? 'jsonl';
  const validFormats = ['json', 'jsonl', 'csv'];

  if (!validFormats.includes(formatParam)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: `Invalid format. Valid values: ${validFormats.join(', ')}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  const format = formatParam as StreamFormat;

  // Check tier permissions for CSV
  if (format === 'csv' && !hasPermission(client, 'csv')) {
    return createFeatureDeniedResponse('CSV export', 'Silver');
  }

  // Check tier permissions for streaming (JSONL)
  if (format === 'jsonl' && !hasPermission(client, 'streaming')) {
    return createFeatureDeniedResponse('JSONL streaming', 'Silver');
  }

  // Parse time range parameters
  const startTimeParam = url.searchParams.get('startTime');
  const endTimeParam = url.searchParams.get('endTime');
  const entryNoParam = url.searchParams.get('entryNo');
  const limitParam = url.searchParams.get('limit');

  let startTime: Date | undefined;
  let endTime: Date | undefined;

  if (startTimeParam) {
    startTime = new Date(startTimeParam);
    if (isNaN(startTime.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_START_TIME',
            message: 'Invalid startTime. Use ISO 8601 format (e.g., 2024-12-10T10:00:00Z)',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  }

  if (endTimeParam) {
    endTime = new Date(endTimeParam);
    if (isNaN(endTime.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_END_TIME',
            message: 'Invalid endTime. Use ISO 8601 format (e.g., 2024-12-10T18:00:00Z)',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  }

  const entryNo = entryNoParam ? parseInt(entryNoParam, 10) : undefined;
  if (entryNoParam && (isNaN(entryNo!) || entryNo! < 1)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_ENTRY_NO',
          message: 'Invalid entryNo. Must be a positive integer.',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Calculate limit based on tier
  const tierLimit = TIER_LIMITS[client.tier];
  let limit = limitParam ? parseInt(limitParam, 10) : tierLimit;

  if (isNaN(limit) || limit < 1) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_LIMIT',
          message: 'Invalid limit. Must be a positive integer.',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Cap limit based on tier
  limit = Math.min(limit, tierLimit);

  // Check if race has data
  const snapshotCount = await getSnapshotCount(raceId);
  if (snapshotCount === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NO_DATA',
          message: `No odds data found for race ${raceId}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  // For JSON format, return as regular response (not streaming)
  if (format === 'json') {
    const generator = getOddsHistoryStream(raceId, {
      startTime,
      endTime,
      entryNo,
      limit,
    });

    const records = [];
    for await (const snapshot of generator) {
      records.push({
        timestamp: snapshot.time instanceof Date ? snapshot.time.toISOString() : String(snapshot.time),
        race_id: snapshot.raceId,
        entry_no: snapshot.entryNo,
        odds_win: Number(snapshot.oddsWin),
        odds_place: snapshot.oddsPlace ? Number(snapshot.oddsPlace) : null,
        pool_total: snapshot.poolTotal ? Number(snapshot.poolTotal) : null,
        pool_win: snapshot.poolWin ? Number(snapshot.poolWin) : null,
        pool_place: snapshot.poolPlace ? Number(snapshot.poolPlace) : null,
        popularity_rank: snapshot.popularityRank,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        raceId,
        totalRecords: records.length,
        filters: {
          startTime: startTime?.toISOString() ?? null,
          endTime: endTime?.toISOString() ?? null,
          entryNo: entryNo ?? null,
          limit,
        },
        records,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // For JSONL and CSV, stream the response
  const generator = getOddsHistoryStream(raceId, {
    startTime,
    endTime,
    entryNo,
    limit,
  });

  const filename = generateOddsFilename(raceId, format);

  return createOddsStreamResponse(
    generator,
    { format, includeHeaders: true },
    filename
  );
}

export const GET = withB2BAuthParams<RouteParams>(handler);
