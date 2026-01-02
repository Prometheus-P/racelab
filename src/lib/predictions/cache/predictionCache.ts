/**
 * Prediction Cache
 *
 * Redis 기반 예측 결과 캐싱
 * - 경주별 예측 결과 캐싱
 * - TTL 기반 자동 만료
 * - Single-flight 패턴으로 중복 계산 방지
 */

import { getRedisClient } from '@/lib/cache/redisClient';
import {
  singleFlight,
  createCacheKey,
  recordCacheHit,
  recordCacheMiss,
} from '@/lib/cache/cacheUtils';
import type { RacePrediction } from '@/types/prediction';

// =============================================================================
// Constants
// =============================================================================

const CACHE_NAMESPACE = 'predictions';
const CACHE_VERSION = 'v1';

/** 캐시 TTL 설정 (초) */
export const PREDICTION_CACHE_TTL = {
  /** 경주 전 예측 - 5분 */
  PRE_RACE: 300,
  /** 경주 중 예측 (배당률 변동 반영) - 1분 */
  LIVE: 60,
  /** 경주 후 예측 (확정) - 24시간 */
  POST_RACE: 86400,
} as const;

// =============================================================================
// Types
// =============================================================================

export interface CachedPrediction {
  prediction: RacePrediction;
  cachedAt: string;
  expiresAt: string;
  source: 'cache' | 'fresh';
}

export interface PredictionCacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

// =============================================================================
// Cache Key Helpers
// =============================================================================

/**
 * 경주별 캐시 키 생성
 */
export function createPredictionCacheKey(
  raceId: string,
  modelVersion: string
): string {
  return createCacheKey(CACHE_NAMESPACE, CACHE_VERSION, modelVersion, raceId);
}

/**
 * 날짜별 캐시 키 패턴 생성 (일괄 삭제용)
 */
export function createDateCachePattern(date: string): string {
  return createCacheKey(CACHE_NAMESPACE, CACHE_VERSION, '*', `*-${date}-*`);
}

// =============================================================================
// Cache Operations
// =============================================================================

/**
 * 예측 결과 캐시 조회
 *
 * @param raceId 경주 ID
 * @param modelVersion 모델 버전
 * @returns 캐시된 예측 또는 null
 */
export async function getCachedPrediction(
  raceId: string,
  modelVersion: string
): Promise<CachedPrediction | null> {
  const redis = await getRedisClient();
  if (!redis) {
    recordCacheMiss(CACHE_NAMESPACE);
    return null;
  }

  const key = createPredictionCacheKey(raceId, modelVersion);

  try {
    const cached = await redis.get(key);

    if (!cached) {
      recordCacheMiss(CACHE_NAMESPACE);
      return null;
    }

    recordCacheHit(CACHE_NAMESPACE);
    const data = JSON.parse(cached) as CachedPrediction;
    return { ...data, source: 'cache' };
  } catch (error) {
    console.error(`[PredictionCache] Get error for ${key}:`, error);
    recordCacheMiss(CACHE_NAMESPACE);
    return null;
  }
}

/**
 * 예측 결과 캐시 저장
 *
 * @param raceId 경주 ID
 * @param prediction 예측 결과
 * @param ttlSeconds TTL (초)
 */
export async function cachePrediction(
  raceId: string,
  prediction: RacePrediction,
  ttlSeconds: number = PREDICTION_CACHE_TTL.PRE_RACE
): Promise<boolean> {
  const redis = await getRedisClient();
  if (!redis) {
    return false;
  }

  const key = createPredictionCacheKey(raceId, prediction.modelVersion);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  const cacheData: CachedPrediction = {
    prediction,
    cachedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    source: 'fresh',
  };

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.error(`[PredictionCache] Set error for ${key}:`, error);
    return false;
  }
}

/**
 * 예측 결과 캐시 삭제
 *
 * @param raceId 경주 ID
 * @param modelVersion 모델 버전
 */
export async function invalidatePrediction(
  raceId: string,
  modelVersion: string
): Promise<boolean> {
  const redis = await getRedisClient();
  if (!redis) {
    return false;
  }

  const key = createPredictionCacheKey(raceId, modelVersion);

  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`[PredictionCache] Delete error for ${key}:`, error);
    return false;
  }
}

/**
 * 날짜별 예측 캐시 일괄 삭제
 *
 * @param date 경주일자 (YYYYMMDD)
 */
export async function invalidateDatePredictions(date: string): Promise<number> {
  const redis = await getRedisClient();
  if (!redis) {
    return 0;
  }

  const pattern = createDateCachePattern(date);

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`[PredictionCache] Bulk delete error for ${pattern}:`, error);
    return 0;
  }
}

// =============================================================================
// Cache-Through Pattern
// =============================================================================

/**
 * 캐시를 통한 예측 조회/생성
 *
 * Single-flight 패턴 적용으로 동시 요청 시 하나의 계산만 수행
 *
 * @param raceId 경주 ID
 * @param modelVersion 모델 버전
 * @param generator 예측 생성 함수
 * @param ttlSeconds TTL (초)
 */
export async function getOrCreatePrediction(
  raceId: string,
  modelVersion: string,
  generator: () => Promise<RacePrediction>,
  ttlSeconds: number = PREDICTION_CACHE_TTL.PRE_RACE
): Promise<CachedPrediction> {
  // 1. 캐시 조회
  const cached = await getCachedPrediction(raceId, modelVersion);
  if (cached) {
    return cached;
  }

  // 2. Single-flight로 중복 계산 방지
  const flightKey = `prediction:${raceId}:${modelVersion}`;

  const prediction = await singleFlight(flightKey, async () => {
    // 다시 캐시 확인 (다른 요청이 먼저 완료했을 수 있음)
    const recheck = await getCachedPrediction(raceId, modelVersion);
    if (recheck) {
      return recheck.prediction;
    }

    // 예측 생성
    return generator();
  });

  // 3. 캐시 저장
  await cachePrediction(raceId, prediction, ttlSeconds);

  return {
    prediction,
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    source: 'fresh',
  };
}

// =============================================================================
// Export
// =============================================================================

export {
  CACHE_NAMESPACE as PREDICTION_CACHE_NAMESPACE,
};
