// src/lib/api.ts
import { Race, Entry, HistoricalRace, ResultsSearchParams, PaginatedResults } from '@/types';
import {
  mapKRA299ToRaces,
  mapKSPOCycleRaceOrganToRaces,
  mapKSPOBoatRaceInfoToRaces,
  KRA299ResultItem,
  KSPOCycleRaceOrganItem,
  KSPOBoatRaceInfoItem,
} from './api-helpers/mappers';
import { getDummyHorseRaces, getDummyCycleRaces, getDummyBoatRaces, getDummyHistoricalResults, getDummyHistoricalRaceById } from './api-helpers/dummy';


const KRA_BASE_URL = 'https://apis.data.go.kr/B551015';
const KSPO_BASE_URL = 'https://apis.data.go.kr/B551014';


// Generic API fetch function with flexible date parameter
async function fetchApi<T>(
  baseUrl: string,
  endpoint: string,
  apiKey: string | undefined,
  params: Record<string, string>,
  getDummyData: (rcDate: string) => T[],
  rcDate: string,
  apiName: string,
  envVarName: string,
  dateParamName: string = 'rc_date',
): Promise<unknown[]> {
  if (!apiKey) {
    console.warn(`[${apiName}] ${envVarName} is not set. Returning dummy data.`);
    return getDummyData(rcDate);
  }

  const url = new URL(`${baseUrl}${endpoint}`);

  url.searchParams.append('numOfRows', '100');
  url.searchParams.append('pageNo', '1');
  url.searchParams.append(dateParamName, rcDate);
  url.searchParams.append('_type', 'json');

  // Add any additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  // serviceKey must be pre-encoded (from data.go.kr "Encoding" key)
  // Append directly to avoid double-encoding by URLSearchParams
  const finalUrl = `${url.toString()}&serviceKey=${apiKey}`;

  try {
    const response = await fetch(finalUrl, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error(`${apiName} API Error: ${response.status}. Falling back to dummy data.`);
      return getDummyData(rcDate);
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    // If API returns empty data, fallback to dummy data for better UX
    if (items.length === 0) {
      console.warn(`${apiName} API returned empty data. Returning dummy data.`);
      return getDummyData(rcDate);
    }

    return items;
  } catch (error) {
    console.error(`${apiName} API fetch failed:`, error);
    console.warn(`Falling back to dummy data for ${apiName}.`);
    return getDummyData(rcDate);
  }
}


export async function fetchHorseRaceSchedules(rcDate: string): Promise<Race[]> {
  const KRA_API_KEY = process.env.KRA_API_KEY;

  // Try API299 (경주결과종합) first - works with our API key
  const rawItems = await fetchApi(
    KRA_BASE_URL,
    '/API299/Race_Result_total',
    KRA_API_KEY,
    {},
    getDummyHorseRaces,
    rcDate,
    'KRA API299',
    'KRA_API_KEY'
  );

  // API299 returns grouped race result data
  const races = mapKRA299ToRaces(rawItems as KRA299ResultItem[]);
  return races;
}

export async function fetchCycleRaceSchedules(rcDate: string): Promise<Race[]> {
  const KSPO_API_KEY = process.env.KSPO_API_KEY;

  // Use approved API: SRVC_OD_API_CRA_RACE_ORGAN (경륜 출주표)
  const rawItems = await fetchApi(
    KSPO_BASE_URL,
    '/SRVC_OD_API_CRA_RACE_ORGAN/TODZ_API_CRA_RACE_ORGAN_I',
    KSPO_API_KEY,
    { resultType: 'json' },
    getDummyCycleRaces,
    rcDate,
    'KSPO Cycle',
    'KSPO_API_KEY'
  );

  // Use new mapper for approved API format
  const races = mapKSPOCycleRaceOrganToRaces(rawItems as KSPOCycleRaceOrganItem[], rcDate);
  return races;
}

export async function fetchBoatRaceSchedules(rcDate: string): Promise<Race[]> {
  const KSPO_API_KEY = process.env.KSPO_API_KEY;

  // Use approved API: SRVC_OD_API_VWEB_MBR_RACE_INFO (경정 출주표)
  const rawItems = await fetchApi(
    KSPO_BASE_URL,
    '/SRVC_OD_API_VWEB_MBR_RACE_INFO/TODZ_API_VWEB_MBR_RACE_I',
    KSPO_API_KEY,
    { resultType: 'json' },
    getDummyBoatRaces,
    rcDate,
    'KSPO Boat',
    'KSPO_API_KEY'
  );

  // Use new mapper for approved API format
  const races = mapKSPOBoatRaceInfoToRaces(rawItems as KSPOBoatRaceInfoItem[], rcDate);
  return races;
}

export async function fetchRaceById(id: string): Promise<Race | null> {
  const [type, , , date] = id.split('-');

  let races: Race[] = [];
  switch (type) {
    case 'horse':
      races = await fetchHorseRaceSchedules(date);
      break;
    case 'cycle':
      races = await fetchCycleRaceSchedules(date);
      break;
    case 'boat':
      races = await fetchBoatRaceSchedules(date);
      break;
  }

  return races.find(race => race.id === id) || null;
}

export async function fetchRaceEntries(raceId: string): Promise<Entry[] | null> {
  const race = await fetchRaceById(raceId);

  if (!race) {
    return null;
  }

  // For now, return the entries from the race object
  // In the future, this will call the actual API for detailed entry information
  return race.entries || [];
}

export async function fetchRaceOdds(raceId: string): Promise<Array<{ no: number; name: string; odds: number }> | null> {
  const entries = await fetchRaceEntries(raceId);

  if (!entries) {
    return null;
  }

  // Extract odds information from entries
  // In the future, this will call the actual API for real-time odds
  return entries.map(entry => ({
    no: entry.no,
    name: entry.name,
    odds: entry.odds || 0,
  }));
}

export interface RaceResult {
  rank: number;
  no: number;
  name: string;
  jockey: string;
  time: string;
  diff: string;
}

export async function fetchRaceResults(raceId: string): Promise<RaceResult[] | null> {
  const race = await fetchRaceById(raceId);

  if (!race) {
    return null;
  }

  // For now, return empty array as results are not yet available
  // In the future, this will call the actual API for race results
  // For completed races, it will return actual results
  return [];
}

// ============================================
// Historical Race Results API
// ============================================

/**
 * Fetch historical race results with filtering and pagination
 */
export async function fetchHistoricalResults(
  params: ResultsSearchParams
): Promise<PaginatedResults<HistoricalRace>> {
  const {
    dateFrom,
    dateTo,
    types,
    track,
    jockey,
    page = 1,
    limit = 20,
  } = params;

  // Default to today if no dates provided
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fromDate = dateFrom || today;
  const toDate = dateTo || today;

  // For now, use dummy data
  // In the future, this will call the actual APIs (KRA API299, KSPO APIs)
  let results = getDummyHistoricalResults(fromDate, toDate, types, track);

  // Filter by jockey name if provided
  if (jockey) {
    results = results.filter(race =>
      race.results.some(r => r.jockey?.includes(jockey))
    );
  }

  // Calculate pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = results.slice(startIndex, endIndex);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetch a single historical race result by ID
 */
export async function fetchHistoricalResultById(id: string): Promise<HistoricalRace | null> {
  // For now, use dummy data
  // In the future, this will call the actual API based on race type
  return getDummyHistoricalRaceById(id);
}