/**
 * GET /api/v1/kra/jockeys/[id] Route Tests
 *
 * 기수 상세정보 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchJockeyInfo: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchJockeyInfo = kraApi.fetchJockeyInfo as jest.MockedFunction<
  typeof kraApi.fetchJockeyInfo
>;

// Sample mock data
const mockJockey = {
  id: '001',
  name: '홍길동',
  nameEn: 'Hong Gil-dong',
  meet: '1',
  meetName: '서울',
  part: 'A조',
  birthday: '19850315',
  debutDate: '20050101',
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
  rating: 85,
};

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/jockeys/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful requests', () => {
    it('should return jockey details by id', async () => {
      mockFetchJockeyInfo.mockResolvedValue(mockJockey);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('001');
      expect(data.data.name).toBe('홍길동');
      expect(mockFetchJockeyInfo).toHaveBeenCalledWith('001', undefined, undefined);
    });

    it('should pass meet parameter', async () => {
      mockFetchJockeyInfo.mockResolvedValue(mockJockey);

      await GET(createRequest('http://localhost/api/v1/kra/jockeys/001?meet=1'), {
        params: Promise.resolve({ id: '001' }),
      });

      expect(mockFetchJockeyInfo).toHaveBeenCalledWith('001', '1', undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchJockeyInfo.mockResolvedValue(mockJockey);

      await GET(createRequest('http://localhost/api/v1/kra/jockeys/001?date=2024-12-25'), {
        params: Promise.resolve({ id: '001' }),
      });

      expect(mockFetchJockeyInfo).toHaveBeenCalledWith('001', undefined, '20241225');
    });

    it('should pass all parameters', async () => {
      mockFetchJockeyInfo.mockResolvedValue(mockJockey);

      await GET(createRequest('http://localhost/api/v1/kra/jockeys/001?meet=1&date=2024-12-25'), {
        params: Promise.resolve({ id: '001' }),
      });

      expect(mockFetchJockeyInfo).toHaveBeenCalledWith('001', '1', '20241225');
    });
  });

  describe('Response structure', () => {
    it('should return correct response structure', async () => {
      mockFetchJockeyInfo.mockResolvedValue(mockJockey);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('timestamp');
      expect(data.data).toMatchObject({
        id: '001',
        name: '홍길동',
        totalStarts: 500,
        winRate: 20,
      });
    });

    it('should return ISO timestamp', async () => {
      mockFetchJockeyInfo.mockResolvedValue(mockJockey);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('Not found', () => {
    it('should return 404 when jockey not found', async () => {
      mockFetchJockeyInfo.mockResolvedValue(null);

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys/999'), {
        params: Promise.resolve({ id: '999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Jockey not found: 999');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchJockeyInfo.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchJockeyInfo.mockRejectedValue('Unknown error');

      const response = await GET(createRequest('http://localhost/api/v1/kra/jockeys/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
