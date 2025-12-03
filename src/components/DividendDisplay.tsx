// src/components/DividendDisplay.tsx
'use client';

import React from 'react';
import { Dividend, DividendType } from '@/types';

export interface DividendDisplayProps {
  dividends: Dividend[];
  compact?: boolean;
  'data-testid'?: string;
}

const dividendLabels: Record<DividendType, string> = {
  win: '단승',
  place: '복승',
  quinella: '쌍승',
};

function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

export function DividendDisplay({
  dividends,
  compact = false,
  'data-testid': testId = 'dividend-display',
}: DividendDisplayProps) {
  if (dividends.length === 0) {
    return null;
  }

  if (compact) {
    // Show only win dividend in compact mode
    const winDividend = dividends.find(d => d.type === 'win');
    if (!winDividend) return null;

    return (
      <div
        className="flex items-center gap-2 text-body-small"
        data-testid={testId}
      >
        <span className="text-on-surface-variant">{dividendLabels.win}</span>
        <span className="font-medium text-on-surface">
          ₩{formatAmount(winDividend.amount)}
        </span>
      </div>
    );
  }

  // Full dividend display
  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="text-label-medium text-on-surface-variant font-medium">
        배당금
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {dividends.map((dividend, index) => (
          <div
            key={`${dividend.type}-${index}`}
            className="flex items-center justify-between bg-surface-container-low rounded-m3-sm px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-body-small text-on-surface-variant">
                {dividendLabels[dividend.type]}
              </span>
              {dividend.entries.length > 0 && (
                <span className="text-label-small text-on-surface-variant">
                  ({dividend.entries.join('-')})
                </span>
              )}
            </div>
            <span className="text-body-medium font-medium text-on-surface">
              ₩{formatAmount(dividend.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
