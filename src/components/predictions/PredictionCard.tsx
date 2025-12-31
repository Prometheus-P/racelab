/**
 * Prediction Card
 *
 * 출전마 예측 결과 카드 컴포넌트
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { M3Card } from '@/components/ui/M3Card';
import {
  WinProbabilityGauge,
  ConfidenceIndicator,
} from './WinProbabilityGauge';
import type { HorsePrediction, ConfidenceLevel } from '@/types/prediction';

export interface PredictionCardProps {
  prediction: HorsePrediction;
  raceId?: string;
  showDetails?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  strong_bet: { label: '강력 추천', color: 'bg-green-100 text-green-700' },
  bet: { label: '추천', color: 'bg-blue-100 text-blue-700' },
  consider: { label: '검토', color: 'bg-yellow-100 text-yellow-700' },
  avoid: { label: '패스', color: 'bg-gray-100 text-gray-500' },
};

const confidenceLevelToNumber = (level: ConfidenceLevel): number => {
  switch (level) {
    case 'high':
      return 5;
    case 'medium':
      return 3;
    case 'low':
      return 1;
  }
};

export function PredictionCard({
  prediction,
  raceId,
  showDetails = false,
  onClick,
  'data-testid': testId,
}: PredictionCardProps) {
  const {
    entryNo,
    horseName,
    winProbability,
    confidence,
    confidenceLevel,
    predictedRank,
    recommendation,
    totalScore,
    scoreBreakdown,
    valueAnalysis,
  } = prediction;

  const action = actionLabels[recommendation.action] ?? actionLabels.consider;

  const CardContent = (
    <>
      {/* 헤더: 마번 + 마명 + 추천 배지 */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-horse text-sm font-bold text-white">
            {entryNo}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">{horseName}</h3>
            {predictedRank && (
              <span className="text-xs text-gray-500">
                예상 순위 {predictedRank}위
              </span>
            )}
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${action.color}`}>
          {action.label}
        </span>
      </div>

      {/* 메인: 확률 게이지 + 점수 */}
      <div className="flex items-center gap-4">
        <WinProbabilityGauge
          probability={winProbability}
          confidence={confidenceLevel}
          size={72}
          strokeWidth={6}
        />

        <div className="flex-1 space-y-2">
          {/* 총점 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">총점</span>
            <span className="font-semibold text-gray-900">
              {totalScore.toFixed(1)}점
            </span>
          </div>

          {/* 신뢰도 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">신뢰도</span>
            <ConfidenceIndicator level={confidenceLevelToNumber(confidenceLevel)} />
          </div>

          {/* 가치 분석 (배당 있을 때) */}
          {valueAnalysis && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">엣지</span>
              <span
                className={`text-sm font-medium ${
                  valueAnalysis.edge > 0 ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {valueAnalysis.edge > 0 ? '+' : ''}
                {(valueAnalysis.edge * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 상세 점수 (펼침 시) */}
      {showDetails && scoreBreakdown && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">레이팅</span>
              <span className="font-medium">{scoreBreakdown.ratingScore.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">최근폼</span>
              <span className="font-medium">{scoreBreakdown.formScore.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">기수</span>
              <span className="font-medium">{scoreBreakdown.jockeyScore.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">조교사</span>
              <span className="font-medium">{scoreBreakdown.trainerScore.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">콤보</span>
              <span className="font-medium">{scoreBreakdown.comboSynergyScore.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">주로상태</span>
              <span className="font-medium">{scoreBreakdown.trackConditionScore.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 추천 근거 */}
      {recommendation.reasoning.length > 0 && (
        <div className="mt-3 rounded-lg bg-gray-50 p-2">
          <p className="text-xs text-gray-600 line-clamp-2">
            {recommendation.reasoning[0]}
          </p>
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <M3Card
        variant="outlined"
        onClick={onClick}
        className="hover:border-horse"
        data-testid={testId}
      >
        {CardContent}
      </M3Card>
    );
  }

  if (raceId) {
    return (
      <Link href={`/predictions/${raceId}/${entryNo}`}>
        <M3Card
          variant="outlined"
          className="cursor-pointer hover:border-horse hover:shadow-md transition-all"
          data-testid={testId}
        >
          {CardContent}
        </M3Card>
      </Link>
    );
  }

  return (
    <M3Card variant="outlined" data-testid={testId}>
      {CardContent}
    </M3Card>
  );
}

/**
 * 예측 카드 스켈레톤
 */
export function PredictionCardSkeleton() {
  return (
    <M3Card variant="outlined">
      <div className="animate-pulse">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-200" />
            <div>
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-1 h-3 w-16 rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-5 w-14 rounded-full bg-gray-200" />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-[72px] w-[72px] rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </M3Card>
  );
}
