// src/components/ui/M3Chip.tsx
'use client';

import React from 'react';

export type M3ChipColorVariant = 'default' | 'horse' | 'cycle' | 'boat';

export interface M3ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  colorVariant?: M3ChipColorVariant;
  leadingIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

const colorVariantClasses: Record<M3ChipColorVariant, { selected: string; unselected: string }> = {
  default: {
    selected: 'bg-primary-100 text-primary-900 border-primary',
    unselected: 'bg-surface-container border-outline-variant text-on-surface',
  },
  horse: {
    selected: 'bg-horse-container text-horse-on-container border-horse',
    unselected: 'bg-horse-container/30 border-horse/30 text-horse',
  },
  cycle: {
    selected: 'bg-cycle-container text-cycle-on-container border-cycle',
    unselected: 'bg-cycle-container/30 border-cycle/30 text-cycle',
  },
  boat: {
    selected: 'bg-boat-container text-boat-on-container border-boat',
    unselected: 'bg-boat-container/30 border-boat/30 text-boat',
  },
};

export function M3Chip({
  label,
  selected = false,
  onClick,
  colorVariant = 'default',
  leadingIcon,
  disabled = false,
  className = '',
  'data-testid': testId,
}: M3ChipProps) {
  const colorClasses = colorVariantClasses[colorVariant];
  const stateClasses = selected ? colorClasses.selected : colorClasses.unselected;

  const baseClasses = [
    'inline-flex',
    'items-center',
    'gap-2',
    'rounded-m3-sm',
    'border',
    'min-h-[32px]',
    'min-w-[48px]', // M3 touch target width
    'px-4',
    'py-1',
    'text-label-large',
    'font-medium',
    'transition-all',
    'duration-m3-short',
    'ease-m3-standard',
    stateClasses,
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary',
    'focus:ring-offset-1',
    'relative', // For extended touch area
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={baseClasses}
      data-testid={testId}
    >
      {/* Extended touch area - invisible but expands tap target to 48px */}
      <span
        className="absolute inset-0 -top-2 -bottom-2 pointer-events-none"
        aria-hidden="true"
      />
      {leadingIcon && <span className="flex-shrink-0">{leadingIcon}</span>}
      <span>{label}</span>
    </button>
  );
}
