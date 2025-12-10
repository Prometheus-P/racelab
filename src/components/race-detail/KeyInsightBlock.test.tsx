// src/components/race-detail/KeyInsightBlock.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import KeyInsightBlock, { getTopEntries } from './KeyInsightBlock';
import { Race, RaceType, Entry, RaceResult } from '@/types';

// Helper to create mock entries
function createMockEntry(no: number, overrides: Partial<Entry> = {}): Entry {
  return {
    no,
    name: `테스트마${no}`,
    jockey: `기수${no}`,
    odds: undefined,
    recentRecord: undefined,
    ...overrides,
  };
}

function createMockRace(
  type: RaceType,
  entries: Entry[],
  status: 'upcoming' | 'live' | 'finished' | 'canceled' = 'upcoming'
): Race {
  return {
    id: `${type}-1-1-20251210`,
    type,
    raceNo: 1,
    track: type === 'horse' ? '서울' : type === 'cycle' ? '광명' : '미사리',
    startTime: '14:00',
    status,
    entries,
  };
}

function createMockResult(rank: number, no: number): RaceResult {
  return {
    rank,
    no,
    name: `테스트마${no}`,
  };
}

describe('KeyInsightBlock', () => {
  describe('getTopEntries ranking logic', () => {
    it('should rank by odds (lowest first) when available', () => {
      const entries = [
        createMockEntry(1, { odds: 5.0 }),
        createMockEntry(2, { odds: 2.5 }),
        createMockEntry(3, { odds: 8.0 }),
        createMockEntry(4, { odds: 3.0 }),
      ];

      const top3 = getTopEntries(entries, 3);

      expect(top3.map((e) => e.no)).toEqual([2, 4, 1]); // 2.5, 3.0, 5.0
    });

    it('should use recent record when odds not available', () => {
      const entries = [
        createMockEntry(1, { recentRecord: '1-2-3' }), // sum = 6
        createMockEntry(2, { recentRecord: '2-1-1' }), // sum = 4
        createMockEntry(3, { recentRecord: '3-3-2' }), // sum = 8
        createMockEntry(4, { recentRecord: '1-1-2' }), // sum = 4
      ];

      const top3 = getTopEntries(entries, 3);

      // Highest sum = lowest rank score (best) = most popular
      // Entry 2 (sum=4) and Entry 4 (sum=4) tie, so entry 2 first (lower no)
      // Entry 1 (sum=6) next
      expect(top3.map((e) => e.no)).toEqual([2, 4, 1]);
    });

    it('should break ties by entry number (lowest first)', () => {
      const entries = [
        createMockEntry(3, { odds: 3.0 }),
        createMockEntry(1, { odds: 3.0 }),
        createMockEntry(2, { odds: 3.0 }),
      ];

      const top3 = getTopEntries(entries, 3);

      expect(top3.map((e) => e.no)).toEqual([1, 2, 3]);
    });

    it('should handle mixed odds and no-odds entries', () => {
      const entries = [
        createMockEntry(1, { odds: 5.0 }),
        createMockEntry(2, { recentRecord: '1-1-1' }), // no odds, use record
        createMockEntry(3, { odds: 2.0 }),
      ];

      const top3 = getTopEntries(entries, 3);

      // Odds take priority: 3 (2.0), 1 (5.0)
      // Entry 2 has no odds, so ranked last
      expect(top3.map((e) => e.no)).toEqual([3, 1, 2]);
    });

    it('should return empty array when no entries', () => {
      const top3 = getTopEntries([], 3);
      expect(top3).toEqual([]);
    });

    it('should return all entries if less than requested', () => {
      const entries = [createMockEntry(1, { odds: 2.0 }), createMockEntry(2, { odds: 3.0 })];

      const top3 = getTopEntries(entries, 3);

      expect(top3.length).toBe(2);
    });
  });

  describe('rendering', () => {
    it('should render top 3 popular entries', () => {
      const entries = [
        createMockEntry(1, { odds: 5.0, name: '일등마' }),
        createMockEntry(2, { odds: 2.5, name: '인기마' }),
        createMockEntry(3, { odds: 8.0, name: '삼등마' }),
      ];
      const race = createMockRace('horse', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      expect(screen.getByTestId('key-insight-block')).toBeInTheDocument();
      expect(screen.getByText('인기 분석')).toBeInTheDocument();
      // 인기마 should be first (lowest odds)
      expect(screen.getByText('인기마')).toBeInTheDocument();
    });

    it('should show empty state when no entries', () => {
      const race = createMockRace('horse', []);

      render(<KeyInsightBlock race={race} results={[]} />);

      expect(screen.getByText(/인사이트 데이터 준비 중/)).toBeInTheDocument();
    });

    it('should show rank badge with popularity rank', () => {
      const entries = [
        createMockEntry(1, { odds: 5.0, name: '일등마' }),
        createMockEntry(2, { odds: 2.5, name: '인기마' }),
      ];
      const race = createMockRace('horse', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      // Popularity ranks should be shown
      expect(screen.getByText('1위')).toBeInTheDocument();
      expect(screen.getByText('2위')).toBeInTheDocument();
    });
  });

  describe('result comparison', () => {
    it('should show actual result when race is finished', () => {
      const entries = [
        createMockEntry(1, { odds: 5.0, name: '일등마' }),
        createMockEntry(2, { odds: 2.5, name: '인기마' }),
      ];
      const race = createMockRace('horse', entries, 'finished');
      const results = [createMockResult(1, 2), createMockResult(2, 1)];

      render(<KeyInsightBlock race={race} results={results} />);

      // Should show actual race result for each entry (one per entry)
      const resultLabels = screen.getAllByText(/착순/);
      expect(resultLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('should not show result section for upcoming race', () => {
      const entries = [createMockEntry(1, { odds: 5.0 })];
      const race = createMockRace('horse', entries, 'upcoming');

      render(<KeyInsightBlock race={race} results={[]} />);

      expect(screen.queryByText(/착순/)).not.toBeInTheDocument();
    });
  });

  describe('entry details display', () => {
    it('should display odds when available', () => {
      const entries = [createMockEntry(1, { odds: 3.5, name: '테스트마' })];
      const race = createMockRace('horse', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      expect(screen.getByText('3.5')).toBeInTheDocument();
    });

    it('should display recent record when available', () => {
      const entries = [createMockEntry(1, { recentRecord: '1-2-3', name: '테스트마' })];
      const race = createMockRace('horse', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      expect(screen.getByText('1-2-3')).toBeInTheDocument();
    });

    it('should show dash when data not available', () => {
      const entries = [createMockEntry(1, { name: '테스트마' })];
      const race = createMockRace('horse', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      // Odds and record should show dash
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe('race type styling', () => {
    it('should apply horse racing color', () => {
      const entries = [createMockEntry(1, { odds: 3.0 })];
      const race = createMockRace('horse', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      const container = screen.getByTestId('key-insight-block');
      expect(container).toHaveClass('border-horse');
    });

    it('should apply cycle racing color', () => {
      const entries = [createMockEntry(1, { odds: 3.0 })];
      const race = createMockRace('cycle', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      const container = screen.getByTestId('key-insight-block');
      expect(container).toHaveClass('border-cycle');
    });

    it('should apply boat racing color', () => {
      const entries = [createMockEntry(1, { odds: 3.0 })];
      const race = createMockRace('boat', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      const container = screen.getByTestId('key-insight-block');
      expect(container).toHaveClass('border-boat');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading', () => {
      const entries = [createMockEntry(1, { odds: 3.0 })];
      const race = createMockRace('horse', entries);

      render(<KeyInsightBlock race={race} results={[]} />);

      expect(screen.getByRole('heading', { name: /인기 분석/ })).toBeInTheDocument();
    });
  });
});
