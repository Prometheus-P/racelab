// src/components/QuickStats.tsx
import React from 'react';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';
import { getTodayYYYYMMDD } from '@/lib/utils/date';
import { RaceType } from '@/types';

// Stat card configuration for consistent styling
interface StatCardConfig {
  icon?: string;
  label: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const statConfigs: Record<'total' | RaceType, StatCardConfig> = {
  total: {
    icon: '🏁',
    label: '총 경주',
    accentColor: 'bg-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
    textColor: 'text-primary',
  },
  horse: {
    icon: '🐎',
    label: '경마',
    accentColor: 'bg-horse',
    bgColor: 'bg-horse/5',
    borderColor: 'border-horse/20',
    textColor: 'text-horse',
  },
  cycle: {
    icon: '🚴',
    label: '경륜',
    accentColor: 'bg-cycle',
    bgColor: 'bg-cycle/5',
    borderColor: 'border-cycle/20',
    textColor: 'text-cycle',
  },
  boat: {
    icon: '🚤',
    label: '경정',
    accentColor: 'bg-boat',
    bgColor: 'bg-boat/5',
    borderColor: 'border-boat/20',
    textColor: 'text-boat',
  },
};

interface StatCardProps {
  type: 'total' | RaceType;
  value: number;
}

const StatCard = ({ type, value }: StatCardProps) => {
  const config = statConfigs[type];
  const isTotal = type === 'total';

  return (
    <article
      className={`
        relative overflow-hidden
        ${isTotal ? 'bg-white' : config.bgColor}
        p-4 rounded-xl
        border ${config.borderColor}
        shadow-sm hover:shadow-md
        transition-shadow duration-150 ease-out
      `}
      aria-labelledby={`stat-label-${type}`}
    >
      {/* Accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${config.accentColor}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between">
        <div>
          <p
            id={`stat-label-${type}`}
            className="text-sm font-medium text-gray-600 mb-1"
          >
            {config.label}
          </p>
          <p
            className={`text-3xl font-bold tabular-nums ${config.textColor}`}
            aria-label={`${value}개`}
          >
            {value.toLocaleString('ko-KR')}
          </p>
        </div>
        {config.icon && (
          <span
            aria-hidden="true"
            className={`text-2xl ${isTotal ? 'opacity-80' : 'opacity-60'}`}
          >
            {config.icon}
          </span>
        )}
      </div>

      {/* Unit label for screen readers */}
      <span className="sr-only">개 경주 예정</span>
    </article>
  );
};

export default async function QuickStats() {
  const rcDate = getTodayYYYYMMDD();
  const [horseRaces, cycleRaces, boatRaces] = await Promise.all([
    fetchHorseRaceSchedules(rcDate),
    fetchCycleRaceSchedules(rcDate),
    fetchBoatRaceSchedules(rcDate),
  ]);

  const stats = {
    horse: horseRaces.length,
    cycle: cycleRaces.length,
    boat: boatRaces.length,
    total: horseRaces.length + cycleRaces.length + boatRaces.length,
  };

  return (
    <section
      aria-label="오늘의 경주 통계"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <StatCard type="total" value={stats.total} />
      <StatCard type="horse" value={stats.horse} />
      <StatCard type="cycle" value={stats.cycle} />
      <StatCard type="boat" value={stats.boat} />
    </section>
  );
}