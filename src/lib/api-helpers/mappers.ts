// src/lib/api-helpers/mappers.ts
import { Race, Entry, Odds, KSPOOddsResponse } from '@/types';

// Type definitions for raw API response items
export interface KRAHorseRaceItem {
  meet?: string;
  rcNo?: string;
  rcDate?: string;
  rcTime?: string;
  rcDist?: string;
  rank?: string;
  hrNo?: string;
  hrName?: string;
  jkName?: string;
  trName?: string;
  age?: string;
  wgHr?: string;
  rcRst?: string;
}

export interface KSPORaceItem {
  meet?: string;
  rcNo?: string;
  rcDate?: string;
  rcTime?: string;
  rcDist?: string;
  hrNo?: string;
  hrName?: string;
  age?: string;
  recentRecord?: string;
}

/**
 * Generate a unique race ID with validation
 * Throws error if required fields are missing to prevent invalid/duplicate IDs
 */
function generateRaceId(
  type: 'horse' | 'cycle' | 'boat',
  meet: string | undefined,
  rcNo: string | undefined,
  rcDate: string | undefined
): string {
  if (!meet || !rcNo || !rcDate) {
    // Log warning but don't throw to avoid breaking the app for bad API data
    console.warn(`Missing required fields for race ID generation: meet=${meet}, rcNo=${rcNo}, rcDate=${rcDate}`);
    // Generate a fallback ID with timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${type}-unknown-${timestamp}`;
  }
  return `${type}-${meet}-${rcNo}-${rcDate}`;
}

// Helper function to map KRA API response item to our internal Race type
export function mapKRAHorseRaceToRace(item: KRAHorseRaceItem): Race {
  // Extract entry data for horse races
  const entries: Entry[] = [];
  // For KRA API, entry data seems to be directly within the race item
  // based on API_SPECIFICATION.md and test mock.
  // Note: This is a simplified mapping. Real API might require separate calls for entries.
  if (item.hrNo && item.hrName) { // Check if entry data is present
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      jockey: item.jkName,
      trainer: item.trName,
      age: item.age ? parseInt(item.age) : undefined,
      weight: item.wgHr ? parseInt(item.wgHr) : undefined,
      recentRecord: item.rcRst,
      // odds will be added in Phase 2
    });
  }

  return {
    id: generateRaceId('horse', item.meet, item.rcNo, item.rcDate),
    type: 'horse',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: item.meet === '1' ? '서울' : item.meet === '2' ? '부산경남' : '제주',
    startTime: item.rcTime || '',
    distance: item.rcDist ? parseInt(item.rcDist) : undefined,
    grade: item.rank,
    status: 'upcoming',
    entries: entries,
  };
}

// Helper function to map KSPO Cycle API response item to our internal Race type
export function mapKSPOCycleRaceToRace(item: KSPORaceItem): Race {
  // Extract entry data for cycle races
  const entries: Entry[] = [];
  if (item.hrNo && item.hrName) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: item.age ? parseInt(item.age) : undefined,
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: generateRaceId('cycle', item.meet, item.rcNo, item.rcDate),
    type: 'cycle',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: item.meet === '1' ? '광명' : item.meet === '2' ? '창원' : '부산',
    startTime: item.rcTime || '',
    distance: item.rcDist ? parseInt(item.rcDist) : undefined,
    grade: undefined,
    status: 'upcoming',
    entries: entries,
  };
}

// Helper function to map KSPO Boat API response item to our internal Race type
export function mapKSPOBoatRaceToRace(item: KSPORaceItem): Race {
  // Extract entry data for boat races
  const entries: Entry[] = [];
  if (item.hrNo && item.hrName) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: item.age ? parseInt(item.age) : undefined,
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: generateRaceId('boat', item.meet, item.rcNo, item.rcDate),
    type: 'boat',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: '미사리',
    startTime: item.rcTime || '',
    distance: undefined,
    grade: undefined,
    status: 'upcoming',
    entries: entries,
  };
}

// Helper function to parse odds value from string
function parseOddsValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

// Helper function to map KSPO odds response to our internal Odds type
export function mapOddsResponse(kspoResponse: KSPOOddsResponse): Odds {
  return {
    win: parseOddsValue(kspoResponse.oddsDansng),
    place: parseOddsValue(kspoResponse.oddsBoksng),
    quinella: parseOddsValue(kspoResponse.oddsSsangsng),
  };
}