// src/components/ui/ThemeToggle.tsx
// RaceLab Theme Toggle - Dark mode toggle button

'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, getResolvedTheme, type Theme } from '@/lib/stores/themeStore';

interface ThemeToggleProps {
  /** Show all three options (light/dark/system) or just toggle */
  showSystem?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Sun size={20} aria-hidden="true" />,
  dark: <Moon size={20} aria-hidden="true" />,
  system: <Monitor size={20} aria-hidden="true" />,
};

const themeLabels: Record<Theme, string> = {
  light: '라이트 모드',
  dark: '다크 모드',
  system: '시스템 설정',
};

export function ThemeToggle({ showSystem = true, className = '' }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder with same size to prevent layout shift
    return (
      <button
        className={`inline-flex min-h-touch min-w-touch items-center justify-center rounded-rl-md p-2 ${className}`}
        disabled
        aria-label="테마 로딩 중"
      >
        <Monitor size={20} className="text-on-surface-variant" />
      </button>
    );
  }

  const resolvedTheme = getResolvedTheme(theme);

  if (showSystem) {
    // Dropdown-style toggle for all three options
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={toggleTheme}
          className="inline-flex min-h-touch min-w-touch items-center justify-center gap-2 rounded-rl-md p-2 transition-colors hover:bg-[var(--rl-state-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-boat)]"
          aria-label={`현재 테마: ${themeLabels[theme]}. 클릭하여 변경`}
          title={themeLabels[theme]}
        >
          <span className="text-[var(--rl-text-primary)]">{themeIcons[theme]}</span>
          <span className="sr-only">{themeLabels[theme]}</span>
        </button>
      </div>
    );
  }

  // Simple light/dark toggle
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className={`inline-flex min-h-touch min-w-touch items-center justify-center rounded-rl-md p-2 transition-colors hover:bg-[var(--rl-state-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-boat)] ${className}`}
      aria-label={resolvedTheme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      title={resolvedTheme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
    >
      <span className="text-[var(--rl-text-primary)]">
        {resolvedTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </span>
    </button>
  );
}

export default ThemeToggle;
