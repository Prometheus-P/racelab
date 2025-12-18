/**
 * Backtest Metrics Calculator
 *
 * ROI, MDD, Sharpe Ratio 등 고급 성과 지표 계산
 */

import type { BetRecord, EquityPoint, BacktestSummary } from '../strategy/types';

// =============================================================================
// Basic Metrics
// =============================================================================

/**
 * 승률 계산
 */
export function calculateWinRate(wins: number, totalBets: number): number {
  if (totalBets === 0) return 0;
  return (wins / totalBets) * 100;
}

/**
 * ROI (Return on Investment) 계산
 */
export function calculateROI(totalProfit: number, totalBetAmount: number): number {
  if (totalBetAmount === 0) return 0;
  return (totalProfit / totalBetAmount) * 100;
}

/**
 * 자본 수익률 계산
 */
export function calculateCapitalReturn(
  initialCapital: number,
  finalCapital: number
): number {
  if (initialCapital === 0) return 0;
  return ((finalCapital - initialCapital) / initialCapital) * 100;
}

// =============================================================================
// Drawdown Metrics
// =============================================================================

/**
 * 최대 낙폭 (MDD) 계산
 * @param equityCurve 자본 곡선
 * @returns 최대 낙폭 (%)
 */
export function calculateMaxDrawdown(equityCurve: EquityPoint[]): number {
  if (equityCurve.length === 0) return 0;

  let peak = equityCurve[0].capital;
  let maxDrawdown = 0;

  for (const point of equityCurve) {
    if (point.capital > peak) {
      peak = point.capital;
    }
    const drawdown = ((peak - point.capital) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * 낙폭 기간 계산
 */
export function calculateDrawdownPeriods(
  equityCurve: EquityPoint[]
): Array<{
  startDate: string;
  endDate: string;
  maxDrawdown: number;
  duration: number;
}> {
  const periods: Array<{
    startDate: string;
    endDate: string;
    maxDrawdown: number;
    duration: number;
  }> = [];

  if (equityCurve.length === 0) return periods;

  let peak = equityCurve[0].capital;
  let peakDate = equityCurve[0].date;
  let inDrawdown = false;
  let currentDrawdownStart = '';
  let currentMaxDrawdown = 0;

  for (const point of equityCurve) {
    if (point.capital > peak) {
      if (inDrawdown) {
        // 낙폭 종료
        periods.push({
          startDate: currentDrawdownStart,
          endDate: point.date,
          maxDrawdown: currentMaxDrawdown,
          duration: calculateDaysBetween(currentDrawdownStart, point.date),
        });
        inDrawdown = false;
        currentMaxDrawdown = 0;
      }
      peak = point.capital;
      peakDate = point.date;
    } else {
      const drawdown = ((peak - point.capital) / peak) * 100;
      if (drawdown > 0 && !inDrawdown) {
        // 낙폭 시작
        inDrawdown = true;
        currentDrawdownStart = peakDate;
      }
      if (drawdown > currentMaxDrawdown) {
        currentMaxDrawdown = drawdown;
      }
    }
  }

  // 마지막 낙폭이 진행 중인 경우
  if (inDrawdown) {
    const lastPoint = equityCurve[equityCurve.length - 1];
    periods.push({
      startDate: currentDrawdownStart,
      endDate: lastPoint.date,
      maxDrawdown: currentMaxDrawdown,
      duration: calculateDaysBetween(currentDrawdownStart, lastPoint.date),
    });
  }

  return periods;
}

// =============================================================================
// Streak Metrics
// =============================================================================

/**
 * 연승/연패 계산
 */
export function calculateStreaks(bets: BetRecord[]): {
  maxWinStreak: number;
  maxLoseStreak: number;
  currentStreak: number;
  currentStreakType: 'win' | 'lose' | 'none';
} {
  let maxWinStreak = 0;
  let maxLoseStreak = 0;
  let currentStreak = 0;
  let currentStreakType: 'win' | 'lose' | 'none' = 'none';

  for (const bet of bets) {
    if (bet.result === 'refund') continue;

    if (bet.result === 'win') {
      if (currentStreakType === 'win') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentStreakType = 'win';
      }
      maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else {
      if (currentStreakType === 'lose') {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentStreakType = 'lose';
      }
      maxLoseStreak = Math.max(maxLoseStreak, currentStreak);
    }
  }

  return {
    maxWinStreak,
    maxLoseStreak,
    currentStreak,
    currentStreakType,
  };
}

// =============================================================================
// Advanced Metrics
// =============================================================================

/**
 * Sharpe Ratio 계산 (간소화 버전)
 * @param returns 일별 수익률 배열
 * @param riskFreeRate 무위험 수익률 (연간, 기본 0)
 * @returns Sharpe Ratio
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0
): number {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = calculateStdDev(returns);

  if (stdDev === 0) return 0;

  // 일간 무위험 수익률로 변환 (연 252 거래일 가정)
  const dailyRiskFree = riskFreeRate / 252;

  return ((avgReturn - dailyRiskFree) / stdDev) * Math.sqrt(252);
}

/**
 * Profit Factor 계산
 * 총 수익 / 총 손실
 */
export function calculateProfitFactor(bets: BetRecord[]): number {
  const totalWins = bets
    .filter((b) => b.result === 'win')
    .reduce((sum, b) => sum + b.profit, 0);
  const totalLosses = Math.abs(
    bets.filter((b) => b.result === 'lose').reduce((sum, b) => sum + b.profit, 0)
  );

  if (totalLosses === 0) return totalWins > 0 ? Infinity : 0;
  return totalWins / totalLosses;
}

/**
 * 평균 이익 / 평균 손실 비율
 */
export function calculateAvgWinLossRatio(bets: BetRecord[]): number {
  const wins = bets.filter((b) => b.result === 'win');
  const losses = bets.filter((b) => b.result === 'lose');

  if (wins.length === 0 || losses.length === 0) return 0;

  const avgWin = wins.reduce((sum, b) => sum + b.profit, 0) / wins.length;
  const avgLoss = Math.abs(losses.reduce((sum, b) => sum + b.profit, 0) / losses.length);

  if (avgLoss === 0) return avgWin > 0 ? Infinity : 0;
  return avgWin / avgLoss;
}

/**
 * 기대값 (Expected Value) 계산
 */
export function calculateExpectedValue(
  winRate: number,
  avgWin: number,
  avgLoss: number
): number {
  const winProb = winRate / 100;
  const loseProb = 1 - winProb;
  return winProb * avgWin - loseProb * avgLoss;
}

// =============================================================================
// Daily Returns
// =============================================================================

/**
 * 일별 수익률 계산
 */
export function calculateDailyReturns(equityCurve: EquityPoint[]): number[] {
  if (equityCurve.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prevCapital = equityCurve[i - 1].capital;
    const currentCapital = equityCurve[i].capital;
    if (prevCapital > 0) {
      returns.push((currentCapital - prevCapital) / prevCapital);
    }
  }

  return returns;
}

/**
 * 월별 수익률 계산
 */
export function calculateMonthlyReturns(
  bets: BetRecord[]
): Map<string, { profit: number; bets: number; winRate: number }> {
  const monthly = new Map<string, { profit: number; bets: number; wins: number }>();

  for (const bet of bets) {
    if (bet.result === 'refund') continue;

    const month = bet.raceDate.slice(0, 7); // YYYY-MM
    const current = monthly.get(month) ?? { profit: 0, bets: 0, wins: 0 };

    current.profit += bet.profit;
    current.bets++;
    if (bet.result === 'win') current.wins++;

    monthly.set(month, current);
  }

  // 승률 계산 추가
  const result = new Map<string, { profit: number; bets: number; winRate: number }>();
  for (const [month, data] of Array.from(monthly.entries())) {
    result.set(month, {
      profit: data.profit,
      bets: data.bets,
      winRate: data.bets > 0 ? (data.wins / data.bets) * 100 : 0,
    });
  }

  return result;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * 표준편차 계산
 */
export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((x) => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * 두 날짜 사이의 일수 계산
 */
function calculateDaysBetween(dateFrom: string, dateTo: string): number {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

// =============================================================================
// Summary Enhancement
// =============================================================================

/**
 * 기존 요약에 고급 메트릭 추가
 */
export interface EnhancedBacktestSummary extends BacktestSummary {
  sharpeRatio: number;
  profitFactor: number;
  avgWinLossRatio: number;
  expectedValue: number;
  monthlyReturns: Array<{
    month: string;
    profit: number;
    bets: number;
    winRate: number;
  }>;
}

/**
 * 고급 메트릭 계산 및 요약 확장
 */
export function enhanceSummary(
  summary: BacktestSummary,
  bets: BetRecord[],
  equityCurve: EquityPoint[]
): EnhancedBacktestSummary {
  const dailyReturns = calculateDailyReturns(equityCurve);
  const sharpeRatio = calculateSharpeRatio(dailyReturns);
  const profitFactor = calculateProfitFactor(bets);
  const avgWinLossRatio = calculateAvgWinLossRatio(bets);

  const wins = bets.filter((b) => b.result === 'win');
  const losses = bets.filter((b) => b.result === 'lose');
  const avgWin = wins.length > 0 ? wins.reduce((s, b) => s + b.profit, 0) / wins.length : 0;
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((s, b) => s + b.profit, 0)) / losses.length
      : 0;
  const expectedValue = calculateExpectedValue(summary.winRate, avgWin, avgLoss);

  const monthlyMap = calculateMonthlyReturns(bets);
  const monthlyReturns = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    ...summary,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    avgWinLossRatio: Math.round(avgWinLossRatio * 100) / 100,
    expectedValue: Math.round(expectedValue),
    monthlyReturns,
  };
}
