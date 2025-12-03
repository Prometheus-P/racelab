// src/components/ResultSearch.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultSearch } from './ResultSearch';

describe('ResultSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders search input', () => {
    render(<ResultSearch />);
    expect(screen.getByRole('searchbox', { name: /기수.*검색|검색/ })).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<ResultSearch />);
    expect(screen.getByPlaceholderText(/기수.*이름|이름.*검색/)).toBeInTheDocument();
  });

  it('displays provided value', () => {
    render(<ResultSearch value="김기수" />);
    expect(screen.getByRole('searchbox')).toHaveValue('김기수');
  });

  it('debounces search input', async () => {
    const handleSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<ResultSearch onSearch={handleSearch} debounceMs={300} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '김기수');

    // Should not have called yet
    expect(handleSearch).not.toHaveBeenCalled();

    // Fast-forward timer
    jest.advanceTimersByTime(300);

    expect(handleSearch).toHaveBeenCalledWith('김기수');
  });

  it('calls onSearch immediately when Enter pressed', async () => {
    const handleSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<ResultSearch onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox');
    await user.type(input, '김기수{Enter}');

    expect(handleSearch).toHaveBeenCalledWith('김기수');
  });

  it('shows clear button when value is present', () => {
    render(<ResultSearch value="김기수" />);
    expect(screen.getByRole('button', { name: /지우기|초기화/ })).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<ResultSearch value="" />);
    expect(screen.queryByRole('button', { name: /지우기|초기화/ })).not.toBeInTheDocument();
  });

  it('clears input when clear button clicked', async () => {
    const handleSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<ResultSearch value="김기수" onSearch={handleSearch} />);

    await user.click(screen.getByRole('button', { name: /지우기|초기화/ }));

    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('has search icon', () => {
    render(<ResultSearch />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ResultSearch className="custom-class" data-testid="result-search" />);
    expect(screen.getByTestId('result-search')).toHaveClass('custom-class');
  });

  it('uses M3SearchBar styling', () => {
    render(<ResultSearch />);
    // Check for M3 styling - input has rounded-full class
    const input = screen.getByRole('searchbox');
    expect(input.className).toMatch(/rounded/);
  });

  it('has proper accessibility attributes', () => {
    render(<ResultSearch />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label');
  });
});
