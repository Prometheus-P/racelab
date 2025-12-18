import { Race } from '@/types';
import { formatDate, getKoreanDate } from '@/lib/utils/date';

export type BookViewMode = 'compact' | 'expert';
export type DataFreshness = 'realtime' | 'snapshot' | 'delayed';

export interface FormLine {
  date?: string;
  venue?: string;
  distance?: string;
  finish?: string;
  time?: string;
}

export interface RunnerVM {
  number: number;
  name: string;
  age?: number;
  sex?: string;
  jockey?: string;
  trainer?: string;
  odds?: number;
  popularity?: number;
  formLines: FormLine[];
}

export interface RaceVM {
  id: string;
  startTime: string;
  grade?: string;
  distance?: number;
  title?: string;
  runners: RunnerVM[];
}

export interface VenueVM {
  id: string;
  name: string;
  type: Race['type'];
  races: RaceVM[];
}

export interface BookVM {
  date: string;
  updatedAt: string;
  freshness: DataFreshness;
  snapshotAt?: string;
  venues: VenueVM[];
  hasData: boolean;
}

interface BuildBookVMOptions {
  date: string;
  races: Race[];
  snapshotUpdatedAt?: string;
}

function buildFormLines(recentRecord?: string): FormLine[] {
  if (!recentRecord) {
    return [];
  }

  const tokens = recentRecord
    .split(/[,\s/]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(-8);

  return tokens.map((finish, index) => ({
    finish,
    date: `최근 ${tokens.length - index}회`,
  }));
}

function buildRunnerVM(race: Race): RunnerVM[] {
  return race.entries.map((entry) => ({
    number: entry.no,
    name: entry.name,
    age: entry.age,
    sex: undefined,
    jockey: entry.jockey,
    trainer: entry.trainer,
    odds: entry.odds,
    popularity: undefined,
    formLines: buildFormLines(entry.recentRecord),
  }));
}

function groupRacesByVenue(races: Race[]): VenueVM[] {
  const venueMap = new Map<string, VenueVM>();

  races.forEach((race) => {
    const key = `${race.type}-${race.track}`;
    if (!venueMap.has(key)) {
      venueMap.set(key, {
        id: key,
        name: race.track,
        type: race.type,
        races: [],
      });
    }

    const venue = venueMap.get(key);
    if (!venue) return;

    const raceVm: RaceVM = {
      id: race.id,
      startTime: race.startTime,
      grade: race.grade,
      distance: race.distance,
      title: `${race.track} 제${race.raceNo}경주`,
      runners: buildRunnerVM(race),
    };

    venue.races.push(raceVm);
  });

  return Array.from(venueMap.values()).map((venue) => ({
    ...venue,
    races: venue.races.sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));
}

export function buildBookViewModel({ date, races, snapshotUpdatedAt }: BuildBookVMOptions): BookVM {
  const venues = groupRacesByVenue(races);
  const hasData = venues.some((venue) => venue.races.length > 0);
  const updatedAt = snapshotUpdatedAt ?? getKoreanDate().toISOString();

  const targetDate = new Date(`${date}T00:00:00`);
  const isToday = formatDate(getKoreanDate()) === formatDate(targetDate);

  const freshness: DataFreshness = hasData
    ? isToday
      ? 'realtime'
      : 'snapshot'
    : 'snapshot';

  return {
    date,
    updatedAt,
    snapshotAt: snapshotUpdatedAt,
    freshness,
    venues,
    hasData,
  };
}
