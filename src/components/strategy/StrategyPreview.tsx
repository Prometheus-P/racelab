'use client';

/**
 * Strategy Preview Component
 *
 * 전략 조건에 대한 실시간 미리보기
 * 최근 N일간 조건 충족 경주 수, 예상 승률 등 표시
 */

import { useState, useEffect, useMemo } from 'react';
import type { StrategyDefinition } from '@/lib/strategy/types';
import {
  EXTENDED_FIELD_METADATA,
  type ExtendedConditionField,
} from '@/lib/strategy/field-metadata';

// =============================================================================
// Types
// =============================================================================

export interface PreviewStats {
  /** 분석 대상 총 경주 수 */
  totalRaces: number;
  /** 조건 충족 경주 수 */
  matchedRaces: number;
  /** 조건 충족률 (%) */
  matchRate: number;
  /** 예상 승률 (백테스트 기반) */
  estimatedWinRate?: number;
  /** 평균 배당률 */
  avgOdds?: number;
  /** 분석 기간 */
  period: string;
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error?: string;
}

export interface StrategyPreviewProps {
  /** 미리보기할 전략 */
  strategy: StrategyDefinition;
  /** 분석 기간 (일) */
  days?: number;
  /** 간결 모드 */
  compact?: boolean;
  /** 클래스명 */
  className?: string;
}

// =============================================================================
// Mock Stats (실제 API 연동 전)
// =============================================================================

function generateMockStats(
  strategy: StrategyDefinition,
  days: number
): Omit<PreviewStats, 'loading'> {
  // 조건이 없으면 빈 통계
  if (strategy.conditions.length === 0) {
    return {
      totalRaces: 0,
      matchedRaces: 0,
      matchRate: 0,
      period: `최근 ${days}일`,
    };
  }

  // 조건 수에 따라 대략적인 통계 생성 (Mock)
  const conditionCount = strategy.conditions.length;
  const baseTotal = days * 12; // 하루 평균 12경주 가정
  const matchProbability = Math.max(0.1, 1 - conditionCount * 0.15); // 조건이 많을수록 낮아짐

  const totalRaces = baseTotal;
  const matchedRaces = Math.floor(baseTotal * matchProbability);
  const matchRate = (matchedRaces / totalRaces) * 100;

  // 배당 관련 조건이 있으면 평균 배당률 추정
  const hasOddsCondition = strategy.conditions.some((c) =>
    c.field.startsWith('odds_')
  );

  return {
    totalRaces,
    matchedRaces,
    matchRate,
    estimatedWinRate: hasOddsCondition ? 15 + Math.random() * 10 : undefined,
    avgOdds: hasOddsCondition ? 3 + Math.random() * 5 : undefined,
    period: `최근 ${days}일`,
  };
}

// =============================================================================
// StrategyPreview Component
// =============================================================================

