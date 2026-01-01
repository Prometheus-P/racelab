/**
 * 프리셋 전략별 모의 백테스트 결과
 * 대시보드 MVP에서 사용할 하드코딩된 데이터
 */

export interface BacktestResult {
  strategyId: string;
  period: '1month' | '3months' | '6months';
  summary: {
    winRate: number;
    roi: number;
    maxDrawdown: number;
    sharpeRatio: number;
    totalBets: number;
    winningBets: number;
    losingBets: number;
    avgWinAmount: number;
    avgLossAmount: number;
    profitFactor: number;
    finalCapital: number;
    startCapital: number;
  };
  equityCurve: EquityPoint[];
  betHistory: BetRecord[];
}

export interface EquityPoint {
  date: string;
  capital: number;
  drawdown: number;
}

export interface BetRecord {
  id: string;
  date: string;
  raceType: 'horse' | 'cycle' | 'boat';
  raceName: string;
  horseName: string;
  odds: number;
  betAmount: number;
  result: 'win' | 'lose';
  payout: number;
  profit: number;
}

// 수익 곡선 데이터 생성 헬퍼
function generateEquityCurve(
  startDate: Date,
  days: number,
  startCapital: number,
  finalCapital: number,
  volatility: number
): EquityPoint[] {
  const points: EquityPoint[] = [];
  const dailyReturn = Math.pow(finalCapital / startCapital, 1 / days) - 1;
  let capital = startCapital;
  let peak = startCapital;

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // 랜덤 변동성 추가
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    capital = capital * (1 + dailyReturn) * randomFactor;

    // 피크 업데이트
    if (capital > peak) peak = capital;

    // 드로다운 계산
    const drawdown = ((peak - capital) / peak) * 100;

    points.push({
      date: date.toISOString().split('T')[0],
      capital: Math.round(capital),
      drawdown: Math.round(drawdown * 100) / 100,
    });
  }

  return points;
}

