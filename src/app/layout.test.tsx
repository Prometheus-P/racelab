// src/app/layout.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RootLayout, { metadata, resolveSiteUrl } from './layout';

// Mock next/navigation for Header component (useSearchParams)
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
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

    // Check for Header content
    const header = screen.getByRole('banner');
    expect(within(header).getByText(/KRace/i)).toBeInTheDocument();

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

    // Expect the Script component to have been called 4 times (2 for JSON-LD schemas + 2 for GA)
    expect(mockScript).toHaveBeenCalledTimes(4);

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

    // Should still have 2 Script calls for JSON-LD schemas
    expect(mockScript).toHaveBeenCalledTimes(2);

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

  it('falls back to canonical domain when NEXT_PUBLIC_SITE_URL lacks protocol', () => {
    expect(resolveSiteUrl('racelab.kr')).toBe('https://racelab.kr');
    expect(metadata.metadataBase).toEqual(new URL('https://racelab.kr'));
  });

  it('normalizes the site url before embedding JSON-LD structured data', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://racelab.kr/';

    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    const organizationSchemaCall = mockScript.mock.calls.find(
      ([props]) => props.id === 'organization-schema'
    )?.[0];

    const websiteSchemaCall = mockScript.mock.calls.find(
      ([props]) => props.id === 'website-schema'
    )?.[0];

    const organizationSchema = organizationSchemaCall
      ? JSON.parse(organizationSchemaCall.dangerouslySetInnerHTML?.__html || '{}')
      : {};

    const websiteSchema = websiteSchemaCall
      ? JSON.parse(websiteSchemaCall.dangerouslySetInnerHTML?.__html || '{}')
      : {};

    expect(organizationSchema.url).toBe('https://racelab.kr');
    expect(organizationSchema.logo).toBe('https://racelab.kr/icon.svg');
    expect(websiteSchema.url).toBe('https://racelab.kr');
    expect(websiteSchema.potentialAction?.target?.urlTemplate).toBe(
      'https://racelab.kr/?q={search_term_string}'
    );
  });
});
