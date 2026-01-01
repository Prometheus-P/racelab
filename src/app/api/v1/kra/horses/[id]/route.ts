/**
 * GET /api/v1/kra/horses/[id]
 *
 * 마필 상세정보 및 경주기록 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchHorseDetail, formatDateParam } from '@/lib/api/kra';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const meet = searchParams.get('meet') || undefined;
    const dateRaw = searchParams.get('date');
    const date = dateRaw ? formatDateParam(dateRaw) : undefined;

    const { horse, history } = await fetchHorseDetail(id, meet, date);

    if (!horse) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Horse not found: ${id}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...horse,
        raceHistory: history,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/horses/[id]] Error:', error);

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
