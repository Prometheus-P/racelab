/**
 * B2B Race Schedules Endpoint
 *
 * GET /api/v1/data/races
 *
 * Returns race schedules for a given date.
 *
 * Query Parameters:
 * - date: Date in YYYYMMDD format (default: today)
 * - type: Race type filter (horse, cycle, boat)
 * - status: Race status filter (upcoming, live, finished, canceled)
 */

import { NextResponse } from 'next/server';
import {
  withB2BAuth,
  type B2BRequest,
} from '@/lib/api-helpers/apiAuth';
import { getRacesByDate } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

/**
 * Format Date to YYYY-MM-DD string
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function handler(request: B2BRequest) {
  const url = new URL(request.url);

  // Parse date parameter
  const dateParam = url.searchParams.get('date');
  let raceDateStr: string;

  if (dateParam) {
    // Validate YYYYMMDD format
    if (!/^\d{8}$/.test(dateParam)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid date format. Use YYYYMMDD (e.g., 20241210)',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Parse and validate the date
    const year = parseInt(dateParam.slice(0, 4), 10);
    const month = parseInt(dateParam.slice(4, 6), 10);
    const day = parseInt(dateParam.slice(6, 8), 10);

    // Check valid month and day ranges
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid date format. Use YYYYMMDD (e.g., 20241210)',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Format to YYYY-MM-DD
    raceDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } else {
    // Default to today
    raceDateStr = formatDateString(new Date());
  }

  // Parse optional filters
  const typeParam = url.searchParams.get('type');
  const statusParam = url.searchParams.get('status');

  const validTypes = ['horse', 'cycle', 'boat'];
  const validStatuses = ['scheduled', 'in_progress', 'finished', 'cancelled'];

  if (typeParam && !validTypes.includes(typeParam)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: `Invalid race type. Valid values: ${validTypes.join(', ')}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  if (statusParam && !validStatuses.includes(statusParam)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  try {
    const races = await getRacesByDate(raceDateStr, {
      raceType: typeParam as 'horse' | 'cycle' | 'boat' | undefined,
      status: statusParam as 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | undefined,
    });

    // Transform to flat format for data analysts
    const flatRaces = races.map((race) => ({
      race_id: race.id,
      race_type: race.raceType,
      track_id: race.trackId,
      race_no: race.raceNo,
      race_date: typeof race.raceDate === 'string' ? race.raceDate : formatDateString(new Date(race.raceDate)),
      start_time: race.startTime,
      distance: race.distance,
      grade: race.grade,
      status: race.status,
      purse: race.purse,
      conditions: race.conditions,
      weather: race.weather,
      track_condition: race.trackCondition,
    }));

    return NextResponse.json({
      success: true,
      data: {
        date: raceDateStr,
        filters: {
          type: typeParam ?? 'all',
          status: statusParam ?? 'all',
        },
        count: flatRaces.length,
        races: flatRaces,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[B2B Races] Failed to fetch races:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve race schedules',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const GET = withB2BAuth(handler);
