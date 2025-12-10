// src/components/race-detail/RaceResultsOdds.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import RaceResultsOdds from './RaceResultsOdds';
import { Race, RaceType, RaceResult, Dividend } from '@/types';

// Helper to create mock results
function createMockResult(rank: number, overrides: Partial<RaceResult> = {}): RaceResult {
  return {
    rank,
    no: rank,
    name: `테스트마${rank}`,
    jockey: `기수${rank}`,
    odds: 3.5 + rank,
    payout: 3500 + rank * 1000,
    ...overrides,
  };
}

// Helper to create mock dividends
function createMockDividends(): Dividend[] {
  return [
    { type: 'win', entries: [1], amount: 3500 },
    { type: 'place', entries: [1, 2], amount: 1200 },
    { type: 'quinella', entries: [1, 2], amount: 5600 },
  ];
}

function createMockRace(
  type: RaceType,
  status: 'upcoming' | 'live' | 'finished' | 'canceled',
  _results: RaceResult[] = [],
  _dividends: Dividend[] = []
): Race {
  return {
    id: `${type}-1-1-20251210`,
    type,
    raceNo: 1,
    track: type === 'horse' ? '서울' : type === 'cycle' ? '광명' : '미사리',
    startTime: '14:00',
    status,
    entries: [],
  };
}

describe('RaceResultsOdds', () => {
  describe('finished race with results', () => {
    it('should render results table with rankings', () => {
      const results = [createMockResult(1), createMockResult(2), createMockResult(3)];
      const dividends = createMockDividends();
      const race = createMockRace('horse', 'finished', results, dividends);

      render(<RaceResultsOdds race={race} results={results} dividends={dividends} />);

      expect(screen.getByTestId('race-results-odds')).toBeInTheDocument();
      expect(screen.getByText('경주 결과')).toBeInTheDocument();
      expect(screen.getByText('테스트마1')).toBeInTheDocument();
      expect(screen.getByText('테스트마2')).toBeInTheDocument();
      expect(screen.getByText('테스트마3')).toBeInTheDocument();
    });

    it('should display ranking badges with appropriate colors', () => {
      const results = [createMockResult(1), createMockResult(2), createMockResult(3)];
      const race = createMockRace('horse', 'finished', results);

      render(<RaceResultsOdds race={race} results={results} dividends={[]} />);

      // First place should have gold styling
      const firstPlace = screen.getByText('1').closest('span');
      expect(firstPlace).toHaveClass('bg-yellow-400');
    });

    it('should display dividends section with amounts', () => {
      const results = [createMockResult(1), createMockResult(2), createMockResult(3)];
      const dividends = createMockDividends();
      const race = createMockRace('horse', 'finished', results, dividends);

      render(<RaceResultsOdds race={race} results={results} dividends={dividends} />);

      // "배당금" appears in both table header and section - use heading role for section
      expect(screen.getByRole('heading', { name: /배당금/, level: 3 })).toBeInTheDocument();
      expect(screen.getByText('단승')).toBeInTheDocument();
      expect(screen.getByText('복승')).toBeInTheDocument();
      expect(screen.getByText('쌍승')).toBeInTheDocument();
    });

    it('should format dividend amounts with Korean won', () => {
      const results = [createMockResult(1)];
      const dividends = [{ type: 'win' as const, entries: [1], amount: 12500 }];
      const race = createMockRace('horse', 'finished', results, dividends);

      render(<RaceResultsOdds race={race} results={results} dividends={dividends} />);

      // Should show formatted amount (12,500원)
      expect(screen.getByText(/12,500/)).toBeInTheDocument();
    });
  });

  describe('non-finished race', () => {
    it('should display message for upcoming race', () => {
      const race = createMockRace('horse', 'upcoming');

      render(<RaceResultsOdds race={race} results={[]} dividends={[]} />);

      expect(screen.getByText(/아직 결과가 없습니다/)).toBeInTheDocument();
    });

    it('should display message for live race', () => {
      const race = createMockRace('horse', 'live');

      render(<RaceResultsOdds race={race} results={[]} dividends={[]} />);

      expect(screen.getByText(/경주 진행 중/)).toBeInTheDocument();
    });

    it('should display message for canceled race', () => {
      const race = createMockRace('horse', 'canceled');

      render(<RaceResultsOdds race={race} results={[]} dividends={[]} />);

      expect(screen.getByText(/취소된 경주/)).toBeInTheDocument();
    });
  });

  describe('missing data handling', () => {
    it('should show message when results are being processed', () => {
      const race = createMockRace('horse', 'finished');

      render(<RaceResultsOdds race={race} results={[]} dividends={[]} />);

      expect(screen.getByText(/결과 미집계/)).toBeInTheDocument();
    });

    it('should show message when specific dividend is not available', () => {
      const results = [createMockResult(1)];
      // Only win dividend, no place or quinella
      const dividends = [{ type: 'win' as const, entries: [1], amount: 3500 }];
      const race = createMockRace('horse', 'finished', results, dividends);

      render(<RaceResultsOdds race={race} results={results} dividends={dividends} />);

      // Should show 미발매 for missing place and quinella dividends
      const unavailableLabels = screen.getAllByText(/미발매/);
      expect(unavailableLabels.length).toBe(2); // place and quinella are missing
    });
  });

  describe('accessibility', () => {
    it('should have proper section heading', () => {
      const results = [createMockResult(1)];
      const race = createMockRace('horse', 'finished', results);

      render(<RaceResultsOdds race={race} results={results} dividends={[]} />);

      expect(screen.getByRole('heading', { name: /경주 결과/ })).toBeInTheDocument();
    });

    it('should have accessible table structure', () => {
      const results = [createMockResult(1), createMockResult(2)];
      const race = createMockRace('horse', 'finished', results);

      render(<RaceResultsOdds race={race} results={results} dividends={[]} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });
  });

  describe('race type styling', () => {
    it('should apply horse racing color', () => {
      const results = [createMockResult(1)];
      const race = createMockRace('horse', 'finished', results);

      render(<RaceResultsOdds race={race} results={results} dividends={[]} />);

      const container = screen.getByTestId('race-results-odds');
      expect(container).toHaveClass('border-horse');
    });

    it('should apply cycle racing color', () => {
      const results = [createMockResult(1)];
      const race = createMockRace('cycle', 'finished', results);

      render(<RaceResultsOdds race={race} results={results} dividends={[]} />);

      const container = screen.getByTestId('race-results-odds');
      expect(container).toHaveClass('border-cycle');
    });

    it('should apply boat racing color', () => {
      const results = [createMockResult(1)];
      const race = createMockRace('boat', 'finished', results);

      render(<RaceResultsOdds race={race} results={results} dividends={[]} />);

      const container = screen.getByTestId('race-results-odds');
      expect(container).toHaveClass('border-boat');
    });
  });
});
