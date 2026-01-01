/**
 * GET /api/v1/kra/horses Route Tests
 *
 * 마필 목록/랭킹 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchHorseRanking: jest.fn(),
  searchHorsesByName: jest.fn(),
  fetchHorsesByGrade: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchHorseRanking = kraApi.fetchHorseRanking as jest.MockedFunction<
  typeof kraApi.fetchHorseRanking
>;
const mockSearchHorsesByName = kraApi.searchHorsesByName as jest.MockedFunction<
  typeof kraApi.searchHorsesByName
>;
const mockFetchHorsesByGrade = kraApi.fetchHorsesByGrade as jest.MockedFunction<
  typeof kraApi.fetchHorsesByGrade
>;

// Sample mock data
const mockHorses = [
  {
    id: 'H001',
    name: '명마',
    nameEn: 'Famous Horse',
    meet: '1',
    meetName: '서울',
    sex: '수',
    sexName: '수말',
    age: 5,
    grade: '1',
    trainer: '박영수',
    owner: '김마주',
    totalStarts: 30,
    totalWins: 10,
    totalSeconds: 8,
    totalThirds: 5,
    winRate: 33.33,
    placeRate: 76.67,
    recentStarts: 10,
    recentWins: 4,
    rating: 92,
  },
  {
    id: 'H002',
    name: '쾌속마',
    nameEn: 'Fast Horse',
    meet: '1',
    meetName: '서울',
    sex: '암',
    sexName: '암말',
    age: 4,
    grade: '2',
    trainer: '이순신',
    owner: '박마주',
    totalStarts: 20,
    totalWins: 6,
    totalSeconds: 5,
    totalThirds: 4,
    winRate: 30,
    placeRate: 75,
    recentStarts: 8,
    recentWins: 3,
    rating: 85,
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/horses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ranking mode (default)', () => {
    it('should return horse ranking with default limit', async () => {
      mockFetchHorseRanking.mockResolvedValue(mockHorses);

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(mockFetchHorseRanking).toHaveBeenCalledWith(undefined, 20, undefined);
    });

    it('should respect limit parameter', async () => {
      mockFetchHorseRanking.mockResolvedValue([mockHorses[0]]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses?limit=1'));
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(mockFetchHorseRanking).toHaveBeenCalledWith(undefined, 1, undefined);
    });

    it('should filter by meet parameter', async () => {
      mockFetchHorseRanking.mockResolvedValue(mockHorses);

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses?meet=1'));
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.meta.meet).toBe('1');
      expect(mockFetchHorseRanking).toHaveBeenCalledWith('1', 20, undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchHorseRanking.mockResolvedValue(mockHorses);

      await GET(createRequest('http://localhost/api/v1/kra/horses?date=2024-12-25'));

      expect(mockFetchHorseRanking).toHaveBeenCalledWith(undefined, 20, '20241225');
    });
  });

  describe('Search mode', () => {
    it('should search horses by name', async () => {
      mockSearchHorsesByName.mockResolvedValue([mockHorses[0]]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses?search=명마'));
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.meta.search).toBe('명마');
      expect(mockSearchHorsesByName).toHaveBeenCalledWith('명마', undefined);
      expect(mockFetchHorseRanking).not.toHaveBeenCalled();
    });

    it('should limit search results', async () => {
      const manyHorses = Array.from({ length: 10 }, (_, i) => ({
        ...mockHorses[0],
        id: `H${String(i).padStart(3, '0')}`,
      }));
      mockSearchHorsesByName.mockResolvedValue(manyHorses);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/horses?search=명&limit=5')
      );
      const data = await response.json();

      expect(data.data).toHaveLength(5);
    });
  });

  describe('Grade filter mode', () => {
    it('should filter horses by grade', async () => {
      mockFetchHorsesByGrade.mockResolvedValue([mockHorses[0]]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses?grade=1'));
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.meta.grade).toBe('1');
      expect(mockFetchHorsesByGrade).toHaveBeenCalledWith('1', undefined, undefined);
      expect(mockFetchHorseRanking).not.toHaveBeenCalled();
    });

    it('should filter by grade and meet', async () => {
      mockFetchHorsesByGrade.mockResolvedValue(mockHorses);

      await GET(createRequest('http://localhost/api/v1/kra/horses?grade=1&meet=1'));

      expect(mockFetchHorsesByGrade).toHaveBeenCalledWith('1', '1', undefined);
    });

    it('should limit grade filter results', async () => {
      const manyHorses = Array.from({ length: 10 }, (_, i) => ({
        ...mockHorses[0],
        id: `H${String(i).padStart(3, '0')}`,
      }));
      mockFetchHorsesByGrade.mockResolvedValue(manyHorses);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/horses?grade=1&limit=5')
      );
      const data = await response.json();

      expect(data.data).toHaveLength(5);
    });
  });

  describe('Priority of query parameters', () => {
    it('should prioritize search over grade', async () => {
      mockSearchHorsesByName.mockResolvedValue([mockHorses[0]]);

      await GET(createRequest('http://localhost/api/v1/kra/horses?search=명마&grade=1'));

      expect(mockSearchHorsesByName).toHaveBeenCalled();
      expect(mockFetchHorsesByGrade).not.toHaveBeenCalled();
    });

    it('should prioritize grade over meet for filtering', async () => {
      mockFetchHorsesByGrade.mockResolvedValue([mockHorses[0]]);

      await GET(createRequest('http://localhost/api/v1/kra/horses?grade=1&meet=1'));

      expect(mockFetchHorsesByGrade).toHaveBeenCalledWith('1', '1', undefined);
      expect(mockFetchHorseRanking).not.toHaveBeenCalled();
    });
  });

  describe('Response structure', () => {
    it('should return correct meta information', async () => {
      mockFetchHorseRanking.mockResolvedValue(mockHorses);

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses'));
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('total', 2);
      expect(data.meta).toHaveProperty('meet', 'all');
      expect(data.meta).toHaveProperty('search', null);
      expect(data.meta).toHaveProperty('grade', null);
    });

    it('should include grade in meta when filtering by grade', async () => {
      mockFetchHorsesByGrade.mockResolvedValue([mockHorses[0]]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses?grade=1'));
      const data = await response.json();

      expect(data.meta.grade).toBe('1');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchHorseRanking.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
    });
  });
});
