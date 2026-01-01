'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Zap, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// 프리셋 전략 데이터 (하드코딩 결과)
const PRESET_STRATEGIES = [
  {
    id: 'underdog',
    name: '인기마 역배팅',
    icon: Target,
    description: '인기순위 5위 이하 + 배당률 10배 이상',
    results: {
      winRate: 28.5,
      roi: 34.2,
      maxDrawdown: -18.5,
      totalBets: 156,
      period: '6개월',
    },
    color: 'cycle',
  },
  {
    id: 'odds-surge',
    name: '배당률 급등 추적',
    icon: Zap,
    description: '마감 30분 내 배당률 20% 이상 상승',
    results: {
      winRate: 42.3,
      roi: 23.7,
      maxDrawdown: -12.8,
      totalBets: 312,
      period: '6개월',
    },
    color: 'horse',
  },
  {
    id: 'stable',
    name: '안정형 복합 베팅',
    icon: Shield,
    description: '인기 1-3위 복승식 조합',
    results: {
      winRate: 67.3,
      roi: 8.5,
      maxDrawdown: -5.2,
      totalBets: 524,
      period: '6개월',
    },
    color: 'boat',
  },
];

interface ResultCardProps {
  label: string;
  value: string;
  isPositive?: boolean;
  isNegative?: boolean;
}

function ResultCard({ label, value, isPositive, isNegative }: ResultCardProps) {
  return (
    <div className="rounded-lg bg-surface-dim p-3 text-center">
      <p className="text-label-small text-neutral-text-secondary">{label}</p>
      <p
        className={`font-mono text-title-medium font-bold ${
          isPositive ? 'text-bullish' : isNegative ? 'text-bearish' : 'text-neutral-text-primary'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function InteractiveDemo() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleStrategyClick = (strategyId: string) => {
    if (isAnimating) return;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);
    setShowResults(false);
    setSelectedStrategy(strategyId);

    // 로딩 애니메이션 후 결과 표시
    timeoutRef.current = setTimeout(() => {
      setShowResults(true);
      setIsAnimating(false);
    }, 800);
  };

  const selectedData = PRESET_STRATEGIES.find((s) => s.id === selectedStrategy);

  return (
    <div className="rounded-2xl border border-neutral-divider bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <p className="text-label-medium text-neutral-text-secondary">전략 체험하기</p>
        <h3 className="mt-1 text-title-large font-bold text-neutral-text-primary">
          클릭 한 번으로 결과 확인
        </h3>
      </div>

      {/* Strategy Buttons */}
      <div className="mb-6 flex flex-col gap-2">
        {PRESET_STRATEGIES.map((strategy) => {
          const Icon = strategy.icon;
          const isSelected = selectedStrategy === strategy.id;

          return (
            <button
              key={strategy.id}
              onClick={() => handleStrategyClick(strategy.id)}
              disabled={isAnimating}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                isSelected
                  ? `border-${strategy.color} bg-${strategy.color}-container`
                  : 'border-neutral-divider bg-white hover:border-neutral-border hover:bg-surface-dim'
              } ${isAnimating ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  isSelected ? `bg-${strategy.color}` : 'bg-surface-dim'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-neutral-text-secondary'}`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`text-body-medium font-semibold ${
                    isSelected ? 'text-neutral-text-primary' : 'text-neutral-text-primary'
                  }`}
                >
                  {strategy.name}
                </p>
                <p className="text-label-small text-neutral-text-secondary">
                  {strategy.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Results Area */}
      <AnimatePresence mode="wait">
        {isAnimating && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-40 items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-horse border-t-transparent" />
              <p className="text-body-medium text-neutral-text-secondary">백테스트 실행 중...</p>
            </div>
          </motion.div>
        )}

        {showResults && selectedData && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Result Header */}
            <div className="flex items-center justify-between rounded-lg bg-horse-container p-3">
              <div className="flex items-center gap-2">
                {selectedData.results.roi >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-bullish" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-bearish" />
                )}
                <span className="text-body-medium font-medium text-neutral-text-primary">
                  {selectedData.results.period} 백테스트 결과
                </span>
              </div>
              <span className="text-label-small text-neutral-text-secondary">
                {selectedData.results.totalBets}회 베팅
              </span>
            </div>

            {/* Result Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="승률"
                value={`${selectedData.results.winRate}%`}
                isPositive={selectedData.results.winRate >= 50}
              />
              <ResultCard
                label="수익률"
                value={`${selectedData.results.roi >= 0 ? '+' : ''}${selectedData.results.roi}%`}
                isPositive={selectedData.results.roi >= 0}
                isNegative={selectedData.results.roi < 0}
              />
              <ResultCard
                label="최대 손실"
                value={`${selectedData.results.maxDrawdown}%`}
                isNegative
              />
              <ResultCard
                label="안정성 지수"
                value={(selectedData.results.roi / Math.abs(selectedData.results.maxDrawdown)).toFixed(2)}
                isPositive
              />
            </div>

            {/* CTA */}
            <Link
              href="/dashboard"
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cycle-bold py-3 text-label-large font-semibold text-white transition-all hover:bg-red-900"
            >
              내 전략 만들기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}

        {!isAnimating && !showResults && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-neutral-divider"
          >
            <p className="text-body-medium text-neutral-text-secondary">
              위 전략을 선택하면 결과를 확인할 수 있습니다
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
