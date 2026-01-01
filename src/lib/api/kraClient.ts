// src/lib/api/kraClient.ts

import { Race, RaceResult } from '@/types';
import {
  mapKRA299ToRaces,
  mapKRA299ToResults,
  KRA299ResultItem,
} from '../api-helpers/mappers';
import { fetchApi } from './fetcher';

const KRA_BASE_URL = 'https://apis.data.go.kr/B551015';

/**
 * @API_README_v2.md Section: 한국마사회 API - 경주 일정 조회 (API299)
 */
export async function fetchHorseRaceSchedules(rcDate: string): Promise<Race[]> {
  const KRA_API_KEY = process.env.KRA_API_KEY;

  // Try API299 (경주결과종합) first - works with our API key
  const rawItems = await fetchApi(
    KRA_BASE_URL,
    '/API299/Race_Result_total',
    KRA_API_KEY,
    {},
    rcDate,
    'KRA API299',
    'KRA_API_KEY'
  );

  // API299 returns grouped race result data
  const races = mapKRA299ToRaces(rawItems as KRA299ResultItem[]);
  return races;
}

/**
 * Fetch race results for a specific race from API299
 * @param rcDate Race date in YYYYMMDD format
 * @param meetCode Meet code (1=서울, 2=제주, 3=부경)
 * @param raceNo Race number
 */
export async function fetchHorseRaceResults(
  rcDate: string,
  meetCode: string,
  raceNo: number
): Promise<RaceResult[]> {
  const KRA_API_KEY = process.env.KRA_API_KEY;

  const rawItems = await fetchApi(
    KRA_BASE_URL,
    '/API299/Race_Result_total',
    KRA_API_KEY,
    {},
    rcDate,
    'KRA API299',
    'KRA_API_KEY'
  );

  // Map to RaceResult format for the specific race
  const results = mapKRA299ToResults(
    rawItems as KRA299ResultItem[],
    meetCode,
    raceNo
  );

  return results;
}
