import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // RaceLab Design System V1.0 Typography
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        brand: ['Exo 2', 'Noto Sans KR', 'sans-serif'],
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
        // TradingView 스타일 금융 컬러 (WCAG AA 대비율 충족)
        bullish: '#00897B',  // 상승 (다크 틸 - 4.5:1 대비율)
        bearish: '#D32F2F',  // 하락 (다크 레드 - 5.5:1 대비율)

        // RaceLab Primary Colors - 로고 기반 (채도 낮춤)
        // Sage Green - 경마/안정/긍정적 지표
        horse: {
          DEFAULT: '#81C784',
          light: '#C8E6C9',
          dark: '#66BB6A',
          container: '#E8F5E9',
          'on-container': '#2E7D32',
          bold: '#2E7D32', // Added bold variant
        },
        // Soft Coral - 경륜/핵심/CTA
        cycle: {
          DEFAULT: '#E57373',
          light: '#FFCDD2',
          dark: '#EF5350',
          container: '#FFEBEE',
          'on-container': '#C62828',
          bold: '#C62828', // Added bold variant
        },
        // Steel Blue - 경정/흐름/링크
        boat: {
          DEFAULT: '#64B5F6',
          light: '#BBDEFB',
          dark: '#42A5F5',
          container: '#E3F2FD',
          'on-container': '#1565C0',
          bold: '#1565C0', // Added bold variant
        },

        // CTA (Soft Coral 사용)
        primary: {
          DEFAULT: '#E57373',
          light: '#FFCDD2',
          dark: '#EF5350',
          container: '#FFEBEE',
          'on-container': '#C62828',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
        },

        // Neutral Colors - 흰색 배경 최적화
        neutral: {
          background: '#FFFFFF',
          'text-primary': '#27272A',
          'text-secondary': '#71717A',
          border: '#D4D4D8',
          divider: '#E4E4E7',
          'table-row-alt': '#F4F4F5',
        },

        // Surface Colors
        surface: {
          DEFAULT: '#FFFFFF',
          dim: '#F4F4F5',
          bright: '#FFFFFF',
          container: '#F4F4F5',
          'container-low': '#FAFAFA',
          'container-high': '#E4E4E7',
          'container-highest': '#D4D4D8',
        },
        'on-surface': {
          DEFAULT: '#27272A',
          variant: '#71717A',
        },
        outline: {
          DEFAULT: '#A1A1AA',
          variant: '#D4D4D8',
        },

        // Status Colors
        status: {
          success: {
            DEFAULT: '#81C784',
            bg: '#E8F5E9',
            text: '#2E7D32',
            border: '#81C784',
          },
          warning: {
            DEFAULT: '#FFB74D',
            bg: '#FFF8E1',
            text: '#F57C00',
            border: '#FFB74D',
          },
          error: {
            DEFAULT: '#E57373',
            bg: '#FFEBEE',
            text: '#C62828',
            border: '#E57373',
          },
          info: {
            DEFAULT: '#64B5F6',
            bg: '#E3F2FD',
            text: '#1565C0',
            border: '#64B5F6',
          },
          live: {
            bg: '#FFF8E1',
            text: '#F57C00',
            border: '#FFB74D',
          },
          upcoming: {
            bg: '#E3F2FD',
            text: '#1565C0',
            border: '#64B5F6',
          },
          completed: {
            bg: '#F4F4F5',
            text: '#71717A',
            border: '#D4D4D8',
          },
          cancelled: {
            bg: '#FFEBEE',
            text: '#C62828',
            border: '#E57373',
          },
        },

        // Error Colors
        error: {
          DEFAULT: '#E57373',
          container: '#FFEBEE',
          'on-container': '#C62828',
        },
      },
      // Elevation (Box Shadow) - 부드러운 그림자
      boxShadow: {
        'rl-0': 'none',
        'rl-1': '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'rl-2': '0 2px 6px 0 rgb(0 0 0 / 0.1)',
        'rl-3': '0 4px 12px 0 rgb(0 0 0 / 0.12)',
        'rl-4': '0 8px 24px 0 rgb(0 0 0 / 0.14)',
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
