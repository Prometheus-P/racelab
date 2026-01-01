/**
 * KRA Live Data Source
 *
 * KRA 공공데이터 API에서 실시간 경주 데이터를 조회하여
 * 예측 엔진 입력 형식으로 변환하는 오케스트레이터
 */

import {
  fetchEntriesByRace,
  fetchAllJockeyResults,
  fetchAllTrainerResults,
  getTodayDate,
  MEET_NAMES,
  type RaceEntry,
  type Jockey,
  type Trainer,
} from '@/lib/api/kra';

import {
  adaptKraRace,
  getSurfaceByMeet,
  type KraRaceData,
  type KraRelatedData,
} from '@/lib/predictions/adapters/kraAdapter';

import type { PredictionInput } from '@/types/prediction';

// =============================================================================
// Types
// =============================================================================

export interface LiveRaceData {
  /** 경주 ID */
  raceId: string;
  /** 경주번호 */
  raceNo: number;
  /** 경주명 */
  raceName: string;
  /** 경마장명 */
  trackName: string;
  /** 거리 */
  distance: number;
  /** 예측 입력 데이터 */
  predictionInput: PredictionInput;
}

export interface FetchResult {
  /** 성공 여부 */
  success: boolean;
  /** 경주 데이터 배열 */
  races: LiveRaceData[];
  /** 경고 메시지 */
  warnings: string[];
  /** 메타 정보 */
  meta: {
    date: string;
    source: 'kra-live' | 'kra-fallback';
    fetchedAt: string;
  };
}

// =============================================================================
// Main Functions
// =============================================================================

/**
 * 오늘 경주 데이터를 KRA API에서 실시간 조회
 *
 * @param date 경주일자 (YYYYMMDD, 기본값: 오늘)
 * @param meet 경마장 코드 (1:서울, 2:제주, 3:부경)
 * @returns 예측 가능한 경주 데이터 배열
 *
 * @example
 * const result = await fetchTodaysRaces();
 * for (const race of result.races) {
 *   const prediction = engine.predictRace(race.predictionInput);
 * }
 */
export async function fetchTodaysRaces(
  date?: string,
  meet?: '1' | '2' | '3'
): Promise<FetchResult> {
  const targetDate = date || getTodayDate();
  const warnings: string[] = [];

  try {
    // 1. 출마표 조회 (경주별 그룹화)
    const entriesByRace = await fetchEntriesByRace(targetDate, meet);

    if (entriesByRace.size === 0) {
      return {
        success: true,
        races: [],
        warnings: ['오늘 예정된 경주가 없습니다.'],
        meta: {
          date: targetDate,
          source: 'kra-live',
          fetchedAt: new Date().toISOString(),
        },
      };
    }

    // 2. 기수/조교사 정보 조회 (병렬)
    const [jockeys, trainers] = await Promise.all([
      fetchAllJockeyResults(targetDate).catch((err) => {
        warnings.push(`기수 정보 조회 실패: ${err.message}`);
        return [] as Jockey[];
      }),
      fetchAllTrainerResults(targetDate).catch((err) => {
        warnings.push(`조교사 정보 조회 실패: ${err.message}`);
        return [] as Trainer[];
      }),
    ]);

    // 3. 이름 기반 조회 맵 생성
    const relatedData = createRelatedDataMaps(jockeys, trainers);

    // 4. 각 경주를 예측 입력 형식으로 변환
    const races: LiveRaceData[] = [];

    const raceEntries = Array.from(entriesByRace.entries());
    for (const [raceId, entries] of raceEntries) {
      try {
        const raceData = createKraRaceData(raceId, entries, targetDate);
        const predictionInput = adaptKraRace(raceData, relatedData);

        races.push({
          raceId,
          raceNo: raceData.raceNo,
          raceName: raceData.raceName || `제${raceData.raceNo}경주`,
          trackName: MEET_NAMES[raceData.meetCode] || raceData.meetCode,
          distance: raceData.distance,
          predictionInput,
        });
      } catch (err) {
        warnings.push(
          `경주 ${raceId} 변환 실패: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    // 경주번호순 정렬
    races.sort((a, b) => {
      const aTrack = a.trackName;
      const bTrack = b.trackName;
      if (aTrack !== bTrack) return aTrack.localeCompare(bTrack);
      return a.raceNo - b.raceNo;
    });

    return {
      success: true,
      races,
      warnings,
      meta: {
        date: targetDate,
        source: 'kra-live',
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    return {
      success: false,
      races: [],
      warnings: [
        `데이터 조회 실패: ${err instanceof Error ? err.message : 'Unknown error'}`,
      ],
      meta: {
        date: targetDate,
        source: 'kra-live',
        fetchedAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * 특정 경주만 조회
 */
export async function fetchRaceData(
  date: string,
  meet: '1' | '2' | '3',
  raceNo: number
): Promise<LiveRaceData | null> {
  const result = await fetchTodaysRaces(date, meet);

  if (!result.success || result.races.length === 0) {
    return null;
  }

  return result.races.find((r) => r.raceNo === raceNo) || null;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * 기수/조교사 이름 기반 조회 맵 생성
 */
function createRelatedDataMaps(
  jockeys: Jockey[],
  trainers: Trainer[]
): KraRelatedData {
  const jockeyMap = new Map<string, Jockey>();
  const trainerMap = new Map<string, Trainer>();

  for (const jockey of jockeys) {
    jockeyMap.set(jockey.name, jockey);
  }

  for (const trainer of trainers) {
    trainerMap.set(trainer.name, trainer);
  }

  return {
    jockeys: jockeyMap,
    trainers: trainerMap,
    horses: new Map(), // MVP에서는 마필 상세 정보 생략
  };
}

/**
 * 출마표 엔트리에서 KraRaceData 생성
 */
function createKraRaceData(
  raceId: string,
  entries: RaceEntry[],
  date: string
): KraRaceData {
  const first = entries[0];

  // meet가 이름으로 되어 있을 수 있으므로 코드로 변환
  const meetCode = getMeetCodeFromEntry(first);

  return {
    raceId,
    raceDate: date,
    meetCode,
    raceNo: first.raceNo,
    raceName: first.raceName,
    distance: first.distance,
    surface: getSurfaceByMeet(meetCode, first.distance),
    grade: first.grade,
    entries,
    trackConditionCode: '1', // 기본값: 양호
  };
}

/**
 * 엔트리에서 경마장 코드 추출
 */
function getMeetCodeFromEntry(entry: RaceEntry): '1' | '2' | '3' {
  const meet = entry.meet;

  // 이미 코드인 경우
  if (meet === '1' || meet === '2' || meet === '3') {
    return meet;
  }

  // 이름인 경우 코드로 변환
  const nameToCode: Record<string, '1' | '2' | '3'> = {
    서울: '1',
    제주: '2',
    부경: '3',
  };

  return nameToCode[meet] || '1';
}
