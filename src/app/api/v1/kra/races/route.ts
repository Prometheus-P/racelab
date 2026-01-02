/**
 * GET /api/v1/kra/races
 *
 * 경주정보 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRaceInfo,
  fetchRaceSchedule,
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

    // grouped=true인 경우 경마장/일자별 그룹화된 일정 반환
    if (grouped) {
      const schedules = await fetchRaceSchedule(date);

      // meet 필터 적용
      const filteredSchedules = meet
        ? schedules.filter((s) => s.meet === meet)
        : schedules;

      return NextResponse.json({
        success: true,
        data: filteredSchedules,
        meta: {
          total: filteredSchedules.length,
          meet: meet || 'all',
          date: date || 'today',
          grouped: true,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 특정 경마장 또는 전체 경주 목록
    let races;
    if (meet) {
      races = await fetchRaceInfo(meet, date);
    } else {
      const schedules = await fetchRaceSchedule(date);
      races = schedules.flatMap((s) => s.races);
    }

    return NextResponse.json({
      success: true,
      data: races,
      meta: {
        total: races.length,
        meet: meet || 'all',
        date: date || 'today',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/races] Error:', error);

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
