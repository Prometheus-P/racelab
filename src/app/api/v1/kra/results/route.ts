/**
 * GET /api/v1/kra/results
 *
 * AI학습용 경주결과 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRaceResultAI,
  fetchRaceResultAISummary,
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
  params: { meet?: string; date?: string; grouped?: boolean };
} {
  const meet = searchParams.get('meet') || undefined;
  const dateRaw = searchParams.get('date');
  const grouped = searchParams.get('grouped') === 'true';

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
    params: { meet, date, grouped },
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

    const { meet, date, grouped } = validation.params;

    // grouped=true인 경우 경주별 그룹화된 결과 반환
    if (grouped) {
      const summaries = await fetchRaceResultAISummary(date, meet);

      return NextResponse.json({
        success: true,
        data: summaries,
        meta: {
          total: summaries.length,
          meet: meet || 'all',
          date: date || 'today',
          grouped: true,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 특정 경마장 또는 전체 경주결과 목록
    let results;
    if (meet) {
      results = await fetchRaceResultAI(meet, date);
    } else {
      const summaries = await fetchRaceResultAISummary(date);
      results = summaries.flatMap((s) => s.entries);
    }

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        meet: meet || 'all',
        date: date || 'today',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/results] Error:', error);

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
