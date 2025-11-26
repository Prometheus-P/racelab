// src/components/QuickStats.test.tsx
import { render, screen } from '@testing-library/react';
import QuickStats from './QuickStats'; // This file does not exist yet
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
  fetchCycleRaceSchedules: jest.fn(),
  fetchBoatRaceSchedules: jest.fn(),
}));

describe('QuickStats Component', () => {
  beforeEach(() => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(new Array(5));
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(new Array(3));
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue(new Array(2));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the total number of races for each category', async () => {
    // QuickStats is a Server Component, so we need to handle its async nature
    const resolvedComponent = await QuickStats();
    render(resolvedComponent);

    // Check for the labels and corresponding numbers
    const totalRacesLabel = screen.getByText('총 경주');
    const totalRacesValue = screen.getByText('10'); // 5 + 3 + 2
    expect(totalRacesLabel).toBeInTheDocument();
    expect(totalRacesValue).toBeInTheDocument();

    const horseRacesLabel = screen.getByText('경마');
    const horseRacesValue = screen.getByText('5');
    expect(horseRacesLabel).toBeInTheDocument();
    expect(horseRacesValue).toBeInTheDocument();

    const cycleRacesLabel = screen.getByText('경륜');
    const cycleRacesValue = screen.getByText('3');
    expect(cycleRacesLabel).toBeInTheDocument();
    expect(cycleRacesValue).toBeInTheDocument();

    const boatRacesLabel = screen.getByText('경정');
    const boatRacesValue = screen.getByText('2');
    expect(boatRacesLabel).toBeInTheDocument();
    expect(boatRacesValue).toBeInTheDocument();
  });
});
