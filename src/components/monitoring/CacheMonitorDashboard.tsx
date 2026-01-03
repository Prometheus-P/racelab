'use client';

/**
 * Cache Monitor Dashboard
 *
 * 캐시 성능 모니터링 대시보드 컴포넌트
 * - 실시간 캐시 히트율 표시
 * - 네임스페이스별 성능 차트
 * - 배치 처리 메트릭
 * - 알림 표시
 */

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  lastReset: number;
}

interface CacheAlert {
  type: 'warning' | 'critical';
  namespace: string;
  message: string;
  hitRate: number;
  threshold: number;
}

interface BatchMetrics {
  batchSize: number;
  avgResponseTime: number;
  successRate: number;
  totalFetched: number;
  cacheHits: number;
}

interface InvalidationMeta {
  trigger: string;
  timestamp: number;
  keys: string[];
  source?: string;
}

interface CacheStatsData {
  cache: {
    namespaces: Record<string, CacheMetrics>;
    summary: {
      totalHits: number;
      totalMisses: number;
      totalErrors: number;
      overallHitRate: number;
    };
  };
  batch: BatchMetrics;
  inFlightCount: number;
  invalidationHistory: InvalidationMeta[];
  alerts: CacheAlert[];
  timestamp: string;
}

interface CacheStatsResponse {
  success: boolean;
  data: CacheStatsData;
}

// =============================================================================
// Component
// =============================================================================

export default function CacheMonitorDashboard() {
  const [data, setData] = useState<CacheStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/internal/cache/stats');
      const result: CacheStatsResponse = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError('Failed to fetch cache stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-horse border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { cache, batch, inFlightCount, invalidationHistory, alerts, timestamp } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Cache Monitor
        </h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh (5s)
          </label>
          <span className="text-sm text-gray-500">
            Last update: {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                alert.type === 'critical'
                  ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg ${
                    alert.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`}
                >
                  {alert.type === 'critical' ? '!!' : '!'}
                </span>
                <span
                  className={
                    alert.type === 'critical'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-yellow-800 dark:text-yellow-200'
                  }
                >
                  <strong>[{alert.namespace}]</strong> {alert.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Hit Rate"
          value={`${(cache.summary.overallHitRate * 100).toFixed(1)}%`}
          subtitle={`${cache.summary.totalHits.toLocaleString()} hits`}
          status={
            cache.summary.overallHitRate >= 0.8
              ? 'good'
              : cache.summary.overallHitRate >= 0.5
                ? 'warning'
                : 'critical'
          }
        />
        <SummaryCard
          title="Total Requests"
          value={(cache.summary.totalHits + cache.summary.totalMisses).toLocaleString()}
          subtitle={`${cache.summary.totalMisses.toLocaleString()} misses`}
        />
        <SummaryCard
          title="In-Flight"
          value={inFlightCount.toString()}
          subtitle="concurrent requests"
        />
        <SummaryCard
          title="Batch Size"
          value={batch.batchSize.toString()}
          subtitle={`avg ${batch.avgResponseTime.toFixed(0)}ms`}
        />
      </div>

      {/* Namespace Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Namespace Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-2 pr-4">Namespace</th>
                <th className="pb-2 pr-4 text-right">Hits</th>
                <th className="pb-2 pr-4 text-right">Misses</th>
                <th className="pb-2 pr-4 text-right">Errors</th>
                <th className="pb-2 pr-4 text-right">Hit Rate</th>
                <th className="pb-2 pr-4">Performance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cache.namespaces).map(([ns, metrics]) => {
                const total = metrics.hits + metrics.misses;
                const hitRate = total > 0 ? metrics.hits / total : 0;
                return (
                  <tr
                    key={ns}
                    className="border-b dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    <td className="py-2 pr-4 font-mono text-xs">{ns}</td>
                    <td className="py-2 pr-4 text-right text-green-600">
                      {metrics.hits.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right text-red-600">
                      {metrics.misses.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right text-yellow-600">
                      {metrics.errors}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold">
                      {(hitRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 pr-4">
                      <ProgressBar value={hitRate} />
                    </td>
                  </tr>
                );
              })}
              {Object.keys(cache.namespaces).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No cache activity recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invalidation History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Recent Invalidations
        </h2>
        <div className="space-y-2">
          {invalidationHistory.length > 0 ? (
            invalidationHistory.slice(0, 10).map((inv, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                    {inv.trigger}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {inv.keys.slice(0, 3).join(', ')}
                    {inv.keys.length > 3 && ` +${inv.keys.length - 3} more`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(inv.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No invalidations recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function SummaryCard({
  title,
  value,
  subtitle,
  status,
}: {
  title: string;
  value: string;
  subtitle: string;
  status?: 'good' | 'warning' | 'critical';
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p
        className={`text-3xl font-bold mt-1 ${status ? statusColors[status] : 'text-gray-900 dark:text-gray-100'}`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const percentage = Math.round(value * 100);
  const color =
    percentage >= 80
      ? 'bg-green-500'
      : percentage >= 50
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}
