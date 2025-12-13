/**
 * UI Component Barrel Export
 * Feature: 002-design-system
 *
 * Central export point for all M3 design system components.
 */

// Core interactive components
export { M3Button } from './M3Button';
export type { M3ButtonProps, M3ButtonVariant, M3ButtonSize } from './M3Button';

// Container components
export { M3Card } from './M3Card';
export type { M3CardProps, M3CardVariant, M3ElevationLevel } from './M3Card';

// Selection components
export { M3Chip } from './M3Chip';
export type { M3ChipProps, M3ChipColorVariant } from './M3Chip';

// Form components
export { M3TextField } from './M3TextField';
export type { M3TextFieldProps, M3TextFieldVariant, M3TextFieldType } from './M3TextField';

// Search components
export { M3SearchBar } from './M3SearchBar';

// Loading components
export { Skeleton } from './Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton';

// Dialog components
export { M3Dialog } from './M3Dialog';
export type { M3DialogProps, M3DialogMaxWidth } from './M3Dialog';

// Feedback components
export { M3Snackbar } from './M3Snackbar';
export type { M3SnackbarProps, SnackbarSeverity, SnackbarPosition } from './M3Snackbar';

// Badge component (shadcn-inspired)
export { default as Badge } from './Badge';
