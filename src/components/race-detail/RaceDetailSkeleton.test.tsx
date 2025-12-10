// src/components/race-detail/RaceDetailSkeleton.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  RaceSummaryCardSkeleton,
  EntryTableSkeleton,
  KeyInsightBlockSkeleton,
  RaceResultsOddsSkeleton,
} from './RaceDetailSkeleton';

describe('RaceDetailSkeleton', () => {
  describe('RaceSummaryCardSkeleton', () => {
    it('should render skeleton with loading state', () => {
      render(<RaceSummaryCardSkeleton />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have skeleton card structure', () => {
      render(<RaceSummaryCardSkeleton />);

      expect(screen.getByTestId('summary-skeleton')).toBeInTheDocument();
    });
  });

  describe('EntryTableSkeleton', () => {
    it('should render skeleton rows', () => {
      render(<EntryTableSkeleton />);

      expect(screen.getByTestId('entry-table-skeleton')).toBeInTheDocument();
      const rows = screen.getAllByTestId('entry-row-skeleton');
      expect(rows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('KeyInsightBlockSkeleton', () => {
    it('should render skeleton for insight block', () => {
      render(<KeyInsightBlockSkeleton />);

      expect(screen.getByTestId('insight-skeleton')).toBeInTheDocument();
    });

    it('should render 3 skeleton items', () => {
      render(<KeyInsightBlockSkeleton />);

      const items = screen.getAllByTestId('insight-item-skeleton');
      expect(items.length).toBe(3);
    });
  });

  describe('RaceResultsOddsSkeleton', () => {
    it('should render skeleton for results section', () => {
      render(<RaceResultsOddsSkeleton />);

      expect(screen.getByTestId('results-skeleton')).toBeInTheDocument();
    });
  });
});
