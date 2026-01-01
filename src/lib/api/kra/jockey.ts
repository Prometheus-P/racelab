/**
 * KRA Jockey API
 *
 * 기수 정보 조회 API
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type { KraJockeyResultItem, KraJockeyInfoItem, Jockey } from './types';
import {
  mapJockeyResult,
  mapJockeyResults,
  mergeJockeyInfo,
  sortJockeysByWinRate,
} from './mappers';

/**
 * 기수 성적 목록 조회 (특정 경마장)
 *
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchJockeyResults(
  meet: string,
  date?: string
): Promise<Jockey[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraJockeyResultItem>('JOCKEY_RESULT', rcDate, {
    meet,
    numOfRows: 100,
  });

  return mapJockeyResults(items);
}

/**
 * 전체 경마장 기수 성적 조회
 *
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchAllJockeyResults(date?: string): Promise<Jockey[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApiAllMeets<KraJockeyResultItem>('JOCKEY_RESULT', rcDate, {
    numOfRows: 100,
  });

  const jockeys = mapJockeyResults(items);
  return sortJockeysByWinRate(jockeys);
}

/**
 * 기수 상세정보 조회
 *
 * @param jkNo 기수번호
 * @param meet 경마장 코드 (선택)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchJockeyInfo(
  jkNo: string,
  meet?: string,
  date?: string
): Promise<Jockey | null> {
  const rcDate = date || getTodayDate();

  // 기수 성적 조회
  const resultItems = await kraApi<KraJockeyResultItem>('JOCKEY_RESULT', rcDate, {
    meet,
    params: { jkNo },
  });

  if (resultItems.length === 0) {
    return null;
  }

  // 기본 정보 변환
  const jockey = mapJockeyResult(resultItems[0]);

  // 상세정보 조회 및 병합 시도
  try {
    const infoItems = await kraApi<KraJockeyInfoItem>('JOCKEY_INFO', rcDate, {
      meet: meet || jockey.meet,
      params: { jkNo },
    });

    if (infoItems.length > 0) {
      return mergeJockeyInfo(jockey, infoItems[0]);
    }
  } catch {
    // 상세정보 실패 시 기본 정보만 반환
    console.warn(`[fetchJockeyInfo] Failed to fetch detail for jkNo: ${jkNo}`);
  }

  return jockey;
}

/**
 * 기수 검색 (이름으로)
 *
 * @param name 기수명 (부분 일치)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function searchJockeysByName(
  name: string,
  date?: string
): Promise<Jockey[]> {
  const allJockeys = await fetchAllJockeyResults(date);

  const filtered = allJockeys.filter((j) =>
    j.name.toLowerCase().includes(name.toLowerCase())
  );

  return sortJockeysByWinRate(filtered);
}

/**
 * 기수 랭킹 조회 (승률순)
 *
 * @param meet 경마장 코드 (선택, 없으면 전체)
 * @param limit 최대 결과 수 (기본값: 20)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchJockeyRanking(
  meet?: string,
  limit: number = 20,
  date?: string
): Promise<Jockey[]> {
  let jockeys: Jockey[];

  if (meet) {
    jockeys = await fetchJockeyResults(meet, date);
  } else {
    jockeys = await fetchAllJockeyResults(date);
  }

  // 최소 출주횟수 필터 (10회 이상)
  const qualified = jockeys.filter((j) => j.totalStarts >= 10);

  // 승률순 정렬 및 상위 N개
  return sortJockeysByWinRate(qualified).slice(0, limit);
}

/**
 * 기수 성적 Safe 버전 (에러 시 빈 배열)
 */
export async function fetchJockeyResultsSafe(
  meet: string,
  date?: string
): Promise<{ data: Jockey[]; isStale?: boolean; warning?: string }> {
  const rcDate = date || getTodayDate();

  const result = await kraApiSafe<KraJockeyResultItem>('JOCKEY_RESULT', rcDate, {
    meet,
    numOfRows: 100,
  });

  return {
    data: mapJockeyResults(result.data),
    isStale: result.isStale,
    warning: result.warning,
  };
}
