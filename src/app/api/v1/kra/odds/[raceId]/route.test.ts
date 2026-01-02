/**
 * GET /api/v1/kra/odds/[raceId] Route Tests
 *
 * 특정 경주 배당률 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchRaceOdds: jest.fn(),
}));

const mockFetchRaceOdds = kraApi.fetchRaceOdds as jest.MockedFunction<typeof kraApi.fetchRaceOdds>;

// Sample mock data
const mockRaceOdds = {
  raceDate: '20241225',
  meet: '서울',
  raceNo: 5,
  win: { '1': 2.5, '2': 3.1, '3': 5.0, '4': 8.0 },
  place: { '1': 1.5, '2': 1.8, '3': 2.2, '4': 2.8 },
  quinella: { '1-2': 4.5, '1-3': 6.2, '2-3': 7.1 },
  exacta: { '1-2': 8.2, '2-1': 9.5 },
  quinellaPlace: { '1-2': 2.3 },
  trifecta: { '1-2-3': 50.0 },
};

function createRequest(url: string, params: { raceId: string }): [NextRequest, { params: Promise<{ raceId: string }> }] {
  return [
    new NextRequest(new URL(url, 'http://localhost')),
    { params: Promise.resolve(params) },
  ];
}

describe('GET /api/v1/kra/odds/[raceId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should return odds for a specific race', async () => {
      mockFetchRaceOdds.mockResolvedValue(mockRaceOdds);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRaceOdds);
      expect(mockFetchRaceOdds).toHaveBeenCalledWith('1', 5, '20241225');
    });

    it('should return correct meta information', async () => {
      mockFetchRaceOdds.mockResolvedValue(mockRaceOdds);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(data.meta).toEqual({
        raceId: '1-5-20241225',
        meet: '1',
        raceNo: 5,
        date: '20241225',
      });
    });

    it('should parse all valid meet codes', async () => {
      mockFetchRaceOdds.mockResolvedValue(mockRaceOdds);

      // 서울 (1)
      const [req1, ctx1] = createRequest('http://localhost/api/v1/kra/odds/1-1-20241225', { raceId: '1-1-20241225' });
      await GET(req1, ctx1);
      expect(mockFetchRaceOdds).toHaveBeenLastCalledWith('1', 1, '20241225');

      // 제주 (2)
      const [req2, ctx2] = createRequest('http://localhost/api/v1/kra/odds/2-1-20241225', { raceId: '2-1-20241225' });
      await GET(req2, ctx2);
      expect(mockFetchRaceOdds).toHaveBeenLastCalledWith('2', 1, '20241225');

      // 부경 (3)
      const [req3, ctx3] = createRequest('http://localhost/api/v1/kra/odds/3-1-20241225', { raceId: '3-1-20241225' });
      await GET(req3, ctx3);
      expect(mockFetchRaceOdds).toHaveBeenLastCalledWith('3', 1, '20241225');
    });
  });

  describe('Parameter validation', () => {
    it('should reject invalid raceId format - too few parts', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5',
        { raceId: '1-5' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject invalid raceId format - too many parts', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225-extra',
        { raceId: '1-5-20241225-extra' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject invalid meet code', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/9-5-20241225',
        { raceId: '9-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid meet code: 9');
    });

    it('should reject invalid race number - non-numeric', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-abc-20241225',
        { raceId: '1-abc-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should reject invalid race number - out of range (0)', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-0-20241225',
        { raceId: '1-0-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should reject invalid race number - out of range (17)', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-17-20241225',
        { raceId: '1-17-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should accept valid race number range (1-16)', async () => {
      mockFetchRaceOdds.mockResolvedValue(mockRaceOdds);

      // Race 1
      const [req1, ctx1] = createRequest('http://localhost/api/v1/kra/odds/1-1-20241225', { raceId: '1-1-20241225' });
      const res1 = await GET(req1, ctx1);
      expect(res1.status).toBe(200);

      // Race 16
      const [req16, ctx16] = createRequest('http://localhost/api/v1/kra/odds/1-16-20241225', { raceId: '1-16-20241225' });
      const res16 = await GET(req16, ctx16);
      expect(res16.status).toBe(200);
    });

    it('should reject invalid date format with dashes (splits into too many parts)', async () => {
      // raceId '1-5-2024-12-25' splits into 5 parts, so it's invalid format
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-2024-12-25',
        { raceId: '1-5-2024-12-25' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject date with wrong length', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-202412',
        { raceId: '1-5-202412' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid date format');
    });
  });

  describe('Not found cases', () => {
    it('should return 404 when odds not found', async () => {
      mockFetchRaceOdds.mockResolvedValue(null);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-99-20241225',
        { raceId: '1-99-20241225' }
      );
      // raceNo 99 is out of range, but let's test a valid range race that returns null
      const [req, ctx] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(req, ctx);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toContain('Odds not found');
    });
  });

  describe('Response structure', () => {
    it('should return ISO timestamp', async () => {
      mockFetchRaceOdds.mockResolvedValue(mockRaceOdds);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('should include all bet types in response', async () => {
      mockFetchRaceOdds.mockResolvedValue(mockRaceOdds);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(data.data).toHaveProperty('win');
      expect(data.data).toHaveProperty('place');
      expect(data.data).toHaveProperty('quinella');
      expect(data.data).toHaveProperty('exacta');
      expect(data.data).toHaveProperty('quinellaPlace');
      expect(data.data).toHaveProperty('trifecta');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchRaceOdds.mockRejectedValue(new Error('API Error'));

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchRaceOdds.mockRejectedValue('Unknown error');

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/odds/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
