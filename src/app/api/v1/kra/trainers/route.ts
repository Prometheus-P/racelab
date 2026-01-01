/**
 * GET /api/v1/kra/trainers
 *
 * 조교사 목록/랭킹 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchTrainerRanking,
  searchTrainersByName,
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

    let trainers;

    if (search) {
      // 이름 검색
      trainers = await searchTrainersByName(search, date);
      trainers = trainers.slice(0, limit);
    } else if (meet) {
      // 특정 경마장 랭킹
      trainers = await fetchTrainerRanking(meet, limit, date);
    } else {
      // 전체 랭킹
      trainers = await fetchTrainerRanking(undefined, limit, date);
    }

    return NextResponse.json({
      success: true,
      data: trainers,
      meta: {
        total: trainers.length,
        meet: meet || 'all',
        search: search || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/trainers] Error:', error);

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
