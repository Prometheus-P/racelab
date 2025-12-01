// src/components/StatusBadge.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  describe('Rendering', () => {
    it('should render live status with correct text', () => {
      render(<StatusBadge status="live" />);
      expect(screen.getByText('진행중')).toBeInTheDocument();
    });

    it('should render upcoming status with correct text', () => {
      render(<StatusBadge status="upcoming" />);
      expect(screen.getByText('예정')).toBeInTheDocument();
    });

    it('should render finished status with correct text', () => {
      render(<StatusBadge status="finished" />);
      expect(screen.getByText('완료')).toBeInTheDocument();
    });

    it('should render canceled status with correct text', () => {
      render(<StatusBadge status="canceled" />);
      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply status-badge base class', () => {
      render(<StatusBadge status="live" />);
      const badge = screen.getByText('진행중');
      expect(badge).toHaveClass('status-badge');
    });

    it('should apply status-live class for live status', () => {
      render(<StatusBadge status="live" />);
      const badge = screen.getByText('진행중');
      expect(badge).toHaveClass('status-live');
    });

    it('should apply status-upcoming class for upcoming status', () => {
      render(<StatusBadge status="upcoming" />);
      const badge = screen.getByText('예정');
      expect(badge).toHaveClass('status-upcoming');
    });

    it('should apply status-completed class for finished status', () => {
      render(<StatusBadge status="finished" />);
      const badge = screen.getByText('완료');
      expect(badge).toHaveClass('status-completed');
    });

    it('should apply status-cancelled class for canceled status', () => {
      render(<StatusBadge status="canceled" />);
      const badge = screen.getByText('취소');
      expect(badge).toHaveClass('status-cancelled');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for live races', () => {
      render(<StatusBadge status="live" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live="polite" for live status', () => {
      render(<StatusBadge status="live" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-live', 'polite');
    });

    it('should not have aria-live for non-live statuses', () => {
      render(<StatusBadge status="finished" />);
      const badge = screen.getByText('완료');
      expect(badge).not.toHaveAttribute('aria-live');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with base classes', () => {
      render(<StatusBadge status="live" className="custom-class" />);
      const badge = screen.getByText('진행중');
      expect(badge).toHaveClass('status-badge', 'status-live', 'custom-class');
    });
  });
});
