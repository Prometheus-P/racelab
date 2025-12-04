// src/components/ui/M3Snackbar.tsx
'use client';

import React, { useEffect } from 'react';

export type SnackbarSeverity = 'info' | 'success' | 'warning' | 'error';
export type SnackbarPosition = 'top' | 'bottom';

export interface M3SnackbarProps {
  /** Open state */
  open: boolean;
  /** Message content */
  message: string;
  /** Visual severity */
  severity?: SnackbarSeverity;
  /** Auto-hide duration in ms (0 = no auto-hide, default 4000) */
  autoHideDuration?: number;
  /** Close handler */
  onClose: () => void;
  /** Action element */
  action?: React.ReactNode;
  /** Position on screen */
  position?: SnackbarPosition;
  /** Additional CSS classes */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

const severityClasses: Record<SnackbarSeverity, string> = {
  info: 'bg-inverse-surface text-inverse-on-surface',
  success: 'bg-green-800 text-white',
  warning: 'bg-amber-800 text-white',
  error: 'bg-error text-on-error',
};

const severityIcons: Record<SnackbarSeverity, React.ReactNode> = {
  info: (
    <svg
      data-testid="snackbar-icon-info"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg
      data-testid="snackbar-icon-success"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  warning: (
    <svg
      data-testid="snackbar-icon-warning"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg
      data-testid="snackbar-icon-error"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

export function M3Snackbar({
  open,
  message,
  severity = 'info',
  autoHideDuration = 4000,
  onClose,
  action,
  position = 'bottom',
  className = '',
  'data-testid': testId,
}: M3SnackbarProps) {
  // Auto-hide timer
  useEffect(() => {
    if (open && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) {
    return null;
  }

  const isUrgent = severity === 'error' || severity === 'warning';
  const slideDirection =
    position === 'bottom' ? 'slide-in-from-bottom-4' : 'slide-in-from-top-4';

  const snackbarClasses = [
    // Base
    'flex',
    'items-center',
    'gap-3',
    'px-4',
    'py-3',
    'min-w-[288px]',
    'max-w-[568px]',
    // M3 styling
    'rounded-m3',
    'shadow-m3-3',
    'text-body-medium',
    // Severity colors
    severityClasses[severity],
    // Animation
    'animate-in',
    'fade-in',
    slideDirection,
    'duration-m3-medium',
    // Custom
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClasses = [
    'fixed',
    'left-0',
    'right-0',
    'z-50',
    'flex',
    'justify-center',
    'px-4',
    position === 'bottom' ? 'bottom-0 pb-6' : 'top-0 pt-6',
  ].join(' ');

  return (
    <div className={containerClasses}>
      <div
        role="alert"
        aria-live={isUrgent ? 'assertive' : 'polite'}
        className={snackbarClasses}
        data-testid={testId}
      >
        {/* Icon */}
        <span className="flex-shrink-0">{severityIcons[severity]}</span>

        {/* Message */}
        <span className="flex-1">{message}</span>

        {/* Action */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
