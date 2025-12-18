'use client';

import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive';
}

const badgeStyles: Record<Required<BadgeProps>['variant'], string> = {
  default:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700',
  secondary:
    'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100 dark:hover:bg-emerald-900',
  destructive:
    'bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-200 dark:border-rose-800 dark:bg-rose-900/60 dark:text-rose-100 dark:hover:bg-rose-900',
};

export default function Badge({
  children,
  className = '',
  variant = 'default',
  ...props
}: BadgeProps) {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';

  return (
    <span className={`${baseClasses} ${badgeStyles[variant]} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
