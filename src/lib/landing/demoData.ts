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
  { text: '$ racelab backtest --strategy="value-drift-hunter"', delay: 0, variant: 'default' },
  { text: '> Initializing Quant Engine v2.1...', delay: 400, variant: 'default' },
  { text: '> Connecting to TimescaleDB...', delay: 300, variant: 'default' },
  { text: '> Date range: 2024-01-01 ~ 2024-06-30', delay: 200, variant: 'default' },
  { text: '> Initial capital: 1,000,000 KRW', delay: 200, variant: 'default' },
  { text: '> Fetching 30s odds snapshots...', delay: 500, variant: 'default' },
  { text: 'Found 1,247 races matching criteria', delay: 700, variant: 'success' },
  { text: '> Evaluating conditions...', delay: 400, variant: 'default' },
  { text: '> Pattern: [Odds Drop > 20% && Popularity < 5]', delay: 300, variant: 'default' },
  { text: 'Matched 312 entries for betting', delay: 600, variant: 'success' },
  { text: '> Simulating bets...', delay: 400, variant: 'default' },
  { text: '> Processing: [====================] 100%', delay: 1000, variant: 'progress' },
  { text: '> Calculating Sharpe Ratio...', delay: 300, variant: 'default' },
  { text: '> Analyzing drawdown periods...', delay: 300, variant: 'default' },
  { text: 'Backtest complete!', delay: 400, variant: 'success' },
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
