// src/components/Footer.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer'; // This file does not exist yet

describe('Footer Component', () => {
  it('should display legal disclaimers and contact information', () => {
    render(<Footer />);

    // Check for the information disclaimer (separate lines in the actual component)
    const disclaimerElement = screen.getByText(/본 서비스는 정보 제공 목적입니다/i);
    expect(disclaimerElement).toBeInTheDocument();

    const bettingDisclaimerElement = screen.getByText(/베팅 결과를 보장하지 않습니다/i);
    expect(bettingDisclaimerElement).toBeInTheDocument();

    // Check for the gambling addiction help contact
    const helpElement = screen.getByText(/도박 문제 상담: 1336/i);
    expect(helpElement).toBeInTheDocument();
    
    // Check for the copyright and data source
    const copyrightElement = screen.getByText(/© 2024 KRace. 공공데이터포털 API 활용./i);
    expect(copyrightElement).toBeInTheDocument();
  });
});
