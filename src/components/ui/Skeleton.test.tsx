// src/components/ui/Skeleton.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  describe('rendering', () => {
    it('renders skeleton element', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('has shimmer animation class', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('animate-shimmer');
    });

    it('has accessible role', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-busy attribute', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('variants', () => {
    it('renders text variant by default', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('h-4');
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-m3-xs');
    });

    it('renders circular variant', () => {
      render(<Skeleton variant="circular" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-full');
    });

    it('renders rectangular variant', () => {
      render(<Skeleton variant="rectangular" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-m3-sm');
    });
  });

  describe('sizing', () => {
    it('accepts width prop', () => {
      render(<Skeleton width={200} data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '200px' });
    });

    it('accepts height prop', () => {
      render(<Skeleton height={100} data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ height: '100px' });
    });

    it('accepts string width', () => {
      render(<Skeleton width="50%" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '50%' });
    });

    it('has default width of 100%', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('w-full');
    });
  });

  describe('styling', () => {
    it('has background color for shimmer effect', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('bg-surface-container');
    });

    it('accepts custom className', () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('custom-class');
    });
  });

  describe('Skeleton.Text preset', () => {
    it('renders text line preset', () => {
      render(<Skeleton.Text data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('h-4');
    });

    it('accepts lines prop', () => {
      render(<Skeleton.Text lines={3} />);
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('Skeleton.Avatar preset', () => {
    it('renders circular avatar skeleton', () => {
      render(<Skeleton.Avatar data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-full');
    });

    it('applies size prop', () => {
      render(<Skeleton.Avatar size={48} data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveStyle({ width: '48px', height: '48px' });
    });
  });

  describe('Skeleton.Card preset', () => {
    it('renders card skeleton with padding', () => {
      render(<Skeleton.Card data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('p-4');
    });

    it('has card elevation', () => {
      render(<Skeleton.Card data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('shadow-m3-1');
    });
  });

  describe('animation control', () => {
    it('can disable animation', () => {
      render(<Skeleton animation={false} data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).not.toHaveClass('animate-shimmer');
    });
  });

  describe('accessibility', () => {
    it('has screen reader text', () => {
      render(<Skeleton />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('screen reader text is visually hidden', () => {
      render(<Skeleton />);
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
  });
});
