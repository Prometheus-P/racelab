/**
 * Demo data for the landing page terminal animation.
 * These are preset fake values to showcase the Quant Terminal capabilities
 * without making actual API calls.
 */

export interface DemoLog {
  text: string;
  delay: number;
  variant?: 'default' | 'success' | 'progress' | 'error';
}

export const DEMO_LOGS: DemoLog[] = [
  { text: '$ racelab backtest --strategy="배당급등추적"', delay: 0, variant: 'default' },
  { text: '> 분석 엔진 v2.1 초기화 중...', delay: 400, variant: 'default' },
  { text: '> 데이터베이스 연결 중...', delay: 300, variant: 'default' },
  { text: '> 분석 기간: 2024-01-01 ~ 2024-06-30', delay: 200, variant: 'default' },
  { text: '> 초기 자금: 1,000,000원', delay: 200, variant: 'default' },
  { text: '> 30초 단위 배당률 데이터 조회 중...', delay: 500, variant: 'default' },
  { text: '1,247개 경주 조건 충족', delay: 700, variant: 'success' },
  { text: '> 전략 조건 평가 중...', delay: 400, variant: 'default' },
  { text: '> 조건: [배당률 20% 이상 하락 & 인기순위 5위 이하]', delay: 300, variant: 'default' },
  { text: '312건 베팅 대상 확정', delay: 600, variant: 'success' },
  { text: '> 베팅 시뮬레이션 중...', delay: 400, variant: 'default' },
  { text: '> 진행률: [====================] 100%', delay: 1000, variant: 'progress' },
  { text: '> 안정성 지수 계산 중...', delay: 300, variant: 'default' },
  { text: '> 손실 구간 분석 중...', delay: 300, variant: 'default' },
  { text: '백테스트 완료!', delay: 400, variant: 'success' },
];

export interface DemoMetrics {
  roi: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  totalBets: number;
  finalCapital: number;
}

export const DEMO_METRICS: DemoMetrics = {
  roi: 23.7,
  winRate: 31.2,
  sharpeRatio: 1.42,
  maxDrawdown: 12.8,
  profitFactor: 1.89,
  totalBets: 312,
  finalCapital: 1237000,
};

// Total animation duration (sum of all delays + buffer)
export const TOTAL_ANIMATION_DURATION = DEMO_LOGS.reduce((acc, log) => acc + log.delay, 0) + 500;
