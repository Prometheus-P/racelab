import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // M3 Font Family
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      // M3 Typography Scale
      fontSize: {
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
      },
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
        'on-primary': {
          DEFAULT: '#ffffff',
        },
        secondary: {
          DEFAULT: '#7c3aed',
          container: '#f3e8ff',
          'on-container': '#581c87',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#581c87',
        },
        accent: '#f59e0b',

        // M3 Surface Colors
        surface: {
          DEFAULT: '#ffffff',
          dim: '#f8fafc',
          bright: '#ffffff',
          container: '#f1f5f9',
          'container-low': '#f8fafc',
          'container-high': '#e2e8f0',
          'container-highest': '#cbd5e1',
        },
        'on-surface': {
          DEFAULT: '#1e293b',
          variant: '#475569',
        },
        outline: {
          DEFAULT: '#94a3b8',
          variant: '#cbd5e1',
        },

        // 경주 타입별 컬러 (M3 Semantic Accent)
        horse: {
          DEFAULT: '#2d5a27',
          light: '#dcfce7',
          dark: '#166534',
          container: '#dcfce7',
          'on-container': '#166534',
        },
        cycle: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
          dark: '#b91c1c',
          container: '#fee2e2',
          'on-container': '#b91c1c',
        },
        boat: {
          DEFAULT: '#0369a1',
          light: '#e0f2fe',
          dark: '#075985',
          container: '#e0f2fe',
          'on-container': '#075985',
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

        // M3 Error Colors
        error: {
          DEFAULT: '#dc2626',
          container: '#fee2e2',
          'on-container': '#991b1b',
        },
      },
      // M3 Elevation (Box Shadow) - Dual-shadow technique per M3 spec
      boxShadow: {
        'm3-0': 'none',
        'm3-1': '0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 1px 3px 1px rgb(0 0 0 / 15%)',
        'm3-2': '0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 2px 6px 2px rgb(0 0 0 / 15%)',
        'm3-3': '0px 1px 3px 0px rgb(0 0 0 / 30%), 0px 4px 8px 3px rgb(0 0 0 / 15%)',
        'm3-4': '0px 2px 3px 0px rgb(0 0 0 / 30%), 0px 6px 10px 4px rgb(0 0 0 / 15%)',
        'm3-5': '0px 4px 4px 0px rgb(0 0 0 / 30%), 0px 8px 12px 6px rgb(0 0 0 / 15%)',
      },
      // M3 Border Radius
      borderRadius: {
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '28px',
      },
      // M3 Transition
      transitionTimingFunction: {
        'm3-standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'm3-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'm3-emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'm3-emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
      transitionDuration: {
        'm3-short': '150ms',
        'm3-medium': '300ms',
        'm3-long': '500ms',
      },
      // M3 Animations
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ripple: {
          from: { transform: 'scale(0)', opacity: '0.4' },
          to: { transform: 'scale(4)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite ease-in-out',
        ripple: 'ripple 300ms ease-out forwards',
      },
      // M3 Opacity tokens
      opacity: {
        '8': '0.08',
        '12': '0.12',
        '38': '0.38',
      },
    },
  },
  plugins: [],
}
export default config
