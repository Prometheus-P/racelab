/**
 * Jockey-Trainer Combo Types
 *
 * 기수-조교사 콤보 분석 타입 정의
 * 연구 문서: 특정 조합의 승률이 개별 성적 대비 30-40%까지 상승
 */

// =============================================================================
// 시너지 등급
// =============================================================================

/** 콤보 시너지 등급 */
export type ComboSynergyGrade = 'S' | 'A' | 'B' | 'C' | 'D';

/** 시너지 등급별 점수 범위 */
export const SYNERGY_GRADE_THRESHOLDS: Record<ComboSynergyGrade, { min: number; max: number }> = {
  S: { min: 85, max: 100 },
  A: { min: 70, max: 84 },
  B: { min: 50, max: 69 },
  C: { min: 30, max: 49 },
  D: { min: 0, max: 29 },
};

/** 시너지 등급별 라벨 */
export const SYNERGY_GRADE_LABELS: Record<ComboSynergyGrade, { ko: string; en: string }> = {
  S: { ko: '최상', en: 'Excellent' },
  A: { ko: '상', en: 'Good' },
  B: { ko: '중', en: 'Average' },
  C: { ko: '하', en: 'Below Average' },
  D: { ko: '최하', en: 'Poor' },
};

// =============================================================================
// 콤보 기본 타입
// =============================================================================

/** 콤보 식별자 */
export interface ComboId {
  /** 기수 ID */
  jockeyId: string;
  /** 조교사 ID */
  trainerId: string;
}

/** 기수-조교사 콤보 기본 정보 */
export interface JockeyTrainerCombo {
  /** 기수 ID */
  jockeyId: string;
  /** 기수명 */
  jockeyName: string;
  /** 조교사 ID */
  trainerId: string;
  /** 조교사명 */
  trainerName: string;
  /** 경마장 코드 */
  meet: string;
  /** 경마장명 */
  meetName: string;
}

// =============================================================================
// 콤보 성적 통계
// =============================================================================

/** 거리/등급별 세부 성적 */
export interface BreakdownStats {
  /** 키 (거리 "1200m" 또는 등급 "G1") */
  key: string;
  /** 출전 횟수 */
  starts: number;
  /** 1착 횟수 */
  wins: number;
  /** 승률 (%) */
  winRate: number;
}

/** 콤보 성적 통계 */
export interface ComboStats {
  /** 콤보 기본 정보 */
  combo: JockeyTrainerCombo;

  // 전체 성적
  /** 총 출전 횟수 */
  totalStarts: number;
  /** 1착 횟수 */
  wins: number;
  /** 2착 횟수 */
  seconds: number;
  /** 3착 횟수 */
  thirds: number;
  /** 입상 횟수 (1-3착) */
  places: number;
  /** 승률 (%) */
  winRate: number;
  /** 복승률 (%) */
  placeRate: number;
  /** ROI (%) - 단승 기준 */
  roi: number;

  // 최근 성적 (1년)
  /** 최근 1년 출전 수 */
  recentStarts: number;
  /** 최근 1년 1착 수 */
  recentWins: number;
  /** 최근 1년 승률 (%) */
  recentWinRate: number;
  /** 최근 5경주 순위 */
  recentFinishes: number[];

  // 세부 분석
  /** 거리별 성적 */
  byDistance: BreakdownStats[];
  /** 등급별 성적 */
  byClass: BreakdownStats[];

  /** 마지막 업데이트 */
  updatedAt: string;
}

// =============================================================================
// 시너지 분석 결과
// =============================================================================

/** 콤보 시너지 분석 결과 */
export interface ComboSynergyAnalysis {
  /** 콤보 정보 */
  combo: JockeyTrainerCombo;
  /** 콤보 성적 */
  stats: ComboStats;

  /** 시너지 등급 (S/A/B/C/D) */
  grade: ComboSynergyGrade;
  /** 시너지 점수 (0-100) */
  synergyScore: number;

