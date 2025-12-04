# Data Model: Design System Tokens & Entities

**Feature**: 002-design-system
**Date**: 2025-12-04

## Overview

The design system is a configuration-driven system with no database storage. All entities are TypeScript types/interfaces representing design decisions.

## Token Schema

### Color Tokens

```typescript
interface ColorToken {
  DEFAULT: string;      // Primary usage
  onColor?: string;     // Text on this color
  container?: string;   // Container/background variant
  onContainer?: string; // Text on container
}

interface ColorSystem {
  // M3 Primary Palette
  primary: ColorToken;

  // M3 Surface System
  surface: {
    DEFAULT: string;
    dim: string;
    bright: string;
    containerLowest: string;
    containerLow: string;
    container: string;
    containerHigh: string;
    containerHighest: string;
  };

  // On-Surface
  onSurface: {
    DEFAULT: string;
    variant: string;
  };

  // Outline
  outline: {
    DEFAULT: string;
    variant: string;
  };

  // Semantic Race Colors
  race: {
    horse: ColorToken;
    cycle: ColorToken;
    boat: ColorToken;
  };

  // Error State
  error: ColorToken;
}
```

### Typography Tokens

```typescript
type TypeScale =
  | 'display-large' | 'display-medium' | 'display-small'
  | 'headline-large' | 'headline-medium' | 'headline-small'
  | 'title-large' | 'title-medium' | 'title-small'
  | 'body-large' | 'body-medium' | 'body-small'
  | 'label-large' | 'label-medium' | 'label-small';

interface TypeStyle {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
}

interface TypographySystem {
  fontFamily: {
    sans: string[];
  };
  fontSize: Record<TypeScale, [string, TypeStyle]>;
}
```

### Spacing Tokens

```typescript
type SpacingScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface SpacingSystem {
  xs: '4px';   // 1 unit
  sm: '8px';   // 2 units
  md: '16px';  // 4 units
  lg: '24px';  // 6 units
  xl: '32px';  // 8 units
  '2xl': '48px'; // 12 units
  '3xl': '64px'; // 16 units
}
```

### Elevation Tokens

```typescript
type ElevationLevel = 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5';

interface ElevationSystem {
  level0: 'none';
  level1: string; // Box shadow value
  level2: string;
  level3: string;
  level4: string;
  level5: string;
}
```

### Motion Tokens

```typescript
type DurationToken =
  | 'short1' | 'short2' | 'short3' | 'short4'
  | 'medium1' | 'medium2' | 'medium3' | 'medium4'
  | 'long1' | 'long2' | 'long3' | 'long4';

type EasingToken =
  | 'standard'
  | 'standardAccelerate'
  | 'standardDecelerate'
  | 'emphasized'
  | 'emphasizedAccelerate'
  | 'emphasizedDecelerate';

interface MotionSystem {
  duration: Record<DurationToken, string>;
  easing: Record<EasingToken, string>;
}
```

### Border Radius Tokens

```typescript
type RadiusScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface RadiusSystem {
  none: '0';
  xs: '4px';
  sm: '8px';
  md: '12px';
  lg: '16px';
  xl: '28px';
  full: '9999px';
}
```

---

## Component Entities

### Logo Asset

```typescript
type LogoVariant = 'full' | 'symbol' | 'text';
type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  variant?: LogoVariant;  // default: 'full'
  size?: LogoSize;        // default: 'md'
  className?: string;
  onClick?: () => void;
}

// Size mappings
const LOGO_SIZES: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 72, height: 72 },
};
```

### Button Component

```typescript
type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonColor = 'primary' | 'secondary' | 'error' | 'horse' | 'cycle' | 'boat';

interface ButtonProps {
  variant?: ButtonVariant;  // default: 'filled'
  size?: ButtonSize;        // default: 'md'
  color?: ButtonColor;      // default: 'primary'
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

// Touch target enforcement
const MIN_TOUCH_TARGET = 48; // dp
```

### Card Component

```typescript
type CardVariant = 'elevated' | 'filled' | 'outlined';

interface CardProps {
  variant?: CardVariant;  // default: 'elevated'
  elevation?: 0 | 1 | 2 | 3; // default: 1
  interactive?: boolean;  // Adds hover/focus states
  selected?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

### Chip Component

```typescript
type ChipVariant = 'assist' | 'filter' | 'input' | 'suggestion';

interface ChipProps {
  variant?: ChipVariant;  // default: 'filter'
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onDelete?: () => void;  // Shows delete icon if provided
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

### TextField Component

```typescript
type TextFieldVariant = 'filled' | 'outlined';

interface TextFieldProps {
  variant?: TextFieldVariant;  // default: 'outlined'
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  className?: string;
}
```

### Dialog Component

```typescript
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}
```

### Snackbar Component

```typescript
type SnackbarSeverity = 'info' | 'success' | 'warning' | 'error';

interface SnackbarProps {
  open: boolean;
  message: string;
  severity?: SnackbarSeverity;  // default: 'info'
  autoHideDuration?: number;    // default: 5000ms
  onClose: () => void;
  action?: React.ReactNode;
}
```

### Skeleton Component

```typescript
type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps {
  variant?: SkeletonVariant;  // default: 'text'
  width?: string | number;
  height?: string | number;
  animation?: 'shimmer' | 'pulse' | false;  // default: 'shimmer'
  className?: string;
}
```

---

## State Relationships

### Component State Layer

All interactive components share a state layer system:

```typescript
interface StateLayer {
  // Opacity values for state layers
  hover: 0.08;      // 8% opacity
  focus: 0.12;      // 12% opacity
  pressed: 0.12;    // 12% opacity
  dragged: 0.16;    // 16% opacity
}
```

### Focus Ring

All focusable components use consistent focus indicators:

```typescript
interface FocusRing {
  width: '2px';
  style: 'solid';
  color: 'var(--outline)';
  offset: '2px';
}
```

---

## Validation Rules

### Touch Target

```typescript
function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= 48 && rect.height >= 48;
}
```

### Contrast Ratio

```typescript
// WCAG AA requirements
const CONTRAST_REQUIREMENTS = {
  normalText: 4.5,    // 4.5:1 for normal text
  largeText: 3.0,     // 3:1 for large text (18pt+ or 14pt+ bold)
  uiComponents: 3.0,  // 3:1 for UI components
};
```

### Animation Duration

```typescript
// Maximum animation duration (SC-009)
const MAX_ANIMATION_DURATION = 500; // ms

function validateAnimationDuration(duration: number): boolean {
  return duration <= MAX_ANIMATION_DURATION;
}
```

---

## File Mapping

| Entity | Source File | Notes |
|--------|-------------|-------|
| Color Tokens | `src/styles/tokens.ts` | Extend existing |
| Typography | `src/styles/tokens.ts` | Extend existing |
| Motion | `src/styles/tokens.ts` | New section |
| Tailwind Config | `tailwind.config.ts` | Map tokens |
| Animations | `src/styles/animations.css` | New file |
| Components | `src/components/ui/*.tsx` | New/extend |
| Logo | `src/components/brand/RaceLabLogo.tsx` | New |