// 베팅 히스토리 생성 헬퍼
function generateBetHistory(
  startDate: Date,
  totalBets: number,
  winRate: number,
  avgOdds: number
): BetRecord[] {
  const records: BetRecord[] = [];
  const raceTypes: ('horse' | 'cycle' | 'boat')[] = ['horse', 'cycle', 'boat'];
  const horseNames = [
    '번개호', '태풍호', '질주호', '승리호', '영광호',
    '희망호', '용감호', '빛나호', '달리호', '바람호',
  ];
  const raceNames = [
    '서울 1경주', '서울 2경주', '부산 3경주', '제주 1경주',
    '서울 5경주', '부산 2경주', '서울 4경주', '제주 2경주',
  ];

  for (let i = 0; i < totalBets; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(i / 3)); // 하루에 약 3개 베팅

    const isWin = Math.random() < winRate / 100;
    const odds = avgOdds + (Math.random() - 0.5) * avgOdds * 0.5;
    const betAmount = 10000;
    const payout = isWin ? Math.round(betAmount * odds) : 0;
    const profit = payout - betAmount;

    records.push({
      id: `bet-${i + 1}`,
      date: date.toISOString().split('T')[0],
      raceType: raceTypes[Math.floor(Math.random() * raceTypes.length)],
      raceName: raceNames[Math.floor(Math.random() * raceNames.length)],
      horseName: horseNames[Math.floor(Math.random() * horseNames.length)],
      odds: Math.round(odds * 100) / 100,
      betAmount,
      result: isWin ? 'win' : 'lose',
      payout,
      profit,
    });
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 기간별 날짜 계산
function getStartDate(period: '1month' | '3months' | '6months'): Date {
  const now = new Date();
  switch (period) {
    case '1month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case '3months':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '6months':
      return new Date(now.setMonth(now.getMonth() - 6));
  }
}

function getDays(period: '1month' | '3months' | '6months'): number {
  switch (period) {
    case '1month':
      return 30;
    case '3months':
      return 90;
    case '6months':
      return 180;
  }
}

// 전략별 기본 파라미터
const STRATEGY_PARAMS: Record<
  string,
  {
    winRate: number;
    roi: number;
    maxDrawdown: number;
    sharpeRatio: number;
    avgOdds: number;
    volatility: number;
  }
> = {
  'underdog-betting': {
    winRate: 28.5,
    roi: 34.2,
    maxDrawdown: -18.5,
    sharpeRatio: 1.42,
    avgOdds: 8.5,
    volatility: 0.08,
  },
  'odds-surge': {
    winRate: 42.3,
    roi: 23.7,
    maxDrawdown: -12.8,
    sharpeRatio: 1.65,
    avgOdds: 4.2,
    volatility: 0.05,
  },
  'stable-combo': {
    winRate: 67.3,
    roi: 8.5,
    maxDrawdown: -5.2,
    sharpeRatio: 2.15,
    avgOdds: 2.1,
    volatility: 0.02,
  },
  'value-drift': {
    winRate: 35.8,
    roi: 28.4,
    maxDrawdown: -14.2,
    sharpeRatio: 1.52,
    avgOdds: 5.8,
    volatility: 0.06,
  },
  momentum: {
    winRate: 48.2,
    roi: 15.6,
    maxDrawdown: -9.8,
    sharpeRatio: 1.78,
    avgOdds: 3.2,
    volatility: 0.04,
  },
};

// 기간별 베팅 횟수 조정
function getBetsForPeriod(period: '1month' | '3months' | '6months', baseRate: number): number {
  switch (period) {
    case '1month':
      return Math.round(baseRate * 0.17);
    case '3months':
      return Math.round(baseRate * 0.5);
    case '6months':
      return baseRate;
  }
}

/**
 * 전략 ID와 기간으로 백테스트 결과 조회
 */
export function getBacktestResult(
  strategyId: string,
  period: '1month' | '3months' | '6months'
): BacktestResult | null {
  const params = STRATEGY_PARAMS[strategyId];
  if (!params) return null;

  const startDate = getStartDate(period);
  const days = getDays(period);
  const startCapital = 1000000;

  // 기간에 따른 ROI 조정
  const periodMultiplier = period === '1month' ? 0.17 : period === '3months' ? 0.5 : 1;
  const adjustedRoi = params.roi * periodMultiplier;
  const finalCapital = Math.round(startCapital * (1 + adjustedRoi / 100));

  // 베팅 횟수 (6개월 기준 150-500회)
  const baseBets =
    strategyId === 'stable-combo' ? 500 : strategyId === 'underdog-betting' ? 150 : 300;
  const totalBets = getBetsForPeriod(period, baseBets);
  const winningBets = Math.round(totalBets * (params.winRate / 100));
  const losingBets = totalBets - winningBets;

  const equityCurve = generateEquityCurve(
    startDate,
    days,
    startCapital,
    finalCapital,
    params.volatility
  );

  const betHistory = generateBetHistory(startDate, Math.min(totalBets, 50), params.winRate, params.avgOdds);

  // 평균 수익/손실 계산
  const avgBetAmount = 10000;
  const avgWinAmount = Math.round(avgBetAmount * params.avgOdds);
  const avgLossAmount = avgBetAmount;

  // Profit Factor 계산
  const totalWinnings = winningBets * avgWinAmount;
  const totalLosses = losingBets * avgLossAmount;
  const profitFactor = totalLosses > 0 ? Math.round((totalWinnings / totalLosses) * 100) / 100 : 0;

  return {
    strategyId,
    period,
    summary: {
      winRate: params.winRate,
      roi: Math.round(adjustedRoi * 10) / 10,
      maxDrawdown: params.maxDrawdown,
      sharpeRatio: params.sharpeRatio,
      totalBets,
      winningBets,
      losingBets,
      avgWinAmount,
      avgLossAmount,
      profitFactor,
      finalCapital,
      startCapital,
    },
    equityCurve,
    betHistory,
  };
}

/**
 * 모든 전략의 요약 결과 조회 (전략 선택 UI용)
 */
export function getAllStrategySummaries(
  period: '1month' | '3months' | '6months'
): Array<{
  strategyId: string;
  winRate: number;
  roi: number;
  maxDrawdown: number;
}> {
  return Object.entries(STRATEGY_PARAMS).map(([strategyId, params]) => {
    const periodMultiplier = period === '1month' ? 0.17 : period === '3months' ? 0.5 : 1;
    return {
      strategyId,
      winRate: params.winRate,
      roi: Math.round(params.roi * periodMultiplier * 10) / 10,
      maxDrawdown: params.maxDrawdown,
    };
  });
}
