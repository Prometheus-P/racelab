'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RaceLabLogo } from '@/components/brand/RaceLabLogo';
import { AuthButton } from '@/components/auth';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/races', label: '오늘의 경주' },
    { href: '/results', label: '과거 결과' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-neutral-divider bg-neutral-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <RaceLabLogo size="sm" />
          <span className="font-brand text-title-medium font-bold text-neutral-text-primary">
            RaceLab
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                className={`rounded-lg px-4 py-2 text-label-large font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary-container text-primary'
                    : 'text-neutral-text-secondary hover:bg-surface-dim hover:text-neutral-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <AuthButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg text-neutral-text-primary hover:bg-surface-dim md:hidden"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-neutral-divider md:hidden">
          <nav className="container mx-auto flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                onClick={() => setIsOpen(false)}
                className={`min-h-[48px] rounded-lg px-4 py-3 text-label-large font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary-container text-primary'
                    : 'text-neutral-text-secondary hover:bg-surface-dim hover:text-neutral-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-neutral-divider p-4">
            <AuthButton />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
