/**
 * FormIndicator Component
 *
 * 폼 점수 시각화 (🔥 표시)
 */

'use client';

import React from 'react';

interface FormIndicatorProps {
  score: number;
  showLabel?: boolean;
}

export function FormIndicator({ score, showLabel = false }: FormIndicatorProps) {
  const maxScore = 5;
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">
        {Array.from({ length: normalizedScore }, () => '🔥').join('')}
        {Array.from({ length: maxScore - normalizedScore }, (_, idx) => (
          <span key={idx} className="opacity-20">
            🔥
          </span>
        ))}
      </span>
      {showLabel && (
        <span className="ml-1 text-xs text-gray-500">
          {normalizedScore === 5
            ? '최상'
            : normalizedScore >= 4
              ? '좋음'
              : normalizedScore >= 3
                ? '보통'
                : normalizedScore >= 2
                  ? '주의'
                  : '부진'}
        </span>
      )}
    </div>
  );
}
