// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { RaceLabLogo } from './brand';
import { ThemeToggle } from './ui/ThemeToggle';

interface NavItem {
  href: string;
  tab: string;
  label: string;
  icon: string;
  color: string;
  hoverColor: string;
  activeColor: string;
  activeBackground: string;
  focusRing: string;
}

const navItems: NavItem[] = [
  {
    href: '/?tab=horse',
    tab: 'horse',
    label: '경마',
    icon: '🐎',
    color: 'text-on-surface',
    hoverColor: 'hover:text-horse',
    activeColor: 'text-horse-on-container',
    activeBackground: 'bg-horse-container',
    focusRing: 'focus:ring-horse',
  },
  {
    href: '/?tab=cycle',
    tab: 'cycle',
    label: '경륜',
    icon: '🚴',
    color: 'text-on-surface',
    hoverColor: 'hover:text-cycle',
    activeColor: 'text-cycle-on-container',
    activeBackground: 'bg-cycle-container',
    focusRing: 'focus:ring-cycle',
  },
  {
    href: '/?tab=boat',
    tab: 'boat',
    label: '경정',
    icon: '🚤',
    color: 'text-on-surface',
    hoverColor: 'hover:text-boat',
    activeColor: 'text-boat-on-container',
    activeBackground: 'bg-boat-container',
    focusRing: 'focus:ring-boat',
  },
];

const Header: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentTab = searchParams.get('tab');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bookDate = new Date().toISOString().split('T')[0];
  const bookHref = `/book/${bookDate}`;

  const isActive = (tab: string) => currentTab === tab;
  const isResultsPage = pathname === '/results';

  return (
    <header className="border-b border-[var(--rl-border)] bg-[var(--rl-surface)] shadow-[var(--rl-shadow-1)]">
      {/* Skip to main content link - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-rl-md focus:bg-cycle focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        본문으로 건너뛰기
      </a>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <RaceLabLogo
            variant="full"
            size="md"
            onClick={() => router.push('/')}
            aria-label="RaceLab 홈으로 이동"
            className="rounded-rl-sm focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2"
          />

          {/* Desktop Navigation */}
          <nav aria-label="주요 네비게이션" className="hidden space-x-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.tab}
                href={item.href}
                aria-current={isActive(item.tab) ? 'page' : undefined}
                title={`${item.label} 경기 보기`}
                className={`relative min-h-touch min-w-touch rounded-rl-md px-5 py-3 text-body-medium font-semibold transition-all duration-rl-fast ease-rl-standard focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isActive(item.tab)
                    ? `${item.activeColor} ${item.activeBackground} ${item.focusRing}`
                    : `${item.color} ${item.hoverColor} hover:bg-surface-dim focus:ring-outline`
                } `}
              >
                <span aria-hidden="true">{item.icon}</span> <span>{item.label}</span>
                {/* Active indicator */}
                {isActive(item.tab) && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-current" />
                )}
              </Link>
            ))}
            {/* Results link */}
            <Link
              href="/results"
              aria-current={isResultsPage ? 'page' : undefined}
              title="경기 결과 보기"
              className={`relative min-h-touch min-w-touch rounded-rl-md px-5 py-3 text-body-medium font-semibold transition-all duration-rl-fast ease-rl-standard focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isResultsPage
                  ? 'bg-boat-container text-boat-on-container focus:ring-boat'
                  : 'text-on-surface hover:bg-surface-dim hover:text-boat focus:ring-outline'
              } `}
            >
              <span aria-hidden="true">📊</span> <span>결과</span>
              {isResultsPage && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-current" />
              )}
            </Link>
            <Link
              href={bookHref}
              title="북 모드 보기"
              className="relative min-h-touch min-w-touch rounded-rl-md px-5 py-3 text-body-medium font-semibold text-on-surface transition-all duration-rl-fast ease-rl-standard hover:bg-surface-dim hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span aria-hidden="true">📕</span> <span>북모드</span>
            </Link>
            {/* Theme Toggle */}
            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="min-h-touch min-w-touch rounded-rl-md p-3 text-on-surface transition-colors duration-rl-fast hover:bg-surface-dim focus:outline-none focus:ring-2 focus:ring-cycle focus:ring-offset-2 md:hidden"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
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
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav
            id="mobile-menu"
            aria-label="모바일 네비게이션"
            className="mt-4 border-t border-[var(--rl-divider)] pt-4 md:hidden"
          >
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.tab}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.tab) ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex min-h-touch items-center rounded-rl-md px-5 py-4 text-body-medium font-semibold transition-all duration-rl-fast ease-rl-standard focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isActive(item.tab)
                        ? `${item.activeColor} ${item.activeBackground} ${item.focusRing}`
                        : `${item.color} ${item.hoverColor} hover:bg-surface-dim focus:ring-outline`
                    } `}
                  >
                    <span aria-hidden="true" className="mr-3 text-xl">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isActive(item.tab) && (
                      <span className="ml-auto text-label-small">현재 페이지</span>
                    )}
                  </Link>
                </li>
              ))}
              {/* Results link in mobile menu */}
              <li>
                <Link
                  href="/results"
                  aria-current={isResultsPage ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex min-h-touch items-center rounded-rl-md px-5 py-4 text-body-medium font-semibold transition-all duration-rl-fast ease-rl-standard focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isResultsPage
                      ? 'bg-boat-container text-boat-on-container focus:ring-boat'
                      : 'text-on-surface hover:bg-surface-dim hover:text-boat focus:ring-outline'
                  } `}
                >
                  <span aria-hidden="true" className="mr-3 text-xl">
                    📊
                  </span>
                  <span>결과</span>
                  {isResultsPage && <span className="ml-auto text-label-small">현재 페이지</span>}
                </Link>
              </li>
              <li>
                <Link
                  href={bookHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex min-h-touch items-center rounded-rl-md px-5 py-4 text-body-medium font-semibold text-on-surface transition-all duration-rl-fast ease-rl-standard hover:bg-surface-dim hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span aria-hidden="true" className="mr-3 text-xl">
                    📕
                  </span>
                  <span>북모드</span>
                </Link>
              </li>
              {/* Theme Toggle in Mobile Menu */}
              <li className="pt-2 border-t border-[var(--rl-divider)]">
                <div className="flex items-center justify-between px-5 py-2">
                  <span className="text-body-medium font-semibold text-[var(--rl-text-primary)]">테마</span>
                  <ThemeToggle />
                </div>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
