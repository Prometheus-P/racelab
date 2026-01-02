/**
 * Cache Utilities
 *
 * Single-flight pattern과 이벤트 기반 캐시 무효화 지원
 */

import { safeError, safeInfo } from '@/lib/utils/safeLogger';

/**
 * In-flight 요청 추적을 위한 저장소
 * Single-flight pattern: 동일 키에 대해 하나의 요청만 실행
 */
const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * 캐시 무효화 이벤트 리스너
 */
type CacheInvalidationListener = (keys: string[]) => void | Promise<void>;
const invalidationListeners = new Set<CacheInvalidationListener>();

/**
 * Single-flight: 동일 키에 대해 하나의 요청만 실행하고 결과 공유
 *
 * 캐시 스탬피드 방지를 위해 사용
 * - 여러 요청이 동시에 캐시 미스가 발생해도 하나의 업스트림 요청만 실행
 * - 나머지 요청은 첫 번째 요청의 결과를 공유
 *
 * @param key - 요청을 식별하는 고유 키
 * @param fetcher - 실제 데이터를 가져오는 함수
 * @returns fetcher의 결과
 *
 * @example
 * ```typescript
 * const data = await singleFlight('races:20241201', async () => {
 *   return fetchFromUpstream('20241201');
 * });
 * ```
 */
export async function singleFlight<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // 이미 진행 중인 요청이 있으면 해당 Promise를 반환
  const existing = inFlightRequests.get(key);
  if (existing) {
    safeInfo(`[SingleFlight] Joining existing request for key: ${key}`);
    return existing as Promise<T>;
  }

  // 새 요청 시작
  const promise = (async () => {
    try {
      const result = await fetcher();
      return result;
    } finally {
      // 요청 완료 후 맵에서 제거
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * 현재 진행 중인 요청 수 반환 (모니터링용)
 */
export function getInFlightCount(): number {
  return inFlightRequests.size;
}

/**
 * 특정 키의 요청이 진행 중인지 확인
 */
export function isInFlight(key: string): boolean {
  return inFlightRequests.has(key);
}

/**
 * 캐시 무효화 이벤트 구독
 *
 * @param listener - 캐시 무효화 시 호출될 콜백
 * @returns 구독 해제 함수
 *
 * @example
 * ```typescript
 * const unsubscribe = onCacheInvalidation((keys) => {
 *   console.log('Invalidated:', keys);
 * });
 *
 * // 나중에 구독 해제
 * unsubscribe();
 * ```
 */
export function onCacheInvalidation(listener: CacheInvalidationListener): () => void {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

/**
 * 캐시 무효화 이벤트 발행
 *
 * 모든 등록된 리스너에게 무효화 이벤트를 전파
 *
 * @param keys - 무효화할 캐시 키 목록
 *
 * @example
 * ```typescript
 * // 특정 날짜의 경주 결과 캐시 무효화
 * await emitCacheInvalidation(['public-data:results:20241201']);
 *
 * // 패턴 기반 무효화
 * await emitCacheInvalidation(['public-data:results:*']);
 * ```
 */
export async function emitCacheInvalidation(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  safeInfo(`[CacheInvalidation] Emitting invalidation for ${keys.length} keys`);

  const results = await Promise.allSettled(
    Array.from(invalidationListeners).map((listener) => {
      try {
        return Promise.resolve(listener(keys));
      } catch (error) {
        return Promise.reject(error);
      }
    })
  );

  // 실패한 리스너 로깅
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      safeError(`[CacheInvalidation] Listener ${index} failed:`, result.reason);
    }
  });
}

/**
 * 캐시 무효화 트리거 타입
 */
export type InvalidationTrigger =
  | 'manual' // 수동 무효화
  | 'ttl_expired' // TTL 만료
  | 'data_updated' // 데이터 업데이트
  | 'upstream_refresh' // 업스트림 갱신
  | 'scheduled'; // 스케줄된 무효화

/**
 * 캐시 무효화 메타데이터
 */
export interface InvalidationMeta {
  trigger: InvalidationTrigger;
  timestamp: number;
  keys: string[];
  source?: string;
}

/**
 * 무효화 이력 저장소 (최근 100건)
 */
const invalidationHistory: InvalidationMeta[] = [];
const MAX_HISTORY = 100;

/**
 * 캐시 무효화 with 메타데이터 기록
 */
export async function invalidateCache(
  keys: string[],
  trigger: InvalidationTrigger,
  source?: string
): Promise<void> {
  const meta: InvalidationMeta = {
    trigger,
    timestamp: Date.now(),
    keys,
    source,
  };

  // 이력 저장
  invalidationHistory.unshift(meta);
  if (invalidationHistory.length > MAX_HISTORY) {
    invalidationHistory.pop();
  }

  safeInfo(`[CacheInvalidation] Trigger: ${trigger}, Keys: ${keys.join(', ')}`);

  await emitCacheInvalidation(keys);
}

/**
 * 캐시 무효화 이력 조회 (모니터링용)
 */
export function getInvalidationHistory(limit = 20): InvalidationMeta[] {
  return invalidationHistory.slice(0, limit);
}

/**
 * Stale-while-revalidate 패턴 지원
 *
 * 캐시된 데이터가 stale하더라도 즉시 반환하고,
 * 백그라운드에서 데이터를 갱신
 */
export interface StaleWhileRevalidateResult<T> {
  data: T;
  isStale: boolean;
  revalidating: boolean;
}

/**
 * 캐시 키 생성 헬퍼
 */
export function createCacheKey(namespace: string, ...parts: (string | number)[]): string {
  return [namespace, ...parts].join(':');
}

/**
 * 와일드카드 패턴 매칭
 *
 * @param pattern - 패턴 (예: 'public-data:results:*')
 * @param key - 매칭할 키 (예: 'public-data:results:20241201')
 * @returns 매칭 여부
 */
export function matchCacheKeyPattern(pattern: string, key: string): boolean {
  if (!pattern.includes('*')) {
    return pattern === key;
  }

  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  return new RegExp(`^${regexPattern}$`).test(key);
}

// ====================================================
// Cache Metrics (#165)
// ====================================================

/**
 * 캐시 메트릭 저장소
 */
interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  lastReset: number;
}

