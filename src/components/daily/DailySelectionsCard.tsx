/**
 * DailySelectionsCard Component
 *
 * 오늘의 추천 전체 카드
 */

'use client';

import React from 'react';
import type { ScreeningResult } from '@/lib/daily/types';
import { SelectionItem } from './SelectionItem';

interface DailySelectionsCardProps {
  result: ScreeningResult | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onStrategyChange?: () => void;
}

export function DailySelectionsCard({
  result,
  isLoading,
  error,
  lastUpdated,
  onRefresh,
  onStrategyChange,
}: DailySelectionsCardProps) {
  // 날짜 포맷
  const dateDisplay = result?.request.date
    ? new Date(result.request.date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : '오늘';

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg">
      {/* 헤더 */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <span className="text-2xl">📊</span>
              오늘의 추천
            </h2>
            <p className="mt-1 text-sm text-gray-500">{dateDisplay}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
              새로고침
            </button>
            {onStrategyChange && (
              <button
                onClick={onStrategyChange}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                전략 변경
              </button>
            )}
          </div>
        </div>

        {/* 기준 전략 */}
        {result && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
            <span className="text-blue-600">📌</span>
            <span className="text-sm font-medium text-blue-800">
              기준 전략: {result.request.strategyName}
            </span>
          </div>
        )}
      </div>

      {/* 컨텐츠 */}
      <div className="p-4">
        {/* 로딩 상태 */}
        {isLoading && !result && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-horse"></div>
            <p className="mt-3 text-sm text-gray-500">추천 마필을 분석 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-red-600">❌ {error.message}</p>
            <button onClick={onRefresh} className="mt-2 text-sm text-red-500 underline">
              다시 시도
            </button>
          </div>
        )}

        {/* 추천 없음 */}
        {!isLoading && !error && result && result.selections.length === 0 && (
          <div className="py-12 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 text-gray-600">오늘 조건에 맞는 추천이 없습니다</p>
            <p className="mt-1 text-sm text-gray-400">
              {result.totalRacesScreened}개 경주, {result.totalEntriesScreened}마리 분석 완료
            </p>
          </div>
        )}

        {/* 추천 목록 */}
        {result && result.selections.length > 0 && (
          <div className="space-y-3">
            {result.selections.map((selection) => (
              <SelectionItem key={`${selection.raceId}-${selection.entryNo}`} selection={selection} />
            ))}
          </div>
        )}
      </div>

      {/* 푸터 */}
      {result && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {result.totalRacesScreened}개 경주, {result.totalEntriesScreened}마리 분석
            </span>
            {lastUpdated && (
              <span>
                마지막 갱신:{' '}
                {lastUpdated.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
