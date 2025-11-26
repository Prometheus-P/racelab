// src/app/api/races/[type]/[id]/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchRaceResults } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/errors';

export async function GET(
    _request: NextRequest,
    { params }: { params: { type: string; id: string } }
) {
    try {
        const results = await fetchRaceResults(params.id);

        if (results === null) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Race not found',
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: results,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error fetching race results:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: getErrorMessage(error),
                },
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
