// src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import LandingPage from './page';

// Mock the landing components
jest.mock('@/components/landing', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  DemoTerminal: () => <div data-testid="demo-terminal">Demo Terminal</div>,
  FeaturesSection: () => <div data-testid="features-section">Features Section</div>,
  CTASection: () => <div data-testid="cta-section">CTA Section</div>,
}));

describe('LandingPage', () => {
  it('should render all landing sections', () => {
    render(<LandingPage />);

    // Check for all landing page sections
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('demo-terminal')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
  });

  it('should have demo section with id for anchor links', () => {
    render(<LandingPage />);

    const demoSection = screen.getByTestId('demo-terminal').closest('section');
    expect(demoSection).toHaveAttribute('id', 'demo');
  });
});
