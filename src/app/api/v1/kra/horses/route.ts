/**
 * GET /api/v1/kra/horses
 *
 * 마필 목록/랭킹 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchHorseRanking,
  searchHorsesByName,
  fetchHorsesByGrade,
  formatDateParam,
} from '@/lib/api/kra';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const meet = searchParams.get('meet') || undefined;
    const search = searchParams.get('search') || undefined;
    const grade = searchParams.get('grade') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const dateRaw = searchParams.get('date');
    const date = dateRaw ? formatDateParam(dateRaw) : undefined;

    let horses;

    if (search) {
      // 이름 검색
      horses = await searchHorsesByName(search, date);
      horses = horses.slice(0, limit);
    } else if (grade) {
      // 등급별 조회
      horses = await fetchHorsesByGrade(grade, meet, date);
      horses = horses.slice(0, limit);
    } else if (meet) {
      // 특정 경마장 랭킹
      horses = await fetchHorseRanking(meet, limit, date);
    } else {
      // 전체 랭킹
      horses = await fetchHorseRanking(undefined, limit, date);
    }

    return NextResponse.json({
      success: true,
      data: horses,
      meta: {
        total: horses.length,
        meet: meet || 'all',
        search: search || null,
        grade: grade || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/horses] Error:', error);

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
