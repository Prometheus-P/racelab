/**
 * PredictionCard Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PredictionCard, PredictionCardSkeleton } from '../PredictionCard';
import type { HorsePrediction } from '@/types/prediction';

const createMockPrediction = (
  overrides: Partial<HorsePrediction> = {}
): HorsePrediction => ({
  entryNo: 1,
  horseName: '테스트마',
  winProbability: 25.5,
  placeProbability: 45.0,
  expectedPosition: 2.1,
  totalScore: 78.5,
  confidence: 0.85,
  confidenceLevel: 'high',
  predictedRank: 1,
  recommendation: {
    action: 'strong_bet',
    betType: 'win',
    reasoning: ['높은 레이팅과 우수한 최근 폼'],
  },
  factors: [],
  scoreBreakdown: {
    trackConditionScore: 75,
    gatePositionScore: 68,
    distanceFitScore: 82,
    fieldSizeScore: 60,
    surfaceScore: 70,
    ratingScore: 85,
    formScore: 80,
    burdenFitScore: 72,
    distancePreferenceScore: 78,
    jockeyScore: 75,
    trainerScore: 70,
    comboSynergyScore: 65,
    bloodlineScore: 68,
    externalTotal: 35,
    internalTotal: 55,
  },
  ...overrides,
});

describe('PredictionCard', () => {
  it('should render horse name and entry number', () => {
    const prediction = createMockPrediction();
    render(<PredictionCard prediction={prediction} />);

    expect(screen.getByText('테스트마')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display predicted rank', () => {
    const prediction = createMockPrediction({ predictedRank: 2 });
    render(<PredictionCard prediction={prediction} />);

    expect(screen.getByText('예상 순위 2위')).toBeInTheDocument();
  });

  it('should display recommendation badge', () => {
    const prediction = createMockPrediction({
      recommendation: { action: 'strong_bet', reasoning: [] },
    });
    render(<PredictionCard prediction={prediction} />);

    expect(screen.getByText('강력 추천')).toBeInTheDocument();
  });

  it('should display total score', () => {
    const prediction = createMockPrediction({ totalScore: 78.5 });
    render(<PredictionCard prediction={prediction} />);

    expect(screen.getByText('78.5점')).toBeInTheDocument();
  });

  it('should display recommendation reasoning', () => {
    const prediction = createMockPrediction({
      recommendation: {
        action: 'bet',
        reasoning: ['안정적인 성적 유지'],
      },
    });
    render(<PredictionCard prediction={prediction} />);

    expect(screen.getByText('안정적인 성적 유지')).toBeInTheDocument();
  });

  it('should show details when showDetails is true', () => {
    const prediction = createMockPrediction();
    render(<PredictionCard prediction={prediction} showDetails />);

    expect(screen.getByText('레이팅')).toBeInTheDocument();
    expect(screen.getByText('기수')).toBeInTheDocument();
    expect(screen.getByText('조교사')).toBeInTheDocument();
  });

  it('should not show details by default', () => {
    const prediction = createMockPrediction();
    render(<PredictionCard prediction={prediction} />);

    expect(screen.queryByText('레이팅')).not.toBeInTheDocument();
  });

  it('should be clickable when onClick is provided', () => {
    const handleClick = jest.fn();
    const prediction = createMockPrediction();
    render(<PredictionCard prediction={prediction} onClick={handleClick} />);

    fireEvent.click(screen.getByText('테스트마'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should display value analysis when available', () => {
    const prediction = createMockPrediction({
      valueAnalysis: {
        impliedProbability: 0.2,
        modelProbability: 0.255,
        edge: 0.055,
        kellyFraction: 0.12,
        isValue: true,
      },
    });
    render(<PredictionCard prediction={prediction} />);

    expect(screen.getByText('엣지')).toBeInTheDocument();
    expect(screen.getByText('+5.5%')).toBeInTheDocument();
  });

  it('should show negative edge in red', () => {
    const prediction = createMockPrediction({
      valueAnalysis: {
        impliedProbability: 0.3,
        modelProbability: 0.255,
        edge: -0.045,
        kellyFraction: 0,
        isValue: false,
      },
    });
    const { container } = render(<PredictionCard prediction={prediction} />);

    const edgeValue = screen.getByText('-4.5%');
    expect(edgeValue).toHaveClass('text-red-500');
  });

  it('should render different action badges correctly', () => {
    const actions = [
      { action: 'strong_bet', label: '강력 추천' },
      { action: 'bet', label: '추천' },
      { action: 'consider', label: '검토' },
      { action: 'avoid', label: '패스' },
    ] as const;

    for (const { action, label } of actions) {
      const prediction = createMockPrediction({
        recommendation: { action, reasoning: [] },
      });
      const { unmount } = render(<PredictionCard prediction={prediction} />);

      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});

describe('PredictionCardSkeleton', () => {
  it('should render skeleton elements', () => {
    const { container } = render(<PredictionCardSkeleton />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should have skeleton shapes', () => {
    const { container } = render(<PredictionCardSkeleton />);

    // Check for skeleton shapes
    const skeletonElements = container.querySelectorAll('.bg-gray-200, .bg-gray-100');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
