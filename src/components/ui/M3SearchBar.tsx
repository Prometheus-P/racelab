// src/components/ui/M3SearchBar.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface M3SearchBarProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function M3SearchBar({
  value,
  defaultValue = '',
  placeholder = '검색...',
  onSearch,
  onChange,
  debounceMs = 300,
  disabled = false,
  className = '',
  'data-testid': testId,
}: M3SearchBarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const currentValue = isControlled ? value : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceMs);
    },
    [isControlled, onChange, onSearch, debounceMs]
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.('');
    onSearch?.('');
  }, [isControlled, onChange, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        onSearch?.(currentValue);
      }
    },
    [currentValue, onSearch]
  );

  // Clear pending debounce when debounceMs changes or on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [debounceMs]);

  const baseClasses = [
    'flex',
    'items-center',
    'gap-3',
    'w-full',
    'min-h-[48px]',
    'px-4',
    'py-2',
    'bg-surface-container',
    'rounded-m3-xl',
    'border',
    'border-transparent',
    'transition-all',
    'duration-m3-short',
    'ease-m3-standard',
    'focus-within:border-primary',
    'focus-within:bg-surface',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={baseClasses} data-testid={testId}>
      {/* Search Icon */}
      <svg
        className="h-5 w-5 flex-shrink-0 text-on-surface-variant"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent text-body-large text-on-surface placeholder:text-on-surface-variant focus:outline-none disabled:cursor-not-allowed"
        aria-label={placeholder}
      />

      {/* Clear Button */}
      {currentValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full p-1 text-on-surface-variant transition-colors hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="검색어 지우기"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
  );
}
