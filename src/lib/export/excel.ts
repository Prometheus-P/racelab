/**
 * Excel Export Utilities
 *
 * exceljs를 사용하여 스타일링된 Excel 파일 생성
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { BacktestResult, BetRecord } from '@/lib/strategy/types';

// =============================================================================
// Style Constants
// =============================================================================

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF4A5568' }, // 진한 회색
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' }, // 흰색
};

const WIN_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE8F5E9' }, // 연한 초록
};

const LOSE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFEBEE' }, // 연한 빨강
};

const REFUND_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFF3E0' }, // 연한 주황
};

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
  right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
};

// =============================================================================
// Helper Functions
// =============================================================================

function translateResult(result: BetRecord['result']): string {
  const translations: Record<BetRecord['result'], string> = {
    win: '승',
    lose: '패',
    refund: '환불',
  };
  return translations[result] || result;
}

function applyHeaderStyle(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDER_STYLE;
  });
  row.height = 24;
}

function getResultFill(result: BetRecord['result']): ExcelJS.Fill | undefined {
  switch (result) {
    case 'win':
      return WIN_FILL;
    case 'lose':
      return LOSE_FILL;
    case 'refund':
      return REFUND_FILL;
    default:
      return undefined;
  }
}

// =============================================================================
// Sheet Builders
// =============================================================================

/**
 * 요약 시트 생성
 */
function buildSummarySheet(
  workbook: ExcelJS.Workbook,
  result: BacktestResult
): void {
  const sheet = workbook.addWorksheet('요약', {
    properties: { tabColor: { argb: 'FF4CAF50' } },
  });

  const { summary, request } = result;

  // 헤더
  sheet.mergeCells('A1:B1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = '백테스트 결과 요약';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  // 데이터
  const summaryData = [
    ['전략명', request.strategy.name],
    ['분석 기간', `${request.dateRange.from} ~ ${request.dateRange.to}`],
    ['초기 자본', `${(request.initialCapital || 1000000).toLocaleString()}원`],
    ['최종 자본', `${summary.finalCapital.toLocaleString()}원`],
    [''],
    ['총 경주 수', summary.totalRaces.toLocaleString()],
    ['조건 충족 경주', summary.matchedRaces.toLocaleString()],
    ['총 베팅 수', summary.totalBets.toLocaleString()],
    [''],
    ['승리', summary.wins.toLocaleString()],
    ['패배', summary.losses.toLocaleString()],
    ['환불', summary.refunds.toLocaleString()],
    [''],
    ['승률', `${summary.winRate.toFixed(2)}%`],
    ['ROI', `${summary.roi.toFixed(2)}%`],
    ['수익률', `${summary.capitalReturn.toFixed(2)}%`],
    ['최대 낙폭 (MDD)', `${summary.maxDrawdown.toFixed(2)}%`],
    [''],
    ['평균 배당률', `${summary.avgOdds.toFixed(2)}배`],
    ['평균 베팅 금액', `${summary.avgBetAmount.toLocaleString()}원`],
    ['최대 연승', summary.maxWinStreak.toString()],
    ['최대 연패', summary.maxLoseStreak.toString()],
  ];

  summaryData.forEach((row, _index) => {
    const excelRow = sheet.addRow(row);
    if (row[0]) {
      excelRow.getCell(1).font = { bold: true };
    }
    excelRow.border = BORDER_STYLE;
  });

  // 열 너비 설정
  sheet.getColumn(1).width = 20;
  sheet.getColumn(2).width = 30;

  // ROI/수익률 조건부 서식
  const roiCell = sheet.getCell('B16');
  const roiValue = summary.roi;
  if (roiValue > 0) {
    roiCell.font = { color: { argb: 'FF4CAF50' }, bold: true };
  } else if (roiValue < 0) {
    roiCell.font = { color: { argb: 'FFF44336' }, bold: true };
  }
}

/**
 * 베팅 기록 시트 생성
 */
function buildBetsSheet(
  workbook: ExcelJS.Workbook,
  result: BacktestResult
): void {
  const sheet = workbook.addWorksheet('베팅 기록', {
    properties: { tabColor: { argb: 'FF2196F3' } },
  });

  // 헤더
  const headers = ['날짜', '경주장', '경주번호', '마번', '베팅금액', '배당률', '결과', '손익', '누적자본'];
  const headerRow = sheet.addRow(headers);
  applyHeaderStyle(headerRow);

  // 데이터
  result.bets.forEach((bet) => {
    const row = sheet.addRow([
      bet.raceDate,
      bet.track,
      bet.raceNo,
      bet.entryNo,
      bet.betAmount,
      bet.oddsAtBet,
      translateResult(bet.result),
      bet.profit,
      bet.cumulativeCapital,
    ]);

    // 결과에 따른 배경색
    const fill = getResultFill(bet.result);
    if (fill) {
      row.eachCell((cell) => {
        cell.fill = fill;
      });
    }

    // 손익 색상
    const profitCell = row.getCell(8);
    if (bet.profit > 0) {
      profitCell.font = { color: { argb: 'FF4CAF50' } };
    } else if (bet.profit < 0) {
      profitCell.font = { color: { argb: 'FFF44336' } };
    }

    row.border = BORDER_STYLE;
  });

  // 열 너비 설정
  sheet.getColumn(1).width = 12; // 날짜
  sheet.getColumn(2).width = 10; // 경주장
  sheet.getColumn(3).width = 10; // 경주번호
  sheet.getColumn(4).width = 8; // 마번
  sheet.getColumn(5).width = 15; // 베팅금액
  sheet.getColumn(5).numFmt = '#,##0';
  sheet.getColumn(6).width = 10; // 배당률
  sheet.getColumn(6).numFmt = '0.00';
  sheet.getColumn(7).width = 8; // 결과
  sheet.getColumn(8).width = 15; // 손익
  sheet.getColumn(8).numFmt = '#,##0';
  sheet.getColumn(9).width = 15; // 누적자본
  sheet.getColumn(9).numFmt = '#,##0';

  // 필터 추가
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: result.bets.length + 1, column: 9 },
  };
}

