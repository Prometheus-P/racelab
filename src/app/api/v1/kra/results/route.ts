/**
 * GET /api/v1/kra/results
 *
 * 경주결과 조회 API
 * - 기본: API299 (경주결과종합) 사용
 * - mode=ai: API156 (AI학습용) 사용
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  // API299 (일반 사용자용)
  fetchRaceResultTotal,
  fetchRaceResultTotalSummary,
  // API156 (AI학습용)
  fetchRaceResultAI,
  fetchRaceResultAISummary,
  formatDateParam,
  getTodayDate,
} from '@/lib/api/kra';

// Valid meet codes: 1=서울, 2=제주, 3=부산/부경
const VALID_MEET_CODES = ['1', '2', '3'];
const VALID_MODES = ['default', 'ai'];

/**
 * Validate and sanitize query parameters
 */
function validateParams(searchParams: URLSearchParams): {
  valid: boolean;
  error?: string;
  params: { meet?: string; date?: string; grouped?: boolean; mode: 'default' | 'ai' };
} {
  const meet = searchParams.get('meet') || undefined;
  const dateRaw = searchParams.get('date');
  const grouped = searchParams.get('grouped') === 'true';
  const modeRaw = searchParams.get('mode') || 'default';

  // Validate meet code
  if (meet && !VALID_MEET_CODES.includes(meet)) {
    return {
      valid: false,
      error: `Invalid meet code: ${meet}. Valid values: 1 (서울), 2 (제주), 3 (부산/부경)`,
      params: { mode: 'default' },
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
        params: { mode: 'default' },
      };
    }
    date = formatDateParam(dateRaw);
  }

  // Validate mode
  const mode = VALID_MODES.includes(modeRaw) ? (modeRaw as 'default' | 'ai') : 'default';

  return {
    valid: true,
    params: { meet, date, grouped, mode },
  };
}

/**
 * Check if the date is today (for cache headers)
 */
function isToday(date?: string): boolean {
  const target = date || getTodayDate();
  return target === getTodayDate();
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

    const { meet, date, grouped, mode } = validation.params;

    // 실시간 vs 과거 결과 구분 (캐시 전략용)
    const isLive = isToday(date);

    let responseData;
    let total = 0;

    if (mode === 'ai') {
      // AI 학습용 API156 사용
      if (grouped) {
        const summaries = await fetchRaceResultAISummary(date, meet);
        responseData = summaries;
        total = summaries.length;
      } else if (meet) {
        const results = await fetchRaceResultAI(meet, date);
        responseData = results;
        total = results.length;
      } else {
        const summaries = await fetchRaceResultAISummary(date);
        responseData = summaries.flatMap((s) => s.entries);
        total = responseData.length;
      }
    } else {
      // 기본: API299 사용
      if (grouped) {
        const summaries = await fetchRaceResultTotalSummary(date, meet);
        responseData = summaries;
        total = summaries.length;
      } else if (meet) {
        const results = await fetchRaceResultTotal(meet, date);
        responseData = results;
        total = results.length;
      } else {
        const summaries = await fetchRaceResultTotalSummary(date);
        responseData = summaries.flatMap((s) => s.entries);
        total = responseData.length;
      }
    }

    const response = NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        total,
        meet: meet || 'all',
        date: date || 'today',
        grouped: grouped || false,
        mode,
        isLive,
      },
      timestamp: new Date().toISOString(),
    });

    // 캐시 헤더 설정
    // - 실시간 결과: 캐시하지 않음
    // - 과거 결과: 1시간 캐싱
    if (!isLive) {
      response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    } else {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    return response;
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
