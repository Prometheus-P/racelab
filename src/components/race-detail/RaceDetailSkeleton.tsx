// src/components/race-detail/RaceDetailSkeleton.tsx
'use client';

import React from 'react';

const shimmerClass =
  'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';

/**
 * Skeleton loader for RaceSummaryCard
 */
export function RaceSummaryCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="summary-skeleton"
      className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-4"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className={`h-6 w-32 rounded ${shimmerClass}`} />
          <div className={`h-5 w-48 rounded ${shimmerClass}`} />
          <div className="flex gap-2">
            <div className={`h-4 w-16 rounded ${shimmerClass}`} />
            <div className={`h-4 w-20 rounded ${shimmerClass}`} />
            <div className={`h-4 w-14 rounded ${shimmerClass}`} />
          </div>
        </div>
        <div className={`h-8 w-24 rounded-full ${shimmerClass}`} />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton loader for EntryTable
 */
export function EntryTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="entry-table-skeleton"
      className="overflow-hidden rounded-lg border border-gray-200"
    >
      {/* Header */}
      <div className="border-b bg-gray-50 p-3">
        <div className="flex gap-4">
          <div className={`h-4 w-12 rounded ${shimmerClass}`} />
          <div className={`h-4 w-24 rounded ${shimmerClass}`} />
          <div className={`h-4 w-20 rounded ${shimmerClass}`} />
          <div className={`h-4 w-16 rounded ${shimmerClass}`} />
          <div className={`h-4 w-16 rounded ${shimmerClass}`} />
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          data-testid="entry-row-skeleton"
          className="flex items-center gap-4 border-b p-3 last:border-b-0"
        >
          <div className={`h-8 w-8 rounded-full ${shimmerClass}`} />
          <div className={`h-4 w-20 rounded ${shimmerClass}`} />
          <div className={`h-4 w-16 rounded ${shimmerClass}`} />
          <div className={`h-4 w-12 rounded ${shimmerClass}`} />
          <div className={`ml-auto h-4 w-10 rounded ${shimmerClass}`} />
        </div>
      ))}

      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton loader for KeyInsightBlock
 */
export function KeyInsightBlockSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="insight-skeleton"
      className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-4"
    >
      <div className={`mb-4 h-6 w-24 rounded ${shimmerClass}`} />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            data-testid="insight-item-skeleton"
            className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`h-7 w-10 rounded-full ${shimmerClass}`} />
              <div className="space-y-1">
                <div className={`h-4 w-20 rounded ${shimmerClass}`} />
                <div className={`h-3 w-12 rounded ${shimmerClass}`} />
              </div>
            </div>
            <div className="flex gap-4">
              <div className={`h-4 w-10 rounded ${shimmerClass}`} />
              <div className={`h-4 w-12 rounded ${shimmerClass}`} />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton loader for RaceResultsOdds
 */
export function RaceResultsOddsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="results-skeleton"
      className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-4"
    >
      <div className={`mb-4 h-6 w-24 rounded ${shimmerClass}`} />

      {/* Results table skeleton */}
      <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b p-3 last:border-b-0">
            <div className={`h-8 w-8 rounded-full ${shimmerClass}`} />
            <div className={`h-4 w-16 rounded ${shimmerClass}`} />
            <div className={`h-4 w-24 rounded ${shimmerClass}`} />
            <div className={`ml-auto h-4 w-16 rounded ${shimmerClass}`} />
          </div>
        ))}
      </div>

      {/* Dividends skeleton */}
      <div className={`mb-3 h-5 w-16 rounded ${shimmerClass}`} />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-3 shadow-sm">
            <div className={`mb-2 h-3 w-10 rounded ${shimmerClass}`} />
            <div className={`h-5 w-16 rounded ${shimmerClass}`} />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page skeleton for race detail
 */
export function RaceDetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <RaceSummaryCardSkeleton />
      <KeyInsightBlockSkeleton />
      <EntryTableSkeleton />
      <RaceResultsOddsSkeleton />
    </div>
  );
}
