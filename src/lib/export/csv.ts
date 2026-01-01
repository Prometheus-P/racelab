/**
 * CSV Export Utilities
 *
 * 백테스트 결과를 CSV 형식으로 내보내기
 */

import type { BacktestResult, BetRecord, EquityPoint } from '@/lib/strategy/types';

// =============================================================================
// CSV Header Definitions
// =============================================================================

export interface CSVHeader {
  label: string;
  key: string;
}

export const BET_RECORD_HEADERS: CSVHeader[] = [
  { label: '날짜', key: 'raceDate' },
  { label: '경주장', key: 'track' },
  { label: '경주번호', key: 'raceNo' },
  { label: '마번', key: 'entryNo' },
  { label: '베팅금액', key: 'betAmount' },
  { label: '배당률', key: 'oddsAtBet' },
  { label: '결과', key: 'result' },
  { label: '손익', key: 'profit' },
  { label: '누적자본', key: 'cumulativeCapital' },
];

export const EQUITY_CURVE_HEADERS: CSVHeader[] = [
  { label: '날짜', key: 'date' },
  { label: '자본', key: 'capital' },
  { label: '낙폭', key: 'drawdown' },
];

export const SUMMARY_HEADERS: CSVHeader[] = [
  { label: '항목', key: 'key' },
  { label: '값', key: 'value' },
];

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * 결과 텍스트 한글화
 */
function translateResult(result: BetRecord['result']): string {
  const translations: Record<BetRecord['result'], string> = {
    win: '승',
    lose: '패',
    refund: '환불',
  };
  return translations[result] || result;
}

/**
 * BetRecord를 CSV용 객체로 변환
 */
export function transformBetRecordsForCSV(
  bets: BetRecord[]
): Array<Record<string, string | number>> {
  return bets.map((bet) => ({
    raceDate: bet.raceDate,
    track: bet.track,
    raceNo: bet.raceNo,
    entryNo: bet.entryNo,
    betAmount: bet.betAmount.toLocaleString(),
    oddsAtBet: bet.oddsAtBet.toFixed(2),
    result: translateResult(bet.result),
    profit: bet.profit.toLocaleString(),
    cumulativeCapital: bet.cumulativeCapital.toLocaleString(),
  }));
}

/**
 * EquityPoint를 CSV용 객체로 변환
 */
export function transformEquityCurveForCSV(
  equityCurve: EquityPoint[]
): Array<Record<string, string | number>> {
  return equityCurve.map((point) => ({
    date: point.date,
    capital: point.capital.toLocaleString(),
    drawdown: `${(point.drawdown * 100).toFixed(2)}%`,
  }));
}

/**
 * BacktestResult 요약을 CSV용 객체로 변환
 */
export function transformSummaryForCSV(
  result: BacktestResult
): Array<Record<string, string>> {
  const { summary, request } = result;

  return [
    { key: '전략명', value: request.strategy.name },
    { key: '분석 기간', value: `${request.dateRange.from} ~ ${request.dateRange.to}` },
    { key: '초기 자본', value: `${(request.initialCapital || 1000000).toLocaleString()}원` },
    { key: '최종 자본', value: `${summary.finalCapital.toLocaleString()}원` },
    { key: '총 경주 수', value: summary.totalRaces.toLocaleString() },
    { key: '조건 충족 경주', value: summary.matchedRaces.toLocaleString() },
    { key: '총 베팅 수', value: summary.totalBets.toLocaleString() },
    { key: '승리', value: summary.wins.toLocaleString() },
    { key: '패배', value: summary.losses.toLocaleString() },
    { key: '환불', value: summary.refunds.toLocaleString() },
    { key: '승률', value: `${summary.winRate.toFixed(2)}%` },
    { key: 'ROI', value: `${summary.roi.toFixed(2)}%` },
    { key: '수익률', value: `${summary.capitalReturn.toFixed(2)}%` },
    { key: '최대 낙폭 (MDD)', value: `${summary.maxDrawdown.toFixed(2)}%` },
    { key: '평균 배당률', value: `${summary.avgOdds.toFixed(2)}배` },
    { key: '평균 베팅 금액', value: `${summary.avgBetAmount.toLocaleString()}원` },
    { key: '최대 연승', value: summary.maxWinStreak.toString() },
    { key: '최대 연패', value: summary.maxLoseStreak.toString() },
  ];
}

// =============================================================================
// CSV Generation
// =============================================================================

/**
 * 데이터를 CSV 문자열로 변환
 */
export function generateCSVString(
  headers: CSVHeader[],
  data: Array<Record<string, string | number>>
): string {
  const headerLine = headers.map((h) => `"${h.label}"`).join(',');
  const dataLines = data.map((row) =>
    headers.map((h) => {
      const value = row[h.key];
      // 문자열이면 따옴표로 감싸기
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}

/**
 * CSV 파일 다운로드
 */
export function downloadCSV(
  filename: string,
  headers: CSVHeader[],
  data: Array<Record<string, string | number>>
): void {
  const csv = generateCSVString(headers, data);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM 추가 (한글 호환)
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 백테스트 결과 전체를 CSV로 다운로드 (베팅 기록)
 */
export function downloadBacktestBetsCSV(result: BacktestResult): void {
  const filename = `backtest_bets_${result.request.strategy.name}_${Date.now()}.csv`;
  const data = transformBetRecordsForCSV(result.bets);
  downloadCSV(filename, BET_RECORD_HEADERS, data);
}

/**
 * 백테스트 요약을 CSV로 다운로드
 */
export function downloadBacktestSummaryCSV(result: BacktestResult): void {
  const filename = `backtest_summary_${result.request.strategy.name}_${Date.now()}.csv`;
  const data = transformSummaryForCSV(result);
  downloadCSV(filename, SUMMARY_HEADERS, data);
}

/**
 * 자본 곡선을 CSV로 다운로드
 */
export function downloadEquityCurveCSV(result: BacktestResult): void {
  const filename = `backtest_equity_${result.request.strategy.name}_${Date.now()}.csv`;
  const data = transformEquityCurveForCSV(result.equityCurve);
  downloadCSV(filename, EQUITY_CURVE_HEADERS, data);
}
