import { NextRequest, NextResponse } from 'next/server';
import { and, lte, ne } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { races } from '@/lib/db/schema';
import { pollResults } from '@/ingestion/jobs/resultPoller';
import { enforceCronSecret } from '../../utils/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authResponse = enforceCronSecret(request);
  if (authResponse) return authResponse;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentTime = now.toISOString().slice(11, 19); // HH:MM:SS

  try {
    const candidateRaces = await db
      .select({ id: races.id, startTime: races.startTime })
      .from(races)
      .where(and(lte(races.raceDate, todayStr), ne(races.status, 'finished')));

    const readyRaceIds = candidateRaces
      .filter((race) => {
        if (!race.startTime) return true;
        return race.startTime <= currentTime;
      })
      .map((race) => race.id);

    if (readyRaceIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: { racesChecked: candidateRaces.length, racesProcessed: 0 },
          timestamp: now.toISOString(),
        },
        { status: 200 }
      );
    }

    console.log(`[Cron/Results] Collecting results for ${readyRaceIds.length} races`);
    const result = await pollResults({ raceIds: readyRaceIds });

    return NextResponse.json(
      {
        success: true,
        data: {
          racesChecked: candidateRaces.length,
          racesProcessed: readyRaceIds.length,
          collected: result.collected,
          skipped: result.skipped,
          errors: result.errors,
        },
        timestamp: now.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron/Results] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CRON_ERROR',
          message: error instanceof Error ? error.message : 'Failed to collect results',
        },
        timestamp: now.toISOString(),
      },
      { status: 500 }
    );
  }
}
