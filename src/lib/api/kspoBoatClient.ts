// src/lib/api/kspoBoatClient.ts

import { Race } from '@/types';
import { mapKSPOBoatRaceInfoToRaces, KSPOBoatRaceInfoItem } from '../api-helpers/mappers'; // Adjust path as needed
import { fetchApi } from './fetcher'; // Shared fetcher utility

const KSPO_BASE_URL = 'https://apis.data.go.kr/B551014'; // KSPO base URL for boat races

/**
 * @API_README_v2.md Section: 국민체육진흥공단 API - 경정 출주표 조회
 */
export async function fetchBoatRaceSchedules(rcDate: string): Promise<Race[]> {
  const KSPO_API_KEY = process.env.KSPO_API_KEY;

  // Use approved API: SRVC_OD_API_VWEB_MBR_RACE_INFO (경정 출주표)
  const rawItems = await fetchApi(
    KSPO_BASE_URL,
    '/SRVC_OD_API_VWEB_MBR_RACE_INFO/TODZ_API_VWEB_MBR_RACE_I',
    KSPO_API_KEY,
    { resultType: 'json' },
    rcDate,
    'KSPO Boat',
    'KSPO_API_KEY'
  );

  // Use new mapper for approved API format
  const races = mapKSPOBoatRaceInfoToRaces(rawItems as KSPOBoatRaceInfoItem[], rcDate);
  return races;
}
