// src/app/race/[id]/page.test.tsx
import { render, screen, within } from '@testing-library/react';
import RaceDetailPage, { generateMetadata } from './page';
import { fetchRaceById } from '@/lib/api';
import { Race } from '@/types';
import type { ResolvingMetadata } from 'next';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
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
      { no: 1, name: '말1', jockey: '기수1', trainer: '조교사1', age: 3, weight: 54, recentRecord: '1-2-3', odds: 2.5 },
      { no: 2, name: '말2', jockey: '기수2', trainer: '조교사2', age: 4, weight: 55, recentRecord: '4-5-6', odds: 3.0 },
    ],
  };

  beforeEach(() => {
    (fetchRaceById as jest.Mock).mockResolvedValue(mockRace);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render race details and entry list', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      // Check for race header details (using getByRole for h1)
      expect(screen.getByRole('heading', { level: 1, name: /서울 제1경주/ })).toBeInTheDocument();
      expect(screen.getByText('11:30')).toBeInTheDocument();
      expect(screen.getByText('국산5등급')).toBeInTheDocument();

      // Check for entry list (appears in both desktop table and mobile cards)
      expect(screen.getAllByText('말1').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('말2').length).toBeGreaterThanOrEqual(1);
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

      expect(screen.getByText('경마')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic time element for start time', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      const timeElement = screen.getByText('11:30');
      expect(timeElement.tagName.toLowerCase()).toBe('time');
      expect(timeElement).toHaveAttribute('dateTime', '11:30');
    });

    it('should have aria-labelledby on entries section', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      const entriesSection = screen.getByTestId('entries');
      expect(entriesSection).toHaveAttribute('aria-labelledby', 'entries-heading');
    });

    it('should have table caption for screen readers', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      const caption = screen.getByText(/서울 제1경주 출전표/);
      expect(caption).toBeInTheDocument();
    });

    it('should have scope attributes on table headers', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });

  describe('Not Found State', () => {
    it('should render styled not found message if race is not found', async () => {
      (fetchRaceById as jest.Mock).mockResolvedValue(null);

      const resolvedPage = await RaceDetailPage({ params: { id: 'invalid-id' } });
      render(resolvedPage);

      expect(screen.getByText('경주 정보를 찾을 수 없습니다')).toBeInTheDocument();
      expect(screen.getByText(/존재하지 않거나 삭제/)).toBeInTheDocument();
    });

    it('should render home link in not found state', async () => {
      (fetchRaceById as jest.Mock).mockResolvedValue(null);

      const resolvedPage = await RaceDetailPage({ params: { id: 'invalid-id' } });
      render(resolvedPage);

      const homeLink = screen.getByRole('link', { name: /홈으로 돌아가기/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Odds Section', () => {
    it('should display odds with unit indicator', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      const oddsSection = screen.getByTestId('odds');
      // Check for "배" unit indicator
      expect(within(oddsSection).getAllByText('배').length).toBeGreaterThan(0);
    });

    it('should have aria-label on odds cards', async () => {
      const resolvedPage = await RaceDetailPage({ params: { id: 'horse-1-1-20240115' } });
      render(resolvedPage);

      const oddsSection = screen.getByTestId('odds');
      const oddsCards = within(oddsSection).getAllByRole('article');
      expect(oddsCards[0]).toHaveAttribute('aria-label', expect.stringContaining('배당률'));
    });
  });

  describe('generateMetadata', () => {
    // Mock parent metadata as required by generateMetadata signature
    const mockParent = Promise.resolve({}) as ResolvingMetadata;

    it('should generate correct metadata for a race', async () => {
      const metadata = await generateMetadata({ params: { id: 'horse-1-1-20240115' } }, mockParent);

      expect(metadata.title).toBe('서울 제1경주 - KRace');
      expect(metadata.description).toContain('서울 제1경주 경마 상세 정보');
    });

    it('should generate default metadata if race is not found', async () => {
      (fetchRaceById as jest.Mock).mockResolvedValue(null);

      const metadata = await generateMetadata({ params: { id: 'invalid-id' } }, mockParent);

      expect(metadata.title).toBe('경주 정보 - KRace');
    });
  });
});