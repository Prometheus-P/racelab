'use client';

import { useState } from 'react';
import type { BetRecord } from '@/lib/dashboard/mockResults';
import { ChevronDown, ChevronUp, History } from 'lucide-react';

interface BetHistoryTableProps {
  records: BetRecord[] | null;
  isLoading?: boolean;
}

const RACE_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  horse: { label: '경마', className: 'bg-horse-container text-horse-bold' },
  cycle: { label: '경륜', className: 'bg-cycle-container text-cycle-bold' },
  boat: { label: '경정', className: 'bg-boat-container text-boat-bold' },
};

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-divider bg-white p-4">
      <div className="h-6 w-32 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-5 w-20 animate-pulse rounded bg-neutral-100" />
            <div className="h-5 w-16 animate-pulse rounded bg-neutral-100" />
            <div className="h-5 flex-1 animate-pulse rounded bg-neutral-100" />
            <div className="h-5 w-16 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyTable() {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border border-neutral-divider bg-surface-dim">
      <div className="text-center">
        <History className="mx-auto h-12 w-12 text-neutral-text-secondary opacity-50" />
        <p className="mt-3 text-body-medium text-neutral-text-secondary">
          베팅 히스토리가 여기에 표시됩니다
        </p>
      </div>
    </div>
  );
}

export function BetHistoryTable({ records, isLoading }: BetHistoryTableProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return <TableSkeleton />;
  if (!records || records.length === 0) return <EmptyTable />;

  const displayRecords = expanded ? records : records.slice(0, 10);
  const hasMore = records.length > 10;

  return (
    <div className="rounded-xl border border-neutral-divider bg-white">
      <div className="border-b border-neutral-divider p-4">
        <h3 className="text-title-small font-semibold text-neutral-text-primary">
          베팅 히스토리
        </h3>
        <p className="text-body-small text-neutral-text-secondary">
          최근 {records.length}건의 베팅 기록
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-surface-dim">
            <tr>
              <th className="px-4 py-3 text-left text-label-medium font-medium text-neutral-text-secondary">
                날짜
              </th>
              <th className="px-4 py-3 text-left text-label-medium font-medium text-neutral-text-secondary">
                종목
              </th>
              <th className="px-4 py-3 text-left text-label-medium font-medium text-neutral-text-secondary">
                경주
              </th>
              <th className="px-4 py-3 text-left text-label-medium font-medium text-neutral-text-secondary">
                마명
              </th>
              <th className="px-4 py-3 text-right text-label-medium font-medium text-neutral-text-secondary">
                배당률
              </th>
              <th className="px-4 py-3 text-center text-label-medium font-medium text-neutral-text-secondary">
                결과
              </th>
              <th className="px-4 py-3 text-right text-label-medium font-medium text-neutral-text-secondary">
                손익
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-divider">
            {displayRecords.map((record) => {
              const raceType = RACE_TYPE_LABELS[record.raceType];
              return (
                <tr key={record.id} className="hover:bg-surface-dim/50">
                  <td className="px-4 py-3 text-body-small text-neutral-text-primary">
                    {record.date}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-label-small font-medium ${raceType.className}`}
                    >
                      {raceType.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body-small text-neutral-text-primary">
                    {record.raceName}
                  </td>
                  <td className="px-4 py-3 text-body-small font-medium text-neutral-text-primary">
                    {record.horseName}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-body-small text-neutral-text-primary">
                    {record.odds.toFixed(2)}배
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-label-small font-medium ${
                        record.result === 'win'
                          ? 'bg-bullish/10 text-bullish'
                          : 'bg-bearish/10 text-bearish'
                      }`}
                    >
                      {record.result === 'win' ? '적중' : '미적중'}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono text-body-small font-medium ${
                      record.profit >= 0 ? 'text-bullish' : 'text-bearish'
                    }`}
                  >
                    {record.profit >= 0 ? '+' : ''}
                    {(record.profit / 10000).toFixed(1)}만
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="border-t border-neutral-divider p-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-body-small font-medium text-primary hover:bg-surface-dim"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                더보기 ({records.length - 10}건)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
