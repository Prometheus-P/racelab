/**
 * TrainerRankingTable Component
 *
 * 조교사 랭킹 테이블
 */

'use client';

import React from 'react';
import Link from 'next/link';
import type { TrainerStats, RankingFilters } from '@/lib/analytics/types';
import { FormIndicator } from './FormIndicator';

interface TrainerRankingTableProps {
  trainers: TrainerStats[];
  total: number;
  filters: RankingFilters;
  onFilterChange: (filters: Partial<RankingFilters>) => void;
  isLoading?: boolean;
}

export function TrainerRankingTable({
  trainers,
  total,
  filters,
  onFilterChange,
  isLoading = false,
}: TrainerRankingTableProps) {
  const { sortBy = 'winRate', sortOrder = 'desc' } = filters;

  const handleSort = (field: RankingFilters['sortBy']) => {
    if (sortBy === field) {
      onFilterChange({ sortOrder: sortOrder === 'desc' ? 'asc' : 'desc' });
    } else {
      onFilterChange({ sortBy: field, sortOrder: 'desc' });
    }
  };

  const SortIcon = ({ field }: { field: RankingFilters['sortBy'] }) => {
    if (sortBy !== field) return <span className="text-gray-300">↕</span>;
    return <span className="text-horse">{sortOrder === 'desc' ? '↓' : '↑'}</span>;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-200 bg-white">
        <div className="h-12 border-b border-gray-100 bg-gray-50"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 last:border-0">
            <div className="flex h-full items-center gap-4 px-4">
              <div className="h-4 w-8 rounded bg-gray-200"></div>
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm font-medium text-gray-600">
              <th className="px-4 py-3">순위</th>
              <th className="px-4 py-3">조교사명</th>
              <th className="px-4 py-3">소속</th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-horse"
                onClick={() => handleSort('totalStarts')}
              >
                <span className="flex items-center gap-1">
                  출전 <SortIcon field="totalStarts" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-horse"
                onClick={() => handleSort('wins')}
              >
                <span className="flex items-center gap-1">
                  1착 <SortIcon field="wins" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-horse"
                onClick={() => handleSort('winRate')}
              >
                <span className="flex items-center gap-1">
                  승률 <SortIcon field="winRate" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-horse"
                onClick={() => handleSort('roi')}
              >
                <span className="flex items-center gap-1">
                  ROI <SortIcon field="roi" />
                </span>
              </th>
              <th className="px-4 py-3">관리마</th>
              <th className="px-4 py-3">폼</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trainers.map((trainer, index) => {
              const rank = ((filters.page || 1) - 1) * (filters.limit || 20) + index + 1;
              const roiColor =
                trainer.roi > 0
                  ? 'text-green-600'
                  : trainer.roi < 0
                    ? 'text-red-500'
                    : 'text-gray-600';

              return (
                <tr key={trainer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/analytics/trainers/${trainer.id}`}
                      className="font-medium text-gray-900 hover:text-horse hover:underline"
                    >
                      {trainer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{trainer.track}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{trainer.totalStarts}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{trainer.wins}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-horse">{trainer.winRate.toFixed(1)}%</span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${roiColor}`}>
                    {trainer.roi > 0 ? '+' : ''}
                    {trainer.roi.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{trainer.activeHorses}두</td>
                  <td className="px-4 py-3">
                    <FormIndicator score={trainer.formScore} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>총 {total}명</span>
          <button className="text-horse hover:underline">더 보기</button>
        </div>
      </div>
    </div>
  );
}
