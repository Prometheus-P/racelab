// src/app/layout.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RootLayout from './layout';

// Mock window.matchMedia for useReducedMotion hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock next/navigation for Header component (useSearchParams, usePathname, useRouter)
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the Vercel Analytics component
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

// Mock the next/script component
interface ScriptProps {
  src?: string;
  id?: string;
  children?: string;
  strategy?: string;
}

const mockScript = jest.fn();
jest.mock('next/script', () => {
  const MockScript = (props: ScriptProps) => {
    mockScript(props);
    return <script {...props} />;
  };
  MockScript.displayName = 'MockScript';
  return MockScript;
});

describe('RootLayout', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    mockScript.mockClear();
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

    // Check for Header content - RaceLabLogo component is rendered
    const header = screen.getByRole('banner');
    expect(within(header).getByTestId('racelab-logo')).toBeInTheDocument();

    // Check for Footer content
    expect(screen.getByText(/본 서비스는 정보 제공 목적입니다/i)).toBeInTheDocument();

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

    // Expect the Script component to have been called 5 times (3 for JSON-LD schemas + 2 for GA)
    expect(mockScript).toHaveBeenCalledTimes(5);

    // Check for JSON-LD Organization schema
    expect(mockScript).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'organization-schema',
        type: 'application/ld+json',
      })
    );

    // Check for JSON-LD WebSite schema
    expect(mockScript).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'website-schema',
        type: 'application/ld+json',
      })
    );

    // Check the props for GA gtag.js
    expect(mockScript).toHaveBeenCalledWith(
      expect.objectContaining({
        src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST12345',
      })
    );

    // Check the props for GA inline script
    expect(mockScript).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'google-analytics',
        children: expect.stringContaining("gtag('config', 'G-TEST12345')"),
      })
    );
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

    // Should still have 3 Script calls for JSON-LD schemas
    expect(mockScript).toHaveBeenCalledTimes(3);

    // Verify JSON-LD schemas are present
    expect(mockScript).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'organization-schema',
        type: 'application/ld+json',
      })
    );

    expect(mockScript).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'website-schema',
        type: 'application/ld+json',
      })
    );

    // Verify GA scripts are NOT present
    expect(mockScript).not.toHaveBeenCalledWith(
      expect.objectContaining({
        src: expect.stringContaining('googletagmanager'),
      })
    );
  });
});
