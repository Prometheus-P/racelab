/**
 * Combo Stats Analysis
 *
 * 기수-조교사 콤보 시너지 분석
 * 연구문서: 특정 콤보는 30-40% 승률 달성
 */

import type { ComboStats } from './types';
import type { ComboSynergyGrade, JockeyTrainerCombo } from '@/types/combo';
import { calculateSynergyScore, getSynergyGrade, calculateUplift } from '@/types/combo';

// =============================================================================
// Types
// =============================================================================

/** 상세 콤보 분석 결과 */
export interface ComboAnalysis {
  /** 기수 ID */
  jockeyId: string;
  /** 기수명 */
  jockeyName: string;
  /** 조교사 ID */
  trainerId: string;
  /** 조교사명 */
  trainerName: string;

  /** 콤보 출전 수 */
  starts: number;
  /** 콤보 1착 수 */
  wins: number;
  /** 콤보 2착 수 */
  seconds: number;
  /** 콤보 3착 수 */
  thirds: number;

  /** 콤보 승률 (%) */
  winRate: number;
  /** 콤보 복승률 (%) */
  placeRate: number;

  /** 기수 개인 승률 (%) */
  jockeyWinRate: number;
  /** 조교사 개인 승률 (%) */
  trainerWinRate: number;

  /** 시너지 점수 (0-100) */
  synergyScore: number;
  /** 시너지 등급 (S/A/B/C/D) */
  synergyGrade: ComboSynergyGrade;
  /** 상승률 (%) - 기대 승률 대비 */
  upliftPercent: number;

  /** 최근 5경주 순위 */
  recentForm: number[];
  /** 거리별 성적 */
  byDistance: Record<string, { starts: number; wins: number; rate: number }>;
  /** 등급별 성적 */
  byClass: Record<string, { starts: number; wins: number; rate: number }>;
}

/** 콤보 검색 필터 */
export interface ComboSearchFilters {
  /** 경마장 */
  track?: string;
  /** 최소 출전 수 */
  minStarts?: number;
  /** 최소 승률 */
  minWinRate?: number;
  /** 시너지 등급 */
  synergyGrade?: ComboSynergyGrade;
}

// =============================================================================
// Analysis Functions
// =============================================================================

/**
 * 콤보 통계에서 상세 분석 생성
 */
export function analyzeCombo(
  combo: ComboStats,
  jockeyWinRate: number,
  trainerWinRate: number,
  additionalData?: {
    seconds?: number;
    thirds?: number;
    recentForm?: number[];
    byDistance?: Record<string, { starts: number; wins: number; rate: number }>;
    byClass?: Record<string, { starts: number; wins: number; rate: number }>;
  }
): ComboAnalysis {
  const comboWinRate = combo.starts > 0 ? (combo.wins / combo.starts) * 100 : 0;
  const seconds = additionalData?.seconds ?? 0;
  const thirds = additionalData?.thirds ?? 0;
  const places = combo.wins + seconds + thirds;
  const placeRate = combo.starts > 0 ? (places / combo.starts) * 100 : 0;

  const recentForm = additionalData?.recentForm ?? [];
  const synergyScore = calculateSynergyScore(
    comboWinRate,
    jockeyWinRate,
    trainerWinRate,
    combo.starts,
    recentForm
  );
  const synergyGrade = getSynergyGrade(synergyScore);
  const upliftPercent = calculateUplift(comboWinRate, jockeyWinRate, trainerWinRate);

  // ID 파싱 (combo.id = "jockeyId-trainerId" 형식 가정)
  const [jockeyId, trainerId] = combo.id.split('-');

  return {
    jockeyId: jockeyId ?? combo.id,
    jockeyName: combo.name.split('-')[0]?.trim() ?? combo.name,
    trainerId: trainerId ?? '',
    trainerName: combo.name.split('-')[1]?.trim() ?? '',

    starts: combo.starts,
    wins: combo.wins,
    seconds,
    thirds,

    winRate: comboWinRate,
    placeRate,

    jockeyWinRate,
    trainerWinRate,

    synergyScore,
    synergyGrade,
    upliftPercent,

    recentForm,
    byDistance: additionalData?.byDistance ?? {},
    byClass: additionalData?.byClass ?? {},
  };
}

/**
 * 시너지가 높은 콤보 필터링
 */
