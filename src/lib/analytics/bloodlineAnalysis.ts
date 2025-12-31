/**
 * Bloodline Analysis
 *
 * 혈통 기반 적성 분석
 * 연구문서: 부마 70% + 모부마 30% 영향
 */

// =============================================================================
// Types
// =============================================================================

/** 씨수마 통계 */
export interface SireStats {
  /** 씨수마명 */
  name: string;
  /** 산자 수 */
  offspring: number;
  /** 총 출전 수 */
  starts: number;
  /** 총 승리 수 */
  wins: number;
  /** 승률 (%) */
  winRate: number;

  /** 거리별 성적 */
  byDistance: DistanceAptitude[];
  /** 주로별 성적 */
  bySurface: SurfaceAptitude[];
  /** 등급별 성적 */
  byClass: ClassAptitude[];

  /** 거리 적성 점수 (1-5) */
  distanceAptitude: number;
  /** 최적 거리 (m) */
  optimalDistance: number;
  /** 더트 적성 점수 (1-5) */
  dirtAptitude: number;
  /** 스프린트 적성 */
  sprintAptitude: number;
  /** 장거리 적성 */
  stayerAptitude: number;
}

/** 거리별 적성 */
export interface DistanceAptitude {
  /** 거리 범위 */
  range: string;
  /** 거리 카테고리 */
  category: 'sprint' | 'mile' | 'middle' | 'long';
  /** 출전 수 */
  starts: number;
  /** 승리 수 */
  wins: number;
  /** 승률 (%) */
  winRate: number;
  /** 적성 점수 (1-5) */
  score: number;
}

/** 주로별 적성 */
export interface SurfaceAptitude {
  surface: 'dirt' | 'turf';
  starts: number;
  wins: number;
  winRate: number;
  score: number;
}

/** 등급별 적성 */
export interface ClassAptitude {
  class: string;
  starts: number;
  wins: number;
  winRate: number;
}

/** 혈통 분석 결과 */
export interface BloodlineAnalysis {
  /** 마필명 */
  horseName: string;
  /** 부마 */
  sire?: string;
  /** 모마 */
  dam?: string;
  /** 외조부마 */
  grandsire?: string;

  /** 부마 통계 */
  sireStats?: SireStats;
  /** 외조부 통계 */
  grandsireStats?: SireStats;

  /** 종합 거리 적성 (1-5) */
  distanceAptitude: number;
  /** 종합 더트 적성 (1-5) */
  dirtAptitude: number;
  /** 종합 잔디 적성 (1-5) */
  turfAptitude: number;

  /** 예상 최적 거리 (m) */
  optimalDistance: number;
  /** 신뢰도 */
  reliability: 'high' | 'medium' | 'low';
  /** 분석 근거 */
  reasoning: string[];
}

// =============================================================================
// Constants
// =============================================================================

/** 거리 카테고리 정의 */
export const DISTANCE_CATEGORIES = {
  sprint: { min: 0, max: 1200, label: '단거리' },
  mile: { min: 1201, max: 1600, label: '마일' },
  middle: { min: 1601, max: 2000, label: '중거리' },
  long: { min: 2001, max: 9999, label: '장거리' },
} as const;

/** 혈통 영향도 가중치 */
export const BLOODLINE_WEIGHTS = {
  sire: 0.7, // 부마 70%
  grandsire: 0.3, // 외조부 30%
} as const;

/** 유명 씨수마 거리 적성 (Mock 데이터) */
export const FAMOUS_SIRES: Record<string, Partial<SireStats>> = {
  에이피인디: {
    distanceAptitude: 3,
    optimalDistance: 1600,
    dirtAptitude: 4,
    sprintAptitude: 2,
    stayerAptitude: 3,
  },
  타핏: {
    distanceAptitude: 4,
    optimalDistance: 1800,
    dirtAptitude: 4,
    sprintAptitude: 2,
    stayerAptitude: 4,
  },
  메니피크: {
    distanceAptitude: 3,
    optimalDistance: 1400,
    dirtAptitude: 4,
    sprintAptitude: 3,
    stayerAptitude: 2,
  },
  블루치퍼: {
    distanceAptitude: 2,
    optimalDistance: 1200,
    dirtAptitude: 5,
    sprintAptitude: 5,
    stayerAptitude: 1,
  },
  퓨처윈: {
    distanceAptitude: 3,
    optimalDistance: 1600,
    dirtAptitude: 4,
    sprintAptitude: 3,
    stayerAptitude: 3,
  },
};

