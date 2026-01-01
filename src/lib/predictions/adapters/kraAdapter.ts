/**
 * KRA API Adapter
 *
 * KRA API 데이터를 예측 엔진 입력으로 변환
 */

import type {
  PredictionInput,
  EntryInput,
  RaceContext,
} from '@/types/prediction';
import type { TrackCondition } from '@/types/track-condition';
import { createTrackConditionFromMoisture } from '@/types/track-condition';
import type {
  RaceEntry,
  Jockey,
  Trainer,
  Horse,
  HorseRaceRecord,
  RaceOdds,
} from '@/lib/api/kra/types';

// =============================================================================
// Types
// =============================================================================

export interface KraRaceData {
  /** 경주 기본 정보 */
  raceId: string;
  raceDate: string;
  meetCode: '1' | '2' | '3';
  raceNo: number;
  raceName?: string;
  distance: number;
  surface: 'dirt' | 'turf';
  grade?: string;

  /** 출전마 목록 */
  entries: RaceEntry[];

  /** 배당률 (선택) */
  odds?: RaceOdds;

  /** 주로상태 코드 (선택, 없으면 Mock) */
  trackConditionCode?: '1' | '2' | '3' | '4';
}

export interface KraHorseData {
  horse: Horse;
  records: HorseRaceRecord[];
}

export interface KraRelatedData {
  /** 기수 정보 맵 (기수명 → Jockey) */
  jockeys: Map<string, Jockey>;
  /** 조교사 정보 맵 (조교사명 → Trainer) */
  trainers: Map<string, Trainer>;
  /** 마필 정보 맵 (마번 → Horse) */
  horses: Map<string, KraHorseData>;
}

// =============================================================================
// Adapter Functions
// =============================================================================

/**
 * KRA 경주 데이터를 예측 입력으로 변환
 */
export function adaptKraRace(
  race: KraRaceData,
  related: KraRelatedData
): PredictionInput {
  const raceContext = createRaceContext(race);
  const entries = race.entries.map((entry) =>
    adaptEntry(entry, race, related)
  );

  return {
    race: raceContext,
    entries,
  };
}

/**
 * RaceContext 생성
 */
function createRaceContext(race: KraRaceData): RaceContext {
  // 주로상태 생성 (Mock 또는 실제)
  const trackCondition = createTrackConditionFromCode(race.trackConditionCode);

  return {
    raceId: race.raceId,
    raceDate: race.raceDate,
    meetCode: race.meetCode,
    raceNo: race.raceNo,
    raceName: race.raceName,
    distance: race.distance,
    surface: race.surface,
    grade: race.grade,
    trackCondition,
    fieldSize: race.entries.length,
  };
}

/**
 * 주로상태 코드에서 TrackCondition 생성
 */
function createTrackConditionFromCode(
  code?: '1' | '2' | '3' | '4'
): TrackCondition {
  if (!code) {
    // 코드 없으면 기본 양호 상태 (함수율 10%)
    return createTrackConditionFromMoisture(10);
  }

  // 코드별 추정 함수율
  const moistureMap: Record<string, number> = {
    '1': 8, // 양호
    '2': 15, // 약간불량
    '3': 22, // 불량
    '4': 28, // 극불량
  };

  return createTrackConditionFromMoisture(moistureMap[code] ?? 10);
}

/**
 * 출마표 엔트리를 EntryInput으로 변환
 */
function adaptEntry(
  entry: RaceEntry,
  race: KraRaceData,
  related: KraRelatedData
): EntryInput {
  const horseData = related.horses.get(entry.horseNo);
  const jockey = entry.jockey ? related.jockeys.get(entry.jockey) : undefined;
  const trainer = related.trainers.get(entry.trainer);

  // 최근 5경주 성적 추출
  const recentFinishes = extractRecentFinishes(horseData?.records ?? [], 5);

  // 현재 마체중 (최근 기록에서 추출)
  const currentWeight = extractCurrentWeight(horseData?.records ?? []);

  // 배당률
  const odds = race.odds?.win[entry.horseNo];

  return {
    no: parseInt(entry.horseNo) || 0,
    horseName: entry.horseName,
    rating: entry.rating,
    recentFinishes,
    burdenWeight: entry.burden ?? 55,
    currentWeight,

    jockey: {
      id: jockey?.id ?? entry.jockey ?? '',
      name: jockey?.name ?? entry.jockey ?? '',
      winRate: jockey?.recentWinRate ?? 10,
      formScore: calculateJockeyFormScore(jockey),
      style: inferJockeyStyle(jockey),
    },

    trainer: {
      id: trainer?.id ?? '',
      name: trainer?.name ?? entry.trainer,
      winRate: trainer?.recentWinRate ?? 10,
    },

    combo: extractComboStats(jockey, trainer),

    bloodline: extractBloodline(horseData?.horse),

    odds,
  };
}

