// src/components/ui/M3Snackbar.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { M3Snackbar } from './M3Snackbar';

// Mock window.matchMedia for useReducedMotion hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

describe('M3Snackbar', () => {
  const defaultProps = {
    open: true,
    message: 'Test message',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('visibility', () => {
    it('renders when open is true', () => {
      render(<M3Snackbar {...defaultProps} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<M3Snackbar {...defaultProps} open={false} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays the message', () => {
      render(<M3Snackbar {...defaultProps} />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  describe('severity', () => {
    it('applies info styling by default', () => {
      render(<M3Snackbar {...defaultProps} data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('bg-inverse-surface');
    });

    it('applies success styling', () => {
      render(<M3Snackbar {...defaultProps} severity="success" data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('bg-green-800');
    });

    it('applies warning styling', () => {
      render(<M3Snackbar {...defaultProps} severity="warning" data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('bg-amber-800');
    });

    it('applies error styling', () => {
      render(<M3Snackbar {...defaultProps} severity="error" data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('bg-error');
    });

    it('renders info icon for info severity', () => {
      render(<M3Snackbar {...defaultProps} severity="info" />);
      expect(screen.getByTestId('snackbar-icon-info')).toBeInTheDocument();
    });

    it('renders check icon for success severity', () => {
      render(<M3Snackbar {...defaultProps} severity="success" />);
      expect(screen.getByTestId('snackbar-icon-success')).toBeInTheDocument();
    });

    it('renders warning icon for warning severity', () => {
      render(<M3Snackbar {...defaultProps} severity="warning" />);
      expect(screen.getByTestId('snackbar-icon-warning')).toBeInTheDocument();
    });

    it('renders error icon for error severity', () => {
      render(<M3Snackbar {...defaultProps} severity="error" />);
      expect(screen.getByTestId('snackbar-icon-error')).toBeInTheDocument();
    });
  });

  describe('auto-hide', () => {
    it('auto-hides after default duration (4000ms)', () => {
      const onClose = jest.fn();
      render(<M3Snackbar {...defaultProps} onClose={onClose} />);

      expect(onClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(4000);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('auto-hides after custom duration', () => {
      const onClose = jest.fn();
      render(<M3Snackbar {...defaultProps} onClose={onClose} autoHideDuration={2000} />);

      act(() => {
        jest.advanceTimersByTime(1999);
      });
      expect(onClose).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not auto-hide when autoHideDuration is 0', () => {
      const onClose = jest.fn();
      render(<M3Snackbar {...defaultProps} onClose={onClose} autoHideDuration={0} />);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('action', () => {
    it('renders action button when provided', () => {
      const action = <button>Undo</button>;
      render(<M3Snackbar {...defaultProps} action={action} />);
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('action button is clickable', async () => {
      jest.useRealTimers();
      const user = userEvent.setup();
      const handleAction = jest.fn();
      const action = <button onClick={handleAction}>Undo</button>;
      render(<M3Snackbar {...defaultProps} action={action} />);

      await user.click(screen.getByText('Undo'));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('position', () => {
    it('positions at bottom by default', () => {
      render(<M3Snackbar {...defaultProps} data-testid="snackbar" />);
      const container = screen.getByTestId('snackbar').parentElement;
      expect(container).toHaveClass('bottom-0');
    });

    it('positions at top when position="top"', () => {
      render(<M3Snackbar {...defaultProps} position="top" data-testid="snackbar" />);
      const container = screen.getByTestId('snackbar').parentElement;
      expect(container).toHaveClass('top-0');
    });
  });

  describe('M3 styling', () => {
    it('applies M3 rounded corners', () => {
      render(<M3Snackbar {...defaultProps} data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('rounded-m3');
    });

    it('applies M3 shadow', () => {
      render(<M3Snackbar {...defaultProps} data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('shadow-m3-3');
    });

    it('applies M3 typography', () => {
      render(<M3Snackbar {...defaultProps} data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('text-body-medium');
    });
  });

  describe('accessibility', () => {
    it('has role="alert"', () => {
      render(<M3Snackbar {...defaultProps} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="polite" for info/success', () => {
      render(<M3Snackbar {...defaultProps} severity="success" />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-live="assertive" for error/warning', () => {
      render(<M3Snackbar {...defaultProps} severity="error" />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    it('accepts custom className', () => {
      render(<M3Snackbar {...defaultProps} className="custom-class" data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('custom-class');
    });
  });

  describe('animation', () => {
    it('applies slide-in animation', () => {
      render(<M3Snackbar {...defaultProps} data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('animate-in');
    });

    it('applies bottom slide-in when position is bottom', () => {
      render(<M3Snackbar {...defaultProps} position="bottom" data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('slide-in-from-bottom-4');
    });

    it('applies top slide-in when position is top', () => {
      render(<M3Snackbar {...defaultProps} position="top" data-testid="snackbar" />);
      const snackbar = screen.getByTestId('snackbar');
      expect(snackbar).toHaveClass('slide-in-from-top-4');
    });
  });
});
