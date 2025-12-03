// src/components/DateRangeFilter.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangeFilter } from './DateRangeFilter';

describe('DateRangeFilter', () => {
  it('renders date range inputs', () => {
    render(<DateRangeFilter />);
    expect(screen.getByLabelText(/시작일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/종료일/)).toBeInTheDocument();
  });

  it('displays provided date values', () => {
    render(
      <DateRangeFilter
        dateFrom="2023-12-01"
        dateTo="2023-12-31"
      />
    );
    expect(screen.getByLabelText(/시작일/)).toHaveValue('2023-12-01');
    expect(screen.getByLabelText(/종료일/)).toHaveValue('2023-12-31');
  });

  it('calls onDateFromChange when start date is changed', async () => {
    const handleDateFromChange = jest.fn();
    const user = userEvent.setup();

    render(
      <DateRangeFilter
        onDateFromChange={handleDateFromChange}
      />
    );

    const startDateInput = screen.getByLabelText(/시작일/);
    await user.clear(startDateInput);
    await user.type(startDateInput, '2023-11-01');

    expect(handleDateFromChange).toHaveBeenCalled();
  });

  it('calls onDateToChange when end date is changed', async () => {
    const handleDateToChange = jest.fn();
    const user = userEvent.setup();

    render(
      <DateRangeFilter
        onDateToChange={handleDateToChange}
      />
    );

    const endDateInput = screen.getByLabelText(/종료일/);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2023-12-31');

    expect(handleDateToChange).toHaveBeenCalled();
  });

  it('prevents selecting end date before start date', () => {
    render(
      <DateRangeFilter
        dateFrom="2023-12-15"
      />
    );

    const endDateInput = screen.getByLabelText(/종료일/);
    expect(endDateInput).toHaveAttribute('min', '2023-12-15');
  });

  it('prevents selecting start date after end date', () => {
    render(
      <DateRangeFilter
        dateTo="2023-12-15"
      />
    );

    const startDateInput = screen.getByLabelText(/시작일/);
    expect(startDateInput).toHaveAttribute('max', '2023-12-15');
  });

  it('has proper accessibility labels', () => {
    render(<DateRangeFilter />);

    const startDate = screen.getByLabelText(/시작일/);
    const endDate = screen.getByLabelText(/종료일/);

    expect(startDate).toHaveAttribute('type', 'date');
    expect(endDate).toHaveAttribute('type', 'date');
  });

  it('applies custom className', () => {
    render(<DateRangeFilter className="custom-class" data-testid="date-filter" />);
    expect(screen.getByTestId('date-filter')).toHaveClass('custom-class');
  });

  it('has default max date as today', () => {
    const today = new Date().toISOString().split('T')[0];
    render(<DateRangeFilter />);

    const endDateInput = screen.getByLabelText(/종료일/);
    expect(endDateInput).toHaveAttribute('max', today);
  });
});
