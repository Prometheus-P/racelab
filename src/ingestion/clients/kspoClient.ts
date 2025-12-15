/**
 * KSPO (Korea Sports Promotion Organization) API Client
 *
 * Handles cycle racing and boat racing data from KSPO API.
 * Similar structure to KRA client for consistency.
 */

import { withRetry } from '../utils/retry';
import { checkQuotaFromError, checkQuotaFromResponse } from '../utils/quotaGuard';

const KSPO_API_BASE = 'https://apis.data.go.kr/B551014';
const KSPO_API_KEY = process.env.KSPO_API_KEY;
const KSPO_RETRY_OPTIONS = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 4000,
};

export interface KspoScheduleItem {
  gamePlace: string;
  gameNo: number;
  gameDate: string;
  gameTime: string;
  gameDist: number;
  gameName: string;
  grade: string;
}

export interface KspoEntryItem {
  playerNo: number;
  playerName: string;
  grade: string;
  gearRatio?: number;
  motorNo?: number;
  boatNo?: number;
  record: string;
}

export interface KspoOddsItem {
  playerNo: number;
  winOdds: number;
  plcOdds: number;
  rank: number;
}

export interface KspoResultItem {
  playerNo: number;
  rank: number;
  time: string;
  winDividend: number;
  plcDividend: number;
}

export type KspoRaceType = 'cycle' | 'boat';

/**
 * Get API endpoint based on race type
 */
function getApiEndpoint(raceType: KspoRaceType): string {
  return raceType === 'cycle' ? 'cycleRace' : 'boatRace';
}

/**
 * Fetch race schedules from KSPO API
 */
export async function fetchKspoSchedules(
  date: string,
  raceType: KspoRaceType
): Promise<KspoScheduleItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry<KspoScheduleItem | KspoScheduleItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KSPO_API_KEY,
        pageNo: '1',
        numOfRows: '100',
        game_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKspoApi<KspoScheduleItem>(
        `${endpoint}/schedule`,
        params,
        'schedules',
        { next: { revalidate: 300 } }
      );
    },
    KSPO_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KSPO', result.error);
    console.error('[KSPO] Failed to fetch schedules:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

/**
 * Fetch entries for a specific race from KSPO API
 */
export async function fetchKspoEntries(
  trackCode: string,
  raceNo: number,
  date: string,
  raceType: KspoRaceType
): Promise<KspoEntryItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry<KspoEntryItem | KspoEntryItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KSPO_API_KEY,
        pageNo: '1',
        numOfRows: '30',
        game_place: trackCode,
        game_no: String(raceNo),
        game_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKspoApi<KspoEntryItem>(
        `${endpoint}/entry`,
        params,
        'entries',
        { next: { revalidate: 60 } }
      );
    },
    KSPO_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KSPO', result.error);
    console.error('[KSPO] Failed to fetch entries:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

/**
 * Fetch current odds from KSPO API
 */
export async function fetchKspoOdds(
  trackCode: string,
  raceNo: number,
  date: string,
  raceType: KspoRaceType
): Promise<KspoOddsItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry<KspoOddsItem | KspoOddsItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KSPO_API_KEY,
        game_place: trackCode,
        game_no: String(raceNo),
        game_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKspoApi<KspoOddsItem>(
        `${endpoint}/odds`,
        params,
        'odds',
        { cache: 'no-store' }
      );
    },
    KSPO_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KSPO', result.error);
    console.error('[KSPO] Failed to fetch odds:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

/**
 * Fetch race results from KSPO API
 */
export async function fetchKspoResults(
  trackCode: string,
  raceNo: number,
  date: string,
  raceType: KspoRaceType
): Promise<KspoResultItem[]> {
  if (!KSPO_API_KEY) {
    console.warn('[KSPO] API key not configured, returning empty results');
    return [];
  }

  const endpoint = getApiEndpoint(raceType);

  const result = await withRetry<KspoResultItem | KspoResultItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KSPO_API_KEY,
        pageNo: '1',
        numOfRows: '30',
        game_place: trackCode,
        game_no: String(raceNo),
        game_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKspoApi<KspoResultItem>(
        `${endpoint}/result`,
        params,
        'results',
        { next: { revalidate: 60 } }
      );
    },
    KSPO_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KSPO', result.error);
    console.error('[KSPO] Failed to fetch results:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

async function requestKspoApi<T>(
  path: string,
  params: URLSearchParams,
  context: string,
  init?: RequestInit
): Promise<T | T[] | undefined> {
  const response = await fetch(`${KSPO_API_BASE}/${path}?${params}`, init);
  checkQuotaFromResponse('KSPO', response);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    checkQuotaFromResponse('KSPO', response, body);
    throw new Error(`[KSPO] ${context} error: status ${response.status} ${body}`.trim());
  }

  const data = await response.json();
  return data?.response?.body?.items?.item as T | T[] | undefined;
}

function normalizeItems<T>(data: T | T[] | undefined | null): T[] {
  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
}
