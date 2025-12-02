// src/app/api/results/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchHistoricalResultById } from '@/lib/api';
import { HistoricalRace } from '@/types';
import { ApiResponse } from '@/lib/utils/apiResponse';

// ISR: Revalidate every 24 hours for individual historical results
export const revalidate = 86400;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<HistoricalRace>>> {
  try {
    const { id } = await params;

    // Validate ID is provided
    if (!id || id.trim() === '') {
      const errorResponse: ApiResponse<HistoricalRace> = {
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Race ID is required',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch the historical result by ID
    const data = await fetchHistoricalResultById(id);

    if (!data) {
      const errorResponse: ApiResponse<HistoricalRace> = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Race with ID '${id}' not found`,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse<HistoricalRace> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching historical result:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch historical result';
    const errorResponse: ApiResponse<HistoricalRace> = {
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
