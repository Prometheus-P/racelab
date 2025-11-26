// src/components/TodayRaces.tsx
import React from 'react';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';
import { getTodayYYYYMMDD } from '@/lib/utils/date';
import { Race, RaceType } from '@/types';
import Link from 'next/link';

// Race type configuration for consistent styling
const raceTypeConfig: Record<RaceType, {
  icon: string;
  label: string;
  color: string;
  borderColor: string;
  bgHover: string;
  textColor: string;
}> = {
  horse: {
    icon: '🐎',
    label: '경마',
    color: 'text-horse',
    borderColor: 'border-horse',
    bgHover: 'hover:bg-horse/5',
    textColor: 'text-horse',
  },
  cycle: {
    icon: '🚴',
    label: '경륜',
    color: 'text-cycle',
    borderColor: 'border-cycle',
    bgHover: 'hover:bg-cycle/5',
    textColor: 'text-cycle',
  },
  boat: {
    icon: '🚤',
    label: '경정',
    color: 'text-boat',
    borderColor: 'border-boat',
    bgHover: 'hover:bg-boat/5',
    textColor: 'text-boat',
  },
};

interface RaceRowProps {
  race: Race;
  typeConfig: typeof raceTypeConfig[RaceType];
}

const RaceRow = ({ race, typeConfig }: RaceRowProps) => {
  const raceLabel = `${race.track} 제${race.raceNo}경주`;
  const distanceText = race.distance ? `${race.distance}m` : '';

  return (
    <Link
      href={`/race/${race.id}`}
      data-testid="race-card"
      aria-label={`${raceLabel} ${distanceText} ${race.startTime} 출발 - 상세 정보 보기`}
      className={`
        group flex justify-between items-center
        min-h-[56px] px-4 py-3
        rounded-lg border border-transparent
        transition-all duration-150 ease-out
        hover:border-gray-200 hover:shadow-sm ${typeConfig.bgHover}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
      `}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`text-xl ${typeConfig.textColor}`}
        >
          {typeConfig.icon}
        </span>
        <div>
          <span className="font-semibold text-gray-900">{raceLabel}</span>
          {distanceText && (
            <span className="text-sm text-gray-600 ml-2">{distanceText}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <time
          dateTime={race.startTime}
          className="font-mono font-bold text-lg text-gray-900"
        >
          {race.startTime}
        </time>
        <span
          className={`
            text-sm font-medium ${typeConfig.textColor}
            group-hover:underline group-focus:underline
          `}
          aria-hidden="true"
        >
          상세보기
          <svg
            className="inline-block w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
};

interface RaceSectionProps {
  type: RaceType;
  races: Race[];
  'data-testid': string;
}

const RaceSection = ({ type, races, 'data-testid': dataTestId }: RaceSectionProps) => {
  if (races.length === 0) return null;

  const config = raceTypeConfig[type];
  const headingId = `section-heading-${type}`;

  return (
    <section
      data-testid={dataTestId}
      aria-labelledby={headingId}
      className="mb-8"
    >
      <h2
        id={headingId}
        className={`
          flex items-center gap-2
          text-xl font-bold mb-4 pb-2
          border-b-2 ${config.borderColor}
        `}
      >
        <span aria-hidden="true">{config.icon}</span>
        <span className={config.color}>{config.label}</span>
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({races.length}개 경주)
        </span>
      </h2>
      <ul className="space-y-2" role="list">
        {races.map(race => (
          <li key={race.id}>
            <RaceRow race={race} typeConfig={config} />
          </li>
        ))}
      </ul>
    </section>
  );
};

// Empty state component
const EmptyState = () => (
  <div
    className="flex flex-col items-center justify-center py-12 px-4 text-center"
    role="status"
    aria-label="경주 정보 없음"
  >
    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <p className="text-lg font-medium text-gray-900 mb-1">
      오늘 예정된 경주가 없습니다
    </p>
    <p className="text-sm text-gray-500">
      다음 경주 일정을 확인해 주세요
    </p>
  </div>
);

export default async function TodayRaces({ filter = 'all' }: { filter?: string }) {
  const rcDate = getTodayYYYYMMDD();
  const [horseRaces, cycleRaces, boatRaces] = await Promise.all([
    fetchHorseRaceSchedules(rcDate),
    fetchCycleRaceSchedules(rcDate),
    fetchBoatRaceSchedules(rcDate),
  ]);

  // Filter races based on selected tab
  let displayRaces: { horse: Race[]; cycle: Race[]; boat: Race[] };

  if (filter === 'horse') {
    displayRaces = { horse: horseRaces, cycle: [], boat: [] };
  } else if (filter === 'cycle') {
    displayRaces = { horse: [], cycle: cycleRaces, boat: [] };
  } else if (filter === 'boat') {
    displayRaces = { horse: [], cycle: [], boat: boatRaces };
  } else {
    // 'all' or default - show all races
    displayRaces = { horse: horseRaces, cycle: cycleRaces, boat: boatRaces };
  }

  const allRaces = [...displayRaces.horse, ...displayRaces.cycle, ...displayRaces.boat];

  if (allRaces.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <RaceSection type="horse" races={displayRaces.horse} data-testid="race-section-horse" />
      <RaceSection type="cycle" races={displayRaces.cycle} data-testid="race-section-cycle" />
      <RaceSection type="boat" races={displayRaces.boat} data-testid="race-section-boat" />
    </div>
  );
}