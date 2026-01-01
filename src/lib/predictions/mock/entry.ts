/**
 * Entry Mock Generator
 *
 * 예측 테스트용 출전마 데이터 생성
 */

import type { EntryInput, RaceContext } from '@/types/prediction';
import { createTrackConditionFromMoisture } from '@/types/track-condition';

// =============================================================================
// Types
// =============================================================================

export interface MockEntryOptions {
  /** 마번 */
  no?: number;
  /** 마명 */
  horseName?: string;
  /** 레이팅 (0-140) */
  rating?: number;
  /** 최근 성적 */
  recentFinishes?: number[];
  /** 부담중량 */
  burdenWeight?: number;
  /** 마체중 */
  currentWeight?: number;
  /** 기수 승률 */
  jockeyWinRate?: number;
  /** 조교사 승률 */
  trainerWinRate?: number;
  /** 배당률 */
  odds?: number;
}

export interface MockRaceOptions {
  /** 경마장 코드 */
  meetCode?: '1' | '2' | '3';
  /** 거리 */
  distance?: number;
  /** 출전마 수 */
  fieldSize?: number;
  /** 주로 표면 */
  surface?: 'dirt' | 'turf';
  /** 함수율 */
  moisture?: number;
}

// =============================================================================
// Mock Entry Generator
// =============================================================================

const MOCK_HORSE_NAMES = [
  '번개',
  '질주',
  '태풍',
  '승리',
  '영광',
  '희망',
  '도전',
  '전설',
  '황금',
  '은하',
  '청룡',
  '백호',
  '주작',
  '현무',
  '천둥',
];

const MOCK_JOCKEY_NAMES = [
  '김용근',
  '유현명',
  '문세영',
  '이찬호',
  '조성곤',
  '김해성',
  '박태종',
  '정도훈',
];

const MOCK_TRAINER_NAMES = [
  '박상복',
  '김영관',
  '정진규',
  '심재준',
  '최시대',
  '김순근',
  '조규림',
  '서정길',
];

/**
 * Mock 출전마 생성
 */
export function generateMockEntry(
  options: MockEntryOptions = {}
): EntryInput {
  const no = options.no ?? Math.floor(Math.random() * 14) + 1;
  const horseName =
    options.horseName ?? MOCK_HORSE_NAMES[no % MOCK_HORSE_NAMES.length];

  const jockeyIdx = no % MOCK_JOCKEY_NAMES.length;
  const trainerIdx = no % MOCK_TRAINER_NAMES.length;

  return {
    no,
    horseName,
    rating: options.rating ?? 50 + Math.floor(Math.random() * 40),
    recentFinishes: options.recentFinishes ?? generateRecentFinishes(),
    burdenWeight: options.burdenWeight ?? 54 + Math.floor(Math.random() * 4),
    currentWeight: options.currentWeight ?? 460 + Math.floor(Math.random() * 40),

    jockey: {
      id: `JK${String(jockeyIdx + 1).padStart(3, '0')}`,
      name: MOCK_JOCKEY_NAMES[jockeyIdx],
      winRate: options.jockeyWinRate ?? 5 + Math.random() * 20,
      formScore: 1 + Math.floor(Math.random() * 5),
      style: ['front-runner', 'closer', 'versatile'][
        Math.floor(Math.random() * 3)
      ] as 'front-runner' | 'closer' | 'versatile',
    },

    trainer: {
      id: `TR${String(trainerIdx + 1).padStart(3, '0')}`,
      name: MOCK_TRAINER_NAMES[trainerIdx],
      winRate: options.trainerWinRate ?? 5 + Math.random() * 15,
    },

    combo: {
      winRate: 5 + Math.random() * 15,
      starts: 5 + Math.floor(Math.random() * 25),
    },

    bloodline: {
      sire: '에이피인디',
      dam: '골든리프',
      distanceAptitude: 1 + Math.floor(Math.random() * 5),
      dirtAptitude: 1 + Math.floor(Math.random() * 5),
    },

    odds: options.odds,
  };
}

/**
 * 최근 5경주 성적 생성
 */
function generateRecentFinishes(): number[] {
  const count = 1 + Math.floor(Math.random() * 5);
  return Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 10));
}

