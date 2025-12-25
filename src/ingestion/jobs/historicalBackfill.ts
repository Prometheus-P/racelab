/**
 * Historical Backfill Job
 *
 * 백테스트용 과거 데이터 수집 작업
 * 날짜 범위를 지정하여 일괄로 스케줄/엔트리/배당/결과 데이터 수집
 */

import { db } from '@/lib/db/client';
import { races, oddsSnapshots } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { pollSchedules } from './schedulePoller';
import { pollEntries } from './entryPoller';
import { pollResults } from './resultPoller';
import { fetchKraOdds } from '../clients/kraClient';
import { fetchKspoOdds } from '../clients/kspoClient';
import { mapKraOddsBatch, mapKspoOddsBatch } from '../mappers/oddsMapper';
import type { RaceType, IngestionResult } from '@/types/db';

// =============================================================================
// Types
// =============================================================================

export interface BackfillOptions {
  /** 시작 날짜 (YYYY-MM-DD) */
  dateFrom: string;

  /** 종료 날짜 (YYYY-MM-DD) */
  dateTo: string;

  /** 대상 경주 유형 (기본값: ['horse']) */
  raceTypes?: RaceType[];

  /** 배치당 처리할 일 수 (기본값: 7) */
  batchSize?: number;

  /** API 호출 간 딜레이 (ms) (기본값: 1000) */
  delayMs?: number;

  /** 배치 간 딜레이 (ms) (기본값: 5000) */
  batchDelayMs?: number;

  /** 기존 데이터 스킵 여부 (기본값: true) */
  skipExisting?: boolean;

  /** 배당 데이터 수집 여부 (기본값: false - 히스토리 API 없음) */
  collectOdds?: boolean;
}

export interface BackfillProgress {
  /** 처리할 총 일 수 */
  totalDays: number;

  /** 처리 완료된 일 수 */
  processedDays: number;

  /** 현재 처리 중인 날짜 */
  currentDate: string;

  /** 수집된 경주 수 */
  racesCollected: number;

  /** 수집된 엔트리 수 */
  entriesCollected: number;

  /** 수집된 결과 수 */
  resultsCollected: number;

  /** 에러 수 */
  errors: number;

  /** 스킵된 항목 수 */
  skipped: number;

  /** 시작 시각 */
  startedAt: Date;

  /** 예상 남은 시간 (ms) */
  estimatedRemainingMs?: number;
}

export interface BackfillResult {
  /** 성공 여부 */
  success: boolean;

  /** 최종 진행상황 */
  progress: BackfillProgress;

