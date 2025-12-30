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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const meet = searchParams.get('meet') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const dateRaw = searchParams.get('date');
    const date = dateRaw ? formatDateParam(dateRaw) : undefined;

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
