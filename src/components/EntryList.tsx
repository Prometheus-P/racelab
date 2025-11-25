// src/components/EntryList.tsx
import React from 'react';
import { Entry } from '@/types';

interface EntryListProps {
  entries: Entry[];
  isLoading?: boolean;
  error?: Error | null;
}

interface AvailableColumns {
  hasJockey: boolean;
  hasTrainer: boolean;
  hasAge: boolean;
  hasWeight: boolean;
  hasRecentRecord: boolean;
}

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-12 bg-gray-200 rounded" />
    ))}
  </div>
);

interface EntryRowProps {
  entry: Entry;
  columns: AvailableColumns;
}

const EntryRow = ({ entry, columns }: EntryRowProps) => (
  <tr className="border-b last:border-b-0 hover:bg-gray-50">
    <td className="p-3 text-center font-semibold">{entry.no}</td>
    <td className="p-3 font-semibold">{entry.name}</td>
    {columns.hasJockey && (
      <td className="p-3 text-gray-600">{entry.jockey || '-'}</td>
    )}
    {columns.hasTrainer && (
      <td className="p-3 text-gray-600">{entry.trainer || '-'}</td>
    )}
    {columns.hasAge && (
      <td className="p-3 text-center">{entry.age ?? '-'}</td>
    )}
    {columns.hasWeight && (
      <td className="p-3 text-center">{entry.weight ? `${entry.weight}kg` : '-'}</td>
    )}
    {columns.hasRecentRecord && (
      <td className="p-3 text-gray-600">{entry.recentRecord || '-'}</td>
    )}
  </tr>
);

function getAvailableColumns(entries: Entry[]): AvailableColumns {
  return {
    hasJockey: entries.some(e => e.jockey !== undefined),
    hasTrainer: entries.some(e => e.trainer !== undefined),
    hasAge: entries.some(e => e.age !== undefined),
    hasWeight: entries.some(e => e.weight !== undefined),
    hasRecentRecord: entries.some(e => e.recentRecord !== undefined),
  };
}

export default function EntryList({ entries, isLoading, error }: EntryListProps) {
  if (isLoading) {
    return (
      <div className="py-8" data-testid="loading-skeleton">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-center py-8" data-testid="error-message">
        오류: {error.message}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">출주마 정보가 없습니다</p>
    );
  }

  const columns = getAvailableColumns(entries);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="p-3 text-center font-medium w-16">번호</th>
            <th className="p-3 text-left font-medium">마명/선수명</th>
            {columns.hasJockey && <th className="p-3 text-left font-medium">기수</th>}
            {columns.hasTrainer && <th className="p-3 text-left font-medium">조교사</th>}
            {columns.hasAge && <th className="p-3 text-center font-medium">연령</th>}
            {columns.hasWeight && <th className="p-3 text-center font-medium">중량</th>}
            {columns.hasRecentRecord && <th className="p-3 text-left font-medium">최근성적</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <EntryRow key={entry.no} entry={entry} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
