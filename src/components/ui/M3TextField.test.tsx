// src/components/ui/M3TextField.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { M3TextField } from './M3TextField';

describe('M3TextField', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      render(<M3TextField label="Name" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<M3TextField label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('applies filled variant by default', () => {
      render(<M3TextField label="Name" data-testid="field" />);
      const container = screen.getByTestId('field');
      expect(container).toHaveClass('bg-surface-container-highest');
    });

    it('applies outlined variant', () => {
      render(<M3TextField label="Name" variant="outlined" data-testid="field" />);
      const container = screen.getByTestId('field');
      expect(container).toHaveClass('border');
      expect(container).toHaveClass('border-outline');
    });
  });

  describe('input types', () => {
    it('supports text type by default', () => {
      render(<M3TextField label="Name" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('supports email type', () => {
      render(<M3TextField label="Email" type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('supports password type', () => {
      render(<M3TextField label="Password" type="password" />);
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('supports number type', () => {
      render(<M3TextField label="Amount" type="number" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });
  });

  describe('touch targets', () => {
    it('has minimum touch target height (48dp)', () => {
      render(<M3TextField label="Name" data-testid="field" />);
      const container = screen.getByTestId('field');
      expect(container).toHaveClass('min-h-[56px]');
    });
  });

  describe('helper text', () => {
    it('displays helper text when provided', () => {
      render(<M3TextField label="Name" helperText="Enter your full name" />);
      expect(screen.getByText('Enter your full name')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays error message', () => {
      render(<M3TextField label="Email" error="Invalid email format" />);
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('applies error styling when error is present', () => {
      render(<M3TextField label="Email" error="Invalid" data-testid="field" />);
      const container = screen.getByTestId('field');
      expect(container).toHaveClass('border-error');
    });

    it('marks input as invalid when error is present', () => {
      render(<M3TextField label="Email" error="Invalid" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('disabled state', () => {
    it('disables input when disabled', () => {
      render(<M3TextField label="Name" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<M3TextField label="Name" disabled data-testid="field" />);
      const container = screen.getByTestId('field');
      expect(container).toHaveClass('opacity-38');
    });
  });

  describe('required state', () => {
    it('marks input as required', () => {
      render(<M3TextField label="Name" required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('shows required indicator in label', () => {
      render(<M3TextField label="Name" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('renders leading icon', () => {
      render(<M3TextField label="Search" leadingIcon={<span data-testid="icon">🔍</span>} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders trailing icon', () => {
      render(<M3TextField label="Password" trailingIcon={<span data-testid="eye">👁</span>} />);
      expect(screen.getByTestId('eye')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onChange when typing', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<M3TextField label="Name" onChange={handleChange} />);
      await user.type(screen.getByRole('textbox'), 'John');

      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onFocus when focused', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();

      render(<M3TextField label="Name" onFocus={handleFocus} />);
      await user.click(screen.getByRole('textbox'));

      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur when blurred', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();

      render(<M3TextField label="Name" onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('controlled value', () => {
    it('displays controlled value', () => {
      render(<M3TextField label="Name" value="John Doe" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('John Doe');
    });
  });

  describe('placeholder', () => {
    it('shows placeholder when provided', () => {
      render(<M3TextField label="Name" placeholder="Enter name" />);
      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('associates label with input', () => {
      render(<M3TextField label="Username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName('Username');
    });

    it('has proper focus styles', () => {
      render(<M3TextField label="Name" data-testid="field" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none');
    });

    it('connects error message with aria-describedby', () => {
      render(<M3TextField label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('custom className', () => {
    it('accepts custom className', () => {
      render(<M3TextField label="Name" className="custom-class" data-testid="field" />);
      expect(screen.getByTestId('field')).toHaveClass('custom-class');
    });
  });
});
