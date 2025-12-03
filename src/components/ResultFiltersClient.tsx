// src/components/ResultFiltersClient.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ResultFilters } from './ResultFilters';
import { RaceType } from '@/types';

interface FilterValues {
  dateFrom?: string;
  dateTo?: string;
  types?: RaceType[];
  track?: string;
  jockey?: string;
}

export function ResultFiltersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  const typesParam = searchParams.get('types');
  const types: RaceType[] = typesParam
    ? (typesParam.split(',').filter((t) => ['horse', 'cycle', 'boat'].includes(t)) as RaceType[])
    : [];
  const track = searchParams.get('track') || undefined;
  const jockey = searchParams.get('jockey') || undefined;

  const updateUrl = useCallback(
    (filters: FilterValues) => {
      const params = new URLSearchParams();

      if (filters.dateFrom) {
        params.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.set('dateTo', filters.dateTo);
      }
      if (filters.types && filters.types.length > 0) {
        params.set('types', filters.types.join(','));
      }
      if (filters.track) {
        params.set('track', filters.track);
      }
      if (filters.jockey) {
        params.set('jockey', filters.jockey);
      }

      // Reset to page 1 when filters change
      const queryString = params.toString();
      router.push(queryString ? `/results?${queryString}` : '/results');
    },
    [router]
  );

  const handleFilterChange = useCallback(
    (filters: FilterValues) => {
      updateUrl(filters);
    },
    [updateUrl]
  );

  const handleClear = useCallback(() => {
    router.push('/results');
  }, [router]);

  return (
    <ResultFilters
      dateFrom={dateFrom}
      dateTo={dateTo}
      types={types}
      track={track}
      jockey={jockey}
      onFilterChange={handleFilterChange}
      onClear={handleClear}
    />
  );
}
