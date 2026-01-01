/**
 * useDailySelections Hook
 *
 * 일일 추천 데이터를 가져오고 5분마다 자동 갱신
 */

import { useState, useEffect, useCallback } from 'react';
import type { ScreeningResult, DailySelection } from '@/lib/daily/types';

/** 자동 갱신 간격 (5분) */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface UseDailySelectionsOptions {
  /** 전략 ID */
  strategyId: string;
  /** 대상 날짜 (기본: 오늘) */
  date?: string;
  /** 프리셋 전략 사용 여부 */
  usePreset?: boolean;
  /** 자동 갱신 활성화 */
  autoRefresh?: boolean;
  /** 갱신 간격 (ms) */
  refreshInterval?: number;
}

interface UseDailySelectionsResult {
  /** 추천 목록 */
  selections: DailySelection[];
  /** 전체 스크리닝 결과 */
  result: ScreeningResult | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** 수동 새로고침 */
  refresh: () => Promise<void>;
  /** 마지막 갱신 시간 */
  lastUpdated: Date | null;
  /** 캐시 히트 여부 */
  cacheHit: boolean;
}

export function useDailySelections(options: UseDailySelectionsOptions): UseDailySelectionsResult {
  const {
    strategyId,
    date,
    usePreset = true,
    autoRefresh = true,
    refreshInterval = REFRESH_INTERVAL_MS,
  } = options;

  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cacheHit, setCacheHit] = useState(false);

  const fetchSelections = useCallback(async () => {
    if (!strategyId) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        strategyId,
        ...(date && { date }),
        ...(usePreset && { preset: 'true' }),
      });

      const response = await fetch(`/api/v1/daily-selections?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch daily selections');
      }

      setResult(data.data);
      setCacheHit(data.data.cache?.hit || false);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [strategyId, date, usePreset]);

  // 초기 로드
  useEffect(() => {
    fetchSelections();
  }, [fetchSelections]);

  // 자동 갱신
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSelections, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSelections]);

  return {
    selections: result?.selections || [],
    result,
    isLoading,
    error,
    refresh: fetchSelections,
    lastUpdated,
    cacheHit,
  };
}

/**
 * 사용 가능한 프리셋 전략 목록 훅
 */
export function usePresetStrategies() {
  const [strategies, setStrategies] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      difficulty: string;
      riskLevel: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setError(null);
        const response = await fetch('/api/v1/daily-selections', { method: 'OPTIONS' });
        const data = await response.json();

        if (data.success) {
          setStrategies(data.data.presetStrategies || []);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch preset strategies');
        }
      } catch (err) {
        const fetchError = err instanceof Error ? err : new Error('Unknown error');
        setError(fetchError);
        console.error('Failed to fetch preset strategies:', fetchError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  return { strategies, isLoading, error };
}
