// src/components/ResultFilters.tsx
'use client';

import React, { useState } from 'react';
import { DateRangeFilter } from './DateRangeFilter';
import { RaceTypeFilter } from './RaceTypeFilter';
import { TrackFilter } from './TrackFilter';
import { ResultSearch } from './ResultSearch';
import { RaceType } from '@/types';

interface FilterValues {
  dateFrom?: string;
  dateTo?: string;
  types?: RaceType[];
  track?: string;
  jockey?: string;
}

interface ResultFiltersProps {
  dateFrom?: string;
  dateTo?: string;
  types?: RaceType[];
  track?: string;
  jockey?: string;
  onFilterChange: (filters: FilterValues) => void;
  onClear?: () => void;
  className?: string;
  'data-testid'?: string;
}

export function ResultFilters({
  dateFrom,
  dateTo,
  types = [],
  track,
  jockey,
  onFilterChange,
  onClear,
  className = '',
  'data-testid': testId,
}: ResultFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate active filter count
  const activeFilterCount =
    (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + types.length + (track ? 1 : 0) + (jockey ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const handleDateFromChange = (date: string) => {
    onFilterChange({
      dateFrom: date || undefined,
      dateTo,
      types,
      track,
      jockey,
    });
  };

  const handleDateToChange = (date: string) => {
    onFilterChange({
      dateFrom,
      dateTo: date || undefined,
      types,
      track,
      jockey,
    });
  };

  const handleTypesChange = (newTypes: RaceType[]) => {
    onFilterChange({
      dateFrom,
      dateTo,
      types: newTypes,
      track,
      jockey,
    });
  };

  const handleTrackChange = (newTrack: string | undefined) => {
    onFilterChange({
      dateFrom,
      dateTo,
      types,
      track: newTrack,
      jockey,
    });
  };

  const handleSearchChange = (query: string) => {
    onFilterChange({
      dateFrom,
      dateTo,
      types,
      track,
      jockey: query || undefined,
    });
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <div
      role="search"
      aria-label="결과 필터"
      className={`rounded-xl bg-[var(--rl-surface-container)] p-4 ${className}`}
      data-testid={testId}
    >
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="필터"
        className="flex w-full items-center justify-between md:hidden"
      >
        <span className="text-title-medium text-on-surface">필터</span>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span
              data-testid="filter-count"
              className="rounded-full bg-primary px-2 py-0.5 text-label-small text-on-primary"
            >
              {activeFilterCount}
            </span>
          )}
          <svg
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Filter content - always visible on desktop, toggleable on mobile */}
      <div className={`${isExpanded ? 'block' : 'hidden'} mt-4 md:mt-0 md:block`}>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div>
            <h3 className="mb-2 hidden text-label-large text-on-surface-variant md:block">
              기수/선수 검색
            </h3>
            <ResultSearch value={jockey} onSearch={handleSearchChange} />
          </div>

          {/* Date range filter */}
          <div>
            <h3 className="mb-2 hidden text-label-large text-on-surface-variant md:block">
              날짜 범위
            </h3>
            <DateRangeFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={handleDateFromChange}
              onDateToChange={handleDateToChange}
            />
          </div>

          {/* Race type filter */}
          <div>
            <h3 className="mb-2 hidden text-label-large text-on-surface-variant md:block">종목</h3>
            <RaceTypeFilter selectedTypes={types} onChange={handleTypesChange} />
          </div>

          {/* Track filter */}
          <div>
            <h3 className="mb-2 hidden text-label-large text-on-surface-variant md:block">
              경기장
            </h3>
            <TrackFilter
              selectedTrack={track}
              selectedRaceTypes={types.length > 0 ? types : undefined}
              onChange={handleTrackChange}
            />
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="필터 초기화"
              className="self-start rounded-lg px-3 py-1.5 text-label-large text-primary transition-colors hover:bg-primary/10 hover:text-primary/80"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
