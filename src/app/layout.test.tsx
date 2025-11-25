// src/app/layout.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import RootLayout from './layout';

// Mock the Vercel Analytics component
jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

describe('RootLayout', () => {
  it('should render Header, Footer, children, and Analytics', () => {
    render(
      <RootLayout>
        <main>
          <p>Main Content</p>
        </main>
      </RootLayout>
    );

    // Check for Header content, scoped to the header element
    const header = screen.getByRole('banner'); // The <header> tag has a default role of 'banner'
    const titleElement = within(header).getByText(/KRace/i);
    expect(titleElement).toBeInTheDocument();

    // Check for Footer content
    const disclaimerElement = screen.getByText(/본 서비스는 정보 제공 목적이며/i);
    expect(disclaimerElement).toBeInTheDocument();

    // Check for children content
    const childrenElement = screen.getByText(/Main Content/i);
    expect(childrenElement).toBeInTheDocument();

    // Check for Vercel Analytics component
    const analyticsElement = screen.getByTestId('vercel-analytics');
    expect(analyticsElement).toBeInTheDocument();
  });
});
