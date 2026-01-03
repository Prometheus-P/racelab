/**
 * Cache Alerts
 *
 * 캐시 성능 모니터링 및 알림 전송
 * - 히트율 임계치 기반 알림
 * - 디바운싱으로 알림 폭주 방지
 */

import { alertWarn, alertCritical } from '@/lib/utils/alerting';
import { getAllCacheMetrics, getCacheHitRate } from './cacheUtils';

// =============================================================================
// Types
// =============================================================================

export interface CacheAlertConfig {
  /** 경고 히트율 임계치 (기본: 0.7) */
  warningThreshold: number;
  /** 심각 히트율 임계치 (기본: 0.5) */
  criticalThreshold: number;
  /** 최소 요청 수 (알림 발생 기준, 기본: 50) */
  minRequests: number;
  /** 알림 쿨다운 (ms, 기본: 5분) */
  cooldownMs: number;
}

export interface AlertCheckResult {
  namespace: string;
  hitRate: number;
  level: 'ok' | 'warning' | 'critical';
  alerted: boolean;
}

// =============================================================================
// State
// =============================================================================

const defaultConfig: CacheAlertConfig = {
  warningThreshold: 0.7,
  criticalThreshold: 0.5,
  minRequests: 50,
  cooldownMs: 5 * 60 * 1000, // 5분
};

/** 마지막 알림 시간 (namespace → timestamp) */
const lastAlertTime = new Map<string, number>();

// =============================================================================
// Functions
// =============================================================================

/**
 * 캐시 성능 체크 및 알림 전송
 *
 * @param config 알림 설정 (선택적)
 * @returns 체크 결과 배열
 */
export async function checkAndAlertCachePerformance(
  config: Partial<CacheAlertConfig> = {}
): Promise<AlertCheckResult[]> {
  const cfg = { ...defaultConfig, ...config };
  const metrics = getAllCacheMetrics();
  const results: AlertCheckResult[] = [];

  for (const [namespace, nsMetrics] of Object.entries(metrics.namespaces)) {
    const totalRequests = nsMetrics.hits + nsMetrics.misses;

    // 최소 요청 수 미달
    if (totalRequests < cfg.minRequests) {
      results.push({
        namespace,
        hitRate: 0,
        level: 'ok',
        alerted: false,
      });
      continue;
    }

    const hitRate = getCacheHitRate(namespace);
    let level: 'ok' | 'warning' | 'critical' = 'ok';
    let alerted = false;

    // 알림 레벨 결정
    if (hitRate < cfg.criticalThreshold) {
      level = 'critical';
    } else if (hitRate < cfg.warningThreshold) {
      level = 'warning';
    }

    // 알림 필요 시 쿨다운 체크 후 전송
    if (level !== 'ok') {
      const lastAlert = lastAlertTime.get(namespace) || 0;
      const now = Date.now();

      if (now - lastAlert > cfg.cooldownMs) {
        alerted = await sendCacheAlert(namespace, hitRate, level, nsMetrics);
        if (alerted) {
          lastAlertTime.set(namespace, now);
        }
      }
    }

    results.push({ namespace, hitRate, level, alerted });
  }

  return results;
}

/**
 * 캐시 알림 전송
 */
async function sendCacheAlert(
  namespace: string,
  hitRate: number,
  level: 'warning' | 'critical',
  metrics: { hits: number; misses: number; errors: number }
): Promise<boolean> {
  const hitRatePercent = (hitRate * 100).toFixed(1);
  const title = `Cache Performance ${level === 'critical' ? 'Critical' : 'Warning'}`;
  const message = `캐시 네임스페이스 \`${namespace}\`의 히트율이 ${hitRatePercent}%로 ${level === 'critical' ? '심각하게 ' : ''}낮습니다.`;

  const context = {
    namespace,
    hitRate: hitRatePercent + '%',
    hits: metrics.hits,
    misses: metrics.misses,
    errors: metrics.errors,
  };

  if (level === 'critical') {
    return alertCritical(title, message, context);
  } else {
    return alertWarn(title, message, context);
  }
}

/**
 * 알림 쿨다운 리셋 (테스트용)
 */
export function resetAlertCooldowns(): void {
  lastAlertTime.clear();
}

/**
 * 특정 네임스페이스의 알림 쿨다운 체크
 */
export function isInCooldown(namespace: string, cooldownMs = defaultConfig.cooldownMs): boolean {
  const lastAlert = lastAlertTime.get(namespace) || 0;
  return Date.now() - lastAlert < cooldownMs;
}
