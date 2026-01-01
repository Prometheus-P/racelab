// src/lib/api.ts
// Barrel file for API functions

import {
  Race,
  Entry,
  RaceResult,
  Odds,
  HistoricalRace,
  ResultsSearchParams,
  PaginatedResults,
  RaceType,
  TodayRacesData,
  RaceFetchStatus,
  RaceFetchResult,
} from '@/types';

import { MOCK_HISTORICAL_RACES } from './mockHistoricalResults';
import { getDummyRaces } from './api-helpers/dummy';

// Default timeout for API requests (10 seconds)
const DEFAULT_TIMEOUT = 10000;

/**
 * Fetch with timeout support
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 10000ms)
 * @throws Error with message 'Request timed out' if timeout exceeded
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Re-export client functions
export { fetchHorseRaceSchedules } from './api/kraClient';
export { fetchCycleRaceSchedules } from './api/kspoCycleClient';
export { fetchBoatRaceSchedules } from './api/kspoBoatClient';

// Import for internal use
import { fetchHorseRaceSchedules } from './api/kraClient';
import { fetchCycleRaceSchedules } from './api/kspoCycleClient';
import { fetchBoatRaceSchedules } from './api/kspoBoatClient';

/**
 * Fetch all race types for today in parallel
 * This is used by the home page to reduce API calls from 6 to 3
 * @param rcDate Date in YYYYMMDD format
 * @returns TodayRacesData with all race types and their fetch status
 */
export async function fetchTodayAllRaces(rcDate: string): Promise<TodayRacesData> {
  const results = await Promise.allSettled([
    fetchHorseRaceSchedules(rcDate),
    fetchCycleRaceSchedules(rcDate),
    fetchBoatRaceSchedules(rcDate),
  ]);

  const getStatus = (result: PromiseSettledResult<Race[]>): RaceFetchStatus => {
    if (result.status === 'fulfilled') {
      return 'OK';
    }
    return 'UPSTREAM_ERROR';
  };

  const getData = (result: PromiseSettledResult<Race[]>): Race[] => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return [];
  };

  return {
    horse: getData(results[0]),
    cycle: getData(results[1]),
    boat: getData(results[2]),
    status: {
      horse: getStatus(results[0]),
      cycle: getStatus(results[1]),
      boat: getStatus(results[2]),
    },
  };
}

/**
 * Fetch race by ID
 * @param id Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceById(id: string): Promise<Race | null> {
  // Parse ID to get type and date
  const parts = id.split('-');
  if (parts.length < 4) {
    console.warn(`Invalid race ID format: ${id}`);
    return null;
  }

  const [type, _meetCode, _raceNo, date] = parts;

  // Get races for that date and type
  let races: Race[] = [];

  try {
    if (type === 'horse') {
      const { fetchHorseRaceSchedules } = await import('./api/kraClient');
      races = await fetchHorseRaceSchedules(date);
    } else if (type === 'cycle') {
      const { fetchCycleRaceSchedules } = await import('./api/kspoCycleClient');
      races = await fetchCycleRaceSchedules(date);
    } else if (type === 'boat') {
      const { fetchBoatRaceSchedules } = await import('./api/kspoBoatClient');
      races = await fetchBoatRaceSchedules(date);
    }
  } catch (error) {
    console.error(`Error fetching race ${id}:`, error);
  }

  // If no races from API, try dummy data
  if (races.length === 0) {
    races = getDummyRaces(type as RaceType);
  }

  // Find the race by ID
  const race = races.find((r) => r.id === id);
  return race || null;
}

/**
 * Fetch race by ID with status result wrapper
 * Returns RaceFetchResult with status for proper error/empty handling
 * @param id Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceByIdWithStatus(id: string): Promise<RaceFetchResult<Race>> {
  // Parse ID to get type and date
  const parts = id.split('-');
  if (parts.length < 4) {
    console.warn(`Invalid race ID format: ${id}`);
    return { status: 'NOT_FOUND', data: null, error: 'Invalid race ID format' };
  }

  const [type, _meetCode, _raceNo, date] = parts;
  let races: Race[] = [];

  try {
    if (type === 'horse') {
      const { fetchHorseRaceSchedules } = await import('./api/kraClient');
      races = await fetchHorseRaceSchedules(date);
    } else if (type === 'cycle') {
      const { fetchCycleRaceSchedules } = await import('./api/kspoCycleClient');
      races = await fetchCycleRaceSchedules(date);
    } else if (type === 'boat') {
      const { fetchBoatRaceSchedules } = await import('./api/kspoBoatClient');
      races = await fetchBoatRaceSchedules(date);
    }
  } catch (error) {
    console.error(`Error fetching race ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { status: 'UPSTREAM_ERROR', data: null, error: errorMessage };
  }

  // Find the race by ID
  const race = races.find((r) => r.id === id);

  if (race) {
    return { status: 'OK', data: race };
  }

  // If no races from API, try dummy data (development only)
  if (process.env.NODE_ENV === 'development') {
    const dummyRaces = getDummyRaces(type as RaceType);
    const dummyRace = dummyRaces.find((r) => r.id === id);
    if (dummyRace) {
      return { status: 'OK', data: dummyRace };
    }
  }

  return { status: 'NOT_FOUND', data: null };
}

/**
 * Fetch entries for a specific race
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceEntries(raceId: string): Promise<Entry[]> {
  const race = await fetchRaceById(raceId);
  return race?.entries || [];
}

/**
 * Fetch odds for a specific race
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceOdds(_raceId: string): Promise<Odds | null> {
  // TODO: Implement actual odds fetching from API
  // For now, return null as odds are not yet available
  return null;
}

/**
 * Fetch results for a specific race
 * @param raceId Race ID in format type-meetCode-raceNo-date
 */
