/**
 * @jest-environment jsdom
 *
 * Tests for AISummary component (T037, T038)
 * Verifies plain-text summary for LLM parsing and data source attribution
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import AISummary from '@/components/seo/AISummary';
import { Race, RaceResult, Dividend } from '@/types';

describe('AISummary Component', () => {
  const mockRace: Race = {
    id: 'horse-sel-20241215-03',
    type: 'horse',
    track: '서울',
    raceNo: 3,
    date: '2024-12-15',
    startTime: '14:30',
    distance: 1400,
    status: 'finished',
    entries: [],
  };

  const mockResults: RaceResult[] = [
    { rank: 1, no: 1, name: '번개호', odds: 3.5, jockey: '김철수' },
    { rank: 2, no: 3, name: '바람이', odds: 8.1, jockey: '정대한' },
    { rank: 3, no: 2, name: '천둥이', odds: 5.2, jockey: '이영수' },
  ];

  const mockDividends: Dividend[] = [
    { type: 'win', entries: [1], amount: 3500 },
    { type: 'place', entries: [1], amount: 1500 },
    { type: 'quinella', entries: [1, 3], amount: 8200 },
  ];

  describe('Component rendering', () => {
    it('renders without crashing', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByTestId('ai-summary')).toBeInTheDocument();
    });

    it('renders with sr-only class for screen readers', () => {
      render(<AISummary race={mockRace} />);
      const summary = screen.getByTestId('ai-summary');
      expect(summary).toHaveClass('sr-only');
    });

    it('has correct aria-label', () => {
      render(<AISummary race={mockRace} />);
      const summary = screen.getByTestId('ai-summary');
      expect(summary).toHaveAttribute('aria-label', '경주 요약 정보 (AI/검색엔진용)');
    });
  });

  describe('Race information format (T037)', () => {
    it('includes date in race info', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByText(/경주 정보:.*2024-12-15/)).toBeInTheDocument();
    });

    it('includes track name in race info', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByText(/경주 정보:.*서울/)).toBeInTheDocument();
    });

    it('includes race number in race info', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByText(/제3경주/)).toBeInTheDocument();
    });

    it('includes race type in Korean', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByText(/경마/)).toBeInTheDocument();
    });

    it('includes distance when available', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByText(/1400m/)).toBeInTheDocument();
    });
  });

  describe('Status display', () => {
    it('displays status for upcoming races', () => {
      const upcomingRace = { ...mockRace, status: 'upcoming' as const };
      render(<AISummary race={upcomingRace} />);
      expect(screen.getByText(/상태: 경주 예정/)).toBeInTheDocument();
    });

    it('displays status for live races', () => {
      const liveRace = { ...mockRace, status: 'live' as const };
      render(<AISummary race={liveRace} />);
      expect(screen.getByText(/상태: 진행 중/)).toBeInTheDocument();
    });

    it('displays status for finished races', () => {
      const finishedRace = { ...mockRace, status: 'finished' as const };
      render(<AISummary race={finishedRace} />);
      expect(screen.getByText(/상태: 경주 종료/)).toBeInTheDocument();
    });

    it('displays status for canceled races', () => {
      const canceledRace = { ...mockRace, status: 'canceled' as const };
      render(<AISummary race={canceledRace} />);
      expect(screen.getByText(/상태: 취소됨/)).toBeInTheDocument();
    });
  });

  describe('Results display', () => {
    it('displays top 3 results when available', () => {
      render(<AISummary race={mockRace} results={mockResults} />);
      expect(screen.getByText(/경주 결과:/)).toBeInTheDocument();
      expect(screen.getByText(/1착 번개호/)).toBeInTheDocument();
      expect(screen.getByText(/2착 바람이/)).toBeInTheDocument();
      expect(screen.getByText(/3착 천둥이/)).toBeInTheDocument();
    });

    it('includes odds in results', () => {
      render(<AISummary race={mockRace} results={mockResults} />);
      expect(screen.getByText(/배당 3.5배/)).toBeInTheDocument();
    });

    it('includes jockey in results', () => {
      render(<AISummary race={mockRace} results={mockResults} />);
      expect(screen.getByText(/기수: 김철수/)).toBeInTheDocument();
    });

    it('does not display results section when no results', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.queryByText(/경주 결과:/)).not.toBeInTheDocument();
    });

    it('does not display results section when results array is empty', () => {
      render(<AISummary race={mockRace} results={[]} />);
      expect(screen.queryByText(/경주 결과:/)).not.toBeInTheDocument();
    });
  });

  describe('Dividends display', () => {
    it('displays dividends when available', () => {
      render(<AISummary race={mockRace} dividends={mockDividends} />);
      expect(screen.getByText(/배당금:/)).toBeInTheDocument();
    });

    it('formats win dividend correctly', () => {
      render(<AISummary race={mockRace} dividends={mockDividends} />);
      expect(screen.getByText(/단승 3,500원/)).toBeInTheDocument();
    });

    it('formats place dividend correctly', () => {
      render(<AISummary race={mockRace} dividends={mockDividends} />);
      expect(screen.getByText(/복승 1,500원/)).toBeInTheDocument();
    });

    it('formats quinella dividend correctly', () => {
      render(<AISummary race={mockRace} dividends={mockDividends} />);
      expect(screen.getByText(/쌍승 8,200원/)).toBeInTheDocument();
    });

    it('does not display dividends section when no dividends', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.queryByText(/배당금:/)).not.toBeInTheDocument();
    });
  });

  describe('Data source attribution (T038)', () => {
    it('displays KRA data source for horse racing', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByText(/데이터 출처: 한국마사회/)).toBeInTheDocument();
    });

    it('displays KSPO data source for cycle racing', () => {
      const cycleRace = { ...mockRace, type: 'cycle' as const };
      render(<AISummary race={cycleRace} />);
      expect(screen.getByText(/데이터 출처: 국민체육진흥공단/)).toBeInTheDocument();
    });

    it('displays KSPO data source for boat racing', () => {
      const boatRace = { ...mockRace, type: 'boat' as const };
      render(<AISummary race={boatRace} />);
      expect(screen.getByText(/데이터 출처: 국민체육진흥공단/)).toBeInTheDocument();
    });

    it('includes official data marker (공식 데이터)', () => {
      render(<AISummary race={mockRace} />);
      expect(screen.getByText(/공식 데이터/)).toBeInTheDocument();
    });
  });

  describe('Race type variations', () => {
    it('displays 경륜 for cycle racing', () => {
      const cycleRace = { ...mockRace, type: 'cycle' as const };
      render(<AISummary race={cycleRace} />);
      expect(screen.getByText(/경륜/)).toBeInTheDocument();
    });

    it('displays 경정 for boat racing', () => {
      const boatRace = { ...mockRace, type: 'boat' as const };
      render(<AISummary race={boatRace} />);
      expect(screen.getByText(/경정/)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles race without distance', () => {
      const raceWithoutDistance = { ...mockRace, distance: undefined };
      render(<AISummary race={raceWithoutDistance} />);
      expect(screen.getByTestId('ai-summary')).toBeInTheDocument();
      expect(screen.queryByText(/\d+m/)).not.toBeInTheDocument();
    });

    it('handles race without date (uses today)', () => {
      const raceWithoutDate = { ...mockRace, date: undefined as unknown as string };
      render(<AISummary race={raceWithoutDate} />);
      const today = new Date().toISOString().split('T')[0];
      expect(screen.getByText(new RegExp(today))).toBeInTheDocument();
    });
  });
});
