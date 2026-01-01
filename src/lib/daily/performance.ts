/**
 * Daily Performance Tracker
 *
 * 일일 추천의 성과를 추적하고 계산
 */

import type { DailySelection, DailyPerformance } from './types';

/** 기본 베팅 금액 */
const DEFAULT_BET_AMOUNT = 10_000; // 1만원

/**
 * 단일 추천의 손익 계산
 */
export function calculateSelectionProfit(
  selection: DailySelection,
  betAmount: number = DEFAULT_BET_AMOUNT
): number {
  if (!selection.result) {
    return 0; // 아직 결과 없음
  }

  if (selection.result.won) {
    // 단승 적중
    return selection.odds * betAmount - betAmount;
  } else {
    // 낙마
    return -betAmount;
  }
}

/**
 * 일일 성과 계산
 */
export function calculateDailyPerformance(
  date: string,
  strategyId: string,
  strategyName: string,
  selections: DailySelection[],
  betAmount: number = DEFAULT_BET_AMOUNT
): DailyPerformance {
  const completedSelections = selections.filter((s) => s.result !== undefined);

  const wins = completedSelections.filter((s) => s.result?.won).length;
  const places = completedSelections.filter((s) => s.result?.placed).length;

  const profit = completedSelections.reduce((sum, s) => {
    return sum + calculateSelectionProfit(s, betAmount);
  }, 0);

  const totalBetAmount = completedSelections.length * betAmount;
  const roi = totalBetAmount > 0 ? (profit / totalBetAmount) * 100 : 0;

  return {
    date,
    strategyId,
    strategyName,
    totalSelections: selections.length,
    completedRaces: completedSelections.length,
    wins,
    places,
    winRate: completedSelections.length > 0 ? (wins / completedSelections.length) * 100 : 0,
    placeRate: completedSelections.length > 0 ? (places / completedSelections.length) * 100 : 0,
    profit,
    roi,
  };
}

/**
 * 경주 결과로 추천 업데이트
 */
export function updateSelectionWithResult(
  selection: DailySelection,
  raceResult: {
    winners: number[]; // [1착 마번, 2착 마번, 3착 마번]
  },
  betAmount: number = DEFAULT_BET_AMOUNT
): DailySelection {
  const position = raceResult.winners.indexOf(selection.entryNo);
  const finishPosition = position === -1 ? 99 : position + 1;
  const won = finishPosition === 1;
  const placed = finishPosition <= 3;

  const profit = won ? selection.odds * betAmount - betAmount : -betAmount;

  return {
    ...selection,
    result: {
      finishPosition,
      won,
      placed,
      profit,
    },
  };
}

/**
 * 기간별 성과 집계
 */
export function aggregatePerformance(dailyPerformances: DailyPerformance[]): {
  period: { from: string; to: string };
  totalDays: number;
  totalSelections: number;
  totalCompleted: number;
  totalWins: number;
  totalPlaces: number;
  avgWinRate: number;
  avgPlaceRate: number;
  totalProfit: number;
  avgRoi: number;
  bestDay: DailyPerformance | null;
  worstDay: DailyPerformance | null;
} {
  if (dailyPerformances.length === 0) {
    return {
      period: { from: '', to: '' },
      totalDays: 0,
      totalSelections: 0,
      totalCompleted: 0,
      totalWins: 0,
      totalPlaces: 0,
      avgWinRate: 0,
      avgPlaceRate: 0,
      totalProfit: 0,
      avgRoi: 0,
      bestDay: null,
      worstDay: null,
    };
  }

  const sorted = [...dailyPerformances].sort((a, b) => a.date.localeCompare(b.date));

  const totalSelections = sorted.reduce((sum, d) => sum + d.totalSelections, 0);
  const totalCompleted = sorted.reduce((sum, d) => sum + d.completedRaces, 0);
  const totalWins = sorted.reduce((sum, d) => sum + d.wins, 0);
  const totalPlaces = sorted.reduce((sum, d) => sum + d.places, 0);
  const totalProfit = sorted.reduce((sum, d) => sum + d.profit, 0);

  const avgWinRate = totalCompleted > 0 ? (totalWins / totalCompleted) * 100 : 0;
  const avgPlaceRate = totalCompleted > 0 ? (totalPlaces / totalCompleted) * 100 : 0;
  const avgRoi = sorted.reduce((sum, d) => sum + d.roi, 0) / sorted.length;

  const byProfit = [...sorted].sort((a, b) => b.profit - a.profit);

  return {
    period: {
      from: sorted[0].date,
      to: sorted[sorted.length - 1].date,
    },
    totalDays: sorted.length,
    totalSelections,
    totalCompleted,
    totalWins,
    totalPlaces,
    avgWinRate,
    avgPlaceRate,
    totalProfit,
    avgRoi,
    bestDay: byProfit[0] || null,
    worstDay: byProfit[byProfit.length - 1] || null,
  };
}

/**
 * 더미 성과 데이터 생성 (개발/테스트용)
 */
export function generateMockPerformance(date: string, strategyId: string): DailyPerformance {
  const totalSelections = Math.floor(Math.random() * 5) + 2;
  const wins = Math.floor(Math.random() * totalSelections);
  const places = wins + Math.floor(Math.random() * (totalSelections - wins));

  const profit =
    wins * (Math.random() * 30000 + 10000) - (totalSelections - wins) * DEFAULT_BET_AMOUNT;

  return {
    date,
    strategyId,
    strategyName: '스팀 무브 감지',
    totalSelections,
    completedRaces: totalSelections,
    wins,
    places,
    winRate: (wins / totalSelections) * 100,
    placeRate: (places / totalSelections) * 100,
    profit: Math.round(profit),
    roi: Math.round((profit / (totalSelections * DEFAULT_BET_AMOUNT)) * 100 * 10) / 10,
  };
}
