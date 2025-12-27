import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: '로그인 | RaceLab',
  description: 'RaceLab에 로그인하여 전략 백테스팅을 시작하세요',
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">로그인</h1>
          <p className="mt-2 text-sm text-neutral-600">
            소셜 계정으로 간편하게 시작하세요
          </p>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 animate-pulse rounded-lg bg-neutral-200" />
      <div className="h-12 animate-pulse rounded-lg bg-neutral-200" />
    </div>
  );
}
