// src/app/api/races/[type]/[id]/entries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchRaceEntries } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils/errors';

export async function GET(
    _request: NextRequest,
    { params }: { params: { type: string; id: string } }
) {
    try {
        const entries = await fetchRaceEntries(params.id);

        if (entries === null) {
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
                data: entries,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Error fetching race entries:', error);

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
