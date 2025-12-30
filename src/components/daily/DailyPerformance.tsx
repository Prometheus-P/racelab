/**
 * DailyPerformance Component
 *
 * 오늘의 성과 요약 카드
 */

'use client';

import React from 'react';
import type { DailyPerformance as DailyPerformanceType } from '@/lib/daily/types';

interface DailyPerformanceProps {
  performance: DailyPerformanceType | null;
  isLoading?: boolean;
}

export function DailyPerformance({ performance, isLoading = false }: DailyPerformanceProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-4 w-24 rounded bg-gray-200"></div>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="h-16 rounded bg-gray-100"></div>
          <div className="h-16 rounded bg-gray-100"></div>
          <div className="h-16 rounded bg-gray-100"></div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
        <span className="text-gray-400">성과 데이터 없음</span>
      </div>
    );
  }

  const {
    totalSelections,
    completedRaces,
    wins,
    places,
    winRate,
    placeRate,
    profit,
    roi,
  } = performance;

  const profitColor = profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-500' : 'text-gray-600';
  const roiColor = roi > 0 ? 'text-green-600' : roi < 0 ? 'text-red-500' : 'text-gray-600';

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* 헤더 */}
      <div className="border-b border-gray-100 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <span>📈</span>
          오늘 성과
        </h3>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-2 gap-px bg-gray-100 md:grid-cols-4">
        {/* 적중률 */}
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {wins}/{completedRaces}
          </div>
          <div className="mt-1 text-xs text-gray-500">적중</div>
          <div className="mt-1 text-sm font-medium text-horse">{winRate.toFixed(1)}%</div>
        </div>

        {/* 복승률 */}
        <div className="bg-white p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {places}/{completedRaces}
          </div>
          <div className="mt-1 text-xs text-gray-500">복승</div>
          <div className="mt-1 text-sm font-medium text-blue-600">{placeRate.toFixed(1)}%</div>
        </div>

        {/* 수익 */}
        <div className="bg-white p-4 text-center">
          <div className={`text-2xl font-bold ${profitColor}`}>
            {profit > 0 ? '+' : ''}
            {profit.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">수익 (원)</div>
        </div>

        {/* ROI */}
        <div className="bg-white p-4 text-center">
          <div className={`text-2xl font-bold ${roiColor}`}>
            {roi > 0 ? '+' : ''}
            {roi.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-gray-500">ROI</div>
        </div>
      </div>

      {/* 진행 상태 */}
      {totalSelections > completedRaces && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">진행 중</span>
            <span className="font-medium text-gray-900">
              {completedRaces}/{totalSelections} 경주 완료
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-horse transition-all"
              style={{ width: `${(completedRaces / totalSelections) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
