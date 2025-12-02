// src/app/api/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchHistoricalResults } from '@/lib/api';
import { RaceType, PaginatedResults, HistoricalRace } from '@/types';
import { ApiResponse } from '@/lib/utils/apiResponse';
import { getTodayYYYYMMDD } from '@/lib/utils/date';

// Route handlers that read request.url must opt out of static rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const SUCCESS_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=60';
const ERROR_CACHE_CONTROL = 'no-store';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedResults<HistoricalRace>>>> {
  try {
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const dateFrom = searchParams.get('dateFrom') || getTodayYYYYMMDD();
    const dateTo = searchParams.get('dateTo') || getTodayYYYYMMDD();
    const typesParam = searchParams.get('types');
    const track = searchParams.get('track') || undefined;
    const jockey = searchParams.get('jockey') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!Number.isFinite(page) || page < 1 || !Number.isFinite(limit) || limit < 1 || limit > 100) {
      const errorResponse: ApiResponse<PaginatedResults<HistoricalRace>> = {
        success: false,
        error: {
          code: 'INVALID_PAGINATION',
          message: 'page must be >= 1 and limit must be between 1 and 100',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Cache-Control': ERROR_CACHE_CONTROL,
        },
      });
    }

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
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Cache-Control': ERROR_CACHE_CONTROL,
        },
      });
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

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': SUCCESS_CACHE_CONTROL,
      },
    });
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

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Cache-Control': ERROR_CACHE_CONTROL,
      },
    });
  }
}
