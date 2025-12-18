import { render, screen } from '@testing-library/react';
import { ResultsExperienceClient } from '@/components/ResultsExperienceClient';
import { MOCK_HISTORICAL_RACES } from '@/lib/mockHistoricalResults';
import type { PaginatedResults } from '@/types';
import type { ResultsApiResponse, NormalizedResultsQuery } from '@/lib/services/resultsService';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Results page experience', () => {
  it('renders list when default query provides data', () => {
    const sampleRace = MOCK_HISTORICAL_RACES[0];
    const query: NormalizedResultsQuery = {
      dateFrom: '20230101',
      dateTo: '20230107',
      page: 1,
      limit: 20,
    };
    const response: ResultsApiResponse<PaginatedResults<typeof sampleRace>> = {
      ok: true,
      data: {
        items: [sampleRace],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      meta: {
        cacheHit: false,
        generatedAt: new Date().toISOString(),
        source: 'mock',
        queryNormalized: query,
      },
    };

    render(<ResultsExperienceClient response={response} query={query} />);

    expect(screen.getByTestId('results-experience')).toBeInTheDocument();
    expect(screen.queryByTestId('results-empty')).not.toBeInTheDocument();
  });
});
