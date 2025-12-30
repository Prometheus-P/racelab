import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // RaceLab Design System V1.0 Typography
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        brand: ['Exo 2', 'Pretendard', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      // Typography Scale - 50-60대 사용자 최적화 (1-2단계 큰 폰트)
      fontSize: {
        // Display
        'display-large': ['32px', { lineHeight: '40px', letterSpacing: '-0.5px' }],
        'display-medium': ['28px', { lineHeight: '36px', letterSpacing: '-0.25px' }],
        'display-small': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        // Headline (24pt~28pt for 5060)
        'headline-large': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        'headline-medium': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        'headline-small': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        // Title
        'title-large': ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
        'title-medium': ['18px', { lineHeight: '26px', letterSpacing: '0.1px' }],
        'title-small': ['16px', { lineHeight: '24px', letterSpacing: '0.1px' }],
        // Body (16pt~18pt for 5060)
        'body-large': ['18px', { lineHeight: '28px', letterSpacing: '0.25px' }],
        'body-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.25px' }],
        'body-small': ['14px', { lineHeight: '22px', letterSpacing: '0.4px' }],
        // Data - 배당률, 결과 매칭률 등 핵심 숫자
        'data-large': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'data-medium': ['20px', { lineHeight: '26px', letterSpacing: '0px' }],
        'data-small': ['18px', { lineHeight: '24px', letterSpacing: '0px' }],
        // Label
        'label-large': ['16px', { lineHeight: '24px', letterSpacing: '0.1px' }],
        'label-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'label-small': ['12px', { lineHeight: '18px', letterSpacing: '0.4px' }],
      },
      colors: {
        // TradingView 스타일 금융 컬러 - CSS 변수 참조 (다크모드 지원)
        bullish: 'var(--rl-bullish)',
        bearish: 'var(--rl-bearish)',

        // RaceLab Primary Colors - CSS 변수 참조 (다크모드 지원)
        // Sage Green - 경마/안정/긍정적 지표
        horse: {
          DEFAULT: 'var(--rl-horse)',
          light: 'var(--rl-horse-light)',
          dark: 'var(--rl-horse-dark)',
          container: 'var(--rl-horse-container)',
          'on-container': 'var(--rl-horse-on-container)',
          bold: 'var(--rl-horse-on-container)',
        },
        // Soft Coral - 경륜/핵심/CTA
        cycle: {
          DEFAULT: 'var(--rl-cycle)',
          light: 'var(--rl-cycle-light)',
          dark: 'var(--rl-cycle-dark)',
          container: 'var(--rl-cycle-container)',
          'on-container': 'var(--rl-cycle-on-container)',
          bold: 'var(--rl-cycle-on-container)',
        },
        // Steel Blue - 경정/흐름/링크
        boat: {
          DEFAULT: 'var(--rl-boat)',
          light: 'var(--rl-boat-light)',
          dark: 'var(--rl-boat-dark)',
          container: 'var(--rl-boat-container)',
          'on-container': 'var(--rl-boat-on-container)',
          bold: 'var(--rl-boat-on-container)',
        },

        // CTA (Soft Coral 사용) - CSS 변수 참조 (다크모드 지원)
        primary: {
          DEFAULT: 'var(--rl-cycle)',
          light: 'var(--rl-cycle-light)',
          dark: 'var(--rl-cycle-dark)',
          container: 'var(--rl-cycle-container)',
          'on-container': 'var(--rl-cycle-on-container)',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
        },

        // Neutral Colors - CSS 변수 참조 (다크모드 지원)
        neutral: {
          background: 'var(--rl-background)',
          'text-primary': 'var(--rl-text-primary)',
          'text-secondary': 'var(--rl-text-secondary)',
          'text-tertiary': 'var(--rl-text-tertiary)',
          border: 'var(--rl-border)',
          divider: 'var(--rl-divider)',
          'table-row-alt': 'var(--rl-table-row-alt)',
        },

        // Surface Colors - CSS 변수 참조 (다크모드 지원)
        surface: {
          DEFAULT: 'var(--rl-surface)',
          dim: 'var(--rl-background-dim)',
          bright: 'var(--rl-background)',
          container: 'var(--rl-surface-container)',
          'container-low': 'var(--rl-surface-container-low)',
          'container-high': 'var(--rl-surface-container-high)',
          'container-highest': 'var(--rl-border)',
        },
        'on-surface': {
          DEFAULT: 'var(--rl-on-surface)',
          variant: 'var(--rl-on-surface-variant)',
        },
        outline: {
          DEFAULT: '#A1A1AA',
          variant: '#D4D4D8',
        },

        // Status Colors - CSS 변수 참조 (다크모드 지원)
        status: {
          success: {
            DEFAULT: 'var(--rl-success)',
            bg: 'var(--rl-success-bg)',
            text: 'var(--rl-success-text)',
            border: 'var(--rl-success)',
          },
          warning: {
            DEFAULT: 'var(--rl-warning)',
            bg: 'var(--rl-warning-bg)',
            text: 'var(--rl-warning-text)',
            border: 'var(--rl-warning)',
          },
          error: {
            DEFAULT: 'var(--rl-error)',
            bg: 'var(--rl-error-bg)',
            text: 'var(--rl-error-text)',
            border: 'var(--rl-error)',
          },
          info: {
            DEFAULT: 'var(--rl-info)',
            bg: 'var(--rl-info-bg)',
            text: 'var(--rl-info-text)',
            border: 'var(--rl-info)',
          },
          live: {
            bg: 'var(--rl-warning-bg)',
            text: 'var(--rl-warning-text)',
            border: 'var(--rl-warning)',
          },
          upcoming: {
            bg: 'var(--rl-info-bg)',
            text: 'var(--rl-info-text)',
            border: 'var(--rl-info)',
          },
          completed: {
            bg: 'var(--rl-surface-container)',
            text: 'var(--rl-text-secondary)',
            border: 'var(--rl-border)',
          },
          cancelled: {
            bg: 'var(--rl-error-bg)',
            text: 'var(--rl-error-text)',
            border: 'var(--rl-error)',
          },
        },

        // Error Colors - CSS 변수 참조 (다크모드 지원)
        error: {
          DEFAULT: 'var(--rl-error)',
          container: 'var(--rl-error-bg)',
          'on-container': 'var(--rl-error-text)',
        },
      },
      // Elevation (Box Shadow) - CSS 변수 참조 (다크모드 지원)
      boxShadow: {
        'rl-0': 'none',
        'rl-1': 'var(--rl-shadow-1)',
        'rl-2': 'var(--rl-shadow-2)',
        'rl-3': 'var(--rl-shadow-3)',
        'rl-4': 'var(--rl-shadow-4)',
        'rl-5': '0 16px 32px 0 rgb(0 0 0 / 0.16)',
        // Legacy M3 shadows
        'm3-0': 'none',
        'm3-1': '0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 1px 3px 1px rgb(0 0 0 / 15%)',
        'm3-2': '0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 2px 6px 2px rgb(0 0 0 / 15%)',
        'm3-3': '0px 1px 3px 0px rgb(0 0 0 / 30%), 0px 4px 8px 3px rgb(0 0 0 / 15%)',
        'm3-4': '0px 2px 3px 0px rgb(0 0 0 / 30%), 0px 6px 10px 4px rgb(0 0 0 / 15%)',
        'm3-5': '0px 4px 4px 0px rgb(0 0 0 / 30%), 0px 8px 12px 6px rgb(0 0 0 / 15%)',
      },
      // Border Radius - 둥근 모서리
      borderRadius: {
        'rl-xs': '4px',
        'rl-sm': '8px',
        'rl-md': '12px',
        'rl-lg': '16px',
        'rl-xl': '24px',
        // Legacy M3
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '28px',
      },
      // Transition
      transitionTimingFunction: {
        'rl-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'rl-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'rl-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
        'rl-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        // Legacy M3
        'm3-standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'm3-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'm3-emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'm3-emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
      transitionDuration: {
        'rl-instant': '50ms',
        'rl-fast': '150ms',
        'rl-normal': '250ms',
        'rl-slow': '400ms',
        'rl-slower': '600ms',
        // Legacy M3
        'm3-short': '150ms',
        'm3-medium': '300ms',
        'm3-long': '500ms',
      },
      // Min Height - 터치 타겟 (최소 48px)
      minHeight: {
        touch: '48px',
        'touch-lg': '56px',
        dense: '32px', // Added for compact mode
      },
      minWidth: {
        touch: '48px',
        'touch-lg': '56px',
      },
      // Animations
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ripple: {
          from: { transform: 'scale(0)', opacity: '0.4' },
          to: { transform: 'scale(4)', opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'grow-up': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // Landing page animations
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'typewriter-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite ease-in-out',
        ripple: 'ripple 300ms ease-out forwards',
        'fade-in-up': 'fade-in-up 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        'grow-up': 'grow-up 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Landing page animations
        gradient: 'gradient-shift 8s ease infinite',
        'slide-in': 'slide-in-right 400ms ease-out forwards',
        cursor: 'typewriter-cursor 1s step-end infinite',
        marquee: 'marquee 30s linear infinite',
      },
      // Opacity tokens
      opacity: {
        '8': '0.08',
        '12': '0.12',
        '38': '0.38',
      },
    },
  },
  plugins: [],
};
export default config;
