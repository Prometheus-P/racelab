// src/app/results/page.test.tsx
// Note: Full page testing is done via E2E tests (e2e/tests/results.spec.ts)
// These tests focus on the page component rendering with mocked data

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsList } from '@/components/ResultsList';
import { ResultsSkeleton } from '@/components/Skeletons';
import { PaginatedResults, HistoricalRace } from '@/types';

const mockResults: PaginatedResults<HistoricalRace> = {
  items: [
    {
      id: 'horse-1-20231201-1',
      type: 'horse',
      raceNo: 1,
      track: '서울',
      date: '2023-12-01',
      startTime: '10:30',
      status: 'finished',
      results: [
        { rank: 1, entryNo: 3, name: '번개', jockey: '김기수' },
        { rank: 2, entryNo: 7, name: '천둥', jockey: '이기수' },
        { rank: 3, entryNo: 1, name: '바람', jockey: '박기수' },
      ],
      dividends: [{ type: 'win', entries: [3], amount: 2500 }],
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

describe('Results Page Components', () => {
  describe('ResultsSkeleton', () => {
    it('renders loading skeleton with correct test id', () => {
      render(<ResultsSkeleton />);
      expect(screen.getByTestId('results-skeleton')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<ResultsSkeleton />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-label', '결과 로딩 중');
    });

    it('renders multiple skeleton cards', () => {
      render(<ResultsSkeleton />);
      const cards = screen.getByTestId('results-skeleton').querySelectorAll('.animate-pulse');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('ResultsList Integration', () => {
    it('renders results list with data', () => {
      render(<ResultsList results={mockResults} />);
      expect(screen.getByTestId('results-list')).toBeInTheDocument();
    });

    it('displays race results from data', () => {
      render(<ResultsList results={mockResults} />);
      expect(screen.getByText('번개')).toBeInTheDocument();
    });

    it('displays total count', () => {
      render(<ResultsList results={mockResults} />);
      expect(screen.getByTestId('total-count')).toHaveTextContent('1');
    });

    it('displays result cards', () => {
      render(<ResultsList results={mockResults} />);
      expect(screen.getByTestId(/result-card/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no results', () => {
      const emptyResults: PaginatedResults<HistoricalRace> = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      render(<ResultsList results={emptyResults} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('displays helpful message in empty state', () => {
      const emptyResults: PaginatedResults<HistoricalRace> = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      render(<ResultsList results={emptyResults} />);
      expect(screen.getByText(/결과가 없습니다/)).toBeInTheDocument();
    });
  });
});
