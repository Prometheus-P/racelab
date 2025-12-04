// src/components/ui/M3Button.tsx
'use client';

import React from 'react';

export type M3ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
export type M3ButtonSize = 'sm' | 'md' | 'lg';

export interface M3ButtonProps {
  children: React.ReactNode;
  variant?: M3ButtonVariant;
  size?: M3ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

const variantClasses: Record<M3ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80',
  outlined: 'bg-transparent border border-outline text-primary hover:bg-primary/8 active:bg-primary/12',
  text: 'bg-transparent text-primary hover:bg-primary/8 active:bg-primary/12',
  elevated: 'bg-surface-container-low text-primary shadow-m3-1 hover:shadow-m3-2 active:shadow-m3-1',
  tonal: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/80',
};

const sizeClasses: Record<M3ButtonSize, string> = {
  sm: 'h-8 px-4 text-label-medium gap-1',
  md: 'h-10 px-6 text-label-large gap-2',
  lg: 'h-12 px-8 text-label-large gap-2',
};

const LoadingSpinner = () => (
  <span
    role="status"
    aria-label="Loading"
    className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
  />
);

export function M3Button({
  children,
  variant = 'filled',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  iconOnly = false,
  leadingIcon,
  trailingIcon,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  'data-testid': testId,
}: M3ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-m3-full',
    'transition-all',
    'duration-m3-short',
    'ease-m3-standard',
    'min-h-[48px]',
    'min-w-[48px]',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary',
    'focus:ring-offset-2',
    variantClasses[variant],
    iconOnly ? 'rounded-full p-3' : sizeClasses[size],
    isDisabled ? 'opacity-38 cursor-not-allowed' : 'cursor-pointer',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={baseClasses}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {loading && <LoadingSpinner />}
      {!loading && leadingIcon && <span className="flex-shrink-0">{leadingIcon}</span>}
      {!iconOnly && <span>{children}</span>}
      {iconOnly && !loading && children}
      {!loading && trailingIcon && <span className="flex-shrink-0">{trailingIcon}</span>}
    </button>
  );
}
