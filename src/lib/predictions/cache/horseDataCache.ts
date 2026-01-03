/**
 * Horse Data Cache
 *
 * 마필 데이터 캐싱 및 최적화
 * - 마필 기본정보: 장기 캐싱 (24시간)
 * - 경주기록: 중기 캐싱 (1시간)
 * - 적응형 배치 크기 조절
 */

import { getRedisClient } from '@/lib/cache/redisClient';
import type { Horse, HorseRaceRecord } from '@/lib/api/kra/types';

// =============================================================================
// Constants
// =============================================================================

const CACHE_NAMESPACE = 'horse-data';
const CACHE_VERSION = 'v1';

/** 캐시 TTL 설정 (초) */
export const HORSE_CACHE_TTL = {
  /** 마필 기본정보 - 24시간 (거의 변경 안됨) */
  HORSE_INFO: 86400,
  /** 경주기록 - 1시간 (새 경주 결과 반영) */
  RACE_HISTORY: 3600,
  /** 조회 실패 마킹 - 5분 (재시도 방지) */
  FAILED_LOOKUP: 300,
} as const;

/** 배치 크기 설정 */
export const BATCH_CONFIG: {
  DEFAULT_SIZE: number;
  MIN_SIZE: number;
  MAX_SIZE: number;
  SLOW_THRESHOLD_MS: number;
  FAST_THRESHOLD_MS: number;
} = {
  /** 기본 배치 크기 */
  DEFAULT_SIZE: 10,
  /** 최소 배치 크기 */
  MIN_SIZE: 3,
  /** 최대 배치 크기 */
  MAX_SIZE: 20,
  /** 응답 시간 임계값 (ms) - 이상이면 배치 축소 */
  SLOW_THRESHOLD_MS: 2000,
  /** 응답 시간 임계값 (ms) - 이하이면 배치 확대 */
  FAST_THRESHOLD_MS: 500,
};

// =============================================================================
// Types
// =============================================================================

export interface HorseData {
  horse: Horse | null;
  history: HorseRaceRecord[];
}

export interface CachedHorseData extends HorseData {
  cachedAt: string;
  source: 'cache' | 'fresh';
}

export interface BatchMetrics {
  batchSize: number;
  avgResponseTime: number;
  successRate: number;
  totalFetched: number;
  cacheHits: number;
}

// =============================================================================
// In-memory state for adaptive batching
// =============================================================================

let currentBatchSize = BATCH_CONFIG.DEFAULT_SIZE;
let recentResponseTimes: number[] = [];
const MAX_RESPONSE_SAMPLES = 10;

// =============================================================================
// Cache Key Helpers
// =============================================================================

function createHorseInfoKey(horseNo: string): string {
  return `${CACHE_NAMESPACE}:${CACHE_VERSION}:info:${horseNo}`;
}

function createHistoryKey(horseNo: string): string {
  return `${CACHE_NAMESPACE}:${CACHE_VERSION}:history:${horseNo}`;
}

function createFailedKey(horseNo: string): string {
  return `${CACHE_NAMESPACE}:${CACHE_VERSION}:failed:${horseNo}`;
}

// =============================================================================
// Cache Operations
// =============================================================================

/**
 * 마필 기본정보 캐시 조회
 */
export async function getCachedHorseInfo(
  horseNo: string
): Promise<Horse | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const key = createHorseInfoKey(horseNo);
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as Horse;
    }
  } catch (error) {
    console.error(`[HorseCache] Info cache read error for ${horseNo}:`, error);
  }
  return null;
}

/**
 * 마필 기본정보 캐시 저장
 */
export async function cacheHorseInfo(
  horseNo: string,
  horse: Horse
): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    const key = createHorseInfoKey(horseNo);
    await redis.set(key, JSON.stringify(horse), 'EX', HORSE_CACHE_TTL.HORSE_INFO);
  } catch (error) {
    console.error(`[HorseCache] Info cache write error for ${horseNo}:`, error);
  }
}

/**
 * 경주기록 캐시 조회
 */
export async function getCachedHistory(
  horseNo: string
): Promise<HorseRaceRecord[] | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const key = createHistoryKey(horseNo);
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as HorseRaceRecord[];
    }
  } catch (error) {
    console.error(`[HorseCache] History cache read error for ${horseNo}:`, error);
  }
  return null;
}

/**
 * 경주기록 캐시 저장
 */
