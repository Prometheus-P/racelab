/**
 * Lazy-loaded Entrant Radar Chart
 *
 * recharts RadarChart 동적 로딩으로 번들 최적화
 */

'use client';

import dynamic from 'next/dynamic';
import type { EntrantRadarChartProps } from './EntrantRadarChart';

const RadarSkeleton = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-32 w-32 animate-pulse rounded-full bg-slate-700" />
  </div>
);

export const LazyEntrantRadarChart = dynamic<EntrantRadarChartProps>(
  () => import('./EntrantRadarChart').then((mod) => mod.EntrantRadarChart),
  {
    loading: () => <RadarSkeleton />,
    ssr: false,
  }
);

export default LazyEntrantRadarChart;
