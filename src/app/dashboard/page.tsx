'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import {
  StrategySelector,
  PeriodSelector,
  ResultsSummary,
  BetHistoryTable,
  type Period,
} from './components';
import { LazyEquityCurveChart } from './components/LazyEquityCurveChart';
import { getBacktestResult, type BacktestResult } from '@/lib/dashboard/mockResults';
import { getStrategyById } from '@/lib/dashboard/presetStrategies';

export default function DashboardPage() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('3months');
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const selectedStrategy = selectedStrategyId ? getStrategyById(selectedStrategyId) : null;

  const handleRunBacktest = useCallback(async () => {
    if (!selectedStrategyId) return;

    setIsLoading(true);
    setHasRun(true);

    // UX용 딜레이 (실제 계산하는 느낌)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const backtestResult = getBacktestResult(selectedStrategyId, selectedPeriod);
    setResult(backtestResult);
    setIsLoading(false);
  }, [selectedStrategyId, selectedPeriod]);

  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Header */}
      <header className="border-b border-neutral-divider bg-white">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-body-medium text-neutral-text-secondary hover:text-neutral-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>
          <div className="h-4 w-px bg-neutral-divider" />
          <h1 className="text-title-medium font-bold text-neutral-text-primary">
            전략 백테스트
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Strategy Selector */}
            <div className="rounded-xl border border-neutral-divider bg-white p-4">
              <StrategySelector
                selectedId={selectedStrategyId}
                onSelect={setSelectedStrategyId}
              />
            </div>

            {/* Period Selector */}
            <div className="rounded-xl border border-neutral-divider bg-white p-4">
              <PeriodSelector selected={selectedPeriod} onSelect={setSelectedPeriod} />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunBacktest}
              disabled={!selectedStrategyId || isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-label-large font-semibold transition-all ${
                selectedStrategyId && !isLoading
                  ? 'bg-horse text-white hover:bg-horse-dark active:scale-[0.98]'
                  : 'cursor-not-allowed bg-neutral-border text-neutral-text-secondary'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  백테스트 실행
                </>
              )}
            </button>

            {/* Selected Strategy Info */}
            {selectedStrategy && (
              <div className="rounded-xl border border-neutral-divider bg-white p-4">
                <h3 className="text-title-small font-semibold text-neutral-text-primary">
                  선택된 전략
                </h3>
                <p className="mt-1 text-body-medium font-medium text-horse">
                  {selectedStrategy.name}
                </p>
                <p className="mt-1 text-body-small text-neutral-text-secondary">
                  {selectedStrategy.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* Results Summary */}
            <ResultsSummary result={result} isLoading={isLoading} />

            {/* Equity Curve Chart - Lazy loaded for bundle optimization */}
            <LazyEquityCurveChart
              data={result?.equityCurve ?? null}
              isLoading={isLoading}
            />

            {/* Bet History Table */}
            <BetHistoryTable
              records={result?.betHistory ?? null}
              isLoading={isLoading}
            />

            {/* Empty State Message */}
            {!hasRun && !isLoading && (
              <div className="rounded-xl border border-dashed border-neutral-border bg-white p-8 text-center">
                <p className="text-body-large text-neutral-text-secondary">
                  왼쪽에서 전략을 선택하고 <strong>&quot;백테스트 실행&quot;</strong> 버튼을 누르세요
                </p>
                <p className="mt-2 text-body-small text-neutral-text-secondary">
                  프리셋 전략의 과거 성과를 분석해볼 수 있습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-divider bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-body-small text-neutral-text-secondary">
            * 이 결과는 과거 데이터 기반의 시뮬레이션이며, 실제 수익을 보장하지 않습니다.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link href="/pricing" className="text-body-small text-primary hover:underline">
              Pro 요금제 알아보기
            </Link>
            <span className="text-neutral-border">|</span>
            <Link href="/" className="text-body-small text-primary hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
