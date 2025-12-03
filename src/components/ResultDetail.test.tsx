// src/components/ResultDetail.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultDetail } from './ResultDetail';
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
    { rank: 4, entryNo: 5, name: '구름', jockey: '최기수', time: '1:13.4', timeDiff: '+0.9' },
    { rank: 5, entryNo: 2, name: '번개2', jockey: '정기수', time: '1:13.7', timeDiff: '+1.2' },
  ],
  dividends: [
    { type: 'win', entries: [3], amount: 2500 },
    { type: 'place', entries: [3], amount: 1200 },
    { type: 'place', entries: [7], amount: 1800 },
    { type: 'quinella', entries: [3, 7], amount: 5600 },
  ],
};

describe('ResultDetail', () => {
  it('renders all finishers', () => {
    render(<ResultDetail race={mockRace} />);

    // Should show all 5 finishers, not just top 3
    expect(screen.getByText('번개')).toBeInTheDocument();
    expect(screen.getByText('천둥')).toBeInTheDocument();
    expect(screen.getByText('바람')).toBeInTheDocument();
    expect(screen.getByText('구름')).toBeInTheDocument();
    expect(screen.getByText('번개2')).toBeInTheDocument();
  });

  it('displays all ranks', () => {
    render(<ResultDetail race={mockRace} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays finishing times', () => {
    render(<ResultDetail race={mockRace} />);

    expect(screen.getByText('1:12.5')).toBeInTheDocument();
    expect(screen.getByText('1:12.8')).toBeInTheDocument();
  });

  it('displays time differences', () => {
    render(<ResultDetail race={mockRace} />);

    expect(screen.getByText('+0.3')).toBeInTheDocument();
    expect(screen.getByText('+0.6')).toBeInTheDocument();
  });

  it('displays all dividends', () => {
    render(<ResultDetail race={mockRace} />);

    // All dividend types should be displayed
    expect(screen.getByText(/단승/)).toBeInTheDocument();
    expect(screen.getAllByText(/복승/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/쌍승/)).toBeInTheDocument();
  });

  it('displays dividend amounts', () => {
    render(<ResultDetail race={mockRace} />);

    expect(screen.getByText(/2,500/)).toBeInTheDocument();
    expect(screen.getByText(/1,200/)).toBeInTheDocument();
    expect(screen.getByText(/1,800/)).toBeInTheDocument();
    expect(screen.getByText(/5,600/)).toBeInTheDocument();
  });

  it('displays race distance', () => {
    render(<ResultDetail race={mockRace} />);
    expect(screen.getByText(/1200m/i)).toBeInTheDocument();
  });

  it('displays race grade', () => {
    render(<ResultDetail race={mockRace} />);
    expect(screen.getByText(/국5/)).toBeInTheDocument();
  });

  it('displays entry numbers', () => {
    render(<ResultDetail race={mockRace} />);

    // Entry numbers should be visible
    expect(screen.getByText('3번')).toBeInTheDocument();
    expect(screen.getByText('7번')).toBeInTheDocument();
  });

  it('displays jockey names', () => {
    render(<ResultDetail race={mockRace} />);

    expect(screen.getByText('김기수')).toBeInTheDocument();
    expect(screen.getByText('이기수')).toBeInTheDocument();
    expect(screen.getByText('최기수')).toBeInTheDocument();
  });

  it('has accessible structure', () => {
    render(<ResultDetail race={mockRace} />);

    // Should have table with proper role
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ResultDetail race={mockRace} className="custom-class" data-testid="result-detail" />);
    expect(screen.getByTestId('result-detail')).toHaveClass('custom-class');
  });
});
