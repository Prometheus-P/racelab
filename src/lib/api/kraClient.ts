// src/lib/api/kraClient.ts

import { Race } from '@/types';
import { mapKRA299ToRaces } from '../api-helpers/mappers'; // Adjust path as needed
import { KRA299ResultItem } from '../api-helpers/mappers'; // Adjust path as needed
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