export function StrategyPreview({
  strategy,
  days = 30,
  compact = false,
  className = '',
}: StrategyPreviewProps) {
  const [stats, setStats] = useState<PreviewStats>({
    totalRaces: 0,
    matchedRaces: 0,
    matchRate: 0,
    period: `최근 ${days}일`,
    loading: true,
  });

  // 전략 변경 시 통계 업데이트 (디바운싱)
  useEffect(() => {
    setStats((prev) => ({ ...prev, loading: true }));

    const timer = setTimeout(() => {
      // TODO: 실제 API 호출로 대체
      // const response = await fetch('/api/strategy/preview', {
      //   method: 'POST',
      //   body: JSON.stringify({ strategy, days }),
      // });
      // const data = await response.json();

      const mockStats = generateMockStats(strategy, days);
      setStats({ ...mockStats, loading: false });
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timer);
  }, [strategy, days]);

  // 조건 요약 텍스트 생성
  const conditionSummary = useMemo(() => {
    return strategy.conditions.map((condition) => {
      const fieldMeta = EXTENDED_FIELD_METADATA[condition.field as ExtendedConditionField];
      const fieldLabel = fieldMeta?.label || condition.field;
      const unit = fieldMeta?.unit || '';

      let valueDisplay = '';
      if (Array.isArray(condition.value)) {
        if (condition.operator === 'between') {
          valueDisplay = `${condition.value[0]}~${condition.value[1]}${unit}`;
        } else {
          valueDisplay = condition.value.join(', ') + unit;
        }
      } else {
        valueDisplay = `${condition.value}${unit}`;
      }

      const operatorLabels: Record<string, string> = {
        eq: '=',
        ne: '≠',
        gt: '>',
        gte: '≥',
        lt: '<',
        lte: '≤',
        between: '범위',
        in: '∈',
      };

      return {
        field: fieldLabel,
        operator: operatorLabels[condition.operator] || condition.operator,
        value: valueDisplay,
      };
    });
  }, [strategy.conditions]);

  // Compact 모드
  if (compact) {
    return (
      <div className={`flex items-center gap-4 text-body-small ${className}`}>
        {stats.loading ? (
          <span className="animate-pulse text-neutral-text-tertiary">분석 중...</span>
        ) : (
          <>
            <span className="text-neutral-text-secondary">
              조건 충족: <span className="font-semibold text-primary">{stats.matchedRaces}경주</span>
              <span className="text-neutral-text-tertiary"> / {stats.totalRaces}경주</span>
            </span>
            <span className="text-neutral-text-tertiary">({stats.matchRate.toFixed(1)}%)</span>
          </>
        )}
      </div>
    );
  }

  // Full 모드
  return (
    <div className={`rounded-lg border border-neutral-divider bg-surface-container p-4 ${className}`}>
      <h4 className="mb-3 text-label-medium font-semibold text-neutral-text-primary">
        전략 미리보기
      </h4>

      {/* 로딩 상태 */}
      {stats.loading && (
        <div className="flex items-center gap-2 text-body-small text-neutral-text-tertiary">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-border border-t-primary" />
          <span>분석 중...</span>
        </div>
      )}

      {/* 조건 없음 */}
      {!stats.loading && strategy.conditions.length === 0 && (
        <p className="text-body-small text-neutral-text-tertiary">
          조건을 추가하면 미리보기가 표시됩니다.
        </p>
      )}

      {/* 통계 표시 */}
      {!stats.loading && strategy.conditions.length > 0 && (
        <div className="space-y-4">
          {/* 조건 요약 */}
          <div className="space-y-1">
            <span className="text-label-small font-medium text-neutral-text-secondary">조건</span>
            <ul className="space-y-0.5 text-body-small">
              {conditionSummary.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="text-neutral-text-primary">{c.field}</span>
                  <span className="text-neutral-text-tertiary">{c.operator}</span>
                  <span className="font-mono text-primary">{c.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 통계 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-surface p-3">
              <div className="text-label-small text-neutral-text-tertiary">조건 충족</div>
              <div className="text-data-medium font-semibold text-primary">
                {stats.matchedRaces}
                <span className="text-body-small font-normal text-neutral-text-tertiary">
                  /{stats.totalRaces}경주
                </span>
              </div>
            </div>
            <div className="rounded-md bg-surface p-3">
              <div className="text-label-small text-neutral-text-tertiary">충족률</div>
              <div className="text-data-medium font-semibold text-horse">
                {stats.matchRate.toFixed(1)}%
              </div>
            </div>
            {stats.estimatedWinRate !== undefined && (
              <div className="rounded-md bg-surface p-3">
                <div className="text-label-small text-neutral-text-tertiary">예상 승률</div>
                <div className="text-data-medium font-semibold text-cycle">
                  {stats.estimatedWinRate.toFixed(1)}%
                </div>
              </div>
            )}
            {stats.avgOdds !== undefined && (
              <div className="rounded-md bg-surface p-3">
                <div className="text-label-small text-neutral-text-tertiary">평균 배당</div>
                <div className="text-data-medium font-semibold text-boat">
                  {stats.avgOdds.toFixed(2)}배
                </div>
              </div>
            )}
          </div>

          {/* 기간 표시 */}
          <div className="text-center text-label-small text-neutral-text-tertiary">
            {stats.period} 기준
          </div>
        </div>
      )}
    </div>
  );
}

export default StrategyPreview;
