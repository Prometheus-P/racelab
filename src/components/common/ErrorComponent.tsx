// src/components/common/ErrorComponent.tsx
'use client';

import React from 'react';

export type ErrorVariant = 'card' | 'inline';

export interface ErrorComponentProps {
  /** Error message to display */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Variant style */
  variant?: ErrorVariant;
  /** Show API delay hint message */
  showApiDelayHint?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export default function ErrorComponent({
  message = '데이터를 불러오는 중 오류가 발생했습니다',
  onRetry,
  variant = 'card',
  showApiDelayHint = false,
  className = '',
}: ErrorComponentProps) {
  const isCard = variant === 'card';

  const containerClasses = isCard
    ? `rounded-lg border border-error/20 bg-error/5 p-6 ${className}`
    : `inline-flex items-center gap-2 text-error ${className}`;

  return (
    <div
      role="alert"
      data-testid="error-component"
      className={containerClasses}
    >
      {isCard ? (
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div
            data-testid="error-icon"
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-error/10"
          >
            <svg
              className="h-6 w-6 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <p className="mb-2 text-sm font-medium text-error">{message}</p>

          {/* API Delay Hint */}
          {showApiDelayHint && (
            <p className="mb-4 text-xs text-gray-500">
              데이터 제공 기관(API)의 지연으로 최신 정보가 표시되지 않을 수 있습니다
            </p>
          )}

          {/* Retry Button */}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              다시 시도
            </button>
          )}
        </div>
      ) : (
        <>
          <svg
            data-testid="error-icon"
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">{message}</span>
          {showApiDelayHint && (
            <span className="text-xs text-gray-500">
              (데이터 제공 기관 지연)
            </span>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-medium underline hover:no-underline"
            >
              다시 시도
            </button>
          )}
        </>
      )}
    </div>
  );
}
