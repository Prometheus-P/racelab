/**
 * KRA Horse API
 *
 * 마필 정보 조회 API
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type {
  KraHorseInfoItem,
  KraHorseResultItem,
  KraHorseTotalInfoItem,
  Horse,
  HorseRaceRecord,
} from './types';
import {
  mapHorseInfo,
  mapHorseInfoList,
  mapHorseRaceRecords,
  mergeHorseTotalInfo,
  sortHorsesByRating,
} from './mappers';

/**
 * 마필 목록 조회 (특정 경마장)
 *
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchHorseList(
  meet: string,
  date?: string
): Promise<Horse[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraHorseInfoItem>('HORSE_INFO', rcDate, {
    meet,
    numOfRows: 100,
  });

  return mapHorseInfoList(items);
}

/**
 * 전체 경마장 마필 목록 조회
 *
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchAllHorses(date?: string): Promise<Horse[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApiAllMeets<KraHorseInfoItem>('HORSE_INFO', rcDate, {
    numOfRows: 100,
  });

  const horses = mapHorseInfoList(items);
  return sortHorsesByRating(horses);
}

/**
 * 마필 상세정보 조회
 *
 * @param hrNo 마번
 * @param meet 경마장 코드 (선택)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchHorseInfo(
  hrNo: string,
  meet?: string,
  date?: string
): Promise<Horse | null> {
  const rcDate = date || getTodayDate();

  // 기본 정보 조회
  const infoItems = await kraApi<KraHorseInfoItem>('HORSE_INFO', rcDate, {
    meet,
    params: { hrNo },
  });

  if (infoItems.length === 0) {
    return null;
  }

  // 기본 정보 변환
  let horse = mapHorseInfo(infoItems[0]);

  // 종합정보 조회 및 병합 시도
  try {
    const totalItems = await kraApi<KraHorseTotalInfoItem>('HORSE_TOTAL_INFO', rcDate, {
      params: { hrNo },
    });

    if (totalItems.length > 0) {
      horse = mergeHorseTotalInfo(horse, totalItems[0]);
    }
  } catch {
    // 종합정보 실패 시 기본 정보만 반환
    console.warn(`[fetchHorseInfo] Failed to fetch total info for hrNo: ${hrNo}`);
  }

  return horse;
}

/**
 * 마필 경주 기록 조회
 *
 * @param hrNo 마번
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchHorseRaceHistory(
  hrNo: string,
  date?: string
): Promise<HorseRaceRecord[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraHorseResultItem>('HORSE_RESULT', rcDate, {
    params: { hrNo },
    numOfRows: 50,
  });

  return mapHorseRaceRecords(items);
}

/**
 * 마필 검색 (이름으로)
 *
 * @param name 마명 (부분 일치)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function searchHorsesByName(
  name: string,
  date?: string
): Promise<Horse[]> {
  const allHorses = await fetchAllHorses(date);

  const filtered = allHorses.filter((h) =>
    h.name.toLowerCase().includes(name.toLowerCase())
  );

  return sortHorsesByRating(filtered);
}

/**
 * 마필 랭킹 조회 (레이팅순)
 *
 * @param meet 경마장 코드 (선택, 없으면 전체)
 * @param limit 최대 결과 수 (기본값: 20)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchHorseRanking(
  meet?: string,
  limit: number = 20,
  date?: string
): Promise<Horse[]> {
  let horses: Horse[];

  if (meet) {
    horses = await fetchHorseList(meet, date);
  } else {
    horses = await fetchAllHorses(date);
  }

  // 최소 출주횟수 필터 (5회 이상)
  const qualified = horses.filter((h) => h.totalStarts >= 5);

  // 레이팅순 정렬 및 상위 N개
  return sortHorsesByRating(qualified).slice(0, limit);
}

/**
 * 특정 등급 마필 조회
 *
 * @param grade 등급 (예: "1", "2", "3" 등)
 * @param meet 경마장 코드 (선택)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchHorsesByGrade(
  grade: string,
  meet?: string,
  date?: string
): Promise<Horse[]> {
  let horses: Horse[];

  if (meet) {
    horses = await fetchHorseList(meet, date);
  } else {
    horses = await fetchAllHorses(date);
  }

  return horses.filter((h) => h.grade === grade);
}

/**
 * 마필 정보 Safe 버전 (에러 시 빈 배열)
 */
export async function fetchHorseListSafe(
  meet: string,
  date?: string
): Promise<{ data: Horse[]; isStale?: boolean; warning?: string }> {
  const rcDate = date || getTodayDate();

  const result = await kraApiSafe<KraHorseInfoItem>('HORSE_INFO', rcDate, {
    meet,
    numOfRows: 100,
  });

  return {
    data: mapHorseInfoList(result.data),
    isStale: result.isStale,
    warning: result.warning,
  };
}

/**
 * 마필 상세정보 + 경주기록 통합 조회
 *
 * @param hrNo 마번
 * @param meet 경마장 코드 (선택)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchHorseDetail(
  hrNo: string,
  meet?: string,
  date?: string
): Promise<{ horse: Horse | null; history: HorseRaceRecord[] }> {
  const [horse, history] = await Promise.all([
    fetchHorseInfo(hrNo, meet, date),
    fetchHorseRaceHistory(hrNo, date),
  ]);

  return { horse, history };
}
