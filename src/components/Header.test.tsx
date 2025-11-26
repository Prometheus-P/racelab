// src/components/Header.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header'; // This file does not exist yet

// We need to set up Jest to handle CSS modules and other static assets if they are used.
// For now, we assume a simple component without complex imports.

describe('Header Component', () => {
  it('should display the project title and navigation links', () => {
    render(<Header />);

    // Check for the project title
    const titleElement = screen.getByText(/KRace/i);
    expect(titleElement).toBeInTheDocument();

    // Check for navigation links (using query parameters for tab navigation)
    const horseLink = screen.getByRole('link', { name: /경마/i });
    expect(horseLink).toBeInTheDocument();
    expect(horseLink).toHaveAttribute('href', '/?tab=horse');

    const cycleLink = screen.getByRole('link', { name: /경륜/i });
    expect(cycleLink).toBeInTheDocument();
    expect(cycleLink).toHaveAttribute('href', '/?tab=cycle');

    const boatLink = screen.getByRole('link', { name: /경정/i });
    expect(boatLink).toBeInTheDocument();
    expect(boatLink).toHaveAttribute('href', '/?tab=boat');
  });
});
