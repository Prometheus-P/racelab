/**
 * KRA Race Info API
 *
 * 경마경주정보 조회 API (API187)
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type { KraRaceInfoItem, RaceInfo, RaceSchedule } from './types';
import { mapRaceInfoList, groupRacesByDateAndMeet, filterRaceByNo } from './mappers';

/**
 * 경주정보 조회 (특정 경마장)
 *
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRaceInfo(
  meet: string,
  date?: string
): Promise<RaceInfo[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraRaceInfoItem>('RACE_INFO', rcDate, {
    meet,
    numOfRows: 100,
  });

  return mapRaceInfoList(items);
}

/**
 * 전체 경마장 경주정보 조회
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchAllRaceInfo(date?: string): Promise<RaceInfo[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApiAllMeets<KraRaceInfoItem>('RACE_INFO', rcDate, {
    numOfRows: 100,
  });

  return mapRaceInfoList(items);
}

/**
 * 경주일정 조회 (일자/경마장별 그룹화)
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRaceSchedule(date?: string): Promise<RaceSchedule[]> {
  const races = await fetchAllRaceInfo(date);
  return groupRacesByDateAndMeet(races);
}

/**
 * 특정 경주 조회
 *
 * @param meet 경마장 코드
 * @param raceNo 경주번호
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRace(
  meet: string,
  raceNo: number,
  date?: string
): Promise<RaceInfo | null> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraRaceInfoItem>('RACE_INFO', rcDate, {
    meet,
    params: { rcNo: String(raceNo) },
    numOfRows: 50,
  });

  const races = mapRaceInfoList(items);
  return filterRaceByNo(races, meet, raceNo);
}

/**
 * 경주정보 Safe 버전 (에러 시 빈 배열)
 *
 * @param meet 경마장 코드
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRaceInfoSafe(
  meet: string,
  date?: string
): Promise<{ data: RaceInfo[]; isStale?: boolean; warning?: string }> {
  const rcDate = date || getTodayDate();

  const result = await kraApiSafe<KraRaceInfoItem>('RACE_INFO', rcDate, {
    meet,
    numOfRows: 100,
  });

  return {
    data: mapRaceInfoList(result.data),
    isStale: result.isStale,
    warning: result.warning,
  };
}

/**
 * 오늘 경주 여부 확인 (경주정보 기반)
 */
export async function hasRacesToday(meet?: string): Promise<boolean> {
  try {
    const races = meet
      ? await fetchRaceInfo(meet)
      : await fetchAllRaceInfo();
    return races.length > 0;
  } catch {
    return false;
  }
}

/**
 * 경주 수 조회 (경주정보 기반)
 */
export async function getTotalRaceCount(meet?: string, date?: string): Promise<number> {
  try {
    const races = meet
      ? await fetchRaceInfo(meet, date)
      : await fetchAllRaceInfo(date);
    return races.length;
  } catch {
    return 0;
  }
}

/**
 * 경주 등급별 필터
 */
export function filterRacesByGrade(races: RaceInfo[], grade: string): RaceInfo[] {
  return races.filter((r) => r.grade === grade);
}

/**
 * 경주 거리별 필터
 */
export function filterRacesByDistance(
  races: RaceInfo[],
  minDistance: number,
  maxDistance?: number
): RaceInfo[] {
  return races.filter((r) => {
    if (r.distance < minDistance) return false;
    if (maxDistance && r.distance > maxDistance) return false;
    return true;
  });
}

/**
 * 경주 시작시간순 정렬
 */
export function sortRacesByStartTime(races: RaceInfo[]): RaceInfo[] {
  return [...races].sort((a, b) => {
    const timeA = a.startTime || '99:99';
    const timeB = b.startTime || '99:99';
    return timeA.localeCompare(timeB);
  });
}
