/**
 * GET /api/v1/kra/jockeys
 *
 * 기수 목록/랭킹 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchJockeyRanking,
  searchJockeysByName,
  formatDateParam,
} from '@/lib/api/kra';

// Valid meet codes: 1=서울, 2=제주, 3=부산/부경
const VALID_MEET_CODES = ['1', '2', '3'];
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_LENGTH = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/**
 * Validate and sanitize query parameters
 */
function validateParams(searchParams: URLSearchParams): {
  valid: boolean;
  error?: string;
  params: { meet?: string; search?: string; limit: number; date?: string };
} {
  const meet = searchParams.get('meet') || undefined;
  const search = searchParams.get('search') || undefined;
  const limitRaw = searchParams.get('limit');
  const dateRaw = searchParams.get('date');

  // Validate meet code
  if (meet && !VALID_MEET_CODES.includes(meet)) {
    return {
      valid: false,
      error: `Invalid meet code: ${meet}. Valid values: 1 (서울), 2 (제주), 3 (부산/부경)`,
      params: { limit: DEFAULT_LIMIT },
    };
  }

  // Validate search parameter
  if (search) {
    if (search.length < MIN_SEARCH_LENGTH) {
      return {
        valid: false,
        error: `Search term must be at least ${MIN_SEARCH_LENGTH} characters`,
        params: { limit: DEFAULT_LIMIT },
      };
    }
    if (search.length > MAX_SEARCH_LENGTH) {
      return {
        valid: false,
        error: `Search term must not exceed ${MAX_SEARCH_LENGTH} characters`,
        params: { limit: DEFAULT_LIMIT },
      };
    }
    // Prevent SQL injection patterns (basic sanitization)
    if (/[<>'"`;\\]/.test(search)) {
      return {
        valid: false,
        error: 'Search term contains invalid characters',
        params: { limit: DEFAULT_LIMIT },
      };
    }
  }

  // Validate limit
  let limit = DEFAULT_LIMIT;
  if (limitRaw) {
    const parsed = parseInt(limitRaw, 10);
    if (isNaN(parsed) || parsed < MIN_LIMIT || parsed > MAX_LIMIT) {
      return {
        valid: false,
        error: `Limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`,
        params: { limit: DEFAULT_LIMIT },
      };
    }
    limit = parsed;
  }

  // Validate date format (YYYYMMDD or YYYY-MM-DD)
  let date: string | undefined;
  if (dateRaw) {
    const datePattern = /^\d{4}(-?\d{2}){2}$/;
    if (!datePattern.test(dateRaw)) {
      return {
        valid: false,
        error: 'Invalid date format. Use YYYYMMDD or YYYY-MM-DD',
        params: { limit: DEFAULT_LIMIT },
      };
    }
    date = formatDateParam(dateRaw);
  }

  return {
    valid: true,
    params: { meet, search, limit, date },
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

    const { meet, search, limit, date } = validation.params;

    let jockeys;

    if (search) {
      // 이름 검색
      jockeys = await searchJockeysByName(search, date);
      jockeys = jockeys.slice(0, limit);
    } else if (meet) {
      // 특정 경마장 랭킹
      jockeys = await fetchJockeyRanking(meet, limit, date);
    } else {
      // 전체 랭킹
      jockeys = await fetchJockeyRanking(undefined, limit, date);
    }

    return NextResponse.json({
      success: true,
      data: jockeys,
      meta: {
        total: jockeys.length,
        meet: meet || 'all',
        search: search || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/jockeys] Error:', error);

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
