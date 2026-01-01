/**
 * GET /api/v1/kra/jockeys Route Tests
 *
 * 기수 목록/랭킹 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchJockeyRanking: jest.fn(),
  searchJockeysByName: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchJockeyRanking = kraApi.fetchJockeyRanking as jest.MockedFunction<
  typeof kraApi.fetchJockeyRanking
>;
const mockSearchJockeysByName = kraApi.searchJockeysByName as jest.MockedFunction<
  typeof kraApi.searchJockeysByName
>;

// Sample mock data
const mockJockeys = [
  {
    id: '001',
    name: '홍길동',
    meet: '1',
    meetName: '서울',
    part: 'A조',
    totalStarts: 500,
    totalWins: 100,
    totalSeconds: 80,
    totalThirds: 60,
    totalPlaces: 240,
    winRate: 20,
    placeRate: 48,
    recentStarts: 100,
    recentWins: 25,
    recentSeconds: 20,
    recentThirds: 15,
    recentPlaces: 60,
    recentWinRate: 25,
    recentPlaceRate: 60,
  },
  {
    id: '002',
    name: '김철수',
    meet: '1',
    meetName: '서울',
    part: 'B조',
    totalStarts: 300,
    totalWins: 90,
    totalSeconds: 50,
    totalThirds: 40,
    totalPlaces: 180,
    winRate: 30,
    placeRate: 60,
    recentStarts: 80,
    recentWins: 30,
    recentSeconds: 15,
    recentThirds: 10,
    recentPlaces: 55,
    recentWinRate: 37.5,
    recentPlaceRate: 68.75,
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/jockeys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ranking mode (default)', () => {
    it('should return jockey ranking with default limit', async () => {
      mockFetchJockeyRanking.mockResolvedValue(mockJockeys);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(mockFetchJockeyRanking).toHaveBeenCalledWith(undefined, 20, undefined);
    });

    it('should respect limit parameter', async () => {
      mockFetchJockeyRanking.mockResolvedValue([mockJockeys[0]]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys?limit=1'));
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(mockFetchJockeyRanking).toHaveBeenCalledWith(undefined, 1, undefined);
    });

    it('should filter by meet parameter', async () => {
      mockFetchJockeyRanking.mockResolvedValue(mockJockeys);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys?meet=1'));
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.meta.meet).toBe('1');
      expect(mockFetchJockeyRanking).toHaveBeenCalledWith('1', 20, undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchJockeyRanking.mockResolvedValue(mockJockeys);

      await GET(
        createRequest('http://localhost/api/v1/kra/jockeys?date=2024-12-25')
      );

      expect(mockFetchJockeyRanking).toHaveBeenCalledWith(undefined, 20, '20241225');
    });
  });

  describe('Search mode', () => {
    it('should search jockeys by name', async () => {
      mockSearchJockeysByName.mockResolvedValue([mockJockeys[0]]);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/jockeys?search=홍길동')
      );
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.meta.search).toBe('홍길동');
      expect(mockSearchJockeysByName).toHaveBeenCalledWith('홍길동', undefined);
      expect(mockFetchJockeyRanking).not.toHaveBeenCalled();
    });

    it('should limit search results', async () => {
      const manyJockeys = Array.from({ length: 10 }, (_, i) => ({
        ...mockJockeys[0],
        id: String(i),
      }));
      mockSearchJockeysByName.mockResolvedValue(manyJockeys);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/jockeys?search=홍길&limit=5')
      );
      const data = await response.json();

      expect(data.data).toHaveLength(5);
    });
  });

  describe('Response structure', () => {
    it('should return correct meta information', async () => {
      mockFetchJockeyRanking.mockResolvedValue(mockJockeys);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys'));
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('total', 2);
      expect(data.meta).toHaveProperty('meet', 'all');
      expect(data.meta).toHaveProperty('search', null);
    });

    it('should return ISO timestamp', async () => {
      mockFetchJockeyRanking.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys'));
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchJockeyRanking.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchJockeyRanking.mockRejectedValue('Unknown error');

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
