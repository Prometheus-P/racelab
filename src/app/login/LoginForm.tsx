'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          로그인 중 오류가 발생했습니다. 다시 시도해주세요.
        </div>
      )}

      <button
        onClick={() => signIn('google', { callbackUrl })}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        <GoogleIcon />
        Google로 로그인
      </button>

      <button
        onClick={() => signIn('kakao', { callbackUrl })}
        className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] transition-colors hover:bg-[#FDD835]"
      >
        <KakaoIcon />
        카카오로 로그인
      </button>

      <p className="mt-6 text-center text-xs text-neutral-500">
        로그인 시{' '}
        <a href="/terms" className="text-primary-600 hover:underline">
          이용약관
        </a>
        {' 및 '}
        <a href="/privacy" className="text-primary-600 hover:underline">
          개인정보처리방침
        </a>
        에 동의하게 됩니다.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#191919"
        d="M12 3c-5.52 0-10 3.59-10 8.01 0 2.74 1.75 5.15 4.4 6.54-.16.57-.58 2.08-.67 2.4-.1.4.15.39.31.28.13-.08 2.02-1.37 2.84-1.93.68.1 1.38.15 2.12.15 5.52 0 10-3.59 10-8.01S17.52 3 12 3z"
      />
    </svg>
  );
}