/**
 * 자본 곡선 시트 생성
 */
function buildEquityCurveSheet(
  workbook: ExcelJS.Workbook,
  result: BacktestResult
): void {
  const sheet = workbook.addWorksheet('자본 곡선', {
    properties: { tabColor: { argb: 'FFFF9800' } },
  });

  // 헤더
  const headers = ['날짜', '자본', '낙폭 (%)'];
  const headerRow = sheet.addRow(headers);
  applyHeaderStyle(headerRow);

  // 데이터
  result.equityCurve.forEach((point) => {
    const row = sheet.addRow([
      point.date,
      point.capital,
      point.drawdown * 100,
    ]);
    row.border = BORDER_STYLE;
  });

  // 열 너비 및 포맷
  sheet.getColumn(1).width = 12;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(2).numFmt = '#,##0';
  sheet.getColumn(3).width = 12;
  sheet.getColumn(3).numFmt = '0.00"%"';
}

// =============================================================================
// Main Export Function
// =============================================================================

export interface ExcelExportOptions {
  /** 요약 시트 포함 */
  includeSummary?: boolean;
  /** 베팅 기록 시트 포함 */
  includeBets?: boolean;
  /** 자본 곡선 시트 포함 */
  includeEquityCurve?: boolean;
  /** 파일명 (확장자 제외) */
  filename?: string;
}

/**
 * 백테스트 결과를 Excel 파일로 내보내기
 */
export async function exportToExcel(
  result: BacktestResult,
  options: ExcelExportOptions = {}
): Promise<void> {
  const {
    includeSummary = true,
    includeBets = true,
    includeEquityCurve = true,
    filename,
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RaceLab';
  workbook.created = new Date();
  workbook.modified = new Date();

  // 시트 생성
  if (includeSummary) {
    buildSummarySheet(workbook, result);
  }
  if (includeBets) {
    buildBetsSheet(workbook, result);
  }
  if (includeEquityCurve) {
    buildEquityCurveSheet(workbook, result);
  }

  // 파일 생성 및 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const outputFilename =
    filename || `backtest_${result.request.strategy.name}_${Date.now()}`;
  saveAs(blob, `${outputFilename}.xlsx`);
}
