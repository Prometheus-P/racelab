// src/components/ui/M3Dialog.tsx
'use client';

import React, { useEffect, useId, useCallback } from 'react';

export type M3DialogMaxWidth = 'xs' | 'sm' | 'md' | 'lg';

export interface M3DialogProps {
  /** Open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Dialog title */
  title?: string;
  /** Dialog content */
  children: React.ReactNode;
  /** Action buttons */
  actions?: React.ReactNode;
  /** Expand to container width */
  fullWidth?: boolean;
  /** Maximum width */
  maxWidth?: M3DialogMaxWidth;
  /** Disable backdrop click close */
  disableBackdropClose?: boolean;
  /** Disable escape key close */
  disableEscapeClose?: boolean;
  /** Accessible description ID */
  'aria-describedby'?: string;
  /** Additional CSS classes for the panel */
  className?: string;
  /** Test ID for the panel */
  'data-testid'?: string;
}

const maxWidthClasses: Record<M3DialogMaxWidth, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function M3Dialog({
  open,
  onClose,
  title,
  children,
  actions,
  fullWidth = false,
  maxWidth = 'sm',
  disableBackdropClose = false,
  disableEscapeClose = false,
  'aria-describedby': ariaDescribedBy,
  className = '',
  'data-testid': testId,
}: M3DialogProps) {
  const titleId = useId();

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableEscapeClose) {
        onClose();
      }
    },
    [onClose, disableEscapeClose]
  );

  // Add/remove event listener for escape key
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (!disableBackdropClose) {
      onClose();
    }
  };

  // Prevent click propagation from dialog content
  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!open) {
    return null;
  }

  const panelClasses = [
    // Base
    'relative',
    'mx-4',
    'my-8',
    // M3 styling
    'bg-surface-container-high',
    'rounded-m3-xl',
    'shadow-m3-3',
    // Animation
    'animate-in',
    'fade-in',
    'zoom-in-95',
    'duration-m3-medium',
    // Sizing
    fullWidth ? 'w-full' : '',
    maxWidthClasses[maxWidth],
    // Custom
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      role="presentation"
    >
      {/* Backdrop/Scrim */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in duration-m3-short"
        data-testid="dialog-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={ariaDescribedBy}
        className={panelClasses}
        onClick={handlePanelClick}
        data-testid={testId}
      >
        {/* Title */}
        {title && (
          <div className="px-6 pt-6 pb-4">
            <h2 id={titleId} className="text-headline-small text-on-surface">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6 text-body-medium text-on-surface-variant">{children}</div>

        {/* Actions */}
        {actions && (
          <div
            className="flex justify-end gap-2 px-6 pb-6"
            data-dialog-actions
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
