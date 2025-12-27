// src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import LandingPage from './page';

// Mock next/dynamic to return the component immediately
jest.mock('next/dynamic', () => {
  return function dynamic(_importFn: () => Promise<{ DemoTerminal: React.ComponentType }>) {
    // Return a mock component that renders immediately
    return function DynamicComponent() {
      return <div data-testid="demo-terminal">Demo Terminal</div>;
    };
  };
});

// Mock the landing components
jest.mock('@/components/landing', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
  DemoTerminal: () => <div data-testid="demo-terminal">Demo Terminal</div>,
  FeaturesSection: () => <div data-testid="features-section">Features Section</div>,
  CTASection: () => <div data-testid="cta-section">CTA Section</div>,
  SocialProofSection: () => <div data-testid="social-proof-section">Social Proof</div>,
  LeadMagnetSection: () => <div data-testid="lead-magnet-section">Lead Magnet</div>,
  LiveTicker: () => <div data-testid="live-ticker">Live Ticker</div>,
  TodayPicksSection: () => <div data-testid="today-picks-section">Today Picks</div>,
  PricingPreview: () => <div data-testid="pricing-preview">Pricing Preview</div>,
  BeforeAfterSection: () => <div data-testid="before-after-section">Before After</div>,
}));

describe('LandingPage', () => {
  it('should render all landing sections', () => {
    render(<LandingPage />);

    // Check for all landing page sections
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('live-ticker')).toBeInTheDocument();
    expect(screen.getByTestId('today-picks-section')).toBeInTheDocument();
    expect(screen.getByTestId('demo-terminal')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-preview')).toBeInTheDocument();
    expect(screen.getByTestId('before-after-section')).toBeInTheDocument();
    expect(screen.getByTestId('social-proof-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('lead-magnet-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
  });

  it('should have demo section with id for anchor links', () => {
    render(<LandingPage />);

    const demoSection = screen.getByTestId('demo-terminal').closest('section');
    expect(demoSection).toHaveAttribute('id', 'demo');
  });
});
