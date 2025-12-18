'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import DataFreshnessBadge from '@/components/shared/DataFreshnessBadge';
import ViewModeToggle from '@/components/shared/ViewModeToggle';
import PrintPdfButton from '@/components/shared/PrintPdfButton';
import { BookViewMode, DataFreshness } from '@/lib/view-models/bookVM';

interface BookTopBarProps {
  date: string;
  viewMode: BookViewMode;
  freshness: DataFreshness;
  updatedAt?: string;
}

export function BookTopBar({ date, viewMode, freshness, updatedAt }: BookTopBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', viewMode);
    router.push(`/book/${value}${params.size ? `?${params.toString()}` : ''}`);
  };

  const handleTodayShortcut = () => {
    const today = new Date();
    const todayValue = today.toISOString().split('T')[0];
    handleDateChange(todayValue);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-base font-semibold">
          <label htmlFor="book-date" className="text-gray-600">
            날짜
          </label>
          <input
            id="book-date"
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-base shadow-inner focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleTodayShortcut}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            오늘
          </button>
        </div>
        <DataFreshnessBadge freshness={freshness} updatedAt={updatedAt} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ViewModeToggle viewMode={viewMode} />
        <PrintPdfButton label="PDF/인쇄" />
      </div>
    </div>
  );
}

export default BookTopBar;
