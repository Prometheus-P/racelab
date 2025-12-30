/**
 * Entrant Radar Chart
 *
 * EntrantCard에서 사용하는 RadarChart 컴포넌트
 * recharts 의존성이 있어 동적 로딩용으로 분리
 */

'use client';

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
    score: safeStats[key],
  }));
}

export interface EntrantRadarChartProps {
  stats?: EntrantStats;
}

export function EntrantRadarChart({ stats }: EntrantRadarChartProps) {
  const radarData = useMemo(() => toRadarData(stats), [stats]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={radarData} outerRadius="70%">
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5f5', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
        <Radar
          name="능력치"
          dataKey="score"
          stroke="#38bdf8"
          fill="#38bdf8"
          fillOpacity={0.35}
          isAnimationActive={false}
        />
        <Tooltip
          formatter={(value) => `${value}/100`}
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default EntrantRadarChart;
