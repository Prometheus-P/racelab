/**
 * WinProbabilityGauge Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  WinProbabilityGauge,
  MiniProbability,
  ConfidenceIndicator,
} from '../WinProbabilityGauge';

describe('WinProbabilityGauge', () => {
  it('should render probability percentage', () => {
    render(<WinProbabilityGauge probability={25.5} data-testid="gauge" />);

    expect(screen.getByText('25.5%')).toBeInTheDocument();
  });

  it('should render with rank when provided', () => {
    render(<WinProbabilityGauge probability={30} rank={1} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should use correct color for high confidence', () => {
    const { container } = render(
      <WinProbabilityGauge probability={40} confidence="high" />
    );

    // Check that the progress circle has green stroke
    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-green-500');
  });

  it('should use correct color for medium confidence', () => {
    const { container } = render(
      <WinProbabilityGauge probability={25} confidence="medium" />
    );

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-yellow-500');
  });

  it('should use correct color for low confidence', () => {
    const { container } = render(
      <WinProbabilityGauge probability={10} confidence="low" />
    );

    const progressCircle = container.querySelectorAll('circle')[1];
    expect(progressCircle).toHaveClass('stroke-gray-400');
  });

  it('should respect custom size', () => {
    const { container } = render(
      <WinProbabilityGauge probability={50} size={100} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '100');
  });

  it('should clamp probability to 0-100', () => {
    render(<WinProbabilityGauge probability={150} />);
    // Should not crash and should display clamped value
    expect(screen.getByText('150.0%')).toBeInTheDocument();
  });
});

describe('MiniProbability', () => {
  it('should render probability as badge', () => {
    render(<MiniProbability probability={18.5} />);

    expect(screen.getByText('18.5%')).toBeInTheDocument();
  });

  it('should apply correct confidence styling', () => {
    const { container } = render(
      <MiniProbability probability={20} confidence="high" />
    );

    expect(container.firstChild).toHaveClass('bg-green-50');
    expect(container.firstChild).toHaveClass('text-green-600');
  });

  it('should have accessible label', () => {
    render(<MiniProbability probability={25} />);

    expect(screen.getByText('승률')).toBeInTheDocument();
  });
});

describe('ConfidenceIndicator', () => {
  it('should render 5 stars by default', () => {
    const { container } = render(<ConfidenceIndicator level={3} />);

    const stars = container.querySelectorAll('span[aria-hidden="true"]');
    expect(stars.length).toBe(5);
  });

  it('should fill correct number of stars', () => {
    const { container } = render(<ConfidenceIndicator level={3} />);

    const stars = container.querySelectorAll('span[aria-hidden="true"]');
    const filledStars = Array.from(stars).filter((star) =>
      star.classList.contains('text-yellow-400')
    );
    expect(filledStars.length).toBe(3);
  });

  it('should handle custom max value', () => {
    const { container } = render(<ConfidenceIndicator level={2} max={3} />);

    const stars = container.querySelectorAll('span[aria-hidden="true"]');
    expect(stars.length).toBe(3);
  });

  it('should have accessible aria-label', () => {
    render(<ConfidenceIndicator level={4} />);

    expect(screen.getByLabelText('신뢰도 4/5')).toBeInTheDocument();
  });

  it('should clamp level to valid range', () => {
    const { container } = render(<ConfidenceIndicator level={10} max={5} />);

    const filledStars = Array.from(
      container.querySelectorAll('span[aria-hidden="true"]')
    ).filter((star) => star.classList.contains('text-yellow-400'));
    expect(filledStars.length).toBe(5);
  });
});
