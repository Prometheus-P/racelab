// src/components/ResultCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultCard } from './ResultCard';
import { HistoricalRace } from '@/types';

const mockRace: HistoricalRace = {
  id: 'horse-1-20231201-1',
  type: 'horse',
  raceNo: 1,
  track: '서울',
  date: '2023-12-01',
  startTime: '10:30',
  distance: 1200,
  grade: '국5',
  status: 'finished',
  results: [
    { rank: 1, entryNo: 3, name: '번개', jockey: '김기수', time: '1:12.5' },
    { rank: 2, entryNo: 7, name: '천둥', jockey: '이기수', time: '1:12.8', timeDiff: '+0.3' },
    { rank: 3, entryNo: 1, name: '바람', jockey: '박기수', time: '1:13.1', timeDiff: '+0.6' },
  ],
  dividends: [
    { type: 'win', entries: [3], amount: 2500 },
    { type: 'place', entries: [3], amount: 1200 },
    { type: 'place', entries: [7], amount: 1800 },
    { type: 'quinella', entries: [3, 7], amount: 5600 },
  ],
};

describe('ResultCard', () => {
  it('renders race type icon for horse racing', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText('🐎')).toBeInTheDocument();
  });

  it('renders race type icon for cycle racing', () => {
    const cycleRace = { ...mockRace, type: 'cycle' as const };
    render(<ResultCard race={cycleRace} />);
    expect(screen.getByText('🚴')).toBeInTheDocument();
  });

  it('renders race type icon for boat racing', () => {
    const boatRace = { ...mockRace, type: 'boat' as const };
    render(<ResultCard race={boatRace} />);
    expect(screen.getByText('🚤')).toBeInTheDocument();
  });

  it('displays track name', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText(/서울/)).toBeInTheDocument();
  });

  it('displays race number', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText(/1경주/)).toBeInTheDocument();
  });

  it('displays race date', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText(/2023-12-01/)).toBeInTheDocument();
  });

  it('displays top 3 finishers', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText('번개')).toBeInTheDocument();
    expect(screen.getByText('천둥')).toBeInTheDocument();
    expect(screen.getByText('바람')).toBeInTheDocument();
  });

  it('displays finishing positions', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays jockey names for horse racing', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText('김기수')).toBeInTheDocument();
  });

  it('displays win dividend amount', () => {
    render(<ResultCard race={mockRace} />);
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
  });

  it('applies horse race color styling', () => {
    render(<ResultCard race={mockRace} data-testid="result-card" />);
    const card = screen.getByTestId('result-card');
    expect(card).toHaveClass('border-horse');
  });

  it('applies cycle race color styling', () => {
    const cycleRace = { ...mockRace, type: 'cycle' as const };
    render(<ResultCard race={cycleRace} data-testid="result-card" />);
    const card = screen.getByTestId('result-card');
    expect(card).toHaveClass('border-cycle');
  });

  it('applies boat race color styling', () => {
    const boatRace = { ...mockRace, type: 'boat' as const };
    render(<ResultCard race={boatRace} data-testid="result-card" />);
    const card = screen.getByTestId('result-card');
    expect(card).toHaveClass('border-boat');
  });

  it('is clickable and calls onClick when provided', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<ResultCard race={mockRace} onClick={handleClick} />);
    await user.click(screen.getByText('번개'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows canceled status for canceled races', () => {
    const canceledRace = { ...mockRace, status: 'canceled' as const };
    render(<ResultCard race={canceledRace} />);
    expect(screen.getByText(/취소/)).toBeInTheDocument();
  });

  it('has minimum touch target size', () => {
    render(<ResultCard race={mockRace} data-testid="result-card" />);
    const card = screen.getByTestId('result-card');
    expect(card).toHaveClass('min-h-[48px]');
  });

  // T054c: Missing data scenarios
  describe('missing data handling', () => {
    it('displays fallback text when finisher name is null', () => {
      const raceWithMissingName: HistoricalRace = {
        ...mockRace,
        results: [
          { rank: 1, entryNo: 3, name: null as unknown as string, jockey: '김기수', time: '1:12.5' },
          { rank: 2, entryNo: 7, name: '천둥', jockey: '이기수', time: '1:12.8' },
          { rank: 3, entryNo: 1, name: '바람', jockey: '박기수', time: '1:13.1' },
        ],
      };
      render(<ResultCard race={raceWithMissingName} />);
      expect(screen.getByTestId('rank-1')).toHaveTextContent(/출전마 #3|#3/);
    });

    it('displays fallback text when finisher name is undefined', () => {
      const raceWithUndefinedName: HistoricalRace = {
        ...mockRace,
        results: [
          { rank: 1, entryNo: 3, name: undefined as unknown as string, jockey: '김기수', time: '1:12.5' },
          { rank: 2, entryNo: 7, name: '천둥', jockey: '이기수', time: '1:12.8' },
          { rank: 3, entryNo: 1, name: '바람', jockey: '박기수', time: '1:13.1' },
        ],
      };
      render(<ResultCard race={raceWithUndefinedName} />);
      expect(screen.getByTestId('rank-1')).toHaveTextContent(/출전마 #3|#3/);
    });

    it('displays fallback text when finisher name is empty string', () => {
      const raceWithEmptyName: HistoricalRace = {
        ...mockRace,
        results: [
          { rank: 1, entryNo: 3, name: '', jockey: '김기수', time: '1:12.5' },
          { rank: 2, entryNo: 7, name: '천둥', jockey: '이기수', time: '1:12.8' },
          { rank: 3, entryNo: 1, name: '바람', jockey: '박기수', time: '1:13.1' },
        ],
      };
      render(<ResultCard race={raceWithEmptyName} />);
      expect(screen.getByTestId('rank-1')).toHaveTextContent(/출전마 #3|#3/);
    });

    it('displays fallback text when track is null', () => {
      const raceWithMissingTrack: HistoricalRace = {
        ...mockRace,
        track: null as unknown as string,
      };
      render(<ResultCard race={raceWithMissingTrack} />);
      expect(screen.getByText(/1경주/)).toBeInTheDocument();
      // Should show fallback track name, not just empty space
      expect(screen.getByText(/경주장 미정/)).toBeInTheDocument();
    });

    it('displays fallback text when track is undefined', () => {
      const raceWithUndefinedTrack: HistoricalRace = {
        ...mockRace,
        track: undefined as unknown as string,
      };
      render(<ResultCard race={raceWithUndefinedTrack} />);
      expect(screen.getByText(/1경주/)).toBeInTheDocument();
      // Should show fallback track name, not just empty space
      expect(screen.getByText(/경주장 미정/)).toBeInTheDocument();
    });

    it('displays fallback text when track is empty string', () => {
      const raceWithEmptyTrack: HistoricalRace = {
        ...mockRace,
        track: '',
      };
      render(<ResultCard race={raceWithEmptyTrack} />);
      expect(screen.getByText(/1경주/)).toBeInTheDocument();
      // Should show fallback track name, not just empty space
      expect(screen.getByText(/경주장 미정/)).toBeInTheDocument();
    });

    it('handles race with no results gracefully', () => {
      const raceWithNoResults: HistoricalRace = {
        ...mockRace,
        results: [],
      };
      render(<ResultCard race={raceWithNoResults} />);
      expect(screen.getByText(/서울/)).toBeInTheDocument();
      // Should not crash, just show header without finishers
    });

    it('handles race with fewer than 3 results', () => {
      const raceWithFewResults: HistoricalRace = {
        ...mockRace,
        results: [
          { rank: 1, entryNo: 3, name: '번개', jockey: '김기수', time: '1:12.5' },
        ],
      };
      render(<ResultCard race={raceWithFewResults} />);
      expect(screen.getByText('번개')).toBeInTheDocument();
      expect(screen.queryByTestId('rank-2')).not.toBeInTheDocument();
    });
  });
});