export async function cacheHistory(
  horseNo: string,
  history: HorseRaceRecord[]
): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    const key = createHistoryKey(horseNo);
    await redis.set(key, JSON.stringify(history), 'EX', HORSE_CACHE_TTL.RACE_HISTORY);
  } catch (error) {
    console.error(`[HorseCache] History cache write error for ${horseNo}:`, error);
  }
}

/**
 * 조회 실패 마킹 확인
 */
export async function isFailedLookup(horseNo: string): Promise<boolean> {
  const redis = await getRedisClient();
  if (!redis) return false;

  try {
    const key = createFailedKey(horseNo);
    const exists = await redis.exists(key);
    return exists === 1;
  } catch {
    return false;
  }
}

/**
 * 조회 실패 마킹 저장
 */
export async function markFailedLookup(horseNo: string): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    const key = createFailedKey(horseNo);
    await redis.set(key, '1', 'EX', HORSE_CACHE_TTL.FAILED_LOOKUP);
  } catch (error) {
    console.error(`[HorseCache] Failed mark error for ${horseNo}:`, error);
  }
}

/**
 * 전체 마필 데이터 캐시 조회
 */
export async function getCachedHorseData(
  horseNo: string
): Promise<CachedHorseData | null> {
  const [horse, history, isFailed] = await Promise.all([
    getCachedHorseInfo(horseNo),
    getCachedHistory(horseNo),
    isFailedLookup(horseNo),
  ]);

  // 실패 마킹된 경우 빈 데이터 반환
  if (isFailed) {
    return {
      horse: null,
      history: [],
      cachedAt: new Date().toISOString(),
      source: 'cache',
    };
  }

  // 기본정보가 있으면 캐시 히트
  if (horse) {
    return {
      horse,
      history: history ?? [],
      cachedAt: new Date().toISOString(),
      source: 'cache',
    };
  }

  return null;
}

/**
 * 전체 마필 데이터 캐시 저장
 */
export async function cacheHorseData(
  horseNo: string,
  data: HorseData
): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (data.horse) {
    tasks.push(cacheHorseInfo(horseNo, data.horse));
  }

  if (data.history.length > 0) {
    tasks.push(cacheHistory(horseNo, data.history));
  }

  // 마필 정보가 없으면 실패 마킹
  if (!data.horse) {
    tasks.push(markFailedLookup(horseNo));
  }

  await Promise.all(tasks);
}

// =============================================================================
// Adaptive Batch Sizing
// =============================================================================

/**
 * 현재 적응형 배치 크기 반환
 */
export function getCurrentBatchSize(): number {
  return currentBatchSize;
}

/**
 * 응답 시간 기반 배치 크기 조정
 */
export function recordResponseTime(responseTimeMs: number): void {
  recentResponseTimes.push(responseTimeMs);

  // 최근 샘플만 유지
  if (recentResponseTimes.length > MAX_RESPONSE_SAMPLES) {
    recentResponseTimes = recentResponseTimes.slice(-MAX_RESPONSE_SAMPLES);
  }

  // 평균 응답 시간 계산
  const avgTime =
    recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length;

  // 배치 크기 조정
  if (avgTime > BATCH_CONFIG.SLOW_THRESHOLD_MS && currentBatchSize > BATCH_CONFIG.MIN_SIZE) {
    currentBatchSize = Math.max(BATCH_CONFIG.MIN_SIZE, currentBatchSize - 2);
    console.log(`[HorseCache] Batch size decreased to ${currentBatchSize} (avg: ${avgTime.toFixed(0)}ms)`);
  } else if (avgTime < BATCH_CONFIG.FAST_THRESHOLD_MS && currentBatchSize < BATCH_CONFIG.MAX_SIZE) {
    currentBatchSize = Math.min(BATCH_CONFIG.MAX_SIZE, currentBatchSize + 1);
    console.log(`[HorseCache] Batch size increased to ${currentBatchSize} (avg: ${avgTime.toFixed(0)}ms)`);
  }
}

/**
 * 배치 크기 리셋
 */
export function resetBatchSize(): void {
  currentBatchSize = BATCH_CONFIG.DEFAULT_SIZE;
  recentResponseTimes = [];
}

// =============================================================================
// Metrics
// =============================================================================

/**
 * 배치 메트릭 조회
 */
export function getBatchMetrics(): BatchMetrics {
  const avgResponseTime =
    recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length
      : 0;

  return {
    batchSize: currentBatchSize,
    avgResponseTime,
    successRate: 1, // TODO: 실제 성공률 추적
    totalFetched: 0,
    cacheHits: 0,
  };
}
