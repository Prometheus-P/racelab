// src/components/ResultSearch.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ResultSearchProps {
  value?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  className?: string;
  'data-testid'?: string;
}

export function ResultSearch({
  value = '',
  onSearch,
  debounceMs = 300,
  className = '',
  'data-testid': testId,
}: ResultSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input value with prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onSearch?.(query);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Cancel debounce and search immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onSearch?.(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearch?.('');
  };

  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <div className="relative">
        {/* Search icon */}
        <div
          data-testid="search-icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search input */}
        <input
          type="search"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="기수/선수 이름 검색"
          aria-label="기수 또는 선수 이름으로 검색"
          className="w-full pl-10 pr-10 py-2.5 border border-outline rounded-full bg-surface text-on-surface
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     text-body-medium placeholder:text-on-surface-variant/60"
        />

        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant
                       hover:text-on-surface p-1 rounded-full hover:bg-on-surface/10 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