// =============================================================================
// Analysis Functions
// =============================================================================

/**
 * 혈통 분석 수행
 */
export function analyzeBloodline(
  horseName: string,
  sire?: string,
  dam?: string,
  grandsire?: string
): BloodlineAnalysis {
  const sireStats = sire ? getSireStats(sire) : undefined;
  const grandsireStats = grandsire ? getSireStats(grandsire) : undefined;

  // 적성 점수 계산 (부마 70% + 외조부 30%)
  const distanceAptitude = calculateWeightedAptitude(
    sireStats?.distanceAptitude,
    grandsireStats?.distanceAptitude
  );

  const dirtAptitude = calculateWeightedAptitude(
    sireStats?.dirtAptitude,
    grandsireStats?.dirtAptitude
  );

  // 잔디 적성 (더트 역산)
  const turfAptitude = 6 - dirtAptitude;

  // 최적 거리 계산
  const optimalDistance = calculateOptimalDistance(sireStats, grandsireStats);

  // 신뢰도 판정
  const reliability = getBloodlineReliability(sireStats, grandsireStats);

  // 분석 근거 생성
  const reasoning = generateReasoning(sireStats, grandsireStats, distanceAptitude, dirtAptitude);

  return {
    horseName,
    sire,
    dam,
    grandsire,
    sireStats,
    grandsireStats,
    distanceAptitude,
    dirtAptitude,
    turfAptitude,
    optimalDistance,
    reliability,
    reasoning,
  };
}

/**
 * 씨수마 통계 조회 (Mock)
 */
export function getSireStats(sireName: string): SireStats | undefined {
  const known = FAMOUS_SIRES[sireName];

  if (known) {
    return {
      name: sireName,
      offspring: 50,
      starts: 200,
      wins: 30,
      winRate: 15,
      byDistance: [],
      bySurface: [],
      byClass: [],
      distanceAptitude: known.distanceAptitude ?? 3,
      optimalDistance: known.optimalDistance ?? 1600,
      dirtAptitude: known.dirtAptitude ?? 3,
      sprintAptitude: known.sprintAptitude ?? 3,
      stayerAptitude: known.stayerAptitude ?? 3,
    };
  }

  // 알려지지 않은 씨수마는 기본값
  return {
    name: sireName,
    offspring: 10,
    starts: 50,
    wins: 5,
    winRate: 10,
    byDistance: [],
    bySurface: [],
    byClass: [],
    distanceAptitude: 3,
    optimalDistance: 1600,
    dirtAptitude: 3,
    sprintAptitude: 3,
    stayerAptitude: 3,
  };
}

/**
 * 가중 적성 점수 계산
 */
function calculateWeightedAptitude(
  sireValue?: number,
  grandsireValue?: number
): number {
  if (sireValue && grandsireValue) {
    return Math.round(
      sireValue * BLOODLINE_WEIGHTS.sire +
        grandsireValue * BLOODLINE_WEIGHTS.grandsire
    );
  }

  if (sireValue) return sireValue;
  if (grandsireValue) return grandsireValue;
  return 3; // 기본값 (중립)
}

/**
 * 최적 거리 계산
 */
function calculateOptimalDistance(
  sireStats?: SireStats,
  grandsireStats?: SireStats
): number {
  if (sireStats && grandsireStats) {
    return Math.round(
      sireStats.optimalDistance * BLOODLINE_WEIGHTS.sire +
        grandsireStats.optimalDistance * BLOODLINE_WEIGHTS.grandsire
    );
  }

  if (sireStats) return sireStats.optimalDistance;
  if (grandsireStats) return grandsireStats.optimalDistance;
  return 1600; // 기본값 (마일)
}

/**
 * 혈통 분석 신뢰도 판정
 */
