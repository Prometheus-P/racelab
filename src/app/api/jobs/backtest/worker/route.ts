/**
 * Backtest Worker Handler
 *
 * POST /api/jobs/backtest/worker
 *
 * Processes backtest jobs from QStash queue.
 * This endpoint receives webhook calls from Upstash QStash.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import {
  getJob,
  updateJobStatus,
  updateJobProgress,
  failJob,
  saveResult,
  deleteCheckpoint,
} from '@/lib/backtest/jobManager';
import { BacktestExecutor, MockRaceDataSource, type RaceDataSource } from '@/lib/backtest/executor';
import { PostgresDataSource, checkDatabaseHasData } from '@/lib/backtest/datasource';
import { enhanceSummary } from '@/lib/backtest/metrics';
import type { QStashBacktestPayload, JobError } from '@/lib/backtest/types';
import type { BacktestResult } from '@/lib/strategy/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro limit

// QStash signature verification
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

/**
 * POST handler for QStash webhook
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // 1. Verify QStash signature (skip in development)
  if (process.env.NODE_ENV === 'production') {
    const signature = request.headers.get('upstash-signature');
    const body = await request.text();

    if (!signature) {
      console.error('[Worker] Missing QStash signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    try {
      const isValid = await receiver.verify({
        signature,
        body,
      });

      if (!isValid) {
        console.error('[Worker] Invalid QStash signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }

      // Parse body after verification
      const payload = JSON.parse(body) as QStashBacktestPayload;
      return processJob(payload, startTime);
    } catch (error) {
      console.error('[Worker] Signature verification failed:', error);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }
  } else {
    // Development mode - skip signature verification
    try {
      const payload = (await request.json()) as QStashBacktestPayload;
      return processJob(payload, startTime);
    } catch (error) {
      console.error('[Worker] Failed to parse payload:', error);
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }
  }
}

/**
 * Process the backtest job
 */
