/**
 * Win Probability Gauge
 *
 * 원형 확률 게이지 컴포넌트
 * SVG 기반 도넛 차트로 승률 시각화
 */

'use client';

import React from 'react';

export interface WinProbabilityGaugeProps {
  /** 승률 (0-100) */
  probability: number;
  /** 크기 (px) */
  size?: number;
  /** 두께 (px) */
  strokeWidth?: number;
  /** 신뢰도 수준 */
  confidence?: 'high' | 'medium' | 'low';
  /** 순위 표시 */
  rank?: number;
  /** 테스트 ID */
  'data-testid'?: string;
}

const confidenceColors = {
  high: {
    stroke: 'stroke-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
  },
  medium: {
    stroke: 'stroke-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  low: {
    stroke: 'stroke-gray-400',
    text: 'text-gray-500',
    bg: 'bg-gray-50',
  },
};

export function WinProbabilityGauge({
  probability,
  size = 80,
  strokeWidth = 8,
  confidence = 'medium',
  rank,
  'data-testid': testId,
}: WinProbabilityGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, probability));
  const offset = circumference - (progress / 100) * circumference;

  const colors = confidenceColors[confidence];

  return (
    <div
      className="relative inline-flex items-center justify-center"
      data-testid={testId}
      style={{ width: size, height: size }}
    >
      {/* SVG 게이지 */}
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        aria-hidden="true"
      >
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-200"
        />
        {/* 진행 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colors.stroke} transition-all duration-500 ease-out`}
        />
      </svg>

      {/* 중앙 텍스트 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {rank && (
          <span className="text-xs font-medium text-gray-400">
            #{rank}
          </span>
        )}
        <span className={`text-lg font-bold ${colors.text}`}>
          {probability.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

/**
 * 미니 확률 표시 (인라인용)
 */
export function MiniProbability({
  probability,
  confidence = 'medium',
}: {
  probability: number;
  confidence?: 'high' | 'medium' | 'low';
}) {
  const colors = confidenceColors[confidence];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${colors.bg} ${colors.text}`}
    >
      <span className="sr-only">승률</span>
      {probability.toFixed(1)}%
    </span>
  );
}

/**
 * 신뢰도 인디케이터 (1-5 별)
 */
export function ConfidenceIndicator({
  level,
  max = 5,
}: {
  level: number;
  max?: number;
}) {
  const filled = Math.min(max, Math.max(0, Math.round(level)));

  return (
    <div className="flex items-center gap-0.5" aria-label={`신뢰도 ${filled}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < filled ? 'text-yellow-400' : 'text-gray-300'}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}
