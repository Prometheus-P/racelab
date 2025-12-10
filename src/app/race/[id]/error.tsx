// src/app/race/[id]/error.tsx
'use client';

import ErrorComponent from '@/components/common/ErrorComponent';

export default function RaceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isApiError =
    error.message.includes('API') ||
    error.message.includes('timeout') ||
    error.message.includes('fetch');

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <ErrorComponent
        message={
          isApiError
            ? '경주 정보를 불러오는 중 오류가 발생했습니다'
            : '예상치 못한 오류가 발생했습니다'
        }
        onRetry={reset}
        showApiDelayHint={isApiError}
      />
    </div>
  );
}
