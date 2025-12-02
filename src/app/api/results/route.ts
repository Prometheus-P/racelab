// src/app/api/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchHistoricalResults } from '@/lib/api';
import { RaceType, PaginatedResults, HistoricalRace } from '@/types';
import { ApiResponse } from '@/lib/utils/apiResponse';
import { getTodayYYYYMMDD } from '@/lib/utils/date';

// ISR: Revalidate every 5 minutes for historical results
export const revalidate = 300;

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedResults<HistoricalRace>>>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const dateFrom = searchParams.get('dateFrom') || getTodayYYYYMMDD();
    const dateTo = searchParams.get('dateTo') || getTodayYYYYMMDD();
    const typesParam = searchParams.get('types');
    const track = searchParams.get('track') || undefined;
    const jockey = searchParams.get('jockey') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Parse types array from comma-separated string
    const types: RaceType[] | undefined = typesParam
      ? (typesParam.split(',').filter(t => ['horse', 'cycle', 'boat'].includes(t)) as RaceType[])
      : undefined;

    // Validate date range
    if (dateFrom > dateTo) {
      const errorResponse: ApiResponse<PaginatedResults<HistoricalRace>> = {
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'dateFrom must be before or equal to dateTo',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch historical results with filters
    const data = await fetchHistoricalResults({
      dateFrom,
      dateTo,
      types,
      track,
      jockey,
      page,
      limit,
    });

    const response: ApiResponse<PaginatedResults<HistoricalRace>> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching historical results:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch historical results';
    const errorResponse: ApiResponse<PaginatedResults<HistoricalRace>> = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: errorMessage,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