export async function fetchRaceResults(raceId: string): Promise<RaceResult[]> {
  // Parse ID to get type, meetCode, raceNo, date
  const parts = raceId.split('-');
  if (parts.length < 4) {
    console.warn(`Invalid race ID format: ${raceId}`);
    return [];
  }

  const [type, meetCode, raceNoStr, date] = parts;
  const raceNo = parseInt(raceNoStr, 10);

  if (isNaN(raceNo)) {
    console.warn(`Invalid race number in ID: ${raceId}`);
    return [];
  }

  try {
    if (type === 'horse') {
      const { fetchHorseRaceResults } = await import('./api/kraClient');
      return await fetchHorseRaceResults(date, meetCode, raceNo);
    }
    // TODO: Add support for cycle and boat race results
    return [];
  } catch (error) {
    console.error(`Error fetching results for ${raceId}:`, error);
    return [];
  }
}

/**
 * Fetch historical race results with pagination and filtering
 */
export async function fetchHistoricalResults(
  params: ResultsSearchParams
): Promise<PaginatedResults<HistoricalRace>> {
  const { page = 1, limit = 20, types, dateFrom, dateTo, track, jockey: _jockey } = params;

  // Filter mock data based on params
  let filteredRaces = [...MOCK_HISTORICAL_RACES];

  if (types && types.length > 0) {
    filteredRaces = filteredRaces.filter((race) => types.includes(race.type));
  }

  if (dateFrom) {
    filteredRaces = filteredRaces.filter((race) => race.date >= dateFrom);
  }

  if (dateTo) {
    filteredRaces = filteredRaces.filter((race) => race.date <= dateTo);
  }

  if (track) {
    filteredRaces = filteredRaces.filter((race) =>
      race.track.toLowerCase().includes(track.toLowerCase())
    );
  }

  // Calculate pagination
  const total = filteredRaces.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const items = filteredRaces.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch a specific historical race result by ID
 */
export async function fetchHistoricalResultById(
  id: string
): Promise<HistoricalRace | null> {
  const race = MOCK_HISTORICAL_RACES.find((r) => r.id === id);
  return race || null;
}

/**
 * Fetch horse entry detail (for detailed entry information)
 */
export async function fetchHorseEntryDetail(
  raceId: string
): Promise<Entry[] | null> {
  const race = await fetchRaceById(raceId);
  return race?.entries || null;
}

/**
 * Fetch historical race IDs for sitemap generation
 * Returns race IDs from the past N days for all race types
 *
 * @param days Number of days to look back (default 365)
 * @param offset Starting offset for pagination
 * @param limit Maximum number of results
 */
export interface RaceIdForSitemap {
  id: string;
  status: string;
  date: string;
  updatedAt?: string;
}

export async function fetchHistoricalRaceIds(
  days: number = 365,
  offset: number = 0,
  limit: number = 10000
): Promise<RaceIdForSitemap[]> {
  const raceIds: RaceIdForSitemap[] = [];

  // Get date range
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  // Use mock historical data for now (will be replaced with DB queries)
  for (const race of MOCK_HISTORICAL_RACES) {
    const raceDate = new Date(race.date);
    if (raceDate >= startDate && raceDate <= today) {
      raceIds.push({
        id: race.id,
        status: race.status,
        date: race.date,
      });
    }
  }

  // Apply pagination
  return raceIds.slice(offset, offset + limit);
}

/**
 * Get total count of historical races for sitemap splitting
 */
export async function getHistoricalRaceCount(days: number = 365): Promise<number> {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  let count = 0;
  for (const race of MOCK_HISTORICAL_RACES) {
    const raceDate = new Date(race.date);
    if (raceDate >= startDate && raceDate <= today) {
      count++;
    }
  }

  return count;
}
