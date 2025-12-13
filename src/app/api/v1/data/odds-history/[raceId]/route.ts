import { NextRequest, NextResponse } from 'next/server';
import { getOddsHistoryStream } from '@/lib/db/queries/odds';
import { OddsSnapshot } from '@/lib/db/schema';

// Helper to create a CSV row
function toCSV(data: OddsSnapshot, header = false): string {
    const columns: (keyof OddsSnapshot)[] = ['id', 'raceId', 'entryNo', 'time', 'oddsWin', 'oddsPlace', 'impeachmentRate', 'isFavorite', 'isScratched'];
    if (header) {
        return columns.join(',') + '\n';
    }
    const row = columns.map(col => {
        const value = data[col];
        if (value instanceof Date) return value.toISOString();
        return value;
    });
    return row.join(',') + '\n';
}

export async function GET(
    req: NextRequest,
    { params }: { params: { raceId: string } }
) {
    const { raceId } = params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json'; // 'json' or 'csv'

    if (!raceId) {
        return new NextResponse('Race ID is required', { status: 400 });
    }

    try {
        const dbStream = await getOddsHistoryStream(raceId);

        const transformStream = new TransformStream({
            start(controller) {
                if (format === 'csv') {
                    // Write CSV header
                    const columns: (keyof OddsSnapshot)[] = ['id', 'raceId', 'entryNo', 'time', 'oddsWin', 'oddsPlace', 'impeachmentRate', 'isFavorite', 'isScratched'];
                    controller.enqueue(columns.join(',') + '\n');
                }
            },
            transform(chunk: OddsSnapshot, controller) {
                if (format === 'csv') {
                    controller.enqueue(toCSV(chunk));
                } else { // Flat JSON (JSONL)
                    controller.enqueue(JSON.stringify(chunk) + '\n');
                }
            },
        });
        
        // Use .pipeThrough for modern stream piping
        const responseStream = dbStream.pipeThrough(transformStream);

        const headers = new Headers();
        if (format === 'csv') {
            headers.set('Content-Type', 'text/csv');
            headers.set('Content-Disposition', `attachment; filename="odds_history_${raceId}.csv"`);
        } else {
            headers.set('Content-Type', 'application/x-ndjson');
            headers.set('Content-Disposition', `attachment; filename="odds_history_${raceId}.jsonl"`);
        }

        return new NextResponse(responseStream, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error(`Failed to stream odds history for race ${raceId}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
