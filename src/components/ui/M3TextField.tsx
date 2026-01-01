// src/components/ui/M3TextField.tsx
'use client';

import React, { useId } from 'react';

export type M3TextFieldVariant = 'filled' | 'outlined';
export type M3TextFieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface M3TextFieldProps {
  label: string;
  variant?: M3TextFieldVariant;
  type?: M3TextFieldType;
  value?: string | number;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  'data-testid'?: string;
}

export function M3TextField({
  label,
  variant = 'filled',
  type = 'text',
  value,
  placeholder,
  helperText,
  error,
  disabled = false,
  required = false,
  leadingIcon,
  trailingIcon,
  onChange,
  onFocus,
  onBlur,
  className = '',
  'data-testid': testId,
}: M3TextFieldProps) {
  const inputId = useId();
  const helperTextId = useId();
  const errorId = useId();

  const hasError = !!error;
  const descriptionId = hasError ? errorId : helperText ? helperTextId : undefined;

  const containerClasses = [
    'relative',
    'flex',
    'flex-col',
    'min-h-[56px]',
    'rounded-t-m3-sm',
    variant === 'filled' ? 'bg-surface-container-highest' : 'bg-transparent border border-outline',
    hasError ? 'border-error' : '',
    disabled ? 'opacity-38' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputWrapperClasses = [
    'relative',
    'flex',
    'items-center',
    'gap-2',
    'px-4',
    'pt-5',
    'pb-2',
    variant === 'filled' ? 'border-b-2 border-on-surface-variant focus-within:border-primary' : '',
    hasError ? 'border-error focus-within:border-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [
    'flex-1',
    'bg-transparent',
    'text-body-large',
    'text-on-surface',
    'placeholder:text-on-surface-variant',
    'focus:outline-none',
    'disabled:cursor-not-allowed',
    'w-full',
  ].join(' ');

  const labelClasses = [
    'absolute',
    'left-4',
    'top-2',
    'text-label-small',
    'transition-all',
    'duration-m3-short',
    hasError ? 'text-error' : 'text-on-surface-variant',
    leadingIcon ? 'left-12' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const helperClasses = [
    'px-4',
    'pt-1',
    'text-body-small',
    hasError ? 'text-error' : 'text-on-surface-variant',
  ].join(' ');

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={inputWrapperClasses}>
        {leadingIcon && (
          <span className="flex-shrink-0 text-on-surface-variant">{leadingIcon}</span>
        )}

        <div className="relative flex-1">
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && <span className="ml-0.5 text-error">*</span>}
          </label>

          <input
            id={inputId}
            type={type}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-invalid={hasError || undefined}
            aria-required={required || undefined}
            aria-errormessage={hasError ? errorId : undefined}
            aria-describedby={descriptionId}
            className={inputClasses}
          />
        </div>

        {trailingIcon && (
          <span className="flex-shrink-0 text-on-surface-variant">{trailingIcon}</span>
        )}
      </div>

      {(helperText || error) && (
        <p id={error ? errorId : helperTextId} className={helperClasses}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
