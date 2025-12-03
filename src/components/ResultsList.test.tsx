// src/components/ResultsList.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsList } from './ResultsList';
import { HistoricalRace, PaginatedResults } from '@/types';

const mockRaces: HistoricalRace[] = [
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
  {
    id: 'cycle-1-20231201-1',
    type: 'cycle',
    raceNo: 1,
    track: '광명',
    date: '2023-12-01',
    startTime: '11:00',
    status: 'finished',
    results: [
      { rank: 1, entryNo: 5, name: '선수A' },
      { rank: 2, entryNo: 2, name: '선수B' },
      { rank: 3, entryNo: 8, name: '선수C' },
    ],
    dividends: [{ type: 'win', entries: [5], amount: 3200 }],
  },
];

const mockPaginatedResults: PaginatedResults<HistoricalRace> = {
  items: mockRaces,
  total: 50,
  page: 1,
  limit: 20,
  totalPages: 3,
};

describe('ResultsList', () => {
  it('renders list of race results', () => {
    render(<ResultsList results={mockPaginatedResults} />);
    expect(screen.getByText('번개')).toBeInTheDocument();
    expect(screen.getByText('선수A')).toBeInTheDocument();
  });

  it('renders correct number of ResultCard components', () => {
    render(<ResultsList results={mockPaginatedResults} />);
    const cards = screen.getAllByTestId(/result-card/);
    expect(cards).toHaveLength(2);
  });

  it('displays pagination when multiple pages exist', () => {
    render(<ResultsList results={mockPaginatedResults} />);
    expect(screen.getByRole('navigation', { name: /페이지/ })).toBeInTheDocument();
  });

  it('hides pagination when only one page', () => {
    const singlePageResults = { ...mockPaginatedResults, totalPages: 1 };
    render(<ResultsList results={singlePageResults} />);
    expect(screen.queryByRole('navigation', { name: /페이지/ })).not.toBeInTheDocument();
  });

  it('displays total results count', () => {
    render(<ResultsList results={mockPaginatedResults} />);
    expect(screen.getByTestId('total-count')).toHaveTextContent('50');
  });

  it('calls onPageChange when pagination is clicked', async () => {
    const handlePageChange = jest.fn();
    render(
      <ResultsList
        results={mockPaginatedResults}
        onPageChange={handlePageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /다음/ });
    await nextButton.click();

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('shows empty state when no results', () => {
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

  it('renders results in chronological order', () => {
    render(<ResultsList results={mockPaginatedResults} />);
    const cards = screen.getAllByTestId(/result-card/);
    // First card should be horse race
    expect(cards[0]).toHaveTextContent('번개');
    // Second card should be cycle race
    expect(cards[1]).toHaveTextContent('선수A');
  });
});
