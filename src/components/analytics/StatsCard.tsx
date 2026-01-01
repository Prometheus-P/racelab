/**
 * StatsCard Component
 *
 * 통계 요약 카드
 */

'use client';

import React from 'react';

interface StatItem {
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'default' | 'green' | 'red' | 'blue';
}

interface StatsCardProps {
  title: string;
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatsCard({ title, stats, columns = 3 }: StatsCardProps) {
  const colorClasses = {
    default: 'text-gray-900',
    green: 'text-green-600',
    red: 'text-red-500',
    blue: 'text-blue-600',
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className={`grid ${gridCols[columns]} divide-x divide-y divide-gray-100`}>
        {stats.map((stat, index) => (
          <div key={index} className="p-4 text-center">
            <div className={`text-2xl font-bold ${colorClasses[stat.color || 'default']}`}>
              {stat.value}
            </div>
            {stat.subValue && (
              <div className="mt-1 text-sm text-gray-500">{stat.subValue}</div>
            )}
            <div className="mt-1 text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
