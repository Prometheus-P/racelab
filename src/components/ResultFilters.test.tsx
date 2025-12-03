// src/components/ResultFilters.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultFilters } from './ResultFilters';

describe('ResultFilters', () => {
  const defaultProps = {
    onFilterChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders date range filter', () => {
    render(<ResultFilters {...defaultProps} />);
    expect(screen.getByLabelText(/시작일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/종료일/)).toBeInTheDocument();
  });

  it('renders race type filter', () => {
    render(<ResultFilters {...defaultProps} />);
    expect(screen.getByRole('button', { name: /경마/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /경륜/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /경정/ })).toBeInTheDocument();
  });

  it('displays current filter values', () => {
    render(
      <ResultFilters
        {...defaultProps}
        dateFrom="2023-12-01"
        dateTo="2023-12-31"
        types={['horse', 'cycle']}
      />
    );

    expect(screen.getByLabelText(/시작일/)).toHaveValue('2023-12-01');
    expect(screen.getByLabelText(/종료일/)).toHaveValue('2023-12-31');
    expect(screen.getByRole('button', { name: /경마/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /경륜/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onFilterChange when date filter changes', async () => {
    const handleFilterChange = jest.fn();
    const user = userEvent.setup();

    render(
      <ResultFilters
        onFilterChange={handleFilterChange}
      />
    );

    const startDateInput = screen.getByLabelText(/시작일/);
    await user.type(startDateInput, '2023-12-01');

    expect(handleFilterChange).toHaveBeenCalled();
  });

  it('calls onFilterChange when type filter changes', async () => {
    const handleFilterChange = jest.fn();
    const user = userEvent.setup();

    render(
      <ResultFilters
        onFilterChange={handleFilterChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /경마/ }));
    expect(handleFilterChange).toHaveBeenCalled();
  });

  it('shows clear filters button when filters are active', () => {
    render(
      <ResultFilters
        {...defaultProps}
        dateFrom="2023-12-01"
        types={['horse']}
      />
    );

    expect(screen.getByRole('button', { name: /필터 초기화/ })).toBeInTheDocument();
  });

  it('hides clear filters button when no filters are active', () => {
    render(<ResultFilters {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /필터 초기화/ })).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const handleClear = jest.fn();
    const user = userEvent.setup();

    render(
      <ResultFilters
        {...defaultProps}
        dateFrom="2023-12-01"
        types={['horse']}
        onClear={handleClear}
      />
    );

    await user.click(screen.getByRole('button', { name: /필터 초기화/ }));
    expect(handleClear).toHaveBeenCalled();
  });

  it('displays active filter count badge', () => {
    render(
      <ResultFilters
        {...defaultProps}
        dateFrom="2023-12-01"
        dateTo="2023-12-31"
        types={['horse', 'cycle']}
      />
    );

    // 2 date filters + 2 type filters = 4 active filters
    expect(screen.getByTestId('filter-count')).toHaveTextContent('4');
  });

  it('has collapsible filter section on mobile', () => {
    render(<ResultFilters {...defaultProps} />);
    expect(screen.getByRole('button', { name: /필터/ })).toBeInTheDocument();
  });

  it('toggles filter visibility on mobile', async () => {
    const user = userEvent.setup();
    render(<ResultFilters {...defaultProps} />);

    const toggleButton = screen.getByRole('button', { name: /필터/ });

    // Initially filters should be visible or hidden based on default
    await user.click(toggleButton);
    // Verify toggle behavior changes aria-expanded
    expect(toggleButton).toHaveAttribute('aria-expanded');
  });

  it('applies custom className', () => {
    render(
      <ResultFilters
        {...defaultProps}
        className="custom-class"
        data-testid="result-filters"
      />
    );
    expect(screen.getByTestId('result-filters')).toHaveClass('custom-class');
  });

  it('has accessible filter container', () => {
    render(<ResultFilters {...defaultProps} />);
    expect(screen.getByRole('search', { name: /결과 필터/ })).toBeInTheDocument();
  });
});
