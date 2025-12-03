// src/components/RaceTypeFilter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RaceTypeFilter } from './RaceTypeFilter';

describe('RaceTypeFilter', () => {
  it('renders all three race type chips', () => {
    render(<RaceTypeFilter />);
    expect(screen.getByRole('button', { name: /경마/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /경륜/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /경정/ })).toBeInTheDocument();
  });

  it('shows horse chip as selected when horse type is selected', () => {
    render(<RaceTypeFilter selectedTypes={['horse']} />);
    const horseChip = screen.getByRole('button', { name: /경마/ });
    expect(horseChip).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows multiple chips as selected for multi-select', () => {
    render(<RaceTypeFilter selectedTypes={['horse', 'cycle']} />);

    expect(screen.getByRole('button', { name: /경마/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /경륜/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /경정/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with added type when unselected chip is clicked', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(
      <RaceTypeFilter
        selectedTypes={['horse']}
        onChange={handleChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /경륜/ }));
    expect(handleChange).toHaveBeenCalledWith(['horse', 'cycle']);
  });

  it('calls onChange with removed type when selected chip is clicked', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(
      <RaceTypeFilter
        selectedTypes={['horse', 'cycle']}
        onChange={handleChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /경마/ }));
    expect(handleChange).toHaveBeenCalledWith(['cycle']);
  });

  it('shows all chips as unselected when no types selected (all results)', () => {
    render(<RaceTypeFilter selectedTypes={[]} />);

    expect(screen.getByRole('button', { name: /경마/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /경륜/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /경정/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('applies horse color variant to horse chip', () => {
    render(<RaceTypeFilter selectedTypes={['horse']} />);
    const horseChip = screen.getByRole('button', { name: /경마/ });
    expect(horseChip).toHaveClass('bg-horse-container');
  });

  it('applies cycle color variant to cycle chip', () => {
    render(<RaceTypeFilter selectedTypes={['cycle']} />);
    const cycleChip = screen.getByRole('button', { name: /경륜/ });
    expect(cycleChip).toHaveClass('bg-cycle-container');
  });

  it('applies boat color variant to boat chip', () => {
    render(<RaceTypeFilter selectedTypes={['boat']} />);
    const boatChip = screen.getByRole('button', { name: /경정/ });
    expect(boatChip).toHaveClass('bg-boat-container');
  });

  it('displays race type icons', () => {
    render(<RaceTypeFilter />);
    expect(screen.getByText('🐎')).toBeInTheDocument();
    expect(screen.getByText('🚴')).toBeInTheDocument();
    expect(screen.getByText('🚤')).toBeInTheDocument();
  });

  it('has accessible group role', () => {
    render(<RaceTypeFilter />);
    expect(screen.getByRole('group', { name: /종목 필터/ })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<RaceTypeFilter className="custom-class" data-testid="type-filter" />);
    expect(screen.getByTestId('type-filter')).toHaveClass('custom-class');
  });
});
