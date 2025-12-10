// src/components/common/ErrorComponent.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorComponent from './ErrorComponent';

describe('ErrorComponent', () => {
  describe('rendering', () => {
    it('should render error message', () => {
      render(<ErrorComponent message="공공데이터 API 오류가 발생했습니다" />);

      expect(screen.getByTestId('error-component')).toBeInTheDocument();
      expect(screen.getByText('공공데이터 API 오류가 발생했습니다')).toBeInTheDocument();
    });

    it('should render default error message when not provided', () => {
      render(<ErrorComponent />);

      expect(
        screen.getByText(/데이터를 불러오는 중 오류가 발생했습니다/)
      ).toBeInTheDocument();
    });

    it('should render error icon', () => {
      render(<ErrorComponent message="테스트 오류" />);

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('should render retry button when onRetry provided', () => {
      const mockRetry = jest.fn();
      render(<ErrorComponent message="테스트 오류" onRetry={mockRetry} />);

      expect(screen.getByRole('button', { name: /다시 시도/ })).toBeInTheDocument();
    });

    it('should not render retry button when onRetry not provided', () => {
      render(<ErrorComponent message="테스트 오류" />);

      expect(screen.queryByRole('button', { name: /다시 시도/ })).not.toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('should call onRetry when retry button clicked', () => {
      const mockRetry = jest.fn();
      render(<ErrorComponent message="테스트 오류" onRetry={mockRetry} />);

      fireEvent.click(screen.getByRole('button', { name: /다시 시도/ }));

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('variants', () => {
    it('should render inline variant', () => {
      render(<ErrorComponent message="테스트 오류" variant="inline" />);

      const container = screen.getByTestId('error-component');
      expect(container).toHaveClass('inline-flex');
    });

    it('should render card variant by default', () => {
      render(<ErrorComponent message="테스트 오류" />);

      const container = screen.getByTestId('error-component');
      expect(container).toHaveClass('rounded-lg');
    });
  });

  describe('API delay message', () => {
    it('should show API delay message for timeout errors', () => {
      render(<ErrorComponent message="timeout" showApiDelayHint />);

      expect(
        screen.getByText(/데이터 제공 기관.*지연/)
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have role alert', () => {
      render(<ErrorComponent message="테스트 오류" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
