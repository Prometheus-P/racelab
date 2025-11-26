// src/lib/utils/apiResponse.ts
import { NextResponse } from 'next/server';
import { getTodayYYYYMMDD } from './date'; // Import the date utility

// Define the response interface as per API_SPECIFICATION.md
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Generic handler for API requests
export async function handleApiRequest<T>(
  fetchFunction: (date: string) => Promise<T[]>,
  apiName: string
): Promise<NextResponse<ApiResponse<T[]>>> {
  try {
    const rcDate = getTodayYYYYMMDD();

    const data: T[] = await fetchFunction(rcDate);

    const response: ApiResponse<T[]> = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error fetching ${apiName} schedules:`, error);

    const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${apiName} schedules`;
    const errorResponse: ApiResponse<T[]> = {
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
