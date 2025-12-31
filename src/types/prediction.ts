/**
 * Prediction Types
 *
 * 경마 예측 시스템의 입출력 타입 정의
 * MVP 버전: 핵심 기능에 집중한 간소화된 타입
 */

import type { TrackCondition } from './track-condition';

// =============================================================================
// 신뢰도 및 추천 타입
// =============================================================================

/** 예측 신뢰도 수준 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/** 추천 액션 타입 */
export type RecommendationAction = 'strong_bet' | 'bet' | 'consider' | 'avoid';

/** 베팅 타입 */
export type BetType = 'win' | 'place' | 'quinella' | 'exacta' | 'none';

// =============================================================================
// 요소별 점수 (Factor Scores)
// =============================================================================

/** 개별 예측 요소 점수 */
export interface FactorScore {
  /** 요소 ID (예: 'rating', 'jockeyWinRate') */
  factor: string;
  /** 요소명 (한글) */
  label: string;
  /** 정규화된 점수 (0-100) */
  score: number;
  /** 가중치 (0-1, 합계 1.0) */
  weight: number;
  /** 기여도 (score * weight) */
  contribution: number;
  /** 원본 값 (정규화 전) */
  rawValue?: number;
  /** 단위 */
  unit?: string;
}

/** 점수 분류 (카테고리별 합산) */
export interface ScoreBreakdown {
  // 외부 요인 (40%)
  trackConditionScore: number;
  gatePositionScore: number;
  distanceFitScore: number;
  fieldSizeScore: number;
  surfaceScore: number;

  // 내부 요인 (60%)
  ratingScore: number;
  formScore: number;
  burdenFitScore: number;
  distancePreferenceScore: number;
  jockeyScore: number;
  trainerScore: number;
  comboSynergyScore: number;
  bloodlineScore: number;

  // 카테고리 소계
  externalTotal: number;
  internalTotal: number;
}

// =============================================================================
// 예측 입력 (Prediction Input)
// =============================================================================

/** 경주 컨텍스트 */
export interface RaceContext {
  /** 경주 ID */
  raceId: string;
  /** 경주일 (YYYYMMDD) */
  raceDate: string;
  /** 경마장 코드 (1=서울, 2=제주, 3=부경) */
  meetCode: string;
  /** 경주번호 */
  raceNo: number;
  /** 경주명 */
  raceName?: string;
  /** 경주 거리 (m) */
  distance: number;
  /** 주로 표면 */
  surface: 'turf' | 'dirt';
  /** 등급 */
  grade?: string;
  /** 출주 두수 */
  fieldSize: number;
  /** 주로상태 */
  trackCondition: TrackCondition;
}

/** 출전마 입력 데이터 (MVP) */
export interface EntryInput {
  /** 마번 (게이트 번호) */
  no: number;
  /** 마명 */
  horseName: string;

  // 기본 정보
  /** 마 레이팅 */
  rating?: number;
  /** 최근 5경주 순위 */
  recentFinishes: number[];

  // 체중 정보
  /** 부담중량 (kg) */
  burdenWeight: number;
  /** 현재 마체중 (kg) */
  currentWeight?: number;

  // 기수 정보
  jockey: {
    id: string;
    name: string;
    /** 최근 1년 승률 (%) */
    winRate: number;
    /** 폼 점수 (1-5) */
    formScore: number;
    /** 주행 스타일 */
    style?: 'front-runner' | 'closer' | 'versatile';
  };

  // 조교사 정보
  trainer: {
    id: string;
    name: string;
    /** 최근 1년 승률 (%) */
    winRate: number;
  };

  // 콤보 정보 (기수-조교사)
  combo?: {
    winRate?: number;
    starts?: number;
  };

  // 혈통 정보
  bloodline?: {
    sire?: string;
    dam?: string;
    grandsire?: string;
    /** 더트 적성 (1-5) */
    dirtAptitude?: number;
    /** 해당 거리 적성 (1-5) */
    distanceAptitude?: number;
  };

  // 배당 정보
  odds?: number;
}

/** 예측 입력 전체 */
export interface PredictionInput {
  race: RaceContext;
  entries: EntryInput[];
}

// =============================================================================
// 예측 결과 (Prediction Result)
// =============================================================================

/** 추천 정보 */
export interface PredictionRecommendation {
  action: RecommendationAction;
  betType?: BetType;
  reasoning: string[];
}

/** 가치 분석 결과 */
export interface ValueAnalysisResult {
  impliedProbability: number;
  modelProbability: number;
  edge: number;
  kellyFraction: number;
  isValue: boolean;
}

/** 개별 출전마 예측 결과 */
export interface HorsePrediction {
  entryNo: number;
  horseName: string;

  // 확률
  winProbability: number;
  placeProbability?: number;
  expectedPosition: number;

  // 점수
  totalScore: number;

  // 신뢰도
  confidence: number;
  confidenceLevel: ConfidenceLevel;

  // 순위
  predictedRank?: number;

  // 추천
  recommendation: PredictionRecommendation;

  // 점수 분해
  factors: FactorScore[];
  scoreBreakdown: ScoreBreakdown;

  // 가치 분석 (배당 있을 때)
  valueAnalysis?: ValueAnalysisResult;
}

/** 경주 전체 예측 결과 */
export interface RacePrediction {
  raceId: string;
  meetCode: string;
  raceNo: number;

  trackCondition: TrackCondition;
  predictions: HorsePrediction[];
  recommendations: PredictionRecommendation[];

  generatedAt: string;
  modelVersion: string;
}

// =============================================================================
// 모델 가중치 설정
// =============================================================================

/** 모델 가중치 설정 */
export interface ModelWeights {
  id: string;
  name: string;
  version: string;

  /** 외부 요인 가중치 (합계 0.40) */
  external: {
    trackCondition: number;
    gatePosition: number;
    trackFit: number;
    fieldSize: number;
    surface: number;
  };

  /** 내부 요인 가중치 (합계 0.60) */
  internal: {
    rating: number;
    recentForm: number;
    burdenFit: number;
    distancePreference: number;
    jockeyWinRate: number;
    trainerWinRate: number;
    jockeyTrainerCombo: number;
    bloodlineAptitude: number;
  };

  /** 조정값 */
  adjustments: {
    seoulMultiplier: number;
    busanMultiplier: number;
    jejuMultiplier: number;
    sprintBonus: number;
    routeBonus: number;
    wetTrackCloserBonus: number;
    dryTrackFrontBonus: number;
  };

  createdAt: string;
}
