/**
 * KRA Race Result AI API
 *
 * AI학습용 경주결과 조회 API (API156)
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type { KraRaceResultAIItem, RaceResultAI, RaceResultAISummary } from './types';
import { mapRaceResultAIList, groupRaceResultsByRace } from './mappers';

/**
 * AI학습용 경주결과 조회 (특정 경마장)
 *
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 * @param raceNo 경주번호 (선택)
 */
export async function fetchRaceResultAI(
  meet: string,
  date?: string,
  raceNo?: number
): Promise<RaceResultAI[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraRaceResultAIItem>('RACE_RESULT_AI', rcDate, {
    meet,
    params: raceNo ? { rcNo: String(raceNo) } : undefined,
    numOfRows: 500,
  });

  return mapRaceResultAIList(items);
}

/**
 * 전체 경마장 AI학습용 경주결과 조회
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchAllRaceResultAI(date?: string): Promise<RaceResultAI[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApiAllMeets<KraRaceResultAIItem>('RACE_RESULT_AI', rcDate, {
    numOfRows: 500,
  });

  return mapRaceResultAIList(items);
}

/**
 * AI학습용 경주결과 조회 (경주별 그룹화)
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 * @param meet 경마장 코드 (선택)
 */
export async function fetchRaceResultAISummary(
  date?: string,
  meet?: string
): Promise<RaceResultAISummary[]> {
  const results = meet
    ? await fetchRaceResultAI(meet, date)
    : await fetchAllRaceResultAI(date);
  return groupRaceResultsByRace(results);
}

/**
 * 특정 경주 AI학습용 경주결과 조회
 *
 * @param meet 경마장 코드
 * @param raceNo 경주번호
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRaceResult(
  meet: string,
  raceNo: number,
  date?: string
): Promise<RaceResultAISummary | null> {
  const results = await fetchRaceResultAI(meet, date, raceNo);

  if (results.length === 0) {
    return null;
  }

  const summaries = groupRaceResultsByRace(results);
  return summaries.find((s) => s.meet === meet && s.raceNo === raceNo) || null;
}

/**
 * AI학습용 경주결과 Safe 버전 (에러 시 빈 배열)
 *
 * @param meet 경마장 코드
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRaceResultAISafe(
  meet: string,
  date?: string
): Promise<{ data: RaceResultAI[]; isStale?: boolean; warning?: string }> {
  const rcDate = date || getTodayDate();

  const result = await kraApiSafe<KraRaceResultAIItem>('RACE_RESULT_AI', rcDate, {
    meet,
    numOfRows: 500,
  });

  return {
    data: mapRaceResultAIList(result.data),
    isStale: result.isStale,
    warning: result.warning,
  };
}

/**
 * 특정 마필의 경주결과 조회
 *
 * @param horseNo 마번
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchHorseRaceResultAI(
  horseNo: string,
  date?: string
): Promise<RaceResultAI | null> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraRaceResultAIItem>('RACE_RESULT_AI', rcDate, {
    params: { hr_no: horseNo },
    numOfRows: 50,
  });

  const results = mapRaceResultAIList(items);
  return results.find((r) => r.horseNo === horseNo) || null;
}

/**
 * 경주결과 존재 여부 확인
 */
export async function hasRaceResults(meet?: string, date?: string): Promise<boolean> {
  try {
    const results = meet
      ? await fetchRaceResultAI(meet, date)
      : await fetchAllRaceResultAI(date);
    return results.length > 0;
  } catch {
    return false;
  }
}

/**
 * 경주결과 총 수 조회
 */
export async function getTotalResultCount(meet?: string, date?: string): Promise<number> {
  try {
    const summaries = await fetchRaceResultAISummary(date, meet);
    return summaries.length;
  } catch {
    return 0;
  }
}

/**
 * 특정 순위의 결과만 필터링
 */
export function filterResultsByPosition(
  results: RaceResultAI[],
  position: number
): RaceResultAI[] {
  return results.filter((r) => r.position === position);
}

/**
 * 우승마 결과만 필터링
 */
export function filterWinners(results: RaceResultAI[]): RaceResultAI[] {
  return filterResultsByPosition(results, 1);
}

/**
 * 입상마 결과만 필터링 (1~3위)
 */
export function filterPlacers(results: RaceResultAI[]): RaceResultAI[] {
  return results.filter((r) => r.position >= 1 && r.position <= 3);
}

/**
 * 결과를 순위순으로 정렬
 */
export function sortResultsByPosition(results: RaceResultAI[]): RaceResultAI[] {
  return [...results].sort((a, b) => a.position - b.position);
}

/**
 * 결과를 주파기록순으로 정렬
 */
export function sortResultsByTime(results: RaceResultAI[]): RaceResultAI[] {
  return [...results].sort((a, b) => {
    const timeA = a.finishTime || '99:99.9';
    const timeB = b.finishTime || '99:99.9';
    return timeA.localeCompare(timeB);
  });
}
