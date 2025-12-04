// src/lib/api.ts
import { Race, Entry, HistoricalRace, ResultsSearchParams, PaginatedResults, RaceType, Dividend } from '@/types';
import {
  mapKRA299ToRaces,
  mapKRAHorseEntryRegistration,
  mapKRAHorseEntryDetails,
  mapKRAHorseDividendSummary,
  mapKSPOCycleRaceOrganToRaces,
  mapKSPOBoatRaceInfoToRaces,
  mapKSPOBoatRaceRankings,
  mapKSPOBoatRaceResults,
  mapKSPOCycleRaceRankings,
  mapKSPOCycleRacerInfo,
  mapKSPOCycleRaceResults,
  mapKSPOCyclePayoffs,
  mapKSPOCycleExercise,
  mapKSPOCycleParts,
  mapKSPOCycleInspects,
  mapKSPOCycleInOut,
  KRA299ResultItem,
  KRAHorseEntryItem,
  KRAHorseEntryDetailItem,
  KRAHorseDividendSummaryItem,
  KSPOCycleRaceOrganItem,
  KSPOBoatRaceInfoItem,
  KSPOBoatRaceResultItem,
  KSPOCycleRaceResultItem,
  KSPOCycleRaceRankItem,
  KSPOCycleRacerInfoItem,
  KSPOCyclePayoffItem,
  KSPOCycleExerciseItem,
  KSPOCyclePartItem,
  KSPOCycleInspectItem,
  KSPOCycleInOutItem,
  KSPOBoatRaceRankItem,
} from './api-helpers/mappers';
import { getDummyHorseRaces, getDummyCycleRaces, getDummyBoatRaces, getDummyHistoricalResults, getDummyHistoricalRaceById } from './api-helpers/dummy';


const KRA_BASE_URL = 'https://apis.data.go.kr/B551015';
const KSPO_BASE_URL = 'https://apis.data.go.kr/B551014';
type HistoricalResultItem = Record<string, unknown>;


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

function normalizeDate(value: unknown): string {
  if (typeof value === 'string') return value.replace(/-/g, '');
  if (typeof value === 'number') return value.toString();
  return '';
}

function parseNumber(value: unknown): number | undefined {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? parseInt(value, 10) : NaN;
  return Number.isFinite(num) ? num : undefined;
}

function trackNameFromMeet(type: RaceType, meet: unknown): string {
  const meetStr = typeof meet === 'number' ? meet.toString() : (meet as string) || '';
  const meetMap: Record<RaceType, Record<string, string>> = {
    horse: { '1': '서울', '2': '부산경남', '3': '제주', '서울': '서울', '부산': '부산경남', '제주': '제주' },
    cycle: { '1': '광명', '2': '창원', '3': '부산', '광명': '광명', '창원': '창원', '부산': '부산' },
    boat: { '1': '미사리', '미사리': '미사리' },
  };
  return meetMap[type][meetStr] || meetStr || '서울';
}

function trackCodeFromName(type: RaceType, track: string): string {
  const codeMap: Record<RaceType, Record<string, string>> = {
    horse: { '서울': '1', '부산경남': '2', '제주': '3' },
    cycle: { '광명': '1', '창원': '2', '부산': '3' },
    boat: { '미사리': '1' },
  };
  return codeMap[type][track] || '1';
}

function extractStartTime(item: HistoricalResultItem): string {
  const iso = item.schStTime as string | undefined;
  if (iso) {
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
  }
  const rcTime = item.rcTime as string | undefined;
  if (rcTime) return rcTime;
  return '';
}

