/**
 * KRA Odds API
 *
 * 확정배당률 정보 조회 API
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type { KraOddsItem, RaceOdds } from './types';
import { mapOddsItems, filterOddsByRace } from './mappers';

/**
 * 경주일 전체 배당률 조회 (특정 경마장)
 *
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchOdds(
  meet: string,
  date?: string
): Promise<RaceOdds[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraOddsItem>('ODDS_FINAL', rcDate, {
    meet,
    numOfRows: 1000, // 배당률 데이터는 많을 수 있음
  });

  return mapOddsItems(items);
}

/**
 * 전체 경마장 배당률 조회
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchAllOdds(date?: string): Promise<RaceOdds[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApiAllMeets<KraOddsItem>('ODDS_FINAL', rcDate, {
    numOfRows: 1000,
  });

  return mapOddsItems(items);
}

/**
 * 특정 경주 배당률 조회
 *
 * @param meet 경마장 코드
 * @param raceNo 경주번호
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchRaceOdds(
  meet: string,
  raceNo: number,
  date?: string
): Promise<RaceOdds | null> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraOddsItem>('ODDS_FINAL', rcDate, {
    meet,
    params: { rcNo: String(raceNo) },
    numOfRows: 200,
  });

  const allOdds = mapOddsItems(items);
  return filterOddsByRace(allOdds, meet, raceNo);
}

/**
 * 배당률 Safe 버전 (에러 시 빈 배열)
 *
 * @param meet 경마장 코드
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchOddsSafe(
  meet: string,
  date?: string
): Promise<{ data: RaceOdds[]; isStale?: boolean; warning?: string }> {
  const rcDate = date || getTodayDate();

  const result = await kraApiSafe<KraOddsItem>('ODDS_FINAL', rcDate, {
    meet,
    numOfRows: 1000,
  });

  return {
    data: mapOddsItems(result.data),
    isStale: result.isStale,
    warning: result.warning,
  };
}

/**
 * 단승 배당률만 추출
 */
export function extractWinOdds(raceOdds: RaceOdds): Record<string, number> {
  return raceOdds.win;
}

/**
 * 연승 배당률만 추출
 */
export function extractPlaceOdds(raceOdds: RaceOdds): Record<string, number> {
  return raceOdds.place;
}

/**
 * 인기순 정렬된 마번 목록 (단승 배당 기준)
 *
 * @returns 인기순으로 정렬된 마번 배열
 */
export function getOddsFavoriteOrder(raceOdds: RaceOdds): string[] {
  const winOdds = Object.entries(raceOdds.win);

  // 배당률 오름차순 (낮을수록 인기)
  winOdds.sort((a, b) => a[1] - b[1]);

  return winOdds.map(([horseNo]) => horseNo);
}

/**
 * 특정 마번의 배당률 조회
 */
export function getHorseOdds(
  raceOdds: RaceOdds,
  horseNo: string
): { win: number; place: number } {
  return {
    win: raceOdds.win[horseNo] ?? 0,
    place: raceOdds.place[horseNo] ?? 0,
  };
}
