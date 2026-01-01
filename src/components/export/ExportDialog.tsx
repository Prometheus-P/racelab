'use client';

/**
 * Export Dialog Component
 *
 * 백테스트 결과 및 전략을 다양한 포맷으로 내보내기
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileJson, FileText, X, Upload } from 'lucide-react';
import type { BacktestResult, StrategyDefinition } from '@/lib/strategy/types';
import {
  downloadBacktestBetsCSV,
  downloadBacktestSummaryCSV,
  downloadEquityCurveCSV,
  exportToExcel,
  downloadStrategyJSON,
  importStrategyFromFile,
  type StrategyImportResult,
} from '@/lib/export';

// =============================================================================
// Types
// =============================================================================

export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ExportDialogProps {
  /** 백테스트 결과 (베팅 기록 내보내기용) */
  backtestResult?: BacktestResult;
  /** 전략 정의 (전략 내보내기용) */
  strategy?: StrategyDefinition;
  /** 다이얼로그 열림 상태 */
  isOpen: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 전략 가져오기 콜백 */
  onImportStrategy?: (strategy: StrategyDefinition) => void;
}

// =============================================================================
// Export Dialog Component
// =============================================================================

export function ExportDialog({
  backtestResult,
  strategy,
  isOpen,
  onClose,
  onImportStrategy,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeOptions, setIncludeOptions] = useState({
    summary: true,
    bets: true,
    equityCurve: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<StrategyImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // 내보내기 처리
  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      if (format === 'json' && strategy) {
        // 전략 JSON 내보내기
        downloadStrategyJSON(strategy);
      } else if (format === 'excel' && backtestResult) {
        // Excel 내보내기
        await exportToExcel(backtestResult, {
          includeSummary: includeOptions.summary,
          includeBets: includeOptions.bets,
          includeEquityCurve: includeOptions.equityCurve,
        });
      } else if (format === 'csv' && backtestResult) {
        // CSV 내보내기 (각 항목 별도)
        if (includeOptions.summary) {
          downloadBacktestSummaryCSV(backtestResult);
        }
        if (includeOptions.bets) {
          downloadBacktestBetsCSV(backtestResult);
        }
        if (includeOptions.equityCurve) {
          downloadEquityCurveCSV(backtestResult);
        }
      }

      // 성공 후 닫기
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [format, strategy, backtestResult, includeOptions, onClose]);

  // 파일 가져오기 처리
  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const result = await importStrategyFromFile(file);
      setImportResult(result);

      if (result.success && result.strategy && onImportStrategy) {
        onImportStrategy(result.strategy);
        closeTimeoutRef.current = setTimeout(() => {
          onClose();
        }, 1500);
      }

      // 파일 입력 초기화
      event.target.value = '';
    },
    [onImportStrategy, onClose]
  );

  // 옵션 토글
  const toggleOption = useCallback((key: keyof typeof includeOptions) => {
    setIncludeOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (!isOpen) return null;

  const hasBacktestResult = !!backtestResult;
  const hasStrategy = !!strategy;
  const canExport =
    (format === 'json' && hasStrategy) ||
    ((format === 'csv' || format === 'excel') &&
      hasBacktestResult &&
      (includeOptions.summary || includeOptions.bets || includeOptions.equityCurve));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-rl-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-divider px-6 py-4">
          <h2 className="text-title-medium font-semibold text-neutral-text-primary">
            데이터 내보내기
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-text-tertiary hover:bg-surface-container hover:text-neutral-text-primary"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="space-y-6 p-6">
          {/* 포맷 선택 */}
          <div>
            <label className="mb-3 block text-label-medium font-medium text-neutral-text-secondary">
              포맷 선택
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* CSV */}
              <button
                type="button"
                onClick={() => setFormat('csv')}
                disabled={!hasBacktestResult}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  format === 'csv'
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-border hover:border-neutral-text-tertiary'
                } ${!hasBacktestResult ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <FileText className={`h-8 w-8 ${format === 'csv' ? 'text-primary' : 'text-neutral-text-tertiary'}`} />
                <span className={`text-label-medium font-medium ${format === 'csv' ? 'text-primary' : 'text-neutral-text-primary'}`}>
                  CSV
                </span>
                <span className="text-label-small text-neutral-text-tertiary">
                  Excel 호환
                </span>
              </button>

              {/* Excel */}
              <button
                type="button"
                onClick={() => setFormat('excel')}
                disabled={!hasBacktestResult}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  format === 'excel'
                    ? 'border-horse bg-horse/5'
                    : 'border-neutral-border hover:border-neutral-text-tertiary'
                } ${!hasBacktestResult ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <FileSpreadsheet className={`h-8 w-8 ${format === 'excel' ? 'text-horse' : 'text-neutral-text-tertiary'}`} />
                <span className={`text-label-medium font-medium ${format === 'excel' ? 'text-horse' : 'text-neutral-text-primary'}`}>
                  Excel
                </span>
                <span className="text-label-small text-neutral-text-tertiary">
                  스타일 포함
                </span>
              </button>

              {/* JSON */}
              <button
                type="button"
                onClick={() => setFormat('json')}
                disabled={!hasStrategy}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  format === 'json'
                    ? 'border-boat bg-boat/5'
                    : 'border-neutral-border hover:border-neutral-text-tertiary'
                } ${!hasStrategy ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <FileJson className={`h-8 w-8 ${format === 'json' ? 'text-boat' : 'text-neutral-text-tertiary'}`} />
                <span className={`text-label-medium font-medium ${format === 'json' ? 'text-boat' : 'text-neutral-text-primary'}`}>
                  JSON
                </span>
                <span className="text-label-small text-neutral-text-tertiary">
                  전략 정의
                </span>
              </button>
            </div>
          </div>

          {/* 포함 항목 (CSV/Excel) */}
          {(format === 'csv' || format === 'excel') && hasBacktestResult && (
            <div>
              <label className="mb-3 block text-label-medium font-medium text-neutral-text-secondary">
                포함 항목
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeOptions.summary}
                    onChange={() => toggleOption('summary')}
                    className="h-5 w-5 rounded border-neutral-border text-primary focus:ring-primary"
                  />
                  <span className="text-body-medium text-neutral-text-primary">
                    요약 통계
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeOptions.bets}
                    onChange={() => toggleOption('bets')}
                    className="h-5 w-5 rounded border-neutral-border text-primary focus:ring-primary"
                  />
                  <span className="text-body-medium text-neutral-text-primary">
                    베팅 기록 ({backtestResult.bets.length}건)
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeOptions.equityCurve}
                    onChange={() => toggleOption('equityCurve')}
                    className="h-5 w-5 rounded border-neutral-border text-primary focus:ring-primary"
                  />
                  <span className="text-body-medium text-neutral-text-primary">
                    자본 곡선
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* 전략 가져오기 */}
          {onImportStrategy && (
            <div className="border-t border-neutral-divider pt-6">
              <label className="mb-3 block text-label-medium font-medium text-neutral-text-secondary">
                전략 가져오기
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-border py-4 text-body-medium text-neutral-text-secondary transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <Upload className="h-5 w-5" />
                JSON 파일에서 전략 가져오기
              </button>

              {/* 가져오기 결과 */}
              {importResult && (
                <div
                  className={`mt-3 rounded-lg p-3 text-body-small ${
                    importResult.success
                      ? 'bg-status-success-bg text-status-success-text'
                      : 'bg-status-error-bg text-status-error-text'
                  }`}
                >
                  {importResult.success ? (
                    <>
                      ✓ 전략을 성공적으로 가져왔습니다.
                      {importResult.warnings?.map((w, i) => (
                        <div key={i} className="mt-1 text-status-warning-text">
                          ⚠ {w}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>✗ {importResult.error}</>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-divider px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-6 py-2 text-label-large font-medium text-neutral-text-primary hover:bg-surface-container"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-label-large font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                내보내는 중...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                다운로드
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDialog;
