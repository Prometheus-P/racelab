// src/components/race-detail/KeyInsightBlock.tsx

import React from 'react';
import { Race, RaceType, RaceResult, Entry } from '@/types';

interface KeyInsightBlockProps {
  race: Race;
  results: RaceResult[];
  className?: string;
}

const raceTypeConfig: Record<RaceType, { borderColor: string; bgColor: string }> = {
  horse: { borderColor: 'border-horse', bgColor: 'bg-horse/5' },
  cycle: { borderColor: 'border-cycle', bgColor: 'bg-cycle/5' },
  boat: { borderColor: 'border-boat', bgColor: 'bg-boat/5' },
};

/**
 * Parse recent record string (e.g., "1-2-3") and calculate sum
 * Lower sum = better performance
 */
function parseRecentRecord(record: string | undefined): number {
  if (!record) return Infinity;
  const parts = record.split('-').map(Number);
  if (parts.some(isNaN)) return Infinity;
  return parts.reduce((acc, val) => acc + val, 0);
}

/**
 * Get top N entries ranked by popularity
 * Priority: odds (lowest first) > recent record sum (lowest first) > entry number (lowest first)
 */
export function getTopEntries(entries: Entry[], count: number): Entry[] {
  if (entries.length === 0) return [];

  // Separate entries with and without odds
  const withOdds = entries.filter((e) => e.odds !== undefined && e.odds !== null);
  const withoutOdds = entries.filter((e) => e.odds === undefined || e.odds === null);

  // Sort entries with odds by odds value (ascending), then by entry number
  const sortedWithOdds = [...withOdds].sort((a, b) => {
    const oddsDiff = (a.odds || 0) - (b.odds || 0);
    if (oddsDiff !== 0) return oddsDiff;
    return a.no - b.no;
  });

  // Sort entries without odds by recent record sum (ascending), then by entry number
  const sortedWithoutOdds = [...withoutOdds].sort((a, b) => {
    const recordSumA = parseRecentRecord(a.recentRecord);
    const recordSumB = parseRecentRecord(b.recentRecord);
    if (recordSumA !== recordSumB) return recordSumA - recordSumB;
    return a.no - b.no;
  });

  // Combine: odds entries first, then without odds
  const combined = [...sortedWithOdds, ...sortedWithoutOdds];
  return combined.slice(0, count);
}

/**
 * Get actual race result rank for an entry
 */
function getEntryResult(entryNo: number, results: RaceResult[]): RaceResult | undefined {
  return results.find((r) => r.no === entryNo);
}

const rankBadgeStyles: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-orange-300 text-orange-900',
};

export default function KeyInsightBlock({
  race,
  results,
  className = '',
}: KeyInsightBlockProps) {
  const config = raceTypeConfig[race.type];
  const topEntries = getTopEntries(race.entries, 3);
  const isFinished = race.status === 'finished';

  if (topEntries.length === 0) {
    return (
      <section
        data-testid="key-insight-block"
        className={`rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} p-4 ${className}`}
      >
        <h2 className="mb-3 text-lg font-bold text-gray-900">인기 분석</h2>
        <p className="text-center text-gray-500 py-4">인사이트 데이터 준비 중</p>
      </section>
    );
  }

  return (
    <section
      data-testid="key-insight-block"
      className={`rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} p-4 ${className}`}
    >
      <h2 className="mb-4 text-lg font-bold text-gray-900">인기 분석</h2>

      <div className="space-y-3">
        {topEntries.map((entry, index) => {
          const popularityRank = index + 1;
          const entryResult = isFinished ? getEntryResult(entry.no, results) : undefined;
          const rankStyle = rankBadgeStyles[popularityRank] || 'bg-gray-100 text-gray-600';

          return (
            <div
              key={entry.no}
              className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {/* Popularity Rank Badge */}
                <span
                  className={`inline-flex h-7 w-10 items-center justify-center rounded-full text-sm font-bold ${rankStyle}`}
                >
                  {popularityRank}위
                </span>

                {/* Entry Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{entry.no}번</span>
                    <span className="font-semibold text-gray-800">{entry.name}</span>
                  </div>
                  {entry.jockey && (
                    <span className="text-sm text-gray-500">{entry.jockey}</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                {/* Odds */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">배당</div>
                  <div className="font-semibold text-gray-900">
                    {entry.odds !== undefined && entry.odds !== null ? entry.odds : '-'}
                  </div>
                </div>

                {/* Recent Record */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">최근성적</div>
                  <div className="font-semibold text-gray-900">
                    {entry.recentRecord || '-'}
                  </div>
                </div>

                {/* Actual Result (only for finished races) */}
                {isFinished && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500">착순</div>
                    <div className="font-semibold text-gray-900">
                      {entryResult ? `${entryResult.rank}착` : '-'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
