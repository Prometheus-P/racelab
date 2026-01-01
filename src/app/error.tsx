// src/app/error.tsx
'use client';

import Link from 'next/link';
import ErrorComponent from '@/components/common/ErrorComponent';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isApiError =
    error.message.includes('API') ||
    error.message.includes('timeout') ||
    error.message.includes('fetch') ||
    error.message.includes('network');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <ErrorComponent
        message={
          isApiError
            ? '데이터를 불러오는 중 오류가 발생했습니다'
            : '예상치 못한 오류가 발생했습니다'
        }
        onRetry={reset}
        showApiDelayHint={isApiError}
      />

      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          홈으로 돌아가기
        </Link>
        <Link
          href="/today"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          오늘의 경주 보기
        </Link>
      </div>

      {/* Error digest for debugging (only in dev) */}
      {process.env.NODE_ENV === 'development' && error.digest && (
        <p className="mt-8 text-xs text-gray-400">
          Error digest: {error.digest}
        </p>
      )}
    </div>
  );
}
