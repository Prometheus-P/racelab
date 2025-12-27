'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-10 w-24 animate-pulse rounded-full bg-neutral-200" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || '사용자'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="hidden text-sm font-medium text-neutral-700 md:inline">
          {session.user.name || session.user.email?.split('@')[0]}
        </span>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
          aria-label="로그아웃"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">로그아웃</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
    >
      <LogIn className="h-4 w-4" />
      <span>로그인</span>
    </button>
  );
}
