// src/components/ResultsList.tsx
'use client';

import React, { useState } from 'react';
import { HistoricalRace, PaginatedResults } from '@/types';
import { ResultCard } from './ResultCard';
import { Pagination } from './Pagination';

export interface ResultsListProps {
  results: PaginatedResults<HistoricalRace>;
  onPageChange?: (page: number) => void;
  'data-testid'?: string;
}

export function ResultsList({
  results,
  onPageChange,
  'data-testid': testId = 'results-list',
}: ResultsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardClick = (raceId: string) => {
    setExpandedId(prev => prev === raceId ? null : raceId);
  };

  if (results.items.length === 0) {
    return (
      <div
        className="text-center py-12 text-on-surface-variant"
        data-testid="empty-state"
      >
        <div className="text-headline-small mb-2">결과가 없습니다</div>
        <div className="text-body-medium">
          다른 날짜나 필터를 선택해 보세요.
        </div>
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      {/* Total Count */}
      <div
        className="mb-4 text-body-medium text-on-surface-variant"
        data-testid="total-count"
      >
        총 <span className="font-medium text-on-surface">{results.total}</span>건
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.items.map((race) => (
          <ResultCard
            key={race.id}
            race={race}
            onClick={() => handleCardClick(race.id)}
            expanded={expandedId === race.id}
            data-testid={`result-card-${race.id}`}
          />
        ))}
      </div>

      {/* Pagination */}
      {results.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
