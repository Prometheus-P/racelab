// src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Mock fetchTodayAllRaces with inline data (jest hoisting requires inline)
jest.mock('@/lib/api', () => ({
  fetchTodayAllRaces: jest.fn().mockResolvedValue({
    horse: [
      {
        id: 'horse-seoul-1-20241215',
        type: 'horse',
        track: '서울',
        raceNo: 1,
        date: '2024-12-15',
        startTime: '10:30',
        distance: 1200,
        status: 'scheduled',
        entries: [],
      },
    ],
    cycle: [],
    boat: [],
    status: { horse: 'OK', cycle: 'OK', boat: 'OK' },
  }),
}));

// Mock home-components schemas
jest.mock('./home-components', () => ({
  faqSchema: { '@context': 'https://schema.org', '@type': 'FAQPage' },
  howToSchema: { '@context': 'https://schema.org', '@type': 'HowTo' },
}));

describe('HomePage', () => {
  it('should render StatsRow and RaceTabs', async () => {
    // Render the async HomePage component
    const HomePageComponent = await HomePage({ searchParams: { tab: 'horse' } });
    render(HomePageComponent);

    // Check for page header with today's date
    expect(screen.getByText('오늘의 경주')).toBeInTheDocument();

    // Check for stats section (quick-stats testid)
    expect(screen.getByTestId('quick-stats')).toBeInTheDocument();

    // Check for race tabs (today-races testid)
    expect(screen.getByTestId('today-races')).toBeInTheDocument();

    // Check for tab labels from RACE_TYPES config (appears in both stats and tabs)
    expect(screen.getAllByText('경마').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('경륜').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('경정').length).toBeGreaterThanOrEqual(1);
  });

  it('should display race entry from fetched data', async () => {
    const HomePageComponent = await HomePage({ searchParams: { tab: 'horse' } });
    render(HomePageComponent);

    // Check for the mock race entry
    expect(screen.getByText(/서울 제1경주/)).toBeInTheDocument();
  });
});
