// src/components/Skeletons.tsx
import React from 'react';

export function QuickStatsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      aria-label="통계 로딩 중"
      role="status"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-xl border border-gray-100 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      ))}
      <span className="sr-only">통계 정보를 불러오는 중입니다</span>
    </div>
  );
}

export function RaceListSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="경주 목록 로딩 중"
      role="status"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse"
        >
          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-16 flex-shrink-0" />
        </div>
      ))}
      <span className="sr-only">경주 목록을 불러오는 중입니다</span>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function ResultsSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-label="결과 로딩 중"
      role="status"
      data-testid="results-skeleton"
    >
      {/* Count skeleton */}
      <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />

      {/* Result cards skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-m3-md shadow-m3-1 p-4 border-l-4 border-gray-200 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-6 w-6 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded flex-1 max-w-[120px]" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>

          {/* Dividend */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
        </div>
      ))}
      <span className="sr-only">경주 결과를 불러오는 중입니다</span>
    </div>
  );
}
