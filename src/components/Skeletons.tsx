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
