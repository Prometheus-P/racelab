// src/lib/api/kspoCycleClient.ts

import { Race } from '@/types';
import { mapKSPOCycleRaceOrganToRaces, KSPOCycleRaceOrganItem } from '../api-helpers/mappers'; // Adjust path as needed
import { fetchApi } from './fetcher'; // Shared fetcher utility

const KSPO_BASE_URL = 'https://apis.data.go.kr/B551014';

/**
 * @API_README_v2.md Section: 국민체육진흥공단 API - 경륜 출주표 조회
 */
export async function fetchCycleRaceSchedules(rcDate: string): Promise<Race[]> {
  const KSPO_API_KEY = process.env.KSPO_API_KEY;

  // Use approved API: SRVC_OD_API_CRA_RACE_ORGAN (경륜 출주표)
  const rawItems = await fetchApi(
    KSPO_BASE_URL,
    '/SRVC_OD_API_CRA_RACE_ORGAN/TODZ_API_CRA_RACE_ORGAN_I',
    KSPO_API_KEY,
    { resultType: 'json' },
    rcDate,
    'KSPO Cycle',
    'KSPO_API_KEY'
  );

  // Use new mapper for approved API format
  const races = mapKSPOCycleRaceOrganToRaces(rawItems as KSPOCycleRaceOrganItem[], rcDate);
  return races;
}
