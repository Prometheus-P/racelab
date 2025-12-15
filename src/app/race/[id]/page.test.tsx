// src/app/race/[id]/page.test.tsx
import { render, screen } from '@testing-library/react';
import RaceDetailPage, { generateMetadata } from './page';
import { fetchRaceByIdWithStatus } from '@/lib/api';
import { Race, RaceFetchResult } from '@/types';
import type { ResolvingMetadata } from 'next';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  fetchRaceByIdWithStatus: jest.fn(),
}));

describe('RaceDetailPage', () => {
  const mockRace: Race = {
    id: 'horse-1-1-20240115',
    type: 'horse',
    raceNo: 1,
    track: '서울',
    date: '2024-01-15',
    startTime: '11:30',
    distance: 1200,
    status: 'upcoming',
    entries: [
      {
        no: 1,
        name: '말1',
        jockey: '기수1',
        odds: 2.5,
      },
      {
        no: 2,
        name: '말2',
        jockey: '기수2',
        odds: 3.0,
      },
    ],
  };

  beforeEach(() => {
    // Return RaceFetchResult with OK status
    const mockResult: RaceFetchResult<Race> = {
      status: 'OK',
      data: mockRace,
    };
    (fetchRaceByIdWithStatus as jest.Mock).mockResolvedValue(mockResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render race details', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      // Check for race header details
      expect(screen.getByRole('heading', { level: 1, name: /서울 제1경주/ })).toBeInTheDocument();
      expect(screen.getAllByText(/1200m/).length).toBeGreaterThanOrEqual(1);
    });

    it('should render back navigation link', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      const backLink = screen.getByRole('link', { name: /경마 목록으로/i });
      expect(backLink).toHaveAttribute('href', '/?tab=horse');
    });

    it('should render race type badge', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      expect(screen.getByText('🐎 경마')).toBeInTheDocument();
    });

    it('should render entry list when entries exist', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      // Check for entry names
      expect(screen.getByText('말1')).toBeInTheDocument();
      expect(screen.getByText('말2')).toBeInTheDocument();
      // Check for jockey names
      expect(screen.getByText('기수1')).toBeInTheDocument();
      expect(screen.getByText('기수2')).toBeInTheDocument();
    });

    it('should display odds values', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      // Check for odds values displayed (formatted with 배)
      expect(screen.getByText('2.5배')).toBeInTheDocument();
      expect(screen.getByText('3.0배')).toBeInTheDocument();
    });
  });

  describe('Not Found State', () => {
    it('should render styled not found message if race is not found', async () => {
      const notFoundResult: RaceFetchResult<Race> = {
        status: 'NOT_FOUND',
        data: null,
      };
      (fetchRaceByIdWithStatus as jest.Mock).mockResolvedValue(notFoundResult);

      const resolvedPage = await RaceDetailPage({ params: { id: 'invalid-id' } });
      render(resolvedPage);

      expect(screen.getByText('경주 정보를 찾을 수 없습니다')).toBeInTheDocument();
      expect(screen.getByText(/존재하지 않거나 삭제/)).toBeInTheDocument();
    });

    it('should render home link in not found state', async () => {
      const notFoundResult: RaceFetchResult<Race> = {
        status: 'NOT_FOUND',
        data: null,
      };
      (fetchRaceByIdWithStatus as jest.Mock).mockResolvedValue(notFoundResult);

      const resolvedPage = await RaceDetailPage({ params: { id: 'invalid-id' } });
      render(resolvedPage);

      const homeLink = screen.getByRole('link', { name: /홈으로 돌아가기/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Error State', () => {
    it('should show error banner on upstream error', async () => {
      const errorResult: RaceFetchResult<Race> = {
        status: 'UPSTREAM_ERROR',
        data: mockRace, // Still has partial data
        error: 'API timeout',
      };
      (fetchRaceByIdWithStatus as jest.Mock).mockResolvedValue(errorResult);

      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      // Error banner should be visible
      expect(screen.getByText(/데이터 제공 시스템 지연/)).toBeInTheDocument();
      // But race data should still be shown
      expect(screen.getByRole('heading', { level: 1, name: /서울 제1경주/ })).toBeInTheDocument();
    });
  });

  describe('generateMetadata', () => {
    // Mock parent metadata as required by generateMetadata signature
    const mockParent = Promise.resolve({}) as ResolvingMetadata;

    it('should generate correct metadata for a race', async () => {
      const metadata = await generateMetadata({ params: { id: 'horse-1-1-20240115' } }, mockParent);

      expect(metadata.title).toContain('서울 제1경주');
      expect(metadata.title).toContain('RaceLab');
    });

    it('should generate default metadata if race is not found', async () => {
      const notFoundResult: RaceFetchResult<Race> = {
        status: 'NOT_FOUND',
        data: null,
      };
      (fetchRaceByIdWithStatus as jest.Mock).mockResolvedValue(notFoundResult);

      const metadata = await generateMetadata({ params: { id: 'invalid-id' } }, mockParent);

      expect(metadata.title).toBe('경주 정보 - RaceLab');
    });
  });
});
