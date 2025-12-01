// src/lib/api.ts
import { Race, Entry } from '@/types';
import {
  mapKRAHorseRaceToRace,
  mapKSPOCycleRaceToRace,
  mapKSPOBoatRaceToRace,
  KRAHorseRaceItem,
  KSPORaceItem
} from './api-helpers/mappers';
import { getDummyHorseRaces, getDummyCycleRaces, getDummyBoatRaces } from './api-helpers/dummy';


const KRA_BASE_URL = 'http://apis.data.go.kr/B551015';
const KSPO_BASE_URL = 'http://apis.data.go.kr/B551014';

// Helper function to aggregate races with the same ID
// API returns flat data with one row per entry, so we need to combine entries for the same race
function aggregateRaces(races: Race[]): Race[] {
  const raceMap = new Map<string, Race>();

  for (const race of races) {
    const existing = raceMap.get(race.id);
    if (existing) {
      // Merge entries
      existing.entries = [...(existing.entries || []), ...(race.entries || [])];
    } else {
      raceMap.set(race.id, { ...race, entries: [...(race.entries || [])] });
    }
  }

  return Array.from(raceMap.values());
}


// Generic API fetch function
async function fetchApi<T>(
  baseUrl: string,
  endpoint: string,
  apiKey: string | undefined,
  params: Record<string, string>,
  getDummyData: (rcDate: string) => T[],
  rcDate: string,
  apiName: string,
): Promise<unknown[]> {
  if (!apiKey) {
    console.warn(`${apiName}_API_KEY is not set. Returning dummy data.`);
    return getDummyData(rcDate);
  }

  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.append('serviceKey', apiKey);
  url.searchParams.append('numOfRows', '50');
  url.searchParams.append('pageNo', '1');
  url.searchParams.append('rc_date', rcDate);
  url.searchParams.append('_type', 'json');

  // Add any additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`${apiName} API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.response?.body?.items?.item || [];
}


export async function fetchHorseRaceSchedules(rcDate: string): Promise<Race[]> {
  const KRA_API_KEY = process.env.KRA_API_KEY;

  const rawItems = await fetchApi(
    KRA_BASE_URL,
    '/API214_17/raceHorse_1',
    KRA_API_KEY,
    {}, // No extra params for now
    getDummyHorseRaces,
    rcDate,
    'KRA'
  );

  const races = (rawItems as KRAHorseRaceItem[]).map(mapKRAHorseRaceToRace);
  return aggregateRaces(races);
}

export async function fetchCycleRaceSchedules(rcDate: string): Promise<Race[]> {
  const KSPO_API_KEY = process.env.KSPO_API_KEY;

  const rawItems = await fetchApi(
    KSPO_BASE_URL,
    '/API214_01/raceCycle_1',
    KSPO_API_KEY,
    {}, // No extra params for now
    getDummyCycleRaces,
    rcDate,
    'KSPO Cycle'
  );

  const races = (rawItems as KSPORaceItem[]).map(mapKSPOCycleRaceToRace);
  return aggregateRaces(races);
}

export async function fetchBoatRaceSchedules(rcDate: string): Promise<Race[]> {
  const KSPO_API_KEY = process.env.KSPO_API_KEY;

  const rawItems = await fetchApi(
    KSPO_BASE_URL,
    '/API214_02/raceBoat_1',
    KSPO_API_KEY,
    {}, // No extra params for now
    getDummyBoatRaces,
    rcDate,
    'KSPO Boat'
  );

  const races = (rawItems as KSPORaceItem[]).map(mapKSPOBoatRaceToRace);
  return aggregateRaces(races);
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