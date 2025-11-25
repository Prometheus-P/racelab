// src/app/race/[id]/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import RaceDetailPage from './page';
import { fetchRaceById } from '@/lib/api'; // This function does not exist yet
import { Race } from '@/types';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'), // Keep other functions as they are
  fetchRaceById: jest.fn(),
}));

describe('RaceDetailPage', () => {
  const mockRace: Race = {
    id: 'horse-1-1-20240115',
    type: 'horse',
    raceNo: 1,
    track: '서울',
    startTime: '11:30',
    distance: 1200,
    grade: '국산5등급',
    status: 'upcoming',
    entries: [
      { no: 1, name: '말1', jockey: '기수1', trainer: '조교사1', age: 3, weight: 54, recentRecord: '1-2-3' },
      { no: 2, name: '말2', jockey: '기수2', trainer: '조교사2', age: 4, weight: 55, recentRecord: '4-5-6' },
    ],
  };

  beforeEach(() => {
    (fetchRaceById as jest.Mock).mockResolvedValue(mockRace);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render race details and entry list', async () => {
    // RaceDetailPage is a Server Component, so we await its result.
    const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
    render(resolvedPage);

    // Check for race header details
    expect(screen.getByText('서울 제1경주 (1200m)')).toBeInTheDocument();
    expect(screen.getByText('11:30')).toBeInTheDocument();
    expect(screen.getByText('국산5등급')).toBeInTheDocument();

    // Check for entry list
    const entry1 = screen.getByText('말1');
    expect(entry1).toBeInTheDocument();
    const entry2 = screen.getByText('말2');
    expect(entry2).toBeInTheDocument();
  });

  it('should render a "not found" message if race is not found', async () => {
    (fetchRaceById as jest.Mock).mockResolvedValue(null);

    const resolvedPage = await RaceDetailPage({ params: { id: 'invalid-id' } });
    render(resolvedPage);

    expect(screen.getByText('경주 정보를 찾을 수 없습니다.')).toBeInTheDocument();
  });
});
