// src/components/ui/M3Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { M3Button } from './M3Button';

describe('M3Button', () => {
  describe('rendering', () => {
    it('renders button with label text', () => {
      render(<M3Button>Click me</M3Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders as button element by default', () => {
      render(<M3Button data-testid="btn">Label</M3Button>);
      expect(screen.getByTestId('btn').tagName).toBe('BUTTON');
    });
  });

  describe('variants', () => {
    it('applies filled variant styles by default', () => {
      render(<M3Button data-testid="btn">Filled</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('bg-primary');
      expect(btn).toHaveClass('text-on-primary');
    });

    it('applies outlined variant styles', () => {
      render(<M3Button variant="outlined" data-testid="btn">Outlined</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('border');
      expect(btn).toHaveClass('border-outline');
      expect(btn).toHaveClass('text-primary');
    });

    it('applies text variant styles', () => {
      render(<M3Button variant="text" data-testid="btn">Text</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('text-primary');
      expect(btn).not.toHaveClass('bg-primary');
    });

    it('applies elevated variant styles', () => {
      render(<M3Button variant="elevated" data-testid="btn">Elevated</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('bg-surface-container-low');
      expect(btn).toHaveClass('shadow-m3-1');
    });

    it('applies tonal variant styles', () => {
      render(<M3Button variant="tonal" data-testid="btn">Tonal</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('bg-secondary-container');
      expect(btn).toHaveClass('text-on-secondary-container');
    });
  });

  describe('sizes', () => {
    it('applies medium size by default', () => {
      render(<M3Button data-testid="btn">Medium</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('h-10');
      expect(btn).toHaveClass('px-6');
    });

    it('applies small size', () => {
      render(<M3Button size="sm" data-testid="btn">Small</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('h-8');
      expect(btn).toHaveClass('px-4');
    });

    it('applies large size', () => {
      render(<M3Button size="lg" data-testid="btn">Large</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('h-12');
      expect(btn).toHaveClass('px-8');
    });
  });

  describe('touch targets', () => {
    it('has minimum touch target size (48x48dp)', () => {
      render(<M3Button data-testid="btn">Touch</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('min-h-[48px]');
      expect(btn).toHaveClass('min-w-[48px]');
    });
  });

  describe('icons', () => {
    it('renders leading icon', () => {
      render(
        <M3Button leadingIcon={<span data-testid="icon">★</span>}>
          With Icon
        </M3Button>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders trailing icon', () => {
      render(
        <M3Button trailingIcon={<span data-testid="trailing">→</span>}>
          With Trailing
        </M3Button>
      );
      expect(screen.getByTestId('trailing')).toBeInTheDocument();
    });

    it('renders icon-only button correctly', () => {
      render(
        <M3Button iconOnly aria-label="Add item" data-testid="btn">
          <span data-testid="icon">+</span>
        </M3Button>
      );
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('rounded-full');
      expect(btn).toHaveClass('p-3');
    });
  });

  describe('interaction', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<M3Button onClick={handleClick}>Click</M3Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<M3Button onClick={handleClick} disabled>Disabled</M3Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('applies disabled styles', () => {
      render(<M3Button disabled data-testid="btn">Disabled</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass('opacity-38');
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when loading', () => {
      render(<M3Button loading data-testid="btn">Loading</M3Button>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<M3Button loading data-testid="btn">Loading</M3Button>);
      expect(screen.getByTestId('btn')).toBeDisabled();
    });
  });

  describe('full width', () => {
    it('applies full width when specified', () => {
      render(<M3Button fullWidth data-testid="btn">Full Width</M3Button>);
      expect(screen.getByTestId('btn')).toHaveClass('w-full');
    });
  });

  describe('accessibility', () => {
    it('supports aria-label', () => {
      render(<M3Button aria-label="Custom label">Icon</M3Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('has proper focus styles', () => {
      render(<M3Button data-testid="btn">Focus</M3Button>);
      const btn = screen.getByTestId('btn');
      expect(btn).toHaveClass('focus:outline-none');
      expect(btn).toHaveClass('focus:ring-2');
    });
  });

  describe('custom className', () => {
    it('accepts custom className', () => {
      render(<M3Button className="custom-class" data-testid="btn">Custom</M3Button>);
      expect(screen.getByTestId('btn')).toHaveClass('custom-class');
    });
  });

  describe('button type', () => {
    it('has type="button" by default', () => {
      render(<M3Button data-testid="btn">Button</M3Button>);
      expect(screen.getByTestId('btn')).toHaveAttribute('type', 'button');
    });

    it('supports type="submit"', () => {
      render(<M3Button type="submit" data-testid="btn">Submit</M3Button>);
      expect(screen.getByTestId('btn')).toHaveAttribute('type', 'submit');
    });
  });
});
