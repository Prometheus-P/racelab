// src/components/TodayRaces.tsx
import React from 'react';
import { Race, RaceType, TodayRacesData } from '@/types';
import { RACE_TYPES } from '@/config/raceTypes';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import type { RaceStatus } from './StatusBadge';

// Build component-specific styles from centralized RACE_TYPES config
function getRaceTypeStyles(type: RaceType) {
  const config = RACE_TYPES[type];
  return {
    icon: config.icon,
    label: config.label,
    color: config.color.primary,
    borderColor: config.color.border,
    bgHover: `hover:${config.color.bg}`,
    textColor: config.color.primary,
  };
}

interface RaceRowProps {
  race: Race;
  typeConfig: ReturnType<typeof getRaceTypeStyles>;
}

const RaceRow = ({ race, typeConfig }: RaceRowProps) => {
  const raceLabel = `${race.track} 제${race.raceNo}경주`;
  const distanceText = race.distance ? `${race.distance}m` : '';

  return (
    <Link
      href={`/race/${race.id}`}
      data-testid="race-card"
      aria-label={`${raceLabel} ${distanceText} ${race.startTime} 출발 - 상세 정보 보기`}
      className={`group flex min-h-[56px] items-center justify-between rounded-lg border border-transparent px-4 py-3 transition-all duration-150 ease-out hover:border-gray-200 hover:shadow-sm ${typeConfig.bgHover} focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2`}
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`text-xl ${typeConfig.textColor}`}>
          {typeConfig.icon}
        </span>
        <div>
          <span className="font-semibold text-gray-900">{raceLabel}</span>
          {distanceText && <span className="ml-2 text-sm text-gray-600">{distanceText}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={race.status as RaceStatus} />
        <time dateTime={race.startTime} className="font-mono text-lg font-bold text-gray-900">
          {race.startTime}
        </time>
        <span
          className={`hidden text-sm font-medium sm:inline ${typeConfig.textColor} group-hover:underline group-focus:underline`}
          aria-hidden="true"
        >
          상세보기
          <svg
            className="ml-1 inline-block h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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

  const config = getRaceTypeStyles(type);
  const headingId = `section-heading-${type}`;

  return (
    <section data-testid={dataTestId} aria-labelledby={headingId} className="mb-8">
      <h2
        id={headingId}
        className={`mb-4 flex items-center gap-2 border-b-2 pb-2 text-xl font-bold ${config.borderColor} `}
      >
        <span aria-hidden="true">{config.icon}</span>
        <span className={config.color}>{config.label}</span>
        <span className="ml-2 text-sm font-normal text-gray-500">({races.length}개 경주)</span>
      </h2>
      <ul className="space-y-2" role="list">
        {races.map((race) => (
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
    className="flex flex-col items-center justify-center px-4 py-12 text-center"
    role="status"
    aria-label="경주 정보 없음"
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <svg
        className="h-8 w-8 text-gray-400"
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
    <p className="mb-1 text-lg font-medium text-gray-900">오늘 예정된 경주가 없습니다</p>
    <p className="text-sm text-gray-500">다음 경주 일정을 확인해 주세요</p>
  </div>
);

interface TodayRacesProps {
  data: TodayRacesData;
  filter?: RaceType | 'all';
}

export default function TodayRaces({ data, filter = 'all' }: TodayRacesProps) {
  // Filter races based on selected tab
  let displayRaces: { horse: Race[]; cycle: Race[]; boat: Race[] };

  if (filter === 'horse') {
    displayRaces = { horse: data.horse, cycle: [], boat: [] };
  } else if (filter === 'cycle') {
    displayRaces = { horse: [], cycle: data.cycle, boat: [] };
  } else if (filter === 'boat') {
    displayRaces = { horse: [], cycle: [], boat: data.boat };
  } else {
    // 'all' or default - show all races
    displayRaces = { horse: data.horse, cycle: data.cycle, boat: data.boat };
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
