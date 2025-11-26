// src/components/TodayRaces.test.tsx
import { render, screen, within } from '@testing-library/react';
import TodayRaces from './TodayRaces';
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

  describe('Basic Rendering', () => {
    it('should render horse race information when filtered', async () => {
      const resolvedComponent = await TodayRaces({ filter: 'horse' });
      render(resolvedComponent);

      // Check for Horse Races section
      const horseSection = screen.getByTestId('race-section-horse');
      expect(horseSection).toBeInTheDocument();
      expect(within(horseSection).getByText('서울 제1경주')).toBeInTheDocument();
      expect(within(horseSection).getByText('11:30')).toBeInTheDocument();
    });

    it('should render cycle races when filtered', async () => {
      const resolvedComponent = await TodayRaces({ filter: 'cycle' });
      render(resolvedComponent);

      const cycleSection = screen.getByTestId('race-section-cycle');
      expect(cycleSection).toBeInTheDocument();
      expect(within(cycleSection).getByText('광명 제1경주')).toBeInTheDocument();
      expect(within(cycleSection).getByText('11:00')).toBeInTheDocument();
    });

    it('should render boat races when filtered', async () => {
      const resolvedComponent = await TodayRaces({ filter: 'boat' });
      render(resolvedComponent);

      const boatSection = screen.getByTestId('race-section-boat');
      expect(boatSection).toBeInTheDocument();
      expect(within(boatSection).getByText('미사리 제1경주')).toBeInTheDocument();
      expect(within(boatSection).getByText('10:30')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render styled empty state with icon when no races', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue([]);
      (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]);

      const resolvedComponent = await TodayRaces({ filter: 'horse' });
      render(resolvedComponent);

      expect(screen.getByText('오늘 예정된 경주가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('다음 경주 일정을 확인해 주세요')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', '경주 정보 없음');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-labelledby on sections', async () => {
      const resolvedComponent = await TodayRaces({});
      render(resolvedComponent);

      const horseSection = screen.getByTestId('race-section-horse');
      expect(horseSection).toHaveAttribute('aria-labelledby', 'section-heading-horse');
    });

    it('should have descriptive aria-labels on race links', async () => {
      const resolvedComponent = await TodayRaces({});
      render(resolvedComponent);

      const raceCard = screen.getAllByTestId('race-card')[0];
      expect(raceCard).toHaveAttribute(
        'aria-label',
        expect.stringContaining('서울 제1경주')
      );
      expect(raceCard).toHaveAttribute(
        'aria-label',
        expect.stringContaining('상세 정보 보기')
      );
    });

    it('should use semantic time element for start times', async () => {
      const resolvedComponent = await TodayRaces({});
      render(resolvedComponent);

      const timeElement = screen.getByText('11:30');
      expect(timeElement.tagName.toLowerCase()).toBe('time');
      expect(timeElement).toHaveAttribute('dateTime', '11:30');
    });

    it('should use list semantics for race items', async () => {
      const resolvedComponent = await TodayRaces({});
      render(resolvedComponent);

      const horseSection = screen.getByTestId('race-section-horse');
      const list = within(horseSection).getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply race type colors to sections', async () => {
      const resolvedComponent = await TodayRaces({});
      render(resolvedComponent);

      const horseHeading = screen.getByText('경마');
      expect(horseHeading.className).toContain('text-horse');

      const cycleHeading = screen.getByText('경륜');
      expect(cycleHeading.className).toContain('text-cycle');

      const boatHeading = screen.getByText('경정');
      expect(boatHeading.className).toContain('text-boat');
    });

    it('should have minimum touch target height on race cards', async () => {
      const resolvedComponent = await TodayRaces({});
      render(resolvedComponent);

      const raceCard = screen.getAllByTestId('race-card')[0];
      expect(raceCard.className).toContain('min-h-[56px]');
    });

    it('should have focus ring styles on race cards', async () => {
      const resolvedComponent = await TodayRaces({});
      render(resolvedComponent);

      const raceCard = screen.getAllByTestId('race-card')[0];
      expect(raceCard.className).toContain('focus:ring-2');
      expect(raceCard.className).toContain('focus:ring-offset-2');
    });
  });
});
