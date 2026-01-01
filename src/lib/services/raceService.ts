// src/lib/services/raceService.ts
// RaceService - High-level domain functions for race data

import { Race, Entry, Odds, RaceResult, RaceType } from '@/types';
import { fetchHorseRaceSchedules } from '../api/kraClient';
import { fetchCycleRaceSchedules } from '../api/kspoCycleClient';
import { fetchBoatRaceSchedules } from '../api/kspoBoatClient';
import { fetchRaceById, fetchRaceOdds, fetchRaceResults } from '../api';
import { getTodayYYYYMMDD } from '../utils/date';

/**
 * Result pattern for distinguishing success/failure from empty data
 */
export interface RaceResult_Success<T> {
  success: true;
  data: T;
  warnings?: string[];
}

export interface RaceResult_Failure {
  success: false;
  data: [];
  error: string;
  failedTypes?: RaceType[];
}

export type RaceServiceResult<T> = RaceResult_Success<T> | RaceResult_Failure;

/**
 * Race detail bundle containing race info, entries, odds, and results
 */
export interface RaceDetailBundle {
  race: Race;
  entries: Entry[];
  odds: Odds | null;
  results: RaceResult[];
}

/**
 * Fetch all races for today (all types)
 * 오늘의 경주 조회
 */
export async function getTodayRaces(): Promise<RaceServiceResult<Race[]>> {
  const today = getTodayYYYYMMDD();
  return getRacesByDateAndType(today);
}

/**
 * Fetch races by date and optionally by type
 * 특정 날짜/종목별 경주 조회
 * @param date Date in YYYYMMDD format
 * @param type Optional race type to filter
 * @returns Result pattern with success/failure status and warnings for partial failures
 */
export async function getRacesByDateAndType(
  date: string,
  type?: RaceType
): Promise<RaceServiceResult<Race[]>> {
  const fetchFunctions: Record<RaceType, () => Promise<Race[]>> = {
    horse: () => fetchHorseRaceSchedules(date),
    cycle: () => fetchCycleRaceSchedules(date),
    boat: () => fetchBoatRaceSchedules(date),
  };

  if (type) {
    // Fetch single type
    try {
      const data = await fetchFunctions[type]();
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching ${type} races for ${date}:`, error);
      return {
        success: false,
        data: [],
        error: `Failed to fetch ${type} races: ${errorMessage}`,
        failedTypes: [type],
      };
    }
  }

  // Fetch all types in parallel
  const types: RaceType[] = ['horse', 'cycle', 'boat'];
  const results = await Promise.allSettled(
    types.map((t) => fetchFunctions[t]())
  );

  const races: Race[] = [];
  const failedTypes: RaceType[] = [];
  const warnings: string[] = [];

  results.forEach((result, index) => {
    const raceType = types[index];
    if (result.status === 'fulfilled') {
      races.push(...result.value);
    } else {
      failedTypes.push(raceType);
      const reason = result.reason instanceof Error ? result.reason.message : 'Unknown error';
      warnings.push(`${raceType} API failed: ${reason}`);
      console.error(`Error fetching ${raceType} races:`, result.reason);
    }
  });

  // All failed
  if (failedTypes.length === types.length) {
    return {
      success: false,
      data: [],
      error: 'All race APIs failed',
      failedTypes,
    };
  }

  // Partial success (some failed but not all)
  return {
    success: true,
    data: races,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Fetch race detail with entries, odds, and results bundled together
 * 경주 상세 + 출전표 + 배당 + 결과 묶어서 조회
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function getRaceDetail(
  raceId: string
): Promise<RaceDetailBundle | null> {
  // First fetch the race
  const race = await fetchRaceById(raceId);
  if (!race) {
    return null;
  }

  // Fetch odds and results in parallel (graceful degradation)
  const [oddsResult, resultsResult] = await Promise.allSettled([
    fetchRaceOdds(raceId),
    fetchRaceResults(raceId),
  ]);

  const odds = oddsResult.status === 'fulfilled' ? oddsResult.value : null;
  const results = resultsResult.status === 'fulfilled' ? resultsResult.value : [];

  return {
    race,
    entries: race.entries || [],
    odds,
    results,
  };
}