interface NamespacedMetrics {
  [namespace: string]: CacheMetrics;
}

const cacheMetrics: NamespacedMetrics = {};

/**
 * 기본 메트릭 객체 생성
 */
function getOrCreateMetrics(namespace: string): CacheMetrics {
  if (!cacheMetrics[namespace]) {
    cacheMetrics[namespace] = {
      hits: 0,
      misses: 0,
      errors: 0,
      lastReset: Date.now(),
    };
  }
  return cacheMetrics[namespace];
}

/**
 * 캐시 히트 기록
 */
export function recordCacheHit(namespace: string): void {
  getOrCreateMetrics(namespace).hits++;
}

/**
 * 캐시 미스 기록
 */
export function recordCacheMiss(namespace: string): void {
  getOrCreateMetrics(namespace).misses++;
}

/**
 * 캐시 에러 기록
 */
export function recordCacheError(namespace: string): void {
  getOrCreateMetrics(namespace).errors++;
}

/**
 * 캐시 히트율 계산
 */
export function getCacheHitRate(namespace: string): number {
  const metrics = cacheMetrics[namespace];
  if (!metrics) return 0;

  const total = metrics.hits + metrics.misses;
  if (total === 0) return 0;

  return metrics.hits / total;
}

/**
 * 네임스페이스별 캐시 메트릭 조회
 */
export function getCacheMetrics(namespace: string): CacheMetrics | null {
  return cacheMetrics[namespace] || null;
}

/**
 * 전체 캐시 메트릭 조회
 */
export function getAllCacheMetrics(): {
  namespaces: NamespacedMetrics;
  summary: {
    totalHits: number;
    totalMisses: number;
    totalErrors: number;
    overallHitRate: number;
  };
} {
  let totalHits = 0;
  let totalMisses = 0;
  let totalErrors = 0;

  for (const metrics of Object.values(cacheMetrics)) {
    totalHits += metrics.hits;
    totalMisses += metrics.misses;
    totalErrors += metrics.errors;
  }

  const total = totalHits + totalMisses;
  const overallHitRate = total > 0 ? totalHits / total : 0;

  return {
    namespaces: { ...cacheMetrics },
    summary: {
      totalHits,
      totalMisses,
      totalErrors,
      overallHitRate,
    },
  };
}

/**
 * 특정 네임스페이스 메트릭 리셋
 */
export function resetCacheMetrics(namespace: string): void {
  if (cacheMetrics[namespace]) {
    cacheMetrics[namespace] = {
      hits: 0,
      misses: 0,
      errors: 0,
      lastReset: Date.now(),
    };
  }
}

/**
 * 모든 캐시 메트릭 리셋
 */
export function resetAllCacheMetrics(): void {
  for (const namespace of Object.keys(cacheMetrics)) {
    resetCacheMetrics(namespace);
  }
}