function mapToHistoricalRaces(type: RaceType, items: HistoricalResultItem[]): HistoricalRace[] {
  const raceMap = new Map<string, HistoricalRace>();

  for (const item of items) {
    const date = normalizeDate(item.rcDate);
    const raceNo = parseNumber(item.rcNo ?? item.raceNo);
    if (!date || !raceNo) continue;

    const track = trackNameFromMeet(type, item.meet ?? item.meet_nm ?? item.meetNm);
    const trackCode = trackCodeFromName(type, track);
    const id = `${type}-${trackCode}-${raceNo}-${date}`;

    let race = raceMap.get(id);
    if (!race) {
      race = {
        id,
        type,
        raceNo,
        track,
        date,
        startTime: extractStartTime(item),
        distance: parseNumber(item.rcDist),
        grade: (item.rank as string) || undefined,
        status: 'finished',
        results: [],
        dividends: [],
      };
      raceMap.set(id, race);
    }

    const rank = parseNumber(item.ord ?? item.rank_no) ?? race.results.length + 1;
    const entryNo = parseNumber(item.chulNo ?? item.hrNo ?? item.hr_no ?? item.hrno ?? item.back_no) ?? rank;
    const name = (item.hrName || item.hrNm || item.hr_name || item.hr_name_eng || item.hrNameEng || item.hr_name_en || item.racer_nm) as string | undefined;
    const jockey = (item.jkName || item.riderName || item.driverName || item.racer_nm) as string | undefined;
    const time = item.rcTime ? String(item.rcTime) : undefined;

    race.results.push({
      rank,
      entryNo,
      name: name || 'N/A',
      jockey,
      trainer: (item.trarNm as string) || undefined,
      time,
    });
  }

  return Array.from(raceMap.values()).map(race => ({
    ...race,
    results: race.results.sort((a, b) => a.rank - b.rank),
  })).sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.raceNo - b.raceNo;
  });
}

