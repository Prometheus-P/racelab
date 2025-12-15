// src/app/api/races/boat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRacesByDateAndType } from '@/lib/services/raceService';
import { ApiResponse } from '@/lib/utils/apiResponse';
import { Race } from '@/types';
import { getTodayYYYYMMDD } from '@/lib/utils/date';
import { withOptionalApiAuth } from '@/lib/api-helpers/apiAuth';

// Route handlers that read request.url must opt out of static rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function handler(request: NextRequest): Promise<NextResponse<ApiResponse<Race[]>>> {
  try {
    // Parse date from query params, default to today
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const date = dateParam && /^\d{8}$/.test(dateParam) ? dateParam : getTodayYYYYMMDD();

    // Call service
    const races = await getRacesByDateAndType(date, 'boat');

    return NextResponse.json({
      success: true,
      data: races,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching boat races:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch boat races',
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export const GET = withOptionalApiAuth(handler);
