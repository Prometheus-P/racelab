/**
 * Jockeys Ranking Page
 *
 * 기수 랭킹 페이지
 */

'use client';

import React, { useState } from 'react';
import { getJockeyRanking } from '@/lib/analytics';
import type { RankingFilters } from '@/lib/analytics/types';
import { JockeyRankingTable } from '@/components/analytics';

export default function JockeysPage() {
  const [filters, setFilters] = useState<RankingFilters>({
    sortBy: 'winRate',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const result = getJockeyRanking(filters);

  const handleFilterChange = (newFilters: Partial<RankingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <a href="/analytics" className="hover:text-horse">
              분석
            </a>
            <span>/</span>
            <span>기수 랭킹</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">🏇 기수 랭킹</h1>
          <p className="mt-2 text-gray-600">기수별 승률, ROI, 최근 폼을 비교합니다.</p>
        </div>

        {/* 필터 */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">경주장</label>
            <select
              value={filters.track || ''}
              onChange={(e) => handleFilterChange({ track: e.target.value || undefined })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-horse focus:outline-none"
            >
              <option value="">전체</option>
              <option value="서울">서울</option>
              <option value="부산">부산</option>
              <option value="제주">제주</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">기간</label>
            <select
              value={filters.period || '2024'}
              onChange={(e) => handleFilterChange({ period: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-horse focus:outline-none"
            >
              <option value="2024">2024년</option>
              <option value="2023">2023년</option>
              <option value="2022">2022년</option>
            </select>
          </div>
        </div>

        {/* 랭킹 테이블 */}
        <JockeyRankingTable
          jockeys={result.items}
          total={result.total}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
    </main>
  );
}
