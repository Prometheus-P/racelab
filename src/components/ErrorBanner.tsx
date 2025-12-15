// src/components/ErrorBanner.tsx
import React from 'react';

export interface ErrorBannerProps {
  /** Message to display in the banner */
  message?: string;
  /** Whether to show the banner */
  show?: boolean;
  /** Optional callback for retry action */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ErrorBanner - A banner component for displaying API errors/delays at the top of sections
 * Used when upstream API calls fail but the page can still render with partial data
 */
export default function ErrorBanner({
  message = '데이터 제공 시스템 지연 중입니다',
  show = true,
  onRetry,
  className = '',
}: ErrorBannerProps) {
  if (!show) return null;

  return (
    <div
      role="alert"
      data-testid="error-banner"
      className={`mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5 flex-shrink-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="text-amber-800">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-4 flex-shrink-0 rounded-md px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          새로고침
        </button>
      )}
    </div>
  );
}
