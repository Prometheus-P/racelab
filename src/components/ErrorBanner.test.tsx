// src/components/ErrorBanner.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBanner from './ErrorBanner';

describe('ErrorBanner', () => {
  it('should render with default message', () => {
    render(<ErrorBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('데이터 제공 시스템 지연 중입니다')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<ErrorBanner message="API 연결 실패" />);

    expect(screen.getByText('API 연결 실패')).toBeInTheDocument();
  });

  it('should not render when show is false', () => {
    render(<ErrorBanner show={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const mockRetry = jest.fn();
    render(<ErrorBanner onRetry={mockRetry} />);

    const retryButton = screen.getByRole('button', { name: '새로고침' });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorBanner />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ErrorBanner className="custom-class" />);

    expect(screen.getByTestId('error-banner')).toHaveClass('custom-class');
  });
});
