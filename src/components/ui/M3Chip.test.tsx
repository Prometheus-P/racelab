// src/components/ui/M3Chip.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { M3Chip } from './M3Chip';

describe('M3Chip', () => {
  it('renders label text', () => {
    render(<M3Chip label="Horse" />);
    expect(screen.getByText('Horse')).toBeInTheDocument();
  });

  it('renders as filter chip by default', () => {
    render(<M3Chip label="Filter" data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('rounded-m3-sm');
  });

  it('shows selected state correctly', () => {
    render(<M3Chip label="Selected" selected data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows unselected state correctly', () => {
    render(<M3Chip label="Unselected" selected={false} data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<M3Chip label="Clickable" onClick={handleClick} />);
    await user.click(screen.getByText('Clickable'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies race type color variant for horse when selected', () => {
    render(<M3Chip label="Horse" colorVariant="horse" selected data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('bg-horse-container');
  });

  it('applies race type color variant for cycle when selected', () => {
    render(<M3Chip label="Cycle" colorVariant="cycle" selected data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('bg-cycle-container');
  });

  it('applies race type color variant for boat when selected', () => {
    render(<M3Chip label="Boat" colorVariant="boat" selected data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('bg-boat-container');
  });

  it('renders leading icon when provided', () => {
    render(<M3Chip label="With Icon" leadingIcon={<span data-testid="icon">🐎</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('has proper touch target size (min 48px width)', () => {
    render(<M3Chip label="Touch" data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('min-w-[48px]');
  });

  it('has extended touch area for vertical tapping', () => {
    render(<M3Chip label="Touch" data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('relative');
    // Check for the extended touch area span
    const touchArea = chip.querySelector('[aria-hidden="true"]');
    expect(touchArea).toBeInTheDocument();
  });

  it('has proper padding for label text', () => {
    render(<M3Chip label="Padded" data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('px-4');
  });

  it('is disabled when disabled prop is true', () => {
    render(<M3Chip label="Disabled" disabled data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toBeDisabled();
  });

  it('accepts custom className', () => {
    render(<M3Chip label="Custom" className="custom-class" data-testid="chip" />);
    const chip = screen.getByTestId('chip');
    expect(chip).toHaveClass('custom-class');
  });
});
