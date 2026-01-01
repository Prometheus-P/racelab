/**
 * KRA Entry API
 *
 * 출마표 (출전 등록말) 조회 API
 * API23_1: entryRaceHorse_1
 */

import { kraApiSafe, kraApiAllMeets, getTodayDate } from './client';
import type { KraEntryHorseItem, RaceEntry } from './types';
import { mapEntryHorseList } from './mappers';
import { createRaceId } from '@/lib/predictions/adapters/kraAdapter';

// =============================================================================
// Main API Functions
// =============================================================================

/**
 * 특정 날짜의 출마표 조회
 *
 * @param date 경주일자 (YYYYMMDD)
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @returns 출마표 엔트리 배열
 *
 * @example
 * // 오늘 서울 경마장 출마표
 * const entries = await fetchEntryHorses(getTodayDate(), '1');
 */
export async function fetchEntryHorses(
  date?: string,
  meet?: '1' | '2' | '3'
): Promise<RaceEntry[]> {
  const targetDate = date || getTodayDate();

  if (meet) {
    const result = await kraApiSafe<KraEntryHorseItem>('ENTRY_HORSE', targetDate, {
      meet,
      numOfRows: 500,
    });
    return mapEntryHorseList(result.data);
  }

  // 전체 경마장 조회
  const items = await kraApiAllMeets<KraEntryHorseItem>('ENTRY_HORSE', targetDate, {
    numOfRows: 500,
  });
  return mapEntryHorseList(items);
}

/**
 * 출마표 조회 (Safe 버전 - 경고 포함)
 */
export async function fetchEntryHorsesSafe(
  date?: string,
  meet?: '1' | '2' | '3'
): Promise<{ data: RaceEntry[]; isStale: boolean; warning?: string }> {
  const targetDate = date || getTodayDate();

  const result = await kraApiSafe<KraEntryHorseItem>('ENTRY_HORSE', targetDate, {
    meet,
    numOfRows: 500,
  });

  return {
    data: mapEntryHorseList(result.data),
    isStale: result.isStale ?? false,
    warning: result.warning,
  };
}

// =============================================================================
// Grouped Access
// =============================================================================

/**
 * 경주별로 그룹화된 출마표 조회
 *
 * @param date 경주일자 (YYYYMMDD)
 * @param meet 경마장 코드 (선택)
 * @returns 경주ID → 엔트리 배열 맵
 *
 * @example
 * const byRace = await fetchEntriesByRace('20241225');
 * // Map { '1-20241225-01' => [...], '1-20241225-02' => [...], ... }
 */
export async function fetchEntriesByRace(
  date?: string,
  meet?: '1' | '2' | '3'
): Promise<Map<string, RaceEntry[]>> {
  const entries = await fetchEntryHorses(date, meet);
  return groupEntriesByRace(entries);
}

/**
 * 특정 경주의 출마표 조회
 *
 * @param date 경주일자
 * @param meet 경마장 코드
 * @param raceNo 경주번호
 */
export async function fetchEntriesForRace(
  date: string,
  meet: '1' | '2' | '3',
  raceNo: number
): Promise<RaceEntry[]> {
  const result = await kraApiSafe<KraEntryHorseItem>('ENTRY_HORSE', date, {
    meet,
    params: { rcNo: String(raceNo) },
    numOfRows: 50,
  });
  return mapEntryHorseList(result.data);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * 엔트리를 경주별로 그룹화
 */
export function groupEntriesByRace(
  entries: RaceEntry[]
): Map<string, RaceEntry[]> {
  const byRace = new Map<string, RaceEntry[]>();

  for (const entry of entries) {
    // meet 필드가 이미 이름으로 변환되어 있을 수 있으므로 코드로 역변환
    const meetCode = getMeetCode(entry.meet);
    const raceId = createRaceId(meetCode, entry.raceDate, entry.raceNo);

    if (!byRace.has(raceId)) {
      byRace.set(raceId, []);
    }
    byRace.get(raceId)!.push(entry);
  }

  return byRace;
}

/**
 * 경마장 이름 → 코드 변환
 */
function getMeetCode(meet: string): string {
  const codeMap: Record<string, string> = {
    서울: '1',
    제주: '2',
    부경: '3',
    '1': '1',
    '2': '2',
    '3': '3',
  };
  return codeMap[meet] || meet;
}

/**
 * 오늘 경주 존재 여부 확인
 */
export async function hasTodayRaces(meet?: '1' | '2' | '3'): Promise<boolean> {
  const entries = await fetchEntryHorses(undefined, meet);
  return entries.length > 0;
}

/**
 * 특정 날짜의 경주 수 조회
 */
export async function getRaceCount(
  date?: string,
  meet?: '1' | '2' | '3'
): Promise<number> {
  const byRace = await fetchEntriesByRace(date, meet);
  return byRace.size;
}

/**
 * 경주별 출전마 수 조회
 */
export async function getFieldSizes(
  date?: string,
  meet?: '1' | '2' | '3'
): Promise<Map<string, number>> {
  const byRace = await fetchEntriesByRace(date, meet);
  const fieldSizes = new Map<string, number>();

  Array.from(byRace.entries()).forEach(([raceId, entries]) => {
    fieldSizes.set(raceId, entries.length);
  });

  return fieldSizes;
}