function getBloodlineReliability(
  sireStats?: SireStats,
  grandsireStats?: SireStats
): 'high' | 'medium' | 'low' {
  if (sireStats && grandsireStats) {
    const totalOffspring = sireStats.offspring + grandsireStats.offspring;
    if (totalOffspring >= 100) return 'high';
    if (totalOffspring >= 30) return 'medium';
  }

  if (sireStats && sireStats.offspring >= 30) return 'medium';
  return 'low';
}

/**
 * 분석 근거 생성
 */
function generateReasoning(
  sireStats?: SireStats,
  grandsireStats?: SireStats,
  distanceAptitude?: number,
  dirtAptitude?: number
): string[] {
  const reasons: string[] = [];

  if (sireStats) {
    reasons.push(
      `부마 ${sireStats.name}: 최적거리 ${sireStats.optimalDistance}m, 더트 적성 ${sireStats.dirtAptitude}점`
    );
  }

  if (grandsireStats) {
    reasons.push(
      `외조부 ${grandsireStats.name}: 거리적성 ${grandsireStats.distanceAptitude}점`
    );
  }

  if (distanceAptitude) {
    const distanceDesc =
      distanceAptitude >= 4
        ? '장거리 적성'
        : distanceAptitude <= 2
          ? '단거리 적성'
          : '중거리 적성';
    reasons.push(`종합 ${distanceDesc} (${distanceAptitude}점)`);
  }

  if (dirtAptitude) {
    const surfaceDesc =
      dirtAptitude >= 4
        ? '더트 강점'
        : dirtAptitude <= 2
          ? '잔디 선호'
          : '주로 중립';
    reasons.push(`${surfaceDesc} (${dirtAptitude}점)`);
  }

  if (reasons.length === 0) {
    reasons.push('혈통 정보 부족 - 기본값 적용');
  }

  return reasons;
}

// =============================================================================
// Prediction Integration
// =============================================================================

/**
 * 예측 입력용 혈통 데이터 반환
 */
export function getBloodlineForPrediction(
  sire?: string,
  dam?: string,
  grandsire?: string
): {
  sire?: string;
  dam?: string;
  grandsire?: string;
  distanceAptitude: number;
  dirtAptitude: number;
} {
  const analysis = analyzeBloodline('', sire, dam, grandsire);

  return {
    sire,
    dam,
    grandsire,
    distanceAptitude: analysis.distanceAptitude,
    dirtAptitude: analysis.dirtAptitude,
  };
}

/**
 * 거리 적합도 점수 계산
 */
export function calculateDistanceFitScore(
  bloodlineAptitude: number,
  raceDistance: number
): number {
  const category = getDistanceCategory(raceDistance);

  // 적성과 거리 카테고리 매칭
  // aptitude: 1=단거리, 2=마일-, 3=중거리, 4=마일+, 5=장거리
  const categoryScore: Record<string, Record<number, number>> = {
    sprint: { 1: 100, 2: 75, 3: 50, 4: 30, 5: 10 },
    mile: { 1: 60, 2: 90, 3: 80, 4: 90, 5: 50 },
    middle: { 1: 30, 2: 60, 3: 100, 4: 80, 5: 70 },
    long: { 1: 10, 2: 40, 3: 70, 4: 85, 5: 100 },
  };

  return categoryScore[category]?.[bloodlineAptitude] ?? 50;
}

/**
 * 거리 카테고리 조회
 */
export function getDistanceCategory(
  distance: number
): 'sprint' | 'mile' | 'middle' | 'long' {
  if (distance <= DISTANCE_CATEGORIES.sprint.max) return 'sprint';
  if (distance <= DISTANCE_CATEGORIES.mile.max) return 'mile';
  if (distance <= DISTANCE_CATEGORIES.middle.max) return 'middle';
  return 'long';
}

/**
 * 주로 적합도 점수 계산
 */
export function calculateSurfaceFitScore(
  dirtAptitude: number,
  surface: 'dirt' | 'turf'
): number {
  if (surface === 'dirt') {
    // 더트 적성 그대로 점수화
    return (dirtAptitude - 1) * 25; // 1→0, 5→100
  } else {
    // 잔디는 더트 역산
    return (5 - dirtAptitude) * 25;
  }
}
