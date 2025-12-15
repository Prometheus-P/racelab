/**
 * KRA (Korea Racing Authority) API Client
 *
 * Wraps the existing KRA API functions for use in the ingestion pipeline.
 * Handles horse racing data: schedules, entries, odds, and results.
 */

import { withRetry } from '../utils/retry';
import { checkQuotaFromError, checkQuotaFromResponse } from '../utils/quotaGuard';

const KRA_API_BASE = 'https://apis.data.go.kr/B551015';
const KRA_API_KEY = process.env.KRA_API_KEY;
const KRA_RETRY_OPTIONS = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 4000,
};

export interface KraScheduleItem {
  meet: string;
  rcNo: number;
  rcDate: string;
  rcTime: string;
  rcDist: number;
  rcName: string;
  rank: string;
  weather: string;
  budam: string;
}

export interface KraEntryItem {
  hrNo: number;
  hrName: string;
  jkName: string;
  trName: string;
  owName: string;
  age: number;
  sex: string;
  wgBudam: number;
  wgHr: number;
  rating: number;
  rcsPt: string;
}

export interface KraOddsItem {
  hrNo: number;
  winOdds: number;
  plcOdds: number;
  ord: number;
}

export interface KraResultItem {
  hrNo: number;
  ord: number;
  rcTime: string;
  winOdds: number;
  plcOdds: number;
  chaksun1: number;
  chaksun2: number;
}

/**
 * Fetch race schedules for a specific date from KRA API
 */
export async function fetchKraSchedules(date: string): Promise<KraScheduleItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry<KraScheduleItem | KraScheduleItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KRA_API_KEY,
        pageNo: '1',
        numOfRows: '100',
        rc_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKraApi<KraScheduleItem>(
        'API186_1/raceInfo_1',
        params,
        'schedules',
        { next: { revalidate: 300 } }
      );
    },
    KRA_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KRA', result.error);
    console.error('[KRA] Failed to fetch schedules:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

/**
 * Fetch entries for a specific race from KRA API
 */
export async function fetchKraEntries(
  trackCode: string,
  raceNo: number,
  date: string
): Promise<KraEntryItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry<KraEntryItem | KraEntryItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KRA_API_KEY,
        pageNo: '1',
        numOfRows: '30',
        meet: trackCode,
        rc_no: String(raceNo),
        rc_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKraApi<KraEntryItem>(
        'API323/SeoulRace_1',
        params,
        'entries',
        { next: { revalidate: 60 } }
      );
    },
    KRA_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KRA', result.error);
    console.error('[KRA] Failed to fetch entries:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

/**
 * Fetch current odds for a specific race from KRA API
 */
export async function fetchKraOdds(
  trackCode: string,
  raceNo: number,
  date: string
): Promise<KraOddsItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry<KraOddsItem | KraOddsItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KRA_API_KEY,
        meet: trackCode,
        rc_no: String(raceNo),
        rc_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKraApi<KraOddsItem>(
        'API214_17/oddsInfo_1',
        params,
        'odds',
        { cache: 'no-store' }
      );
    },
    KRA_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KRA', result.error);
    console.error('[KRA] Failed to fetch odds:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

/**
 * Fetch race results from KRA API
 */
export async function fetchKraResults(
  trackCode: string,
  raceNo: number,
  date: string
): Promise<KraResultItem[]> {
  if (!KRA_API_KEY) {
    console.warn('[KRA] API key not configured, returning empty results');
    return [];
  }

  const result = await withRetry<KraResultItem | KraResultItem[] | undefined>(
    async () => {
      const params = new URLSearchParams({
        serviceKey: KRA_API_KEY,
        pageNo: '1',
        numOfRows: '30',
        meet: trackCode,
        rc_no: String(raceNo),
        rc_date: date.replace(/-/g, ''),
        _type: 'json',
      });

      return requestKraApi<KraResultItem>(
        'API299/result_1',
        params,
        'results',
        { next: { revalidate: 60 } }
      );
    },
    KRA_RETRY_OPTIONS
  );

  if (!result.success) {
    checkQuotaFromError('KRA', result.error);
    console.error('[KRA] Failed to fetch results:', result.error);
    return [];
  }

  return normalizeItems(result.data);
}

async function requestKraApi<T>(
  path: string,
  params: URLSearchParams,
  context: string,
  init?: RequestInit
): Promise<T | T[] | undefined> {
  const response = await fetch(`${KRA_API_BASE}/${path}?${params}`, init);
  checkQuotaFromResponse('KRA', response);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    checkQuotaFromResponse('KRA', response, body);
    throw new Error(`[KRA] ${context} error: status ${response.status} ${body}`.trim());
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
