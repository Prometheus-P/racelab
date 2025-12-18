import { Race, RaceType } from '@/types';

export interface RecentRaceVM {
  id: string;
  title: string;
  date: string;
  type: RaceType;
  track: string;
  finish?: string;
}

export interface EntityProfileVM {
  id: string;
  name: string;
  role: 'horse' | 'jockey' | 'trainer';
  stats: {
    totalStarts: number;
    wins: number;
    top3: number;
  };
  affiliations?: string;
  recentRaces: RecentRaceVM[];
  freshness: 'realtime' | 'snapshot';
  updatedAt: string;
}

export function buildEntityProfileVM(
  role: EntityProfileVM['role'],
  id: string,
  races: Race[]
): EntityProfileVM {
  const matchingEntries = races.filter((race) =>
    race.entries.some((entry) =>
      role === 'horse'
        ? entry.name === id
        : role === 'jockey'
          ? entry.jockey === id
          : entry.trainer === id
    )
  );

  const totalStarts = matchingEntries.length;
  const wins = 0;
  const top3 = 0;

  const recentRaces: RecentRaceVM[] = matchingEntries.map((race) => ({
    id: race.id,
    title: `${race.track} 제${race.raceNo}경주`,
    date: race.date ?? '날짜 확인중',
    type: race.type,
    track: race.track,
    finish: race.status === 'finished' ? '완주' : undefined,
  }));

  return {
    id,
    name: id,
    role,
    stats: {
      totalStarts,
      wins,
      top3,
    },
    recentRaces,
    freshness: 'snapshot',
    updatedAt: new Date().toISOString(),
  };
}