  /**
   * 상승률 (%)
   * 개별 성적 평균 대비 콤보 승률 상승 비율
   * 양수 = 시너지 있음, 음수 = 역시너지
   */
  upliftPercent: number;

  /** 개별 기수 승률 (%) */
  jockeyIndividualWinRate: number;
  /** 개별 조교사 승률 (%) */
  trainerIndividualWinRate: number;
  /** 기대 승률 (개별 평균) */
  expectedWinRate: number;

  /** 신뢰도 (샘플 수 기반) */
  confidence: 'high' | 'medium' | 'low';
  /** 분석 근거 */
  reasoning: string[];
}

// =============================================================================
// 유틸리티 함수
// =============================================================================

/**
 * 시너지 점수에서 등급 산정
 */
export function getSynergyGrade(score: number): ComboSynergyGrade {
  if (score >= SYNERGY_GRADE_THRESHOLDS.S.min) return 'S';
  if (score >= SYNERGY_GRADE_THRESHOLDS.A.min) return 'A';
  if (score >= SYNERGY_GRADE_THRESHOLDS.B.min) return 'B';
  if (score >= SYNERGY_GRADE_THRESHOLDS.C.min) return 'C';
  return 'D';
}

/**
 * 시너지 점수 계산
 *
 * 요소:
 * - 승률 상승률 (40%)
 * - 샘플 수 (30%)
 * - 최근 폼 (20%)
 * - 등급별 성과 (10%)
 */
export function calculateSynergyScore(
  comboWinRate: number,
  jockeyWinRate: number,
  trainerWinRate: number,
  sampleSize: number,
  recentFinishes: number[] = []
): number {
  // 기대 승률 (개별 평균)
  const expectedRate = (jockeyWinRate + trainerWinRate) / 2;

  // 상승률 계산
  const uplift = expectedRate > 0 ? ((comboWinRate - expectedRate) / expectedRate) * 100 : 0;

  // 상승률 점수 (40점 만점)
  // +50% 이상 상승 = 40점, -50% 하락 = 0점
  const upliftScore = Math.max(0, Math.min(40, (uplift + 50) * 0.4));

  // 샘플 수 점수 (30점 만점)
  // 50회 이상 = 30점, 1회 = 1점
  const sampleScore = Math.min(30, Math.max(1, sampleSize * 0.6));

  // 최근 폼 점수 (20점 만점)
  // 최근 5경주 평균 순위 (낮을수록 좋음)
  let formScore = 10; // 기본값
  if (recentFinishes.length > 0) {
    const avgFinish = recentFinishes.reduce((a, b) => a + b, 0) / recentFinishes.length;
    // 평균 1위 = 20점, 평균 10위 = 0점
    formScore = Math.max(0, Math.min(20, (10 - avgFinish) * 2));
  }

  // 기본 점수 (10점)
  const baseScore = 10;

  return Math.round(upliftScore + sampleScore + formScore + baseScore);
}

/**
 * 신뢰도 수준 산정 (샘플 수 기반)
 */
export function getConfidenceLevel(sampleSize: number): 'high' | 'medium' | 'low' {
  if (sampleSize >= 30) return 'high';
  if (sampleSize >= 10) return 'medium';
  return 'low';
}

/**
 * 상승률 계산
 */
export function calculateUplift(
  comboWinRate: number,
  jockeyWinRate: number,
  trainerWinRate: number
): number {
  const expectedRate = (jockeyWinRate + trainerWinRate) / 2;
  if (expectedRate === 0) return 0;
  return ((comboWinRate - expectedRate) / expectedRate) * 100;
}

/**
 * 콤보 ID 생성
 */
export function createComboId(jockeyId: string, trainerId: string): string {
  return `${jockeyId}_${trainerId}`;
}

/**
 * 콤보 ID 파싱
 */
export function parseComboId(comboId: string): ComboId | null {
  const parts = comboId.split('_');
  if (parts.length !== 2) return null;
  return {
    jockeyId: parts[0],
    trainerId: parts[1],
  };
}
