/**
 * SelectionItem Component
 *
 * 개별 추천 마필 카드
 */

'use client';

import React from 'react';
import type { DailySelection } from '@/lib/daily/types';

interface SelectionItemProps {
  selection: DailySelection;
  showResult?: boolean;
}

export function SelectionItem({ selection, showResult = false }: SelectionItemProps) {
  const {
    track,
    raceNo,
    raceTime,
    entryNo,
    horseName,
    odds,
    oddsChange,
    popularity,
    matchedConditions,
    result,
  } = selection;

  // 경주 시간 포맷
  const time = new Date(raceTime);
  const timeString = time.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 배당 변화 스타일
  const oddsChangeColor =
    oddsChange < 0 ? 'text-green-600' : oddsChange > 0 ? 'text-red-500' : 'text-gray-500';

  const oddsChangeSymbol = oddsChange < 0 ? '▼' : oddsChange > 0 ? '▲' : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* 헤더: 경주 정보 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏇</span>
          <span className="font-semibold text-gray-900">
            {track} {raceNo}경주
          </span>
          <span className="text-sm text-gray-500">{timeString}</span>
        </div>
        {showResult && result && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              result.won
                ? 'bg-green-100 text-green-800'
                : result.placed
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600'
            }`}
          >
            {result.won ? '🏆 적중' : result.placed ? '📍 복승' : `${result.finishPosition}착`}
          </span>
        )}
      </div>

      {/* 마필 정보 */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-horse text-sm font-bold text-white">
              {entryNo}
            </span>
            <span className="text-lg font-bold text-gray-900">{horseName}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{odds.toFixed(1)}배</div>
          <div className={`text-sm ${oddsChangeColor}`}>
            {oddsChangeSymbol} {Math.abs(oddsChange).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 인기순위 & 조건 충족 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          인기 {popularity}위
        </span>
        {matchedConditions.slice(0, 2).map((condition, idx) => (
          <span
            key={idx}
            className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
            title={`${condition.label} ${condition.operator} ${String(condition.expectedValue)}`}
          >
            {condition.label}: {String(condition.actualValue)}
          </span>
        ))}
        {matchedConditions.length > 2 && (
          <span className="text-xs text-gray-500">+{matchedConditions.length - 2}개 조건</span>
        )}
      </div>

      {/* 결과 상세 (있는 경우) */}
      {showResult && result && (
        <div
          className={`mt-3 rounded-md p-2 text-sm ${
            result.profit > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          손익: {result.profit > 0 ? '+' : ''}
          {result.profit.toLocaleString()}원
        </div>
      )}
    </div>
  );
}
