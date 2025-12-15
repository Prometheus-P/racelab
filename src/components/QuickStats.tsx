// src/components/QuickStats.tsx
import React from 'react';
import { RaceType, TodayRacesData } from '@/types';
import { RACE_TYPES } from '@/config/raceTypes';

// Stat card configuration interface
interface StatCardConfig {
  icon?: string;
  label: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

// Total stat config (not from RACE_TYPES since it's not a race type)
const totalStatConfig: StatCardConfig = {
  icon: '🏁',
  label: '총 경주',
  accentColor: 'bg-primary',
  bgColor: 'bg-primary/5',
  borderColor: 'border-primary/20',
  textColor: 'text-primary',
};

// Build stat config from centralized RACE_TYPES
function getStatConfig(type: 'total' | RaceType): StatCardConfig {
  if (type === 'total') {
    return totalStatConfig;
  }
  const config = RACE_TYPES[type];
  return {
    icon: config.icon,
    label: config.label,
    accentColor: config.color.border.replace('border-', 'bg-'),
    bgColor: config.color.bg,
    borderColor: `${config.color.border}/20`,
    textColor: config.color.primary,
  };
}

interface StatCardProps {
  type: 'total' | RaceType;
  value: number;
}

const StatCard = ({ type, value }: StatCardProps) => {
  const config = getStatConfig(type);
  const isTotal = type === 'total';

  return (
    <article
      className={`relative overflow-hidden ${isTotal ? 'bg-white' : config.bgColor} rounded-xl border p-3 md:p-4 ${config.borderColor} min-h-[80px] shadow-sm transition-shadow duration-150 ease-out hover:shadow-md`}
      aria-labelledby={`stat-label-${type}`}
    >
      {/* Accent bar */}
      <div
        className={`absolute left-0 right-0 top-0 h-1 ${config.accentColor}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div>
          <p id={`stat-label-${type}`} className="mb-1 text-sm font-medium text-gray-600">
            {config.label}
          </p>
          <p
            className={`text-2xl font-bold tabular-nums md:text-3xl ${config.textColor}`}
            aria-label={`${value}개`}
          >
            {value.toLocaleString('ko-KR')}
          </p>
        </div>
        {config.icon && (
          <span aria-hidden="true" className={`text-2xl ${isTotal ? 'opacity-80' : 'opacity-60'}`}>
            {config.icon}
          </span>
        )}
      </div>

      {/* Unit label for screen readers */}
      <span className="sr-only">개 경주 예정</span>
    </article>
  );
};

interface QuickStatsProps {
  data: TodayRacesData;
}

export default function QuickStats({ data }: QuickStatsProps) {
  const stats = {
    horse: data.horse.length,
    cycle: data.cycle.length,
    boat: data.boat.length,
    total: data.horse.length + data.cycle.length + data.boat.length,
  };

  return (
    <section aria-label="오늘의 경주 통계" className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard type="total" value={stats.total} />
      <StatCard type="horse" value={stats.horse} />
      <StatCard type="cycle" value={stats.cycle} />
      <StatCard type="boat" value={stats.boat} />
    </section>
  );
}
