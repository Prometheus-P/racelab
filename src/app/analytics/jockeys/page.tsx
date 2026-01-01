/**
 * Jockeys Ranking Page
 *
 * 기수 랭킹 페이지 (실제 KRA API 연동)
 */

'use client';

import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { fetchJockeyRanking } from '@/lib/analytics/api';
import type { JockeyStats, RankingFilters, RankingResult } from '@/lib/analytics/types';
import { JockeyRankingTable } from '@/components/analytics';

// State batching with useReducer (INP 최적화)
interface FetchState {
  result: RankingResult<JockeyStats>;
  loading: boolean;
  error: string | null;
}

type FetchAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: RankingResult<JockeyStats> }
  | { type: 'FETCH_ERROR'; payload: string };

const initialState: FetchState = {
  result: { items: [], total: 0, page: 1, limit: 20, filters: {} },
  loading: true,
  error: null,
};

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { result: action.payload, loading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function JockeysPage() {
  const [filters, setFilters] = useState<RankingFilters>({
    sortBy: 'winRate',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const { result, loading, error } = state;

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const data = await fetchJockeyRanking(filters);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        console.error('[JockeysPage] Error:', err);
        dispatch({ type: 'FETCH_ERROR', payload: '기수 데이터를 불러오는데 실패했습니다.' });
      }
    };

    loadData();
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: Partial<RankingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

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
          <h1 className="mt-2 text-3xl font-bold text-gray-900">기수 랭킹</h1>
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
            <label className="mb-1 block text-xs font-medium text-gray-500">정렬</label>
            <select
              value={filters.sortBy || 'winRate'}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as RankingFilters['sortBy'] })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-horse focus:outline-none"
            >
              <option value="winRate">승률</option>
              <option value="wins">승수</option>
              <option value="totalStarts">출전</option>
              <option value="roi">ROI</option>
            </select>
          </div>
        </div>

        {/* 로딩/에러 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-horse border-t-transparent" />
            <span className="ml-3 text-gray-600">데이터 로딩 중...</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
            {error}
          </div>
        )}

        {/* 랭킹 테이블 */}
        {!loading && !error && (
          <JockeyRankingTable
            jockeys={result.items}
            total={result.total}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>
    </main>
  );
}
