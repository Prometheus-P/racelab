// src/app/layout.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RootLayout from './layout';

// Mock the Vercel Analytics component
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

describe('RootLayout', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should render Header, Footer, children, and Analytics', () => {
    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    // Check for Header content
    const header = screen.getByRole('banner');
    expect(within(header).getByText(/KRace/i)).toBeInTheDocument();

    // Check for Footer content
    expect(screen.getByText(/본 서비스는 정보 제공 목적이며/i)).toBeInTheDocument();

    // Check for children content
    expect(screen.getByText(/Main Content/i)).toBeInTheDocument();

    // Check for Vercel Analytics component
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
  });

  it('should render Google Analytics scripts when GA_ID is provided', () => {
    process.env.NEXT_PUBLIC_GA_ID = 'G-TEST12345';

    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    // Using querySelector to check for the scripts in the document head
    // as they don't have text content for react-testing-library to find easily.
    const gtagScript = document.querySelector('script[src="https://www.googletagmanager.com/gtag/js?id=G-TEST12345"]');
    expect(gtagScript).toBeInTheDocument();

    const inlineGtagScript = document.querySelector('script[id="google-analytics"]');
    expect(inlineGtagScript).toBeInTheDocument();
    expect(inlineGtagScript?.textContent).toContain("gtag('config', 'G-TEST12345')");
  });

  it('should not render Google Analytics scripts when GA_ID is not provided', () => {
    delete process.env.NEXT_PUBLIC_GA_ID;

    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    const gtagScript = document.querySelector('script[src*="googletagmanager"]');
    expect(gtagScript).not.toBeInTheDocument();
  });
});