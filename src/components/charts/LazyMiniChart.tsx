/**
 * Lazy-loaded MiniChart
 *
 * recharts (367KB) 동적 로딩으로 번들 최적화
 */

'use client';

import dynamic from 'next/dynamic';

const MiniChartSkeleton = () => (
  <div className="rounded-2xl border border-neutral-divider bg-white p-6 shadow-lg">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="text-right">
        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-5 w-14 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
    <div className="h-32 animate-pulse rounded bg-gray-100" />
    <div className="mt-4 grid grid-cols-3 gap-4 border-t border-neutral-divider pt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <div className="mx-auto h-3 w-10 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mt-1 h-5 w-12 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
);

export const LazyMiniChart = dynamic(
  () => import('../landing/MiniChart').then((mod) => mod.MiniChart),
  {
    loading: () => <MiniChartSkeleton />,
    ssr: false,
  }
);

export default LazyMiniChart;
