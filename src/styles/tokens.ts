// src/styles/tokens.ts
// RaceLab Design System V1.0 Design Tokens
// Reference: RaceLab 디자인 시스템 가이드

/**
 * RaceLab Color Tokens
 * 핵심 원칙: CLARITY (명확성), BALANCE (균형), COMFORT (편안함)
 */
export const colors = {
  // Primary Colors - 로고 기반 데이터 컬러 (채도를 낮춰 눈의 피로도 감소)
  primary: {
    // Sage Green - 경마/안정/긍정적 지표
    horse: {
      DEFAULT: '#81C784',
      light: '#C8E6C9',
      dark: '#66BB6A',
      container: '#E8F5E9',
      onContainer: '#2E7D32',
    },
    // Soft Coral - 경륜/핵심/주 액션 버튼 (CTA)
    cycle: {
      DEFAULT: '#E57373',
      light: '#FFCDD2',
      dark: '#EF5350',
      container: '#FFEBEE',
      onContainer: '#C62828',
    },
    // Steel Blue - 경정/흐름/링크 및 아이콘
    boat: {
      DEFAULT: '#64B5F6',
      light: '#BBDEFB',
      dark: '#42A5F5',
      container: '#E3F2FD',
      onContainer: '#1565C0',
    },
  },

  // Neutral Colors - 배경 및 텍스트 (흰색 배경 최적화 고대비)
  neutral: {
    background: '#FFFFFF', // 순백 배경 (필수)
    textPrimary: '#27272A', // 헤드라인 및 주요 텍스트 (최고 대비)
    textSecondary: '#71717A', // 부제목, 보조 정보
    border: '#D4D4D8', // UI 경계선 (낮은 대비로 시선 방해 최소화)
    divider: '#E4E4E7', // 테이블 구분선
    tableRowAlt: '#F4F4F5', // Zebra Stripes 행 배경
  },

  // Legacy Support - M3 Surface Colors (기존 호환성)
  surface: {
    DEFAULT: '#FFFFFF',
    dim: '#F4F4F5',
    bright: '#FFFFFF',
    containerLowest: '#FFFFFF',
    containerLow: '#FAFAFA',
    container: '#F4F4F5',
    containerHigh: '#E4E4E7',
    containerHighest: '#D4D4D8',
  },

  // Legacy Support - M3 On-Surface Colors
  onSurface: {
    DEFAULT: '#27272A',
    variant: '#71717A',
  },

  // Legacy Support - M3 Outline Colors
  outline: {
    DEFAULT: '#A1A1AA',
    variant: '#D4D4D8',
  },

  // Semantic Race Colors (이전 버전 호환)
  race: {
    horse: {
      DEFAULT: '#81C784',
      container: '#E8F5E9',
      onContainer: '#2E7D32',
    },
    cycle: {
      DEFAULT: '#E57373',
      container: '#FFEBEE',
      onContainer: '#C62828',
    },
    boat: {
      DEFAULT: '#64B5F6',
      container: '#E3F2FD',
      onContainer: '#1565C0',
    },
  },

  // Status Colors
  status: {
    success: '#81C784',
    warning: '#FFB74D',
    error: '#E57373',
    info: '#64B5F6',
  },

  // Error Colors
  error: {
    DEFAULT: '#E57373',
    container: '#FFEBEE',
    onContainer: '#C62828',
  },
} as const;

/**
 * Elevation Tokens
 * 부드러운 그림자로 편안한 UX 제공
 */
export const elevation = {
  level0: 'none',
  level1: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
  level2: '0 2px 6px 0 rgb(0 0 0 / 0.1)',
  level3: '0 4px 12px 0 rgb(0 0 0 / 0.12)',
  level4: '0 8px 24px 0 rgb(0 0 0 / 0.14)',
  level5: '0 16px 32px 0 rgb(0 0 0 / 0.16)',
} as const;

/**
 * Spacing Tokens
 * 일관된 여백 스케일
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

/**
 * Border Radius Tokens
 * 부드러운 둥근 모서리 (버튼 필수)
 */
export const borderRadius = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

/**
 * Typography Scale
 * Noto Sans KR 사용, 50-60대 사용자를 위한 큰 폰트 크기
 */
export const typography = {
  fontFamily: {
    // 본문/UI용 폰트
    sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
    // 브랜드/로고용 폰트
    brand: ['Exo 2', 'Noto Sans KR', 'sans-serif'],
  },
  fontSize: {
    // Display - 대형 타이틀
    'display-large': ['32px', { lineHeight: '40px', letterSpacing: '-0.5px', fontWeight: '700' }],
    'display-medium': ['28px', { lineHeight: '36px', letterSpacing: '-0.25px', fontWeight: '700' }],
    'display-small': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '700' }],
    // Headline - H1/H2 (24pt~28pt for 5060)
    'headline-large': ['28px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '700' }],
    'headline-medium': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '700' }],
    'headline-small': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '600' }],
    // Title
    'title-large': ['20px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '600' }],
    'title-medium': ['18px', { lineHeight: '26px', letterSpacing: '0.1px', fontWeight: '600' }],
    'title-small': ['16px', { lineHeight: '24px', letterSpacing: '0.1px', fontWeight: '600' }],
    // Body - 본문 (16pt~18pt for 5060)
    'body-large': ['18px', { lineHeight: '28px', letterSpacing: '0.25px', fontWeight: '400' }],
    'body-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.25px', fontWeight: '400' }],
    'body-small': ['14px', { lineHeight: '22px', letterSpacing: '0.4px', fontWeight: '400' }],
    // Data - 배당률, 결과 매칭률 등 핵심 숫자 (18pt~22pt, Extra Bold)
    'data-large': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '800' }],
    'data-medium': ['20px', { lineHeight: '26px', letterSpacing: '0px', fontWeight: '800' }],
    'data-small': ['18px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '800' }],
    // Label
    'label-large': ['16px', { lineHeight: '24px', letterSpacing: '0.1px', fontWeight: '500' }],
    'label-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '500' }],
    'label-small': ['12px', { lineHeight: '18px', letterSpacing: '0.4px', fontWeight: '500' }],
  },
} as const;

/**
 * Motion Tokens
 * 부드러운 애니메이션으로 COMFORT 원칙 준수
 */
export const motion = {
  duration: {
    instant: '50ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  },
} as const;

/**
 * Touch Target
 * 5060 사용자 + 접근성을 위한 최소 터치 영역
 */
export const touchTarget = {
  min: '48px',
  recommended: '56px',
} as const;

/**
 * Component-specific Tokens
 */
export const components = {
  // 버튼
  button: {
    minHeight: '48px',
    borderRadius: '12px',
    paddingX: '24px',
    paddingY: '12px',
  },
  // 테이블
  table: {
    rowMinHeight: '48px',
    headerBackground: '#F4F4F5',
    rowAltBackground: '#F4F4F5',
    borderColor: '#E4E4E7',
  },
  // 카드
  card: {
    borderRadius: '16px',
    padding: '24px',
    borderColor: '#E4E4E7',
  },
} as const;
