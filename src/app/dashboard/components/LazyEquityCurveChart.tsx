/**
 * Lazy-loaded EquityCurveChart
 *
 * recharts 동적 로딩으로 대시보드 초기 번들 최적화
 */

'use client';

import dynamic from 'next/dynamic';
import type { EquityPoint } from '@/lib/dashboard/mockResults';

interface LazyEquityCurveChartProps {
  data: EquityPoint[] | null;
  isLoading?: boolean;
}

const ChartLoadingSkeleton = () => (
  <div className="rounded-xl border border-neutral-divider bg-white p-4">
    <div className="mb-4 h-5 w-24 animate-pulse rounded bg-gray-200" />
    <div className="h-[300px] animate-pulse rounded bg-gray-100" />
  </div>
);

export const LazyEquityCurveChart = dynamic<LazyEquityCurveChartProps>(
  () => import('./EquityCurveChart').then((mod) => mod.EquityCurveChart),
  {
    loading: () => <ChartLoadingSkeleton />,
    ssr: false,
  }
);

export default LazyEquityCurveChart;
