// src/components/Pagination.tsx
'use client';

import React, { useMemo } from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  'data-testid'?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  'data-testid': testId = 'pagination',
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange?.(page);
  };

  // Generate page numbers to display (memoized to prevent recalculation on every render)
  const pageNumbers = useMemo((): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <nav
      aria-label="페이지 네비게이션"
      className="flex items-center justify-center gap-1"
      data-testid={testId}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className={`min-h-[44px] min-w-[44px] rounded-m3-sm px-3 py-2 text-body-medium transition-colors ${
          currentPage === 1
            ? 'cursor-not-allowed text-on-surface-variant opacity-50'
            : 'text-on-surface hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary'
        }`}
      >
        ‹ 이전
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="w-10 text-center text-on-surface-variant">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageClick(page)}
              aria-label={`${page} 페이지`}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`page-${page}`}
              className={`min-h-[44px] min-w-[44px] rounded-m3-sm px-3 py-2 text-body-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className={`min-h-[44px] min-w-[44px] rounded-m3-sm px-3 py-2 text-body-medium transition-colors ${
          currentPage === totalPages
            ? 'cursor-not-allowed text-on-surface-variant opacity-50'
            : 'text-on-surface hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary'
        }`}
      >
        다음 ›
      </button>
    </nav>
  );
}