/**
 * 최근 N경주 성적 추출
 */
function extractRecentFinishes(
  records: HorseRaceRecord[],
  count: number
): number[] {
  // 날짜순 정렬 (최신 먼저)
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sorted.slice(0, count).map((r) => r.position);
}

/**
 * 현재 마체중 추출 (최근 기록)
 */
function extractCurrentWeight(records: HorseRaceRecord[]): number | undefined {
  if (records.length === 0) return undefined;

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sorted[0].weight;
}

/**
 * 기수 폼 점수 계산 (1-5)
 */
function calculateJockeyFormScore(jockey?: Jockey): number {
  if (!jockey) return 3;

  // 최근 1년 승률 기반
  const winRate = jockey.recentWinRate;

  if (winRate >= 20) return 5;
  if (winRate >= 15) return 4;
  if (winRate >= 10) return 3;
  if (winRate >= 5) return 2;
  return 1;
}

/**
 * 기수 스타일 추론 (데이터 없으면 versatile)
 */
function inferJockeyStyle(
  _jockey?: Jockey
): 'front-runner' | 'closer' | 'versatile' {
  // MVP에서는 데이터 없으므로 versatile 반환
  // 향후 기수별 레이스 스타일 분석 추가 예정
  return 'versatile';
}

/**
 * 콤보 통계 추출
 */
function extractComboStats(
  jockey?: Jockey,
  trainer?: Trainer
): EntryInput['combo'] {
  if (!jockey || !trainer) return undefined;

  // MVP에서는 개별 승률 평균으로 추정
  // 향후 실제 콤보 통계 API 연동 예정
  const avgWinRate = (jockey.recentWinRate + trainer.recentWinRate) / 2;

  return {
    winRate: avgWinRate,
    starts: 10, // 추정값
  };
}

/**
 * 혈통 정보 추출
 */
function extractBloodline(
  horse?: Horse
): EntryInput['bloodline'] {
  if (!horse) return undefined;

  // MVP에서는 기본값 사용
  // 향후 혈통 분석 모듈 연동 예정
  return {
    sire: horse.sire,
    dam: horse.dam,
    grandsire: horse.grandsire,
    distanceAptitude: 3, // 중거리 기본
    dirtAptitude: 3, // 중립
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * 경주 ID 생성
 */
export function createRaceId(
  meetCode: string,
  raceDate: string,
  raceNo: number
): string {
  return `${meetCode}-${raceDate}-${String(raceNo).padStart(2, '0')}`;
}

/**
 * 경마장 코드로 표면 타입 결정
 */
export function getSurfaceByMeet(
  meetCode: string,
  distance: number
): 'dirt' | 'turf' {
  // 한국 경마는 대부분 더트
  // 서울 1800m 이상 일부 잔디 코스 있음
  if (meetCode === '1' && distance >= 1800) {
    // 서울 장거리는 잔디 가능성
    return 'dirt'; // 기본값, 실제로는 경주별 확인 필요
  }
  return 'dirt';
}

/**
 * 부담중량 기본값 계산
 */
export function getDefaultBurden(
  age: number,
  sex: string,
  _grade?: string
): number {
  // 연령별 기본 부담
  let base = 55;

  if (age <= 2) base = 52;
  else if (age === 3) base = 54;
  else if (age >= 5) base = 56;

  // 암말 -2kg
  if (sex === '암' || sex === 'F') base -= 2;

  return base;
}
