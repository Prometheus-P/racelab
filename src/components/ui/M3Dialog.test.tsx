// src/components/ui/M3Dialog.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { M3Dialog } from './M3Dialog';

// Mock window.matchMedia for useReducedMotion hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('M3Dialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    children: <p>Dialog content</p>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders when open is true', () => {
      render(<M3Dialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<M3Dialog {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<M3Dialog {...defaultProps} />);
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });
  });

  describe('title', () => {
    it('renders title when provided', () => {
      render(<M3Dialog {...defaultProps} title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('applies M3 headline-small typography to title', () => {
      render(<M3Dialog {...defaultProps} title="Test Title" />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('text-headline-small');
    });

    it('links title to dialog via aria-labelledby', () => {
      render(<M3Dialog {...defaultProps} title="Test Title" />);
      const dialog = screen.getByRole('dialog');
      const title = screen.getByText('Test Title');
      expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    });
  });

  describe('actions', () => {
    it('renders action buttons when provided', () => {
      const actions = (
        <>
          <button>Cancel</button>
          <button>Confirm</button>
        </>
      );
      render(<M3Dialog {...defaultProps} actions={actions} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('renders actions in footer section', () => {
      const actions = <button data-testid="action-btn">Action</button>;
      render(<M3Dialog {...defaultProps} actions={actions} />);
      const actionBtn = screen.getByTestId('action-btn');
      expect(actionBtn.closest('[data-dialog-actions]')).toBeInTheDocument();
    });
  });

  describe('close behavior', () => {
    it('calls onClose when backdrop is clicked', async () => {
      const onClose = jest.fn();
      render(<M3Dialog {...defaultProps} onClose={onClose} />);

      const backdrop = screen.getByTestId('dialog-backdrop');
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when dialog content is clicked', async () => {
      const onClose = jest.fn();
      render(<M3Dialog {...defaultProps} onClose={onClose} />);

      const content = screen.getByText('Dialog content');
      fireEvent.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', async () => {
      const onClose = jest.fn();
      render(<M3Dialog {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on backdrop click when disableBackdropClose is true', () => {
      const onClose = jest.fn();
      render(<M3Dialog {...defaultProps} onClose={onClose} disableBackdropClose />);

      const backdrop = screen.getByTestId('dialog-backdrop');
      fireEvent.click(backdrop);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close on Escape when disableEscapeClose is true', () => {
      const onClose = jest.fn();
      render(<M3Dialog {...defaultProps} onClose={onClose} disableEscapeClose />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('sizing', () => {
    it('applies fullWidth class when fullWidth is true', () => {
      render(<M3Dialog {...defaultProps} fullWidth data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('w-full');
    });

    it('applies xs maxWidth constraint', () => {
      render(<M3Dialog {...defaultProps} maxWidth="xs" data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('max-w-xs');
    });

    it('applies sm maxWidth constraint', () => {
      render(<M3Dialog {...defaultProps} maxWidth="sm" data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('max-w-sm');
    });

    it('applies md maxWidth constraint', () => {
      render(<M3Dialog {...defaultProps} maxWidth="md" data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('max-w-md');
    });

    it('applies lg maxWidth constraint', () => {
      render(<M3Dialog {...defaultProps} maxWidth="lg" data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('max-w-lg');
    });
  });

  describe('M3 styling', () => {
    it('applies M3 level 3 elevation shadow', () => {
      render(<M3Dialog {...defaultProps} data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('shadow-m3-3');
    });

    it('applies M3 surface container color', () => {
      render(<M3Dialog {...defaultProps} data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('bg-surface-container-high');
    });

    it('applies M3 rounded corners', () => {
      render(<M3Dialog {...defaultProps} data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('rounded-m3-xl');
    });

    it('applies backdrop with scrim color', () => {
      render(<M3Dialog {...defaultProps} />);
      const backdrop = screen.getByTestId('dialog-backdrop');
      expect(backdrop).toHaveClass('bg-black/50');
    });
  });

  describe('accessibility', () => {
    it('has role="dialog"', () => {
      render(<M3Dialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(<M3Dialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('applies aria-describedby when provided', () => {
      render(<M3Dialog {...defaultProps} aria-describedby="desc-id" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'desc-id');
    });

    it('traps focus within dialog (Tab wraps from last to first)', async () => {
      const user = userEvent.setup();
      render(
        <M3Dialog
          {...defaultProps}
          actions={
            <>
              <button data-testid="btn1">First</button>
              <button data-testid="btn2">Second</button>
            </>
          }
        />
      );

      const btn1 = screen.getByTestId('btn1');
      const btn2 = screen.getByTestId('btn2');

      // Tab on last element should wrap to first
      btn2.focus();
      expect(document.activeElement).toBe(btn2);

      await user.tab();
      expect(document.activeElement).toBe(btn1);
    });

    it('accepts custom className', () => {
      render(<M3Dialog {...defaultProps} className="custom-class" data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('custom-class');
    });
  });

  describe('animation', () => {
    it('applies enter animation classes', () => {
      render(<M3Dialog {...defaultProps} data-testid="dialog-panel" />);
      const panel = screen.getByTestId('dialog-panel');
      expect(panel).toHaveClass('animate-in');
    });

    it('applies backdrop fade animation', () => {
      render(<M3Dialog {...defaultProps} />);
      const backdrop = screen.getByTestId('dialog-backdrop');
      expect(backdrop).toHaveClass('animate-in');
      expect(backdrop).toHaveClass('fade-in');
    });
  });
});
