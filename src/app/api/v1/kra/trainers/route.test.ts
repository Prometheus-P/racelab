/**
 * GET /api/v1/kra/trainers Route Tests
 *
 * 조교사 목록/랭킹 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchTrainerRanking: jest.fn(),
  searchTrainersByName: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchTrainerRanking = kraApi.fetchTrainerRanking as jest.MockedFunction<
  typeof kraApi.fetchTrainerRanking
>;
const mockSearchTrainersByName = kraApi.searchTrainersByName as jest.MockedFunction<
  typeof kraApi.searchTrainersByName
>;

// Sample mock data
const mockTrainers = [
  {
    id: '001',
    name: '박영수',
    nameEn: 'Park Young-su',
    meet: '1',
    meetName: '서울',
    part: 'A조',
    totalStarts: 300,
    totalWins: 60,
    totalSeconds: 50,
    totalThirds: 40,
    winRate: 20,
    placeRate: 50,
    recentStarts: 80,
    recentWins: 20,
    recentWinRate: 25,
    horseCount: 15,
  },
  {
    id: '002',
    name: '이순신',
    nameEn: 'Lee Soon-shin',
    meet: '1',
    meetName: '서울',
    part: 'B조',
    totalStarts: 400,
    totalWins: 120,
    totalSeconds: 80,
    totalThirds: 60,
    winRate: 30,
    placeRate: 65,
    recentStarts: 100,
    recentWins: 35,
    recentWinRate: 35,
    horseCount: 20,
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/trainers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ranking mode (default)', () => {
    it('should return trainer ranking with default limit', async () => {
      mockFetchTrainerRanking.mockResolvedValue(mockTrainers);

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(mockFetchTrainerRanking).toHaveBeenCalledWith(undefined, 20, undefined);
    });

    it('should respect limit parameter', async () => {
      mockFetchTrainerRanking.mockResolvedValue([mockTrainers[0]]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers?limit=1'));
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(mockFetchTrainerRanking).toHaveBeenCalledWith(undefined, 1, undefined);
    });

    it('should filter by meet parameter', async () => {
      mockFetchTrainerRanking.mockResolvedValue(mockTrainers);

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers?meet=1'));
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.meta.meet).toBe('1');
      expect(mockFetchTrainerRanking).toHaveBeenCalledWith('1', 20, undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchTrainerRanking.mockResolvedValue(mockTrainers);

      await GET(createRequest('http://localhost/api/v1/kra/trainers?date=2024-12-25'));

      expect(mockFetchTrainerRanking).toHaveBeenCalledWith(undefined, 20, '20241225');
    });
  });

  describe('Search mode', () => {
    it('should search trainers by name', async () => {
      mockSearchTrainersByName.mockResolvedValue([mockTrainers[0]]);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/trainers?search=박영수')
      );
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.meta.search).toBe('박영수');
      expect(mockSearchTrainersByName).toHaveBeenCalledWith('박영수', undefined);
      expect(mockFetchTrainerRanking).not.toHaveBeenCalled();
    });

    it('should limit search results', async () => {
      const manyTrainers = Array.from({ length: 10 }, (_, i) => ({
        ...mockTrainers[0],
        id: String(i),
      }));
      mockSearchTrainersByName.mockResolvedValue(manyTrainers);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/trainers?search=박&limit=5')
      );
      const data = await response.json();

      expect(data.data).toHaveLength(5);
    });
  });

  describe('Response structure', () => {
    it('should return correct meta information', async () => {
      mockFetchTrainerRanking.mockResolvedValue(mockTrainers);

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers'));
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('total', 2);
      expect(data.meta).toHaveProperty('meet', 'all');
      expect(data.meta).toHaveProperty('search', null);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchTrainerRanking.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
    });
  });
});
