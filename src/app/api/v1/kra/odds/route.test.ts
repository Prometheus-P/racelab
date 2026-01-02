/**
 * GET /api/v1/kra/odds Route Tests
 *
 * 배당률 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchOdds: jest.fn(),
  fetchAllOdds: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchOdds = kraApi.fetchOdds as jest.MockedFunction<typeof kraApi.fetchOdds>;
const mockFetchAllOdds = kraApi.fetchAllOdds as jest.MockedFunction<typeof kraApi.fetchAllOdds>;

// Sample mock data
const mockOddsData = [
  {
    raceDate: '20241225',
    meet: '서울',
    raceNo: 1,
    win: { '1': 2.5, '2': 3.1, '3': 5.0 } as Record<string, number>,
    place: { '1': 1.5, '2': 1.8 } as Record<string, number>,
    quinella: { '1-2': 4.5 },
    exacta: { '1-2': 8.2 },
  },
  {
    raceDate: '20241225',
    meet: '서울',
    raceNo: 2,
    win: { '1': 4.0, '2': 2.0 } as Record<string, number>,
    place: { '1': 2.0, '2': 1.4 } as Record<string, number>,
  },
];

const mockAllMeetsOdds = [
  {
    raceDate: '20241225',
    meet: '서울',
    raceNo: 1,
    win: { '1': 2.5 } as Record<string, number>,
    place: { '1': 1.5 } as Record<string, number>,
  },
  {
    raceDate: '20241225',
    meet: '제주',
    raceNo: 1,
    win: { '1': 3.0 } as Record<string, number>,
    place: { '1': 1.7 } as Record<string, number>,
  },
  {
    raceDate: '20241225',
    meet: '부경',
    raceNo: 1,
    win: { '1': 3.5 } as Record<string, number>,
    place: { '1': 1.9 } as Record<string, number>,
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/odds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('All meets mode (default)', () => {
    it('should return odds for all meets when no meet specified', async () => {
      mockFetchAllOdds.mockResolvedValue(mockAllMeetsOdds);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3);
      expect(mockFetchAllOdds).toHaveBeenCalled();
      expect(mockFetchOdds).not.toHaveBeenCalled();
    });

    it('should pass date parameter', async () => {
      mockFetchAllOdds.mockResolvedValue([]);

      await GET(createRequest('http://localhost/api/v1/kra/odds?date=2024-12-25'));

      expect(mockFetchAllOdds).toHaveBeenCalledWith('20241225');
    });

    it('should return meta with meet=all', async () => {
      mockFetchAllOdds.mockResolvedValue(mockAllMeetsOdds);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds'));
      const data = await response.json();

      expect(data.meta.meet).toBe('all');
      expect(data.meta.total).toBe(3);
    });
  });

  describe('Single meet mode', () => {
    it('should return odds for specific meet', async () => {
      mockFetchOdds.mockResolvedValue(mockOddsData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds?meet=1'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockFetchOdds).toHaveBeenCalledWith('1', undefined);
      expect(mockFetchAllOdds).not.toHaveBeenCalled();
    });

    it('should pass meet and date parameters', async () => {
      mockFetchOdds.mockResolvedValue([]);

      await GET(createRequest('http://localhost/api/v1/kra/odds?meet=2&date=20241225'));

      expect(mockFetchOdds).toHaveBeenCalledWith('2', '20241225');
    });

    it('should return meta with specific meet', async () => {
      mockFetchOdds.mockResolvedValue(mockOddsData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds?meet=1'));
      const data = await response.json();

      expect(data.meta.meet).toBe('1');
    });
  });

  describe('Parameter validation', () => {
    it('should reject invalid meet code', async () => {
      const response = await GET(createRequest('http://localhost/api/v1/kra/odds?meet=99'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid meet code');
    });

    it('should reject invalid date format', async () => {
      const response = await GET(createRequest('http://localhost/api/v1/kra/odds?date=invalid'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid date format');
    });

    it('should accept YYYYMMDD date format', async () => {
      mockFetchAllOdds.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds?date=20241225'));

      expect(response.status).toBe(200);
    });

    it('should accept YYYY-MM-DD date format', async () => {
      mockFetchAllOdds.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds?date=2024-12-25'));

      expect(response.status).toBe(200);
    });
  });

  describe('Response structure', () => {
    it('should return correct meta information', async () => {
      mockFetchAllOdds.mockResolvedValue(mockAllMeetsOdds);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds'));
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('meet');
      expect(data.meta).toHaveProperty('date');
    });

    it('should return ISO timestamp', async () => {
      mockFetchAllOdds.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds'));
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('should return date as today when not provided', async () => {
      mockFetchAllOdds.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds'));
      const data = await response.json();

      expect(data.meta.date).toBe('today');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchAllOdds.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchAllOdds.mockRejectedValue('Unknown error');

      const response = await GET(createRequest('http://localhost/api/v1/kra/odds'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