export function filterSynergyticCombos(
  combos: ComboAnalysis[],
  filters: ComboSearchFilters = {}
): ComboAnalysis[] {
  return combos.filter((combo) => {
    if (filters.minStarts && combo.starts < filters.minStarts) return false;
    if (filters.minWinRate && combo.winRate < filters.minWinRate) return false;
    if (filters.synergyGrade) {
      const gradeOrder: ComboSynergyGrade[] = ['S', 'A', 'B', 'C', 'D'];
      const targetIdx = gradeOrder.indexOf(filters.synergyGrade);
      const comboIdx = gradeOrder.indexOf(combo.synergyGrade);
      if (comboIdx > targetIdx) return false;
    }
    return true;
  });
}

/**
 * 콤보 순위 정렬
 */
export function rankCombos(
  combos: ComboAnalysis[],
  sortBy: 'synergyScore' | 'winRate' | 'uplift' | 'starts' = 'synergyScore',
  order: 'asc' | 'desc' = 'desc'
): ComboAnalysis[] {
  const sorted = [...combos].sort((a, b) => {
    let valueA: number, valueB: number;

    switch (sortBy) {
      case 'synergyScore':
        valueA = a.synergyScore;
        valueB = b.synergyScore;
        break;
      case 'winRate':
        valueA = a.winRate;
        valueB = b.winRate;
        break;
      case 'uplift':
        valueA = a.upliftPercent;
        valueB = b.upliftPercent;
        break;
      case 'starts':
        valueA = a.starts;
        valueB = b.starts;
        break;
    }

    return order === 'desc' ? valueB - valueA : valueA - valueB;
  });

  return sorted;
}

/**
 * 콤보 통계 요약
 */
export function summarizeComboStats(combos: ComboAnalysis[]): {
  totalCombos: number;
  avgWinRate: number;
  avgSynergyScore: number;
  gradeDistribution: Record<ComboSynergyGrade, number>;
  topPerformers: ComboAnalysis[];
} {
  if (combos.length === 0) {
    return {
      totalCombos: 0,
      avgWinRate: 0,
      avgSynergyScore: 0,
      gradeDistribution: { S: 0, A: 0, B: 0, C: 0, D: 0 },
      topPerformers: [],
    };
  }

  const totalWinRate = combos.reduce((sum, c) => sum + c.winRate, 0);
  const totalSynergy = combos.reduce((sum, c) => sum + c.synergyScore, 0);

  const gradeDistribution: Record<ComboSynergyGrade, number> = {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  };

  for (const combo of combos) {
    gradeDistribution[combo.synergyGrade]++;
  }

  const topPerformers = rankCombos(combos, 'synergyScore', 'desc').slice(0, 5);

  return {
    totalCombos: combos.length,
    avgWinRate: totalWinRate / combos.length,
    avgSynergyScore: totalSynergy / combos.length,
    gradeDistribution,
    topPerformers,
  };
}

// =============================================================================
// Prediction Integration
// =============================================================================

/**
 * 예측 입력용 콤보 데이터 변환
 */
export function toJockeyTrainerCombo(
  analysis: ComboAnalysis,
  meet: string = '1',
  meetName: string = '서울'
): JockeyTrainerCombo {
  return {
    jockeyId: analysis.jockeyId,
    jockeyName: analysis.jockeyName,
    trainerId: analysis.trainerId,
    trainerName: analysis.trainerName,
    meet,
    meetName,
  };
}

/**
 * 콤보 시너지 점수 계산 (예측 엔진용)
 */
export function getComboScoreForPrediction(
  comboWinRate: number | undefined,
  jockeyWinRate: number,
  trainerWinRate: number,
  starts: number,
  recentForm: number[] = []
): number {
  if (!comboWinRate || starts < 3) {
    return 50; // 데이터 부족 시 중립값
  }

  return calculateSynergyScore(
    comboWinRate,
    jockeyWinRate,
    trainerWinRate,
    starts,
    recentForm
  );
}

/**
 * 콤보 상승률 판정
 */
export function isPositiveSynergy(
  comboWinRate: number,
  jockeyWinRate: number,
  trainerWinRate: number
): boolean {
  const expectedRate = (jockeyWinRate + trainerWinRate) / 2;
  return comboWinRate > expectedRate * 1.1; // 10% 이상 상승
}

/**
 * 콤보 신뢰도 계산
 */
export function getComboReliability(starts: number): 'high' | 'medium' | 'low' {
  if (starts >= 30) return 'high';
  if (starts >= 10) return 'medium';
  return 'low';
}
