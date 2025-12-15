// src/app/api/races/[type]/[id]/entries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRaceDetail } from '@/lib/services/raceService';
import { getErrorMessage } from '@/lib/utils/errors';
import { ApiResponse } from '@/lib/utils/apiResponse';
import { Entry } from '@/types';
import { withApiAuthParams } from '@/lib/api-helpers/apiAuth';

// ISR: Revalidate every 60 seconds for entries
export const revalidate = 60;

type Params = { type: string; id: string };

async function handler(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse<ApiResponse<Entry[]>>> {
  try {
    const { id } = await params;

    // Call service to get race detail bundle
    const raceDetail = await getRaceDetail(id);

    if (!raceDetail) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Race not found',
        },
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: raceDetail.entries,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error fetching race entries:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: getErrorMessage(error),
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export const GET = withApiAuthParams<Params>(handler);
