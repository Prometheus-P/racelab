/**
 * Design System Component API Contracts
 * Feature: 002-design-system
 *
 * These interfaces define the public API for all M3 design system components.
 * Implementation must conform to these contracts.
 */

import { ReactNode, MouseEvent, KeyboardEvent, CSSProperties } from 'react';

// =============================================================================
// SHARED TYPES
// =============================================================================

/** Common sizes used across components */
export type ComponentSize = 'sm' | 'md' | 'lg';

/** Race type semantic colors */
export type RaceType = 'horse' | 'cycle' | 'boat';

/** Standard color palette */
export type ComponentColor = 'primary' | 'secondary' | 'error' | RaceType;

/** Base props shared by all components */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Inline styles (use sparingly) */
  style?: CSSProperties;
  /** Test ID for automated testing */
  'data-testid'?: string;
}

// =============================================================================
// LOGO COMPONENT
// =============================================================================

export type LogoVariant = 'full' | 'symbol' | 'text';

export interface RaceLabLogoProps extends BaseComponentProps {
  /** Logo display variant */
  variant?: LogoVariant;
  /** Logo size */
  size?: ComponentSize;
  /** Click handler - enables hover animation when provided */
  onClick?: () => void;
  /** Accessible label */
  'aria-label'?: string;
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';

export interface M3ButtonProps extends BaseComponentProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size - affects padding and font size */
  size?: ComponentSize;
  /** Color scheme */
  color?: ComponentColor;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state - shows spinner, disables interaction */
  loading?: boolean;
  /** Icon before text */
  startIcon?: ReactNode;
  /** Icon after text */
  endIcon?: ReactNode;
  /** Expand to full container width */
  fullWidth?: boolean;
  /** Button content */
  children: ReactNode;
  /** Click handler */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Submit button type */
  type?: 'button' | 'submit' | 'reset';
  /** Accessible label when children is icon-only */
  'aria-label'?: string;
}

// =============================================================================
// CARD COMPONENT
// =============================================================================

export type CardVariant = 'elevated' | 'filled' | 'outlined';

export interface M3CardProps extends BaseComponentProps {
  /** Visual style variant */
  variant?: CardVariant;
  /** Elevation level (0-3) */
  elevation?: 0 | 1 | 2 | 3;
  /** Enable hover/focus states */
  interactive?: boolean;
  /** Selected state (for selectable cards) */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Card content */
  children: ReactNode;
  /** Click handler - automatically sets interactive=true */
  onClick?: () => void;
  /** Keyboard handler for accessibility */
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  /** Role for accessibility */
  role?: 'button' | 'article' | 'listitem';
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

// =============================================================================
// CHIP COMPONENT
// =============================================================================

export type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion';

export interface M3ChipProps extends BaseComponentProps {
  /** Chip type/behavior */
  variant?: ChipVariant;
  /** Selected state (for filter chips) */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Leading icon */
  icon?: ReactNode;
  /** Delete handler - shows delete icon when provided */
  onDelete?: () => void;
  /** Chip label */
  children: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Color scheme (for race type chips) */
  color?: ComponentColor;
}

// =============================================================================
// TEXT FIELD COMPONENT
// =============================================================================

export type TextFieldVariant = 'filled' | 'outlined';

export interface M3TextFieldProps extends BaseComponentProps {
  /** Visual style variant */
  variant?: TextFieldVariant;
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Value change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text below field */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message (overrides helperText when error=true) */
  errorText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field indicator */
  required?: boolean;
  /** Content before input */
  startAdornment?: ReactNode;
  /** Content after input */
  endAdornment?: ReactNode;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  /** Input name attribute */
  name?: string;
  /** Auto-complete behavior */
  autoComplete?: string;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Key press handler */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

// =============================================================================
// SEARCH BAR COMPONENT
// =============================================================================

export interface M3SearchBarProps extends BaseComponentProps {
  /** Current search value */
  value: string;
  /** Value change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Search submission handler */
  onSearch?: (value: string) => void;
  /** Clear button handler */
  onClear?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Show loading indicator */
  loading?: boolean;
}

// =============================================================================
// DIALOG COMPONENT
// =============================================================================

export interface M3DialogProps extends BaseComponentProps {
  /** Open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Dialog title */
  title?: string;
  /** Dialog content */
  children: ReactNode;
  /** Action buttons */
  actions?: ReactNode;
  /** Expand to container width */
  fullWidth?: boolean;
  /** Maximum width */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  /** Disable backdrop click close */
  disableBackdropClose?: boolean;
  /** Disable escape key close */
  disableEscapeClose?: boolean;
  /** Accessible description ID */
  'aria-describedby'?: string;
}

// =============================================================================
// SNACKBAR COMPONENT
// =============================================================================

export type SnackbarSeverity = 'info' | 'success' | 'warning' | 'error';

export interface M3SnackbarProps extends BaseComponentProps {
  /** Open state */
  open: boolean;
  /** Message content */
  message: string;
  /** Visual severity */
  severity?: SnackbarSeverity;
  /** Auto-hide duration in ms (0 = no auto-hide) */
  autoHideDuration?: number;
  /** Close handler */
  onClose: () => void;
  /** Action element */
  action?: ReactNode;
  /** Position on screen */
  position?: 'top' | 'bottom';
}

// =============================================================================
// SKELETON COMPONENT
// =============================================================================

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';
export type SkeletonAnimation = 'shimmer' | 'pulse' | false;

export interface SkeletonProps extends BaseComponentProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width (CSS value or number in px) */
  width?: string | number;
  /** Height (CSS value or number in px) */
  height?: string | number;
  /** Animation type */
  animation?: SkeletonAnimation;
}

// =============================================================================
// RIPPLE HOOK (Internal)
// =============================================================================

export interface RippleConfig {
  /** Ripple color (CSS color value) */
  color?: string;
  /** Ripple duration in ms */
  duration?: number;
  /** Disable ripple effect */
  disabled?: boolean;
}

export interface UseRippleReturn {
  /** Props to spread on the target element */
  rippleProps: {
    onMouseDown: (e: MouseEvent<HTMLElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  };
  /** Ripple elements to render inside the target */
  ripples: ReactNode;
}

// =============================================================================
// REDUCED MOTION HOOK
// =============================================================================

export interface UseReducedMotionReturn {
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
}
