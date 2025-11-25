// src/components/TodayRaces.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import TodayRaces from './TodayRaces'; // This file does not exist yet
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';
import { Race } from '@/types';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
  fetchCycleRaceSchedules: jest.fn(),
  fetchBoatRaceSchedules: jest.fn(),
}));

describe('TodayRaces Component', () => {
  const mockHorseRaces: Race[] = [
    { id: 'horse-1', type: 'horse', raceNo: 1, track: '서울', startTime: '11:30', distance: 1200, status: 'upcoming', entries: [] },
  ];
  const mockCycleRaces: Race[] = [
    { id: 'cycle-1', type: 'cycle', raceNo: 1, track: '광명', startTime: '11:00', distance: 1000, status: 'upcoming', entries: [] },
  ];
  const mockBoatRaces: Race[] = [
    { id: 'boat-1', type: 'boat', raceNo: 1, track: '미사리', startTime: '10:30', status: 'upcoming', entries: [] },
  ];

  beforeEach(() => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(mockHorseRaces);
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(mockCycleRaces);
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue(mockBoatRaces);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render race information grouped by type', async () => {
    const resolvedComponent = await TodayRaces();
    render(resolvedComponent);

    // Check for Horse Races section
    const horseSection = screen.getByTestId('race-section-horse');
    expect(horseSection).toBeInTheDocument();
    expect(within(horseSection).getByText('서울 제1경주')).toBeInTheDocument();
    expect(within(horseSection).getByText('11:30')).toBeInTheDocument();

    // Check for Cycle Races section
    const cycleSection = screen.getByTestId('race-section-cycle');
    expect(cycleSection).toBeInTheDocument();
    expect(within(cycleSection).getByText('광명 제1경주')).toBeInTheDocument();
    expect(within(cycleSection).getByText('11:00')).toBeInTheDocument();

    // Check for Boat Races section
    const boatSection = screen.getByTestId('race-section-boat');
    expect(boatSection).toBeInTheDocument();
    expect(within(boatSection).getByText('미사리 제1경주')).toBeInTheDocument();
    expect(within(boatSection).getByText('10:30')).toBeInTheDocument();
  });

  it('should render a message if no races are available', async () => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue([]);
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue([]);
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]);

    const resolvedComponent = await TodayRaces();
    render(resolvedComponent);

    expect(screen.getByText('오늘 예정된 경주가 없습니다.')).toBeInTheDocument();
  });
});
