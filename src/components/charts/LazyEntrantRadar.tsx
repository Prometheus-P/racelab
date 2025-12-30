/**
 * Lazy-loaded Entrant Radar Chart
 *
 * recharts RadarChart 동적 로딩으로 번들 최적화
 */

'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type { EntrantStats } from '@/types';

const statLabels: Record<keyof EntrantStats, string> = {
  speed: 'Speed',
  stamina: 'Stamina',
  recentWinRate: 'Recent Win Rate',
  condition: 'Condition',
};

function clampStat(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

function toRadarData(stats: EntrantStats | undefined) {
  const safeStats: EntrantStats = {
    speed: clampStat(stats?.speed),
    stamina: clampStat(stats?.stamina),
    recentWinRate: clampStat(stats?.recentWinRate),
    condition: clampStat(stats?.condition),
  };

  return (Object.keys(safeStats) as (keyof EntrantStats)[]).map((key) => ({
    metric: statLabels[key],
    value: safeStats[key],
    fullMark: 100,
  }));
}

interface EntrantRadarChartProps {
  stats?: EntrantStats;
  showHighlight?: boolean;
}

function EntrantRadarChartInner({ stats, showHighlight = false }: EntrantRadarChartProps) {
  const radarData = useMemo(() => toRadarData(stats), [stats]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={radarData} outerRadius="80%">
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip />
        <Radar
          name="Stats"
          dataKey="value"
          stroke={showHighlight ? '#3b82f6' : '#8884d8'}
          fill={showHighlight ? '#3b82f6' : '#8884d8'}
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

const RadarSkeleton = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200" />
  </div>
);

export const LazyEntrantRadarChart = dynamic(
  () => Promise.resolve(EntrantRadarChartInner),
  {
    loading: () => <RadarSkeleton />,
    ssr: false,
  }
);

export { EntrantRadarChartInner as EntrantRadarChart };
export type { EntrantRadarChartProps };