async function fetchHistoricalApiItems(
  baseUrl: string,
  endpoint: string,
  apiKey: string | undefined,
  rcDate: string,
  apiName: string,
  envVarName: string,
  dateParamName: string = 'rc_date',
): Promise<HistoricalResultItem[]> {
  if (!apiKey) {
    console.warn(`[${apiName}] ${envVarName} is not set. Skipping fetch.`);
    return [];
  }

  const url = new URL(`${baseUrl}${endpoint}`);

  url.searchParams.append('numOfRows', '100');
  url.searchParams.append('pageNo', '1');
  url.searchParams.append(dateParamName, rcDate);
  url.searchParams.append('_type', 'json');

  const finalUrl = `${url.toString()}&serviceKey=${apiKey}`;

  try {
    const response = await fetch(finalUrl, { next: { revalidate: 60 } });
    if (!response.ok) {
      console.error(`${apiName} API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error(`${apiName} API fetch failed:`, error);
    return [];
  }
}

function mapPayoffs(items: unknown[]): Dividend[] {
  return items.map(item => {
    const obj = item as Record<string, unknown>;
    const amount = parseNumber(obj.payoff ?? obj.amount ?? obj.dividend) || 0;
    const type = (obj.betType || obj.bettyp || obj.type || 'win') as Dividend['type'];
    const entriesRaw = obj.entries || obj.combination || obj.no || obj.noList || '';
    const entries = typeof entriesRaw === 'string'
      ? entriesRaw.split(/[^0-9]/).filter(Boolean).map(n => parseInt(n, 10))
      : Array.isArray(entriesRaw) ? (entriesRaw as unknown[]).map(e => parseNumber(e) || 0) : [];

    return {
      type: type === 'place' || type === 'quinella' ? type : 'win',
      entries: entries.length > 0 ? entries : [1],
      amount,
    };
  });
}

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
  const requestedTypes: RaceType[] = types && types.length > 0 ? types : ['horse', 'cycle', 'boat'];

  const resultBuckets: HistoricalRace[][] = [];

  for (const type of requestedTypes) {
    if (type === 'horse') {
      const items = await fetchHistoricalApiItems(
        KRA_BASE_URL,
        '/API299/Race_Result_total',
        process.env.KRA_API_KEY,
        fromDate,
        'KRA API299',
        'KRA_API_KEY'
      );
      resultBuckets.push(mapToHistoricalRaces('horse', items));
    } else if (type === 'cycle') {
      const items = await fetchHistoricalApiItems(
        KSPO_BASE_URL,
        '/SRVC_TODZ_CRA_RACE_RESULT',
        process.env.KSPO_API_KEY,
        fromDate,
        'KSPO Cycle Results',
        'KSPO_API_KEY'
      );
      resultBuckets.push(mapToHistoricalRaces('cycle', items));
    } else if (type === 'boat') {
      const items = await fetchHistoricalApiItems(
        KSPO_BASE_URL,
        '/SRVC_OD_API_MBR_RACE_RESULT',
        process.env.KSPO_API_KEY,
        fromDate,
        'KSPO Boat Results',
        'KSPO_API_KEY'
      );
      resultBuckets.push(mapToHistoricalRaces('boat', items));
    }
  }

  let results = resultBuckets.flat();

  // Fallback to dummy data when nothing returned
  if (results.length === 0) {
    results = getDummyHistoricalResults(fromDate, toDate, requestedTypes, track);
  }

  if (track) {
    results = results.filter(race => race.track === track);
  }

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
  const parts = id.split('-');
  if (parts.length < 4) return null;

  const [type, , , date] = parts;
  if (!['horse', 'cycle', 'boat'].includes(type)) return null;

  const results = await fetchHistoricalResults({
    dateFrom: date,
    dateTo: date,
    types: [type as RaceType],
    limit: 50,
  });

  return results.items.find(item => item.id === id) || getDummyHistoricalRaceById(id);
}

// ============================================
// Auxiliary APIs (KRA / KSPO)
// ============================================

async function fetchServiceItems(
  baseUrl: string,
  endpoint: string,
  apiKey: string | undefined,
  rcDate: string,
  apiName: string,
  envVarName: string,
  dateParamName: string = 'rc_date'
): Promise<unknown[]> {
  return fetchHistoricalApiItems(baseUrl, endpoint, apiKey, rcDate, apiName, envVarName, dateParamName);
}

// KRA (B551015)
export const fetchHorseRaceInfo = (rcDate: string) =>
  fetchServiceItems(KRA_BASE_URL, '/API187', process.env.KRA_API_KEY, rcDate, 'KRA API187', 'KRA_API_KEY');

export const fetchHorseRaceResultDetail = (rcDate: string) =>
  fetchServiceItems(KRA_BASE_URL, '/API156', process.env.KRA_API_KEY, rcDate, 'KRA API156', 'KRA_API_KEY');

export const fetchHorseEntryRegistration = (rcDate: string) =>
  fetchServiceItems(KRA_BASE_URL, '/API23_1', process.env.KRA_API_KEY, rcDate, 'KRA API23_1', 'KRA_API_KEY')
    .then(items => mapKRAHorseEntryRegistration(items as KRAHorseEntryItem[]));

export const fetchHorseDividendSummary = (rcDate: string) =>
  fetchServiceItems(KRA_BASE_URL, '/API301', process.env.KRA_API_KEY, rcDate, 'KRA API301', 'KRA_API_KEY')
    .then(items => mapKRAHorseDividendSummary(items as KRAHorseDividendSummaryItem[]));

export const fetchHorseEntryDetail = (rcDate: string) =>
  fetchServiceItems(KRA_BASE_URL, '/API26_2', process.env.KRA_API_KEY, rcDate, 'KRA API26_2', 'KRA_API_KEY')
    .then(items => mapKRAHorseEntryDetails(items as KRAHorseEntryDetailItem[]));

// KSPO (B551014) - Boat/Cycle shared key
export const fetchBoatPayoffs = async (rcDate: string): Promise<Dividend[]> => {
  const items = await fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_MBR_PAYOFF', process.env.KSPO_API_KEY, rcDate, 'KSPO Boat Payoff', 'KSPO_API_KEY');
  return mapPayoffs(items);
};

export const fetchCyclePayoffs = async (rcDate: string): Promise<Dividend[]> => {
  const items = await fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_CRA_PAYOFF', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle Payoff', 'KSPO_API_KEY');
  return mapKSPOCyclePayoffs(items as KSPOCyclePayoffItem[]);
};

export const fetchCycleRaceResults = async (rcDate: string) => {
  const items = await fetchServiceItems(
    KSPO_BASE_URL,
    '/SRVC_TODZ_CRA_RACE_RESULT',
    process.env.KSPO_API_KEY,
    rcDate,
    'KSPO Cycle Race Result',
    'KSPO_API_KEY'
  );
  return mapKSPOCycleRaceResults(items as KSPOCycleRaceResultItem[], rcDate);
};

export const fetchBoatRaceRankings = async (rcDate: string) => {
  const items = await fetchServiceItems(
    KSPO_BASE_URL,
    '/SRVC_MRA_RACE_RANK',
    process.env.KSPO_API_KEY,
    rcDate,
    'KSPO Boat Race Rank',
    'KSPO_API_KEY'
  );
  return mapKSPOBoatRaceRankings(items as KSPOBoatRaceRankItem[]);
};

export const fetchCycleRaceRankings = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_CRA_RACE_RANK', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle Race Rank', 'KSPO_API_KEY').then(items =>
    mapKSPOCycleRaceRankings(items as KSPOCycleRaceRankItem[])
  );

export const fetchBoatRacerInfo = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_VWEB_MBR_RACER_INFO', process.env.KSPO_API_KEY, rcDate, 'KSPO Boat Racer Info', 'KSPO_API_KEY');

export const fetchCycleRacerInfo = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_CRA_RACER_INFO', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle Racer Info', 'KSPO_API_KEY')
    .then(items => mapKSPOCycleRacerInfo(items as KSPOCycleRacerInfoItem[]));

export const fetchBoatOperationInfo = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_MRA_SUPP_CD', process.env.KSPO_API_KEY, rcDate, 'KSPO Boat Operation Info', 'KSPO_API_KEY');

export const fetchCycleOperationInfo = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_CRA_CYCLE_EXER', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle Operation Info', 'KSPO_API_KEY');

export const fetchCycleExerciseStats = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_CRA_CYCLE_EXER', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle Exercise', 'KSPO_API_KEY')
    .then(items => mapKSPOCycleExercise(items as KSPOCycleExerciseItem[]));

export const fetchCyclePartUnits = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_CRA_CYCLE_PART', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle Part', 'KSPO_API_KEY')
    .then(items => mapKSPOCycleParts(items as KSPOCyclePartItem[]));

export const fetchCycleInspectStats = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_CRA_INSPECT', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle Inspect', 'KSPO_API_KEY')
    .then(items => mapKSPOCycleInspects(items as KSPOCycleInspectItem[]));

export const fetchCycleInOutStats = (rcDate: string) =>
  fetchServiceItems(KSPO_BASE_URL, '/SRVC_OD_API_CRA_INOUT', process.env.KSPO_API_KEY, rcDate, 'KSPO Cycle InOut', 'KSPO_API_KEY')
    .then(items => mapKSPOCycleInOut(items as KSPOCycleInOutItem[]));

/**
 * Fetch boat race results (SRVC_OD_API_MBR_RACE_RESULT)
 * Returns historical race data with rankings and dividends
 */
export const fetchBoatRaceResults = async (rcDate: string): Promise<HistoricalRace[]> => {
  const items = await fetchServiceItems(
    KSPO_BASE_URL,
    '/SRVC_OD_API_MBR_RACE_RESULT',
    process.env.KSPO_API_KEY,
    rcDate,
    'KSPO Boat Race Result',
    'KSPO_API_KEY'
  );
  return mapKSPOBoatRaceResults(items as KSPOBoatRaceResultItem[], rcDate);
};
