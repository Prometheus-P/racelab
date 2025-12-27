'use client';

import { TrendingUp, TrendingDown, Target, Shield, BarChart2, Wallet } from 'lucide-react';
import type { BacktestResult } from '@/lib/dashboard/mockResults';

interface ResultsSummaryProps {
  result: BacktestResult | null;
  isLoading?: boolean;
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
}

function MetricCard({ label, value, subValue, icon, positive, negative }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-neutral-divider bg-white p-4">
      <div className="flex items-center gap-2 text-neutral-text-secondary">
        {icon}
        <span className="text-label-medium">{label}</span>
      </div>
      <div className="mt-2">
        <span
          className={`font-mono text-headline-small font-bold ${
            positive ? 'text-bullish' : negative ? 'text-bearish' : 'text-neutral-text-primary'
          }`}
        >
          {value}
        </span>
        {subValue && (
          <span className="ml-2 text-body-small text-neutral-text-secondary">{subValue}</span>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-divider bg-white p-4">
      <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-8 w-24 animate-pulse rounded bg-neutral-200" />
    </div>
  );
}

export function ResultsSummary({ result, isLoading }: ResultsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-neutral-divider bg-surface-dim p-8 text-center">
        <BarChart2 className="mx-auto h-12 w-12 text-neutral-text-secondary opacity-50" />
        <p className="mt-3 text-body-medium text-neutral-text-secondary">
          전략을 선택하고 백테스트를 실행하세요
        </p>
      </div>
    );
  }

  const { summary } = result;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <MetricCard
        label="승률"
        value={`${summary.winRate}%`}
        subValue={`${summary.winningBets}승 ${summary.losingBets}패`}
        icon={<Target className="h-4 w-4" />}
        positive={summary.winRate >= 50}
        negative={summary.winRate < 40}
      />
      <MetricCard
        label="수익률"
        value={`${summary.roi >= 0 ? '+' : ''}${summary.roi}%`}
        icon={summary.roi >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        positive={summary.roi > 0}
        negative={summary.roi < 0}
      />
      <MetricCard
        label="최대 손실"
        value={`${summary.maxDrawdown}%`}
        icon={<TrendingDown className="h-4 w-4" />}
        negative={summary.maxDrawdown < -10}
      />
      <MetricCard
        label="안정성 지수"
        value={summary.sharpeRatio.toFixed(2)}
        icon={<Shield className="h-4 w-4" />}
        positive={summary.sharpeRatio >= 1.5}
      />
      <MetricCard
        label="수익 배수"
        value={summary.profitFactor.toFixed(2)}
        icon={<BarChart2 className="h-4 w-4" />}
        positive={summary.profitFactor >= 1.5}
      />
      <MetricCard
        label="최종 자산"
        value={`${(summary.finalCapital / 10000).toFixed(0)}만원`}
        subValue={`시작: ${(summary.startCapital / 10000).toFixed(0)}만원`}
        icon={<Wallet className="h-4 w-4" />}
        positive={summary.finalCapital > summary.startCapital}
        negative={summary.finalCapital < summary.startCapital}
      />
    </div>
  );
}
