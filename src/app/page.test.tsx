// src/app/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from './page';
import { TodayRacesData } from '@/types';

// Mock the fetchTodayAllRaces function
jest.mock('@/lib/api', () => ({
  fetchTodayAllRaces: jest.fn().mockResolvedValue({
    horse: [],
    cycle: [],
    boat: [],
    status: { horse: 'OK', cycle: 'OK', boat: 'OK' },
  }),
}));

// Mock the child Server Components
jest.mock('@/components/QuickStats', () => {
  return function DummyQuickStats({ data }: { data: TodayRacesData }) {
    return (
      <div>
        <span>총 경주</span>
        <span>{data.horse.length + data.cycle.length + data.boat.length}</span>
      </div>
    );
  };
});

jest.mock('@/components/TodayRaces', () => {
  return function DummyTodayRaces() {
    return (
      <div>
        <p>서울 제1경주</p>
        <p>광명 제1경주</p>
        <p>미사리 제1경주</p>
      </div>
    );
  };
});

describe('HomePage', () => {
  it('should render QuickStats and TodayRaces components', async () => {
    // Render the async HomePage component
    const HomePageComponent = await HomePage({ searchParams: { tab: 'horse' } });
    render(HomePageComponent);

    // Check for content from the mocked QuickStats
    expect(screen.getByText('총 경주')).toBeInTheDocument();

    // Check for content from the mocked TodayRaces
    expect(screen.getByText('서울 제1경주')).toBeInTheDocument();
    expect(screen.getByText('광명 제1경주')).toBeInTheDocument();
    expect(screen.getByText('미사리 제1경주')).toBeInTheDocument();
  });
});
