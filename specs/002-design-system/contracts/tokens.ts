/**
 * Design System Token Contracts
 * Feature: 002-design-system
 *
 * These interfaces define the structure of design tokens.
 * Tokens are the single source of truth for all design decisions.
 */

// =============================================================================
// COLOR TOKENS
// =============================================================================

/** Standard color token with variants */
export interface ColorToken {
  /** Primary/default color value */
  DEFAULT: string;
  /** Text color on this color */
  onColor?: string;
  /** Container/background variant */
  container?: string;
  /** Text on container */
  onContainer?: string;
}

/** M3 Surface color scale */
export interface SurfaceColors {
  /** Default surface */
  DEFAULT: string;
  /** Dimmed surface */
  dim: string;
  /** Bright surface */
  bright: string;
  /** Lowest container */
  containerLowest: string;
  /** Low container */
  containerLow: string;
  /** Standard container */
  container: string;
  /** High container */
  containerHigh: string;
  /** Highest container */
  containerHighest: string;
}

/** Complete color system */
export interface ColorSystem {
  primary: ColorToken;
  surface: SurfaceColors;
  onSurface: {
    DEFAULT: string;
    variant: string;
  };
  outline: {
    DEFAULT: string;
    variant: string;
  };
  race: {
    horse: ColorToken;
    cycle: ColorToken;
    boat: ColorToken;
  };
  error: ColorToken;
}

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

/** M3 type scale names */
export type TypeScale =
  | 'display-large'
  | 'display-medium'
  | 'display-small'
  | 'headline-large'
  | 'headline-medium'
  | 'headline-small'
  | 'title-large'
  | 'title-medium'
  | 'title-small'
  | 'body-large'
  | 'body-medium'
  | 'body-small'
  | 'label-large'
  | 'label-medium'
  | 'label-small';

/** Typography style definition */
export interface TypeStyle {
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
}

/** Complete typography system */
export interface TypographySystem {
  fontFamily: {
    sans: string[];
  };
  fontSize: Record<TypeScale, [string, TypeStyle]>;
}

// =============================================================================
// SPACING TOKENS
// =============================================================================

/** Spacing scale names */
export type SpacingScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** Complete spacing system */
export interface SpacingSystem {
  xs: '4px';
  sm: '8px';
  md: '16px';
  lg: '24px';
  xl: '32px';
  '2xl': '48px';
  '3xl': '64px';
}

// =============================================================================
// ELEVATION TOKENS
// =============================================================================

/** Elevation level names */
export type ElevationLevel =
  | 'level0'
  | 'level1'
  | 'level2'
  | 'level3'
  | 'level4'
  | 'level5';

/** Complete elevation system */
export interface ElevationSystem {
  level0: 'none';
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
}

// =============================================================================
// MOTION TOKENS
// =============================================================================

/** Duration token names */
export type DurationToken =
  | 'short1'
  | 'short2'
  | 'short3'
  | 'short4'
  | 'medium1'
  | 'medium2'
  | 'medium3'
  | 'medium4'
  | 'long1'
  | 'long2'
  | 'long3'
  | 'long4';

/** Easing curve names */
export type EasingToken =
  | 'standard'
  | 'standardAccelerate'
  | 'standardDecelerate'
  | 'emphasized'
  | 'emphasizedAccelerate'
  | 'emphasizedDecelerate';

/** Complete motion system */
export interface MotionSystem {
  duration: Record<DurationToken, string>;
  easing: Record<EasingToken, string>;
}

// =============================================================================
// BORDER RADIUS TOKENS
// =============================================================================

/** Border radius scale names */
export type RadiusScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Complete border radius system */
export interface RadiusSystem {
  none: '0';
  xs: '4px';
  sm: '8px';
  md: '12px';
  lg: '16px';
  xl: '28px';
  full: '9999px';
}

// =============================================================================
// BREAKPOINT TOKENS
// =============================================================================

/** Responsive breakpoint names */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Breakpoint values */
export interface BreakpointSystem {
  sm: '640px';
  md: '768px';
  lg: '1024px';
  xl: '1280px';
  '2xl': '1536px';
}

// =============================================================================
// COMPLETE TOKEN EXPORT
// =============================================================================

/** All design tokens combined */
export interface DesignTokens {
  colors: ColorSystem;
  typography: TypographySystem;
  spacing: SpacingSystem;
  elevation: ElevationSystem;
  motion: MotionSystem;
  borderRadius: RadiusSystem;
  breakpoints: BreakpointSystem;
}

// =============================================================================
// TAILWIND CONFIG MAPPING
// =============================================================================

/**
 * This interface documents how tokens map to Tailwind config.
 * Not used at runtime, but documents the relationship.
 */
export interface TailwindTokenMapping {
  /** colors.* → theme.extend.colors */
  colors: 'theme.extend.colors';
  /** typography.fontFamily → theme.extend.fontFamily */
  fontFamily: 'theme.extend.fontFamily';
  /** typography.fontSize → theme.extend.fontSize */
  fontSize: 'theme.extend.fontSize';
  /** spacing.* → theme.extend.spacing */
  spacing: 'theme.extend.spacing';
  /** elevation.* → theme.extend.boxShadow */
  boxShadow: 'theme.extend.boxShadow';
  /** borderRadius.* → theme.extend.borderRadius */
  borderRadius: 'theme.extend.borderRadius';
  /** motion.duration → theme.extend.transitionDuration */
  transitionDuration: 'theme.extend.transitionDuration';
  /** motion.easing → theme.extend.transitionTimingFunction */
  transitionTimingFunction: 'theme.extend.transitionTimingFunction';
}
