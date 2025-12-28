// src/components/ThemeProvider.tsx
// RaceLab Theme Provider - Handles dark mode application

'use client';

import { useEffect, useState } from 'react';
import { useThemeStore, getResolvedTheme } from '@/lib/stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const resolvedTheme = getResolvedTheme(theme);

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add new theme class
    if (theme === 'system') {
      // Let CSS media query handle it - don't add class
    } else {
      root.classList.add(resolvedTheme);
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#121212' : '#E57373'
      );
    }
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Force re-render if using system theme
      if (theme === 'system') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        // The CSS media query will handle the actual styling
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  return <>{children}</>;
}

export default ThemeProvider;
