/**
 * KRA Trainer API
 *
 * 조교사 정보 조회 API
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type { KraTrainerInfoItem, Trainer } from './types';
import { mapTrainerInfo, mapTrainerInfoList, sortTrainersByWinRate } from './mappers';

/**
 * 조교사 정보 목록 조회 (특정 경마장)
 *
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchTrainerResults(
  meet: string,
  date?: string
): Promise<Trainer[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraTrainerInfoItem>('TRAINER_INFO', rcDate, {
    meet,
    numOfRows: 100,
  });

  return mapTrainerInfoList(items);
}

/**
 * 전체 경마장 조교사 정보 조회
 *
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchAllTrainerResults(date?: string): Promise<Trainer[]> {
  const rcDate = date || getTodayDate();

  const items = await kraApiAllMeets<KraTrainerInfoItem>('TRAINER_INFO', rcDate, {
    numOfRows: 100,
  });

  const trainers = mapTrainerInfoList(items);
  return sortTrainersByWinRate(trainers);
}

/**
 * 조교사 상세정보 조회
 *
 * @param trNo 조교사번호
 * @param meet 경마장 코드 (선택)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchTrainerInfo(
  trNo: string,
  meet?: string,
  date?: string
): Promise<Trainer | null> {
  const rcDate = date || getTodayDate();

  const items = await kraApi<KraTrainerInfoItem>('TRAINER_INFO', rcDate, {
    meet,
    params: { trNo },
  });

  if (items.length === 0) {
    return null;
  }

  return mapTrainerInfo(items[0]);
}

/**
 * 조교사 검색 (이름으로)
 *
 * @param name 조교사명 (부분 일치)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function searchTrainersByName(
  name: string,
  date?: string
): Promise<Trainer[]> {
  const allTrainers = await fetchAllTrainerResults(date);

  const filtered = allTrainers.filter((t) =>
    t.name.toLowerCase().includes(name.toLowerCase())
  );

  return sortTrainersByWinRate(filtered);
}

/**
 * 조교사 랭킹 조회 (승률순)
 *
 * @param meet 경마장 코드 (선택, 없으면 전체)
 * @param limit 최대 결과 수 (기본값: 20)
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchTrainerRanking(
  meet?: string,
  limit: number = 20,
  date?: string
): Promise<Trainer[]> {
  let trainers: Trainer[];

  if (meet) {
    trainers = await fetchTrainerResults(meet, date);
  } else {
    trainers = await fetchAllTrainerResults(date);
  }

  // 최소 출주횟수 필터 (10회 이상)
  const qualified = trainers.filter((t) => t.totalStarts >= 10);

  // 승률순 정렬 및 상위 N개
  return sortTrainersByWinRate(qualified).slice(0, limit);
}

/**
 * 조교사별 관리마 두수 조회
 *
 * @param meet 경마장 코드
 * @param date 기준일자 (YYYYMMDD, 기본값: 오늘)
 */
export async function fetchTrainerHorseCount(
  meet: string,
  date?: string
): Promise<Array<{ id: string; name: string; horseCount: number }>> {
  const rcDate = date || getTodayDate();

  try {
    const items = await kraApi<KraTrainerInfoItem>('TRAINER_HORSE_COUNT', rcDate, {
      meet,
      numOfRows: 100,
    });

    return items.map((item) => ({
      id: item.trNo,
      name: item.trName,
      horseCount: parseInt(item.hrCnt || '0', 10),
    }));
  } catch {
    console.warn('[fetchTrainerHorseCount] API not available');
    return [];
  }
}

/**
 * 조교사 정보 Safe 버전 (에러 시 빈 배열)
 */
export async function fetchTrainerResultsSafe(
  meet: string,
  date?: string
): Promise<{ data: Trainer[]; isStale?: boolean; warning?: string }> {
  const rcDate = date || getTodayDate();

  const result = await kraApiSafe<KraTrainerInfoItem>('TRAINER_INFO', rcDate, {
    meet,
    numOfRows: 100,
  });

  return {
    data: mapTrainerInfoList(result.data),
    isStale: result.isStale,
    warning: result.warning,
  };
}
