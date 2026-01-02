/**
 * GET /api/v1/kra/odds
 *
 * 확정배당률 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchOdds,
  fetchAllOdds,
  formatDateParam,
} from '@/lib/api/kra';

// Valid meet codes: 1=서울, 2=제주, 3=부산/부경
const VALID_MEET_CODES = ['1', '2', '3'];

/**
 * Validate and sanitize query parameters
 */
function validateParams(searchParams: URLSearchParams): {
  valid: boolean;
  error?: string;
  params: { meet?: string; date?: string };
} {
  const meet = searchParams.get('meet') || undefined;
  const dateRaw = searchParams.get('date');

  // Validate meet code
  if (meet && !VALID_MEET_CODES.includes(meet)) {
    return {
      valid: false,
      error: `Invalid meet code: ${meet}. Valid values: 1 (서울), 2 (제주), 3 (부산/부경)`,
      params: {},
    };
  }

  // Validate date format (YYYYMMDD or YYYY-MM-DD)
  let date: string | undefined;
  if (dateRaw) {
    const datePattern = /^\d{4}(-?\d{2}){2}$/;
    if (!datePattern.test(dateRaw)) {
      return {
        valid: false,
        error: 'Invalid date format. Use YYYYMMDD or YYYY-MM-DD',
        params: {},
      };
    }
    date = formatDateParam(dateRaw);
  }

  return {
    valid: true,
    params: { meet, date },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateParams(searchParams);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: validation.error,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { meet, date } = validation.params;

    let odds;

    if (meet) {
      // 특정 경마장 배당률
      odds = await fetchOdds(meet, date);
    } else {
      // 전체 경마장 배당률
      odds = await fetchAllOdds(date);
    }

    return NextResponse.json({
      success: true,
      data: odds,
      meta: {
        total: odds.length,
        meet: meet || 'all',
        date: date || 'today',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/odds] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
