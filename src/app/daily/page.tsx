/**
 * Daily Selections Page
 *
 * 오늘의 자동 추천 페이지
 */

'use client';

import React, { useState } from 'react';
import { useDailySelections, usePresetStrategies } from '@/hooks/useDailySelections';
import { DailySelectionsCard, DailyPerformance } from '@/components/daily';
import { generateMockPerformance } from '@/lib/daily/performance';
import { ALL_PRESET_STRATEGIES } from '@/lib/dashboard/strategies';

export default function DailyPage() {
  const [selectedStrategyId, setSelectedStrategyId] = useState(
    ALL_PRESET_STRATEGIES[0]?.id || 'value-bet'
  );
  const [showStrategySelector, setShowStrategySelector] = useState(false);

  const { strategies: _strategies, error: presetError } = usePresetStrategies();
  const { result, isLoading, error: selectionsError, refresh, lastUpdated } = useDailySelections({
    strategyId: selectedStrategyId,
    usePreset: true,
    autoRefresh: true,
  });

  // Combine errors for display
  const error = selectionsError || presetError;

  // 더미 성과 데이터
  const today = new Date().toISOString().split('T')[0];
  const mockPerformance = generateMockPerformance(today, selectedStrategyId);

  const handleStrategyChange = (strategyId: string) => {
    setSelectedStrategyId(strategyId);
    setShowStrategySelector(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎯 오늘의 추천</h1>
          <p className="mt-2 text-gray-600">
            저장된 전략을 기반으로 오늘 경주에서 조건에 맞는 마필을 자동 추천합니다.
          </p>
        </div>

        {/* 전략 선택 모달 */}
        {showStrategySelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">전략 선택</h3>
                <button
                  onClick={() => setShowStrategySelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {ALL_PRESET_STRATEGIES.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => handleStrategyChange(strategy.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedStrategyId === strategy.id
                        ? 'border-horse bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{strategy.name}</div>
                    <div className="mt-1 text-sm text-gray-500">{strategy.description}</div>
                    <div className="mt-2 flex gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          strategy.difficulty === 'easy'
                            ? 'bg-green-100 text-green-700'
                            : strategy.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {strategy.difficulty === 'easy'
                          ? '초급'
                          : strategy.difficulty === 'medium'
                            ? '중급'
                            : '고급'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          strategy.riskLevel === 'low'
                            ? 'bg-blue-100 text-blue-700'
                            : strategy.riskLevel === 'medium'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {strategy.riskLevel === 'low'
                          ? '저위험'
                          : strategy.riskLevel === 'medium'
                            ? '중위험'
                            : '고위험'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 성과 카드 */}
        <div className="mb-6">
          <DailyPerformance performance={mockPerformance} />
        </div>

        {/* 추천 카드 */}
        <DailySelectionsCard
          result={result}
          isLoading={isLoading}
          error={error}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          onStrategyChange={() => setShowStrategySelector(true)}
        />

        {/* 안내 메시지 */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h4 className="font-medium text-blue-800">💡 사용 안내</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-700">
            <li>• 추천은 5분마다 자동으로 갱신됩니다</li>
            <li>• 배당률 변화에 따라 추천 마필이 변경될 수 있습니다</li>
            <li>• 모든 추천은 참고용이며, 최종 결정은 본인의 책임입니다</li>
            <li>• 현재는 테스트 데이터로 제공됩니다</li>
          </ul>
        </div>

        {/* 디버그 정보 (개발용) */}
        {process.env.NODE_ENV === 'development' && result && (
          <details className="mt-4 rounded-lg bg-gray-100 p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600">
              개발자 정보
            </summary>
            <pre className="mt-2 overflow-auto text-xs">
              {JSON.stringify(
                {
                  strategyId: selectedStrategyId,
                  selections: result.selections.length,
                  totalRaces: result.totalRacesScreened,
                  totalEntries: result.totalEntriesScreened,
                  cache: result.cache,
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
