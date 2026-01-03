/**
 * Cache Stats API
 *
 * 캐시 모니터링 대시보드용 내부 API
 * - 네임스페이스별 히트율
 * - 시간대별 캐시 성능
 * - 배치 처리 메트릭
 * - 알림 임계치 체크
 */

import { NextResponse } from 'next/server';
import {
  getAllCacheMetrics,
  getCacheHitRate,
  getInvalidationHistory,
  getInFlightCount,
} from '@/lib/cache/cacheUtils';
import { getBatchMetrics } from '@/lib/predictions/cache/horseDataCache';
import { checkAndAlertCachePerformance } from '@/lib/cache/cacheAlerts';

// =============================================================================
// Types
// =============================================================================

interface CacheStatsResponse {
  success: boolean;
  data: {
    /** 전체 캐시 메트릭 */
    cache: ReturnType<typeof getAllCacheMetrics>;
    /** 배치 처리 메트릭 */
    batch: ReturnType<typeof getBatchMetrics>;
    /** 현재 진행 중인 요청 수 */
    inFlightCount: number;
    /** 최근 무효화 이력 */
    invalidationHistory: ReturnType<typeof getInvalidationHistory>;
    /** 알림 상태 */
    alerts: CacheAlert[];
    /** 조회 시각 */
    timestamp: string;
  };
}

interface CacheAlert {
  type: 'warning' | 'critical';
  namespace: string;
  message: string;
  hitRate: number;
  threshold: number;
}

// =============================================================================
// Constants
// =============================================================================

/** 히트율 임계치 */
const HIT_RATE_THRESHOLDS = {
  WARNING: 0.7,
  CRITICAL: 0.5,
} as const;

/** 최소 요청 수 (알림 발생 기준) */
const MIN_REQUESTS_FOR_ALERT = 10;

// =============================================================================
// Helpers
// =============================================================================

function checkCacheAlerts(
  namespaces: Record<string, { hits: number; misses: number; errors: number; lastReset: number }>
): CacheAlert[] {
  const alerts: CacheAlert[] = [];

  for (const [namespace, metrics] of Object.entries(namespaces)) {
    const totalRequests = metrics.hits + metrics.misses;

    // 최소 요청 수 미만이면 알림 스킵
    if (totalRequests < MIN_REQUESTS_FOR_ALERT) {
      continue;
    }

    const hitRate = getCacheHitRate(namespace);

    if (hitRate < HIT_RATE_THRESHOLDS.CRITICAL) {
      alerts.push({
        type: 'critical',
        namespace,
        message: `캐시 히트율이 ${(hitRate * 100).toFixed(1)}%로 심각하게 낮습니다`,
        hitRate,
        threshold: HIT_RATE_THRESHOLDS.CRITICAL,
      });
    } else if (hitRate < HIT_RATE_THRESHOLDS.WARNING) {
      alerts.push({
        type: 'warning',
        namespace,
        message: `캐시 히트율이 ${(hitRate * 100).toFixed(1)}%로 낮습니다`,
        hitRate,
        threshold: HIT_RATE_THRESHOLDS.WARNING,
      });
    }
  }

  return alerts;
}

// =============================================================================
// Route Handler
// =============================================================================

/**
 * GET /api/internal/cache/stats
 *
 * 캐시 성능 메트릭 조회
 */
export async function GET(): Promise<NextResponse<CacheStatsResponse>> {
  try {
    const cacheMetrics = getAllCacheMetrics();
    const batchMetrics = getBatchMetrics();
    const inFlightCount = getInFlightCount();
    const invalidationHist = getInvalidationHistory(20);
    const alerts = checkCacheAlerts(cacheMetrics.namespaces);

    return NextResponse.json({
      success: true,
      data: {
        cache: cacheMetrics,
        batch: batchMetrics,
        inFlightCount,
        invalidationHistory: invalidationHist,
        alerts,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[CacheStats] Error fetching cache stats:', error);

    return NextResponse.json(
      {
        success: false,
        data: {
          cache: {
            namespaces: {},
            summary: {
              totalHits: 0,
              totalMisses: 0,
              totalErrors: 0,
              overallHitRate: 0,
            },
          },
          batch: {
            batchSize: 0,
            avgResponseTime: 0,
            successRate: 0,
            totalFetched: 0,
            cacheHits: 0,
          },
          inFlightCount: 0,
          invalidationHistory: [],
          alerts: [],
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/internal/cache/stats
 *
 * 캐시 성능 체크 및 알림 전송 트리거
 * Cron job이나 모니터링 시스템에서 호출
 */
export async function POST(): Promise<NextResponse> {
  try {
    const results = await checkAndAlertCachePerformance();

    const alertsSent = results.filter((r) => r.alerted).length;
    const criticalCount = results.filter((r) => r.level === 'critical').length;
    const warningCount = results.filter((r) => r.level === 'warning').length;

    return NextResponse.json({
      success: true,
      data: {
        checked: results.length,
        alertsSent,
        criticalCount,
        warningCount,
        details: results,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[CacheStats] Error checking alerts:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
