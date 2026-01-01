// src/components/ui/M3Dialog.tsx
'use client';

import React, { useEffect, useId, useCallback } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

// Global dialog stack for handling multiple dialogs (Escape key priority)
const dialogStack: string[] = [];

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
  const dialogId = useId();

  // Focus trap: Tab/Shift+Tab cycles within dialog (WCAG 2.4.3)
  const focusTrapRef = useFocusTrap<HTMLDivElement>({
    enabled: open,
    autoFocus: true,
    restoreFocus: true,
  });

  // Handle escape key - only topmost dialog responds
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableEscapeClose) {
        // Only handle if this dialog is the topmost in the stack
        const topDialogId = dialogStack[dialogStack.length - 1];
        if (topDialogId === dialogId) {
          event.stopImmediatePropagation();
          onClose();
        }
      }
    },
    [onClose, disableEscapeClose, dialogId]
  );

  // Manage dialog stack and event listener
  useEffect(() => {
    if (open) {
      // Add to stack when opening
      dialogStack.push(dialogId);
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open (CSS class avoids layout thrashing)
      document.body.classList.add('modal-open');
    }

    return () => {
      // Remove from stack when closing
      const index = dialogStack.indexOf(dialogId);
      if (index > -1) {
        dialogStack.splice(index, 1);
      }
      document.removeEventListener('keydown', handleKeyDown);
      // Only remove modal-open if no more dialogs are open
      if (dialogStack.length === 0) {
        document.body.classList.remove('modal-open');
      }
    };
  }, [open, handleKeyDown, dialogId]);

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
        className="animate-in fade-in fixed inset-0 bg-black/50 duration-m3-short"
        data-testid="dialog-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={ariaDescribedBy}
        className={panelClasses}
        onClick={handlePanelClick}
        data-testid={testId}
        tabIndex={-1}
      >
        {/* Title */}
        {title && (
          <div className="px-6 pb-4 pt-6">
            <h2 id={titleId} className="text-headline-small text-on-surface">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6 text-body-medium text-on-surface-variant">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex justify-end gap-2 px-6 pb-6" data-dialog-actions>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
