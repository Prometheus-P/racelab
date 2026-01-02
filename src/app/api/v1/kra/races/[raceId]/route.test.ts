/**
 * GET /api/v1/kra/races/[raceId] Route Tests
 *
 * 특정 경주 정보 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchRace: jest.fn(),
}));

const mockFetchRace = kraApi.fetchRace as jest.MockedFunction<typeof kraApi.fetchRace>;

// Sample mock data
const mockRaceData = {
  meet: '1',
  meetName: '서울',
  raceDate: '20241225',
  raceNo: 5,
  raceName: '5경주',
  distance: 1400,
  grade: '3급',
  condition: '3세 이상',
  startTime: '13:00',
  trackCondition: '양호',
  weather: '맑음',
  entryCount: 12,
};

function createRequest(url: string, params: { raceId: string }): [NextRequest, { params: Promise<{ raceId: string }> }] {
  return [
    new NextRequest(new URL(url, 'http://localhost')),
    { params: Promise.resolve(params) },
  ];
}

describe('GET /api/v1/kra/races/[raceId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should return race for a specific raceId', async () => {
      mockFetchRace.mockResolvedValue(mockRaceData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRaceData);
      expect(mockFetchRace).toHaveBeenCalledWith('1', 5, '20241225');
    });

    it('should return correct meta information', async () => {
      mockFetchRace.mockResolvedValue(mockRaceData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-20241225',
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
      mockFetchRace.mockResolvedValue(mockRaceData);

      // 서울 (1)
      const [req1, ctx1] = createRequest('http://localhost/api/v1/kra/races/1-1-20241225', { raceId: '1-1-20241225' });
      await GET(req1, ctx1);
      expect(mockFetchRace).toHaveBeenLastCalledWith('1', 1, '20241225');

      // 제주 (2)
      const [req2, ctx2] = createRequest('http://localhost/api/v1/kra/races/2-1-20241225', { raceId: '2-1-20241225' });
      await GET(req2, ctx2);
      expect(mockFetchRace).toHaveBeenLastCalledWith('2', 1, '20241225');

      // 부경 (3)
      const [req3, ctx3] = createRequest('http://localhost/api/v1/kra/races/3-1-20241225', { raceId: '3-1-20241225' });
      await GET(req3, ctx3);
      expect(mockFetchRace).toHaveBeenLastCalledWith('3', 1, '20241225');
    });
  });

  describe('Parameter validation', () => {
    it('should reject invalid raceId format - too few parts', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5',
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
        'http://localhost/api/v1/kra/races/1-5-20241225-extra',
        { raceId: '1-5-20241225-extra' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject invalid meet code', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/9-5-20241225',
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
        'http://localhost/api/v1/kra/races/1-abc-20241225',
        { raceId: '1-abc-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should reject invalid race number - out of range (0)', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-0-20241225',
        { raceId: '1-0-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should reject invalid race number - out of range (17)', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-17-20241225',
        { raceId: '1-17-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should accept valid race number range (1-16)', async () => {
      mockFetchRace.mockResolvedValue(mockRaceData);

      // Race 1
      const [req1, ctx1] = createRequest('http://localhost/api/v1/kra/races/1-1-20241225', { raceId: '1-1-20241225' });
      const res1 = await GET(req1, ctx1);
      expect(res1.status).toBe(200);

      // Race 16
      const [req16, ctx16] = createRequest('http://localhost/api/v1/kra/races/1-16-20241225', { raceId: '1-16-20241225' });
      const res16 = await GET(req16, ctx16);
      expect(res16.status).toBe(200);
    });

    it('should reject invalid date format with dashes (splits into too many parts)', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-2024-12-25',
        { raceId: '1-5-2024-12-25' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject date with wrong length', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-202412',
        { raceId: '1-5-202412' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid date format');
    });
  });

  describe('Not found cases', () => {
    it('should return 404 when race not found', async () => {
      mockFetchRace.mockResolvedValue(null);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toContain('Race not found');
    });
  });

  describe('Response structure', () => {
    it('should return ISO timestamp', async () => {
      mockFetchRace.mockResolvedValue(mockRaceData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('should include all race fields in response', async () => {
      mockFetchRace.mockResolvedValue(mockRaceData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(data.data).toHaveProperty('meet');
      expect(data.data).toHaveProperty('meetName');
      expect(data.data).toHaveProperty('raceDate');
      expect(data.data).toHaveProperty('raceNo');
      expect(data.data).toHaveProperty('distance');
      expect(data.data).toHaveProperty('grade');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchRace.mockRejectedValue(new Error('API Error'));

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-20241225',
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
      mockFetchRace.mockRejectedValue('Unknown error');

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/races/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
