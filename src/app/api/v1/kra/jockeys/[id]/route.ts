/**
 * GET /api/v1/kra/jockeys/[id]
 *
 * 기수 상세정보 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchJockeyInfo, formatDateParam } from '@/lib/api/kra';

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

    const jockey = await fetchJockeyInfo(id, meet, date);

    if (!jockey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Jockey not found: ${id}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jockey,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[/api/v1/kra/jockeys/[id]] Error:', error);

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
