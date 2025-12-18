// src/app/api/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaginatedResults, HistoricalRace, RaceType } from '@/types';
import {
  buildResultsResponse,
  normalizeResultsQuery,
  getResultsDefaultRange,
  type ResultsApiResponse,
} from '@/lib/services/resultsService';
import { SUCCESS_CACHE_CONTROL, ERROR_CACHE_CONTROL } from '@/lib/constants/cacheControl';

// Route handlers that read request.url must opt out of static rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
  request: NextRequest
): Promise<NextResponse<ResultsApiResponse<PaginatedResults<HistoricalRace>>>> {
  try {
    const { searchParams } = request.nextUrl;
    const typesParam = searchParams.get('types');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const types = typesParam
      ?.split(',')
      .map((type) => type.trim())
      .filter((type): type is RaceType => ['horse', 'cycle', 'boat'].includes(type as RaceType));

    const normalized = normalizeResultsQuery({
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      types: types?.length ? types : undefined,
      track: searchParams.get('track') || undefined,
      jockey: searchParams.get('jockey') || undefined,
      page: pageParam ? Number(pageParam) : undefined,
      limit: limitParam ? Number(limitParam) : undefined,
    });

    if (!normalized.ok) {
      const defaults = getResultsDefaultRange();
      const errorResponse: ResultsApiResponse<PaginatedResults<HistoricalRace>> = {
        ok: false,
        error: normalized.error,
        meta: {
          cacheHit: false,
          generatedAt: new Date().toISOString(),
          source: 'snapshot',
          queryNormalized: {
            dateFrom: defaults.dateFrom,
            dateTo: defaults.dateTo,
            page: 1,
            limit: 20,
          },
        },
      };

      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          'Cache-Control': ERROR_CACHE_CONTROL,
        },
      });
    }

    const response = await buildResultsResponse(normalized.query);

    return NextResponse.json(response, {
      status: response.ok ? 200 : 500,
      headers: {
        'Cache-Control': response.ok ? SUCCESS_CACHE_CONTROL : ERROR_CACHE_CONTROL,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching historical results:', error);

    const defaults = getResultsDefaultRange();
    const errorResponse: ResultsApiResponse<PaginatedResults<HistoricalRace>> = {
      ok: false,
      error: {
        code: 'DB_FAIL',
        message: error instanceof Error ? error.message : 'Failed to fetch historical results',
      },
      meta: {
        cacheHit: false,
        generatedAt: new Date().toISOString(),
        source: 'snapshot',
        queryNormalized: {
          dateFrom: defaults.dateFrom,
          dateTo: defaults.dateTo,
          page: 1,
          limit: 20,
        },
      },
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Cache-Control': ERROR_CACHE_CONTROL,
      },
    });
  }
}
