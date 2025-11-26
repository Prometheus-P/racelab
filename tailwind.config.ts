import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러 - 신뢰감 있는 네이비 계열
        primary: {
          DEFAULT: '#1d4ed8',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: '#7c3aed',
        accent: '#f59e0b',

        // 경주 타입별 컬러
        horse: {
          DEFAULT: '#2d5a27',
          light: '#dcfce7',
          dark: '#166534',
        },
        cycle: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
          dark: '#b91c1c',
        },
        boat: {
          DEFAULT: '#0369a1',
          light: '#e0f2fe',
          dark: '#075985',
        },

        // 상태 컬러
        status: {
          live: {
            bg: '#fef3c7',
            text: '#92400e',
            border: '#f59e0b',
          },
          upcoming: {
            bg: '#dbeafe',
            text: '#1e40af',
            border: '#3b82f6',
          },
          completed: {
            bg: '#f3f4f6',
            text: '#4b5563',
            border: '#9ca3af',
          },
          cancelled: {
            bg: '#fee2e2',
            text: '#991b1b',
            border: '#ef4444',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
