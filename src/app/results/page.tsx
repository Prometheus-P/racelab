// src/app/results/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResultsList } from '@/components/ResultsList';
import { ResultFiltersClient } from '@/components/ResultFiltersClient';
import { ResultsSkeleton } from '@/components/Skeletons';
import { HistoricalRace, PaginatedResults } from '@/types';
import { ApiResponse } from '@/lib/utils/apiResponse';

export const metadata: Metadata = {
  title: '경주 결과',
  description: '경마, 경륜, 경정 경주 결과를 확인하세요. 배당금, 순위, 기수 정보를 제공합니다.',
};

interface SearchParams {
  dateFrom?: string;
  dateTo?: string;
  types?: string;
  track?: string;
  jockey?: string;
  page?: string;
}

interface ResultsPageProps {
  searchParams: Promise<SearchParams>;
}

async function fetchResults(searchParams: SearchParams): Promise<PaginatedResults<HistoricalRace>> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const params = new URLSearchParams();

  if (searchParams.dateFrom) params.set('dateFrom', searchParams.dateFrom);
  if (searchParams.dateTo) params.set('dateTo', searchParams.dateTo);
  if (searchParams.types) params.set('types', searchParams.types);
  if (searchParams.track) params.set('track', searchParams.track);
  if (searchParams.jockey) params.set('jockey', searchParams.jockey);
  if (searchParams.page) params.set('page', searchParams.page);

  const url = `${baseUrl}/api/results?${params.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 300 }, // 5 minutes
  });

  if (!response.ok) {
    throw new Error('Failed to fetch results');
  }

  const data: ApiResponse<PaginatedResults<HistoricalRace>> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to fetch results');
  }

  return data.data;
}

async function ResultsContent({ searchParams }: { searchParams: SearchParams }) {
  const results = await fetchResults(searchParams);

  return (
    <ResultsList
      results={results}
      data-testid="results-list"
    />
  );
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;

  return (
    <div className="py-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-headline-large font-medium text-on-surface mb-2">
          경주 결과
        </h1>
        <p className="text-body-large text-on-surface-variant">
          최근 경마, 경륜, 경정 결과를 확인하세요
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <ResultFiltersClient />
        </Suspense>
      </div>

      {/* Results */}
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
