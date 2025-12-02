// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  tab: string;
  label: string;
  icon: string;
  color: string;
  hoverColor: string;
  activeColor: string;
}

const navItems: NavItem[] = [
  {
    href: '/?tab=horse',
    tab: 'horse',
    label: '경마',
    icon: '🐎',
    color: 'text-gray-700',
    hoverColor: 'hover:text-horse',
    activeColor: 'text-horse',
  },
  {
    href: '/?tab=cycle',
    tab: 'cycle',
    label: '경륜',
    icon: '🚴',
    color: 'text-gray-700',
    hoverColor: 'hover:text-cycle',
    activeColor: 'text-cycle',
  },
  {
    href: '/?tab=boat',
    tab: 'boat',
    label: '경정',
    icon: '🚤',
    color: 'text-gray-700',
    hoverColor: 'hover:text-boat',
    activeColor: 'text-boat',
  },
];

const Header: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get('tab');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (tab: string) => currentTab === tab;
  const isResultsPage = pathname === '/results';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Skip to main content link - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none"
      >
        본문으로 건너뛰기
      </a>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1 -ml-2"
            aria-label="KRace 홈으로 이동"
          >
            🏁 KRace
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="주요 네비게이션" className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.tab}
                href={item.href}
                aria-current={isActive(item.tab) ? 'page' : undefined}
                title={`${item.label} 경기 보기`}
                className={`
                  relative min-h-[44px] min-w-[44px] px-4 py-2
                  font-medium rounded-lg
                  transition-all duration-150 ease-out
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isActive(item.tab)
                    ? `${item.activeColor} bg-gray-100 focus:ring-current`
                    : `${item.color} ${item.hoverColor} hover:bg-gray-50 focus:ring-gray-400`
                  }
                `}
              >
                <span aria-hidden="true">{item.icon}</span>{' '}
                <span>{item.label}</span>
                {/* Active indicator */}
                {isActive(item.tab) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-current rounded-full" />
                )}
              </Link>
            ))}
            {/* Results link */}
            <Link
              href="/results"
              aria-current={isResultsPage ? 'page' : undefined}
              title="경기 결과 보기"
              className={`
                relative min-h-[44px] min-w-[44px] px-4 py-2
                font-medium rounded-lg
                transition-all duration-150 ease-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isResultsPage
                  ? 'text-primary bg-gray-100 focus:ring-current'
                  : 'text-gray-700 hover:text-primary hover:bg-gray-50 focus:ring-gray-400'
                }
              `}
            >
              <span aria-hidden="true">📊</span>{' '}
              <span>결과</span>
              {isResultsPage && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-current rounded-full" />
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
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
                className="w-6 h-6"
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
            className="md:hidden mt-4 pt-4 border-t border-gray-200"
          >
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.tab}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.tab) ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center min-h-[44px] px-4 py-3
                      font-medium rounded-lg
                      transition-all duration-150 ease-out
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${isActive(item.tab)
                        ? `${item.activeColor} bg-gray-100 focus:ring-current`
                        : `${item.color} ${item.hoverColor} hover:bg-gray-50 focus:ring-gray-400`
                      }
                    `}
                  >
                    <span aria-hidden="true" className="mr-3 text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive(item.tab) && (
                      <span className="ml-auto text-sm">현재 페이지</span>
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
                  className={`
                    flex items-center min-h-[44px] px-4 py-3
                    font-medium rounded-lg
                    transition-all duration-150 ease-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isResultsPage
                      ? 'text-primary bg-gray-100 focus:ring-current'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50 focus:ring-gray-400'
                    }
                  `}
                >
                  <span aria-hidden="true" className="mr-3 text-xl">📊</span>
                  <span>결과</span>
                  {isResultsPage && (
                    <span className="ml-auto text-sm">현재 페이지</span>
                  )}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;