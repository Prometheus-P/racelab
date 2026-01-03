/**
 * KRA Race Result Total API
 *
 * 경주결과종합 조회 API (API299)
 * - 일반 사용자용 경주결과 조회
 * - AI학습용 API156보다 간단한 데이터 구조
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type { KraRaceResultTotalItem, RaceResult, RaceResultSummary } from './types';
import { mapRaceResultList, groupRaceResults } from './mappers';
import { recordCacheHit, recordCacheMiss } from '@/lib/cache/cacheUtils';

const CACHE_NAMESPACE = 'kra-race-result';

/**
 * 경주결과종합 조회 (특정 경마장)
 *
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 * @param raceNo 경주번호 (선택)
 */
export async function fetchRaceResultTotal(
  meet: string,
  date?: string,
  raceNo?: number
): Promise<RaceResult[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraRaceResultTotalItem>('RACE_RESULT_TOTAL', rcDate, {
    meet,
    params: raceNo ? { rcNo: String(raceNo) } : undefined,
    numOfRows: 500,
  });

  return mapRaceResultList(items);
}

/**
 * 전체 경마장 경주결과종합 조회
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchAllRaceResultTotal(date?: string): Promise<RaceResult[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApiAllMeets<KraRaceResultTotalItem>('RACE_RESULT_TOTAL', rcDate, {
    numOfRows: 500,
  });

  return mapRaceResultList(items);
}

/**
 * 경주결과종합 조회 (경주별 그룹화)
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 * @param meet 경마장 코드 (선택)
 */
export async function fetchRaceResultTotalSummary(
  date?: string,
  meet?: string
): Promise<RaceResultSummary[]> {
  const results = meet
    ? await fetchRaceResultTotal(meet, date)
    : await fetchAllRaceResultTotal(date);
  return groupRaceResults(results);
}

/**
 * 특정 경주 결과 조회
 *
 * @param meet 경마장 코드
 * @param raceNo 경주번호
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchSingleRaceResult(
  meet: string,
  raceNo: number,
  date?: string
): Promise<RaceResultSummary | null> {
  const results = await fetchRaceResultTotal(meet, date, raceNo);

  if (results.length === 0) {
    return null;
  }

  const summaries = groupRaceResults(results);
  return summaries.find((s) => s.meet === meet && s.raceNo === raceNo) || null;
}

/**
 * 경주결과종합 Safe 버전 (에러 시 빈 배열)
 *
 * @param meet 경마장 코드
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRaceResultTotalSafe(
  meet: string,
  date?: string
): Promise<{ data: RaceResult[]; isStale?: boolean; warning?: string }> {
  const rcDate = date || getTodayDate();

  const result = await kraApiSafe<KraRaceResultTotalItem>('RACE_RESULT_TOTAL', rcDate, {
    meet,
    numOfRows: 500,
  });

  // 캐시 메트릭 기록
  if (result.isStale) {
    recordCacheHit(CACHE_NAMESPACE);
  } else {
    recordCacheMiss(CACHE_NAMESPACE);
  }

  return {
    data: mapRaceResultList(result.data),
    isStale: result.isStale,
    warning: result.warning,
  };
}

/**
 * 경주결과 존재 여부 확인
 */
export async function hasRaceResultsTotal(meet?: string, date?: string): Promise<boolean> {
  try {
    const results = meet
      ? await fetchRaceResultTotal(meet, date)
      : await fetchAllRaceResultTotal(date);
    return results.length > 0;
  } catch {
    return false;
  }
}

/**
 * 경주결과 총 경주 수 조회
 */
export async function getTotalRaceResultCount(meet?: string, date?: string): Promise<number> {
  try {
    const summaries = await fetchRaceResultTotalSummary(date, meet);
    return summaries.length;
  } catch {
    return 0;
  }
}

/**
 * 우승마 결과만 필터링
 */
export function filterWinnersTotal(results: RaceResult[]): RaceResult[] {
  return results.filter((r) => r.position === 1);
}

/**
 * 입상마 결과만 필터링 (1~3위)
 */
export function filterPlacersTotal(results: RaceResult[]): RaceResult[] {
  return results.filter((r) => r.position >= 1 && r.position <= 3);
}

/**
 * 결과를 순위순으로 정렬
 */
export function sortResultsTotalByPosition(results: RaceResult[]): RaceResult[] {
  return [...results].sort((a, b) => a.position - b.position);
}

/**
 * 결과를 주파기록순으로 정렬
 */
export function sortResultsTotalByTime(results: RaceResult[]): RaceResult[] {
  return [...results].sort((a, b) => {
    const timeA = a.finishTime || '99:99.9';
    const timeB = b.finishTime || '99:99.9';
    return timeA.localeCompare(timeB);
  });
}

/**
 * 경주일자 기준 실시간/과거 결과 구분
 */
export function isLiveResult(raceDate: string): boolean {
  const today = getTodayDate();
  return raceDate === today;
}

/**
 * 실시간 결과만 필터링
 */
export function filterLiveResults(results: RaceResult[]): RaceResult[] {
  const today = getTodayDate();
  return results.filter((r) => r.raceDate === today);
}

/**
 * 과거 결과만 필터링
 */
export function filterPastResults(results: RaceResult[]): RaceResult[] {
  const today = getTodayDate();
  return results.filter((r) => r.raceDate !== today);
}