/**
 * 여러 출전마 일괄 생성
 */
export function generateMockEntries(count: number): EntryInput[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockEntry({ no: i + 1 })
  );
}

// =============================================================================
// Mock Race Context Generator
// =============================================================================

/**
 * Mock 경주 컨텍스트 생성
 */
export function generateMockRaceContext(
  options: MockRaceOptions = {}
): RaceContext {
  const meetCode = options.meetCode ?? '1';
  const distance = options.distance ?? 1400;
  const fieldSize = options.fieldSize ?? 12;
  const surface = options.surface ?? 'dirt';
  const moisture = options.moisture ?? 10;

  const today = new Date();
  const raceDate = today.toISOString().split('T')[0].replace(/-/g, '');
  const raceNo = Math.floor(Math.random() * 12) + 1;

  return {
    raceId: `${meetCode}-${raceDate}-${String(raceNo).padStart(2, '0')}`,
    raceDate,
    meetCode,
    raceNo,
    raceName: `${distance}m 일반경주`,
    distance,
    surface,
    trackCondition: createTrackConditionFromMoisture(moisture),
    fieldSize,
  };
}

// =============================================================================
// Preset Mock Data
// =============================================================================

/**
 * 강한 본명마 프리셋
 */
export function createStrongFavorite(no: number = 1): EntryInput {
  return generateMockEntry({
    no,
    horseName: '챔피언스타',
    rating: 95,
    recentFinishes: [1, 1, 2, 1, 1],
    jockeyWinRate: 25,
    trainerWinRate: 18,
    odds: 1.5,
  });
}

/**
 * 약한 아웃사이더 프리셋
 */
export function createLongshot(no: number = 14): EntryInput {
  return generateMockEntry({
    no,
    horseName: '도전자',
    rating: 45,
    recentFinishes: [8, 10, 7, 9],
    jockeyWinRate: 5,
    trainerWinRate: 6,
    odds: 50,
  });
}

/**
 * 균형잡힌 중위권마 프리셋
 */
export function createMidPack(no: number = 5): EntryInput {
  return generateMockEntry({
    no,
    horseName: '안정주자',
    rating: 70,
    recentFinishes: [3, 4, 2, 5, 3],
    jockeyWinRate: 12,
    trainerWinRate: 10,
    odds: 8,
  });
}

/**
 * 풀 필드 시나리오 생성 (12두)
 */
export function createFullFieldScenario(): {
  race: RaceContext;
  entries: EntryInput[];
} {
  const entries: EntryInput[] = [
    createStrongFavorite(1),
    createMidPack(2),
    generateMockEntry({ no: 3, rating: 75, odds: 6 }),
    generateMockEntry({ no: 4, rating: 72, odds: 7 }),
    createMidPack(5),
    generateMockEntry({ no: 6, rating: 65, odds: 12 }),
    generateMockEntry({ no: 7, rating: 60, odds: 15 }),
    generateMockEntry({ no: 8, rating: 58, odds: 18 }),
    generateMockEntry({ no: 9, rating: 55, odds: 22 }),
    generateMockEntry({ no: 10, rating: 52, odds: 28 }),
    generateMockEntry({ no: 11, rating: 48, odds: 35 }),
    createLongshot(12),
  ];

  const race = generateMockRaceContext({
    meetCode: '1',
    distance: 1400,
    fieldSize: entries.length,
    moisture: 10,
  });

  return { race, entries };
}

/**
 * 소규모 필드 시나리오 생성 (6두)
 */
export function createSmallFieldScenario(): {
  race: RaceContext;
  entries: EntryInput[];
} {
  const entries: EntryInput[] = [
    createStrongFavorite(1),
    generateMockEntry({ no: 2, rating: 78, odds: 4 }),
    createMidPack(3),
    generateMockEntry({ no: 4, rating: 65, odds: 10 }),
    generateMockEntry({ no: 5, rating: 55, odds: 18 }),
    createLongshot(6),
  ];

  const race = generateMockRaceContext({
    meetCode: '3',
    distance: 1200,
    fieldSize: entries.length,
    moisture: 8,
  });

  return { race, entries };
}