async function processJob(payload: QStashBacktestPayload, startTime: number) {
  const { jobId, clientId, request: backtestRequest } = payload;

  console.log(`[Worker] Processing job ${jobId} for client ${clientId}`);

  // 2. Get job from KV
  const job = await getJob(jobId);

  if (!job) {
    console.error(`[Worker] Job not found: ${jobId}`);
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  // 3. Check if job is already completed or cancelled
  if (job.status === 'completed' || job.status === 'cancelled') {
    console.log(`[Worker] Job ${jobId} already ${job.status}, skipping`);
    return NextResponse.json({
      message: `Job already ${job.status}`,
      jobId,
    });
  }

  // 4. Mark job as running
  await updateJobStatus(jobId, 'running', {
    progressMessage: 'Starting backtest execution',
  });

  try {
    // 5. Create data source
    // Use PostgresDataSource if DB has data, otherwise fallback to MockRaceDataSource
    const dataSource = await createDataSource(backtestRequest.dateRange);

    // 6. Create executor with progress callback
    let lastProgressUpdate = 0;
    let lastProcessed = 0;
    let lastTotal = 0;

    const executor = new BacktestExecutor(
      backtestRequest,
      dataSource,
      {
        initialCapital: backtestRequest.initialCapital,
        defaultBetAmount: backtestRequest.strategy.stake?.fixed,
        onProgress: async (progress: number, message: string) => {
          // Rate limit progress updates
          const now = Date.now();
          if (now - lastProgressUpdate > 2000 || progress === 100) { // Every 2 seconds
            lastProgressUpdate = now;
            await updateJobProgress(
              jobId,
              progress,
              message,
              lastProcessed,
              lastTotal
            );
          }
        },
      }
    );

    // 7. Execute backtest
    console.log(`[Worker] Starting backtest for ${backtestRequest.dateRange.from} to ${backtestRequest.dateRange.to}`);
    const result = await executor.execute(backtestRequest);
    lastProcessed = result.summary.totalRaces;
    lastTotal = result.summary.totalRaces;

    // 8. Enhance summary with additional metrics
    const enhancedSummary = enhanceSummary(result.summary, result.bets, result.equityCurve);
    const finalResult: BacktestResult = {
      ...result,
      summary: {
        ...result.summary,
        ...enhancedSummary,
      },
    };

    // 9. Save result
    await saveResult(jobId, clientId, finalResult);

    // 10. Mark job as completed
    const executionTimeMs = Date.now() - startTime;
    await updateJobStatus(jobId, 'completed', {
      progress: 100,
      progressMessage: 'Backtest completed successfully',
      executionTimeMs,
      processedRaces: result.summary.totalRaces,
      totalRaces: result.summary.totalRaces,
    });

    // 11. Clean up checkpoint if exists
    await deleteCheckpoint(jobId);

    console.log(`[Worker] Job ${jobId} completed in ${executionTimeMs}ms`);
    console.log(`[Worker] Results: ${result.summary.totalBets} bets, ${result.summary.winRate.toFixed(1)}% win rate, ${result.summary.roi.toFixed(2)}% ROI`);

    return NextResponse.json({
      success: true,
      jobId,
      summary: {
        totalBets: result.summary.totalBets,
        winRate: result.summary.winRate,
        roi: result.summary.roi,
        totalProfit: result.summary.totalProfit,
      },
      executionTimeMs,
    });
  } catch (error) {
    console.error(`[Worker] Job ${jobId} failed:`, error);

    const jobError: JobError = {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined,
      retryable: isRetryableError(error),
    };

    await failJob(jobId, jobError);

    // Return 500 to trigger QStash retry (if retryable)
    if (jobError.retryable) {
      return NextResponse.json(
        { error: jobError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: jobError.message,
        code: jobError.code,
      },
      { status: 200 } // Don't retry non-retryable errors
    );
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors, timeouts are retryable
    if (
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('timeout')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Create appropriate data source based on database availability
 * Uses PostgresDataSource if DB has finished race data,
 * otherwise falls back to MockRaceDataSource for testing
 */
async function createDataSource(
  dateRange: { from: string; to: string }
): Promise<RaceDataSource> {
  try {
    const hasData = await checkDatabaseHasData();

    if (hasData) {
      console.log('[Worker] Using PostgresDataSource - DB has data');
      return new PostgresDataSource();
    }

    console.log('[Worker] Using MockRaceDataSource - DB empty, generating mock data');
    const mockDataSource = new MockRaceDataSource();
    await generateMockData(mockDataSource, dateRange);
    return mockDataSource;
  } catch (error) {
    console.warn('[Worker] DB check failed, falling back to MockRaceDataSource:', error);
    const mockDataSource = new MockRaceDataSource();
    await generateMockData(mockDataSource, dateRange);
    return mockDataSource;
  }
}

/**
 * Mock entry type for generating test data
 */
interface MockEntry {
  raceId: string;
  entryNo: number;
  odds_win: number;
  odds_place: number;
  odds_drift_pct: number;
  odds_stddev: number;
  popularity_rank: number;
  pool_total: number;
  pool_win_pct: number;
  oddsTimeline: Array<{ time: Date; odds_win: number }>;
  // 확장 필드 지원
  [key: string]: unknown;
}

/**
 * Generate mock race data for testing
 * In production, this would be replaced with actual database queries
 */
async function generateMockData(
  dataSource: MockRaceDataSource,
  dateRange: { from: string; to: string }
): Promise<void> {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

  // Generate mock races
  for (let d = 0; d <= days; d++) {
    const date = new Date(from);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    // Skip weekdays (Korean racing is mainly weekends)
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) continue;

    // Generate 8-12 races per day
    const raceCount = 8 + Math.floor(Math.random() * 5);
    const tracks = ['seoul', 'busan', 'jeju'];
    const track = tracks[Math.floor(Math.random() * tracks.length)];

    for (let r = 1; r <= raceCount; r++) {
      const raceId = `horse-${track}-${r}-${dateStr.replace(/-/g, '')}`;
      const entryCount = 8 + Math.floor(Math.random() * 8); // 8-15 entries

      // Generate entries with odds
      const entries: MockEntry[] = [];
      const totalPool = 50000000 + Math.random() * 100000000;

      for (let e = 1; e <= entryCount; e++) {
        // Generate realistic odds distribution
        const baseOdds = 1.5 + Math.random() * 50;
        const firstOdds = baseOdds * (0.8 + Math.random() * 0.4);
        const lastOdds = baseOdds;
        const oddsDriftPct = ((lastOdds - firstOdds) / firstOdds) * 100;

        entries.push({
          raceId,
          entryNo: e,
          odds_win: lastOdds,
          odds_place: lastOdds * 0.4,
          odds_drift_pct: oddsDriftPct,
          odds_stddev: Math.random() * 2,
          popularity_rank: e, // Will be sorted later
          pool_total: totalPool,
          pool_win_pct: 100 / entryCount + (Math.random() - 0.5) * 10,
          oddsTimeline: [
            { time: new Date(`${dateStr}T10:00:00Z`), odds_win: firstOdds },
            { time: new Date(`${dateStr}T11:00:00Z`), odds_win: (firstOdds + lastOdds) / 2 },
            { time: new Date(`${dateStr}T12:00:00Z`), odds_win: lastOdds },
          ],
        });
      }

      // Sort by odds and assign popularity rank
      entries.sort((a, b) => a.odds_win - b.odds_win);
      entries.forEach((entry, idx) => {
        entry.popularity_rank = idx + 1;
      });

      const raceContext = {
        raceId,
        raceDate: dateStr,
        raceNo: r,
        track,
        raceType: 'horse' as const,
        entries,
      };

      // Determine winner (biased toward lower odds horses)
      const winnerIndex = Math.min(
        Math.floor(Math.random() * Math.random() * entryCount),
        entryCount - 1
      );
      const winner = entries[winnerIndex];

      // Generate random places (2nd and 3rd)
      const otherEntries = entries.filter((_, i) => i !== winnerIndex);
      const shuffled = otherEntries.sort(() => Math.random() - 0.5);
      const places = [winner.entryNo, shuffled[0].entryNo, shuffled[1].entryNo];

      // Create finish positions map
      const finishPositions = new Map<number, number>();
      places.forEach((entryNo, idx) => {
        finishPositions.set(entryNo, idx + 1);
      });

      // Create dividends maps
      const winDividends = new Map<number, number>();
      winDividends.set(winner.entryNo, Math.round(winner.odds_win * 100) / 100);

      const placeDividends = new Map<number, number>();
      places.slice(0, 3).forEach((no) => {
        const entry = entries.find((e) => e.entryNo === no)!;
        placeDividends.set(no, Math.round(entry.odds_place * 100) / 100);
      });

      const result = {
        raceId,
        finishPositions,
        dividends: {
          win: winDividends,
          place: placeDividends,
        },
      };

      dataSource.addRace(raceContext, result);
    }
  }
}