  /** 에러 메시지 (실패 시) */
  error?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * 날짜 범위를 일별 배열로 변환
 */
function getDateRange(dateFrom: string, dateTo: string): string[] {
  const dates: string[] = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * 지정된 시간만큼 대기
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Race ID 파싱
 */
function parseRaceId(raceId: string): {
  raceType: RaceType;
  trackCode: string;
  raceNo: number;
  date: string;
} | null {
  const parts = raceId.split('-');
  if (parts.length < 4) return null;

  const raceType = parts[0] as RaceType;
  const trackCode = parts[1];
  const raceNo = parseInt(parts[2], 10);
  const dateRaw = parts[3];
  const date = `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`;

  return { raceType, trackCode, raceNo, date };
}

/**
 * 해당 날짜에 데이터가 이미 존재하는지 확인
 */
async function hasDataForDate(date: string, _raceTypes: RaceType[]): Promise<boolean> {
  const result = await db
    .select({ id: races.id })
    .from(races)
    .where(
      and(
        eq(races.raceDate, date),
        eq(races.status, 'finished')
      )
    )
    .limit(1);

  return result.length > 0;
}

// =============================================================================
// Main Backfill Function
// =============================================================================

/**
 * 히스토리 데이터 백필 실행
 *
 * @param options - 백필 옵션
 * @param onProgress - 진행상황 콜백 (선택)
 * @returns 백필 결과
 */
export async function runHistoricalBackfill(
  options: BackfillOptions,
  onProgress?: (progress: BackfillProgress) => void
): Promise<BackfillResult> {
  const {
    dateFrom,
    dateTo,
    raceTypes = ['horse'],
    batchSize = 7,
    delayMs = 1000,
    batchDelayMs = 5000,
    skipExisting = true,
    collectOdds = false,
  } = options;

  // 날짜 범위 생성
  const dates = getDateRange(dateFrom, dateTo);

  // 진행상황 초기화
  const progress: BackfillProgress = {
    totalDays: dates.length,
    processedDays: 0,
    currentDate: dates[0] || '',
    racesCollected: 0,
    entriesCollected: 0,
    resultsCollected: 0,
    errors: 0,
    skipped: 0,
    startedAt: new Date(),
  };

  console.log(`[HistoricalBackfill] Starting backfill from ${dateFrom} to ${dateTo}`);
  console.log(`[HistoricalBackfill] Total days: ${dates.length}, Race types: ${raceTypes.join(', ')}`);

  try {
    // 배치별 처리
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);

      for (const date of batch) {
        progress.currentDate = date;

        // 기존 데이터 확인
        if (skipExisting) {
          const exists = await hasDataForDate(date, raceTypes);
          if (exists) {
            console.log(`[HistoricalBackfill] Skipping ${date} - data already exists`);
            progress.skipped += 1;
            progress.processedDays += 1;
            continue;
          }
        }

        console.log(`[HistoricalBackfill] Processing ${date}...`);

        // 1. 스케줄 수집
        try {
          const scheduleResult = await pollSchedules({ date, raceTypes });
          progress.racesCollected += scheduleResult.collected;
          progress.errors += scheduleResult.errors;
        } catch (error) {
          console.error(`[HistoricalBackfill] Schedule error for ${date}:`, error);
          progress.errors += 1;
        }

        await sleep(delayMs);

        // 2. 해당 날짜의 경주 ID 조회
        const raceList = await db
          .select({ id: races.id })
          .from(races)
          .where(eq(races.raceDate, date));

        const raceIds = raceList.map((r) => r.id);

        // 3. 엔트리 수집
        try {
          const entryResult = await pollEntries({ raceIds });
          progress.entriesCollected += entryResult.collected;
          progress.errors += entryResult.errors;
        } catch (error) {
          console.error(`[HistoricalBackfill] Entry error for ${date}:`, error);
          progress.errors += 1;
        }

        await sleep(delayMs);

        // 4. 결과 수집
        try {
          const resultResult = await pollResults({ raceIds });
          progress.resultsCollected += resultResult.collected;
          progress.errors += resultResult.errors;
        } catch (error) {
          console.error(`[HistoricalBackfill] Result error for ${date}:`, error);
          progress.errors += 1;
        }

        // 5. 배당 데이터 수집 (선택적 - 히스토리 API가 있는 경우에만)
        if (collectOdds) {
          for (const raceId of raceIds) {
            try {
              await collectOddsForRace(raceId);
              await sleep(delayMs / 2); // 배당은 더 빠르게
            } catch (error) {
              console.error(`[HistoricalBackfill] Odds error for ${raceId}:`, error);
              progress.errors += 1;
            }
          }
        }

        progress.processedDays += 1;

        // 진행상황 콜백
        if (onProgress) {
          // 예상 남은 시간 계산
          const elapsed = Date.now() - progress.startedAt.getTime();
          const avgPerDay = elapsed / progress.processedDays;
          progress.estimatedRemainingMs = avgPerDay * (progress.totalDays - progress.processedDays);

          onProgress(progress);
        }

        await sleep(delayMs);
      }

      // 배치 간 딜레이 (rate limit 준수)
      if (i + batchSize < dates.length) {
        console.log(`[HistoricalBackfill] Batch complete, waiting ${batchDelayMs}ms...`);
        await sleep(batchDelayMs);
      }
    }

    console.log(`[HistoricalBackfill] Complete!`);
    console.log(`[HistoricalBackfill] Races: ${progress.racesCollected}, Entries: ${progress.entriesCollected}, Results: ${progress.resultsCollected}`);
    console.log(`[HistoricalBackfill] Errors: ${progress.errors}, Skipped: ${progress.skipped}`);

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error('[HistoricalBackfill] Fatal error:', error);
    return {
      success: false,
      progress,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 단일 경주의 배당 데이터 수집
 * (현재는 실시간 배당만 수집 가능 - 히스토리 데이터 API 없음)
 */
async function collectOddsForRace(raceId: string): Promise<IngestionResult> {
  const result: IngestionResult = {
    collected: 0,
    skipped: 0,
    errors: 0,
  };

  const parsed = parseRaceId(raceId);
  if (!parsed) {
    result.skipped += 1;
    return result;
  }

  const { raceType, trackCode, raceNo, date } = parsed;

  try {
    let items;
    let mappedOdds;
    const timestamp = new Date();

    if (raceType === 'horse') {
      items = await fetchKraOdds(trackCode, raceNo, date);
      mappedOdds = mapKraOddsBatch(items, raceId, timestamp);
    } else {
      items = await fetchKspoOdds(trackCode, raceNo, date, raceType);
      mappedOdds = mapKspoOddsBatch(items, raceId, timestamp);
    }

    if (mappedOdds.length > 0) {
      await db
        .insert(oddsSnapshots)
        .values(mappedOdds)
        .onConflictDoNothing();

      result.collected += mappedOdds.length;
    }
  } catch (error) {
    console.error(`[HistoricalBackfill] Odds fetch error for ${raceId}:`, error);
    result.errors += 1;
  }

  return result;
}

// =============================================================================
// Utility Functions for API Route
// =============================================================================

/**
 * 백필 상태 체크 (DB에 데이터 있는지)
 */
export async function checkBackfillStatus(
  dateFrom: string,
  dateTo: string
): Promise<{
  totalDays: number;
  daysWithData: number;
  coverage: number;
}> {
  const dates = getDateRange(dateFrom, dateTo);
  let daysWithData = 0;

  for (const date of dates) {
    const result = await db
      .select({ id: races.id })
      .from(races)
      .where(
        and(
          eq(races.raceDate, date),
          eq(races.status, 'finished')
        )
      )
      .limit(1);

    if (result.length > 0) {
      daysWithData += 1;
    }
  }

  return {
    totalDays: dates.length,
    daysWithData,
    coverage: dates.length > 0 ? (daysWithData / dates.length) * 100 : 0,
  };
}

/**
 * 최근 N일 빠른 백필 (테스트용)
 */
export async function quickBackfill(days: number = 7): Promise<BackfillResult> {
  const today = new Date();
  const dateTo = new Date(today);
  dateTo.setDate(dateTo.getDate() - 1); // 어제까지

  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - days + 1);

  return runHistoricalBackfill({
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
    raceTypes: ['horse'],
    skipExisting: true,
  });
}
