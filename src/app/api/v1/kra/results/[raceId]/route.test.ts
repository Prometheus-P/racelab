/**
 * GET /api/v1/kra/results/[raceId] Route Tests
 *
 * 특정 경주 AI학습용 결과 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchRaceResult: jest.fn(),
}));

const mockFetchRaceResult = kraApi.fetchRaceResult as jest.MockedFunction<
  typeof kraApi.fetchRaceResult
>;

// Sample mock data
const mockResultData = {
  meet: '1',
  meetName: '서울',
  raceDate: '20241225',
  raceNo: 5,
  raceName: '5경주',
  distance: 1400,
  grade: '3급',
  trackCondition: '양호',
  weather: '맑음',
  entries: [
    {
      meet: '1',
      meetName: '서울',
      raceDate: '20241225',
      raceNo: 5,
      distance: 1400,
      horseNo: '123',
      horseName: '우승마',
      gateNo: 3,
      sex: '수말',
      age: 4,
      burden: 57,
      weight: 480,
      rating: 52,
      jockeyNo: '10',
      jockeyName: '김기수',
      trainerNo: '20',
      trainerName: '박조교',
      position: 1,
      finishTime: '1:25.3',
      winOdds: 3.2,
      placeOdds: 1.5,
    },
    {
      meet: '1',
      meetName: '서울',
      raceDate: '20241225',
      raceNo: 5,
      distance: 1400,
      horseNo: '456',
      horseName: '2등마',
      gateNo: 7,
      sex: '암말',
      age: 5,
      burden: 55,
      weight: 460,
      rating: 50,
      jockeyNo: '11',
      jockeyName: '이기수',
      trainerNo: '21',
      trainerName: '최조교',
      position: 2,
      finishTime: '1:25.6',
      winOdds: 8.5,
      placeOdds: 2.8,
    },
  ],
  totalEntries: 2,
};

function createRequest(
  url: string,
  params: { raceId: string }
): [NextRequest, { params: Promise<{ raceId: string }> }] {
  return [
    new NextRequest(new URL(url, 'http://localhost')),
    { params: Promise.resolve(params) },
  ];
}

describe('GET /api/v1/kra/results/[raceId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success cases', () => {
    it('should return result for a specific raceId', async () => {
      mockFetchRaceResult.mockResolvedValue(mockResultData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResultData);
      expect(mockFetchRaceResult).toHaveBeenCalledWith('1', 5, '20241225');
    });

    it('should return correct meta information', async () => {
      mockFetchRaceResult.mockResolvedValue(mockResultData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(data.meta).toEqual({
        raceId: '1-5-20241225',
        meet: '1',
        raceNo: 5,
        date: '20241225',
        totalEntries: 2,
      });
    });

    it('should parse all valid meet codes', async () => {
      mockFetchRaceResult.mockResolvedValue(mockResultData);

      // 서울 (1)
      const [req1, ctx1] = createRequest('http://localhost/api/v1/kra/results/1-1-20241225', {
        raceId: '1-1-20241225',
      });
      await GET(req1, ctx1);
      expect(mockFetchRaceResult).toHaveBeenLastCalledWith('1', 1, '20241225');

      // 제주 (2)
      const [req2, ctx2] = createRequest('http://localhost/api/v1/kra/results/2-1-20241225', {
        raceId: '2-1-20241225',
      });
      await GET(req2, ctx2);
      expect(mockFetchRaceResult).toHaveBeenLastCalledWith('2', 1, '20241225');

      // 부경 (3)
      const [req3, ctx3] = createRequest('http://localhost/api/v1/kra/results/3-1-20241225', {
        raceId: '3-1-20241225',
      });
      await GET(req3, ctx3);
      expect(mockFetchRaceResult).toHaveBeenLastCalledWith('3', 1, '20241225');
    });
  });

  describe('Parameter validation', () => {
    it('should reject invalid raceId format - too few parts', async () => {
      const [request, context] = createRequest('http://localhost/api/v1/kra/results/1-5', {
        raceId: '1-5',
      });
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject invalid raceId format - too many parts', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225-extra',
        { raceId: '1-5-20241225-extra' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject invalid meet code', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/9-5-20241225',
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
        'http://localhost/api/v1/kra/results/1-abc-20241225',
        { raceId: '1-abc-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should reject invalid race number - out of range (0)', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-0-20241225',
        { raceId: '1-0-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should reject invalid race number - out of range (17)', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-17-20241225',
        { raceId: '1-17-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid race number');
    });

    it('should accept valid race number range (1-16)', async () => {
      mockFetchRaceResult.mockResolvedValue(mockResultData);

      // Race 1
      const [req1, ctx1] = createRequest('http://localhost/api/v1/kra/results/1-1-20241225', {
        raceId: '1-1-20241225',
      });
      const res1 = await GET(req1, ctx1);
      expect(res1.status).toBe(200);

      // Race 16
      const [req16, ctx16] = createRequest('http://localhost/api/v1/kra/results/1-16-20241225', {
        raceId: '1-16-20241225',
      });
      const res16 = await GET(req16, ctx16);
      expect(res16.status).toBe(200);
    });

    it('should reject invalid date format with dashes', async () => {
      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-2024-12-25',
        { raceId: '1-5-2024-12-25' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid raceId format');
    });

    it('should reject date with wrong length', async () => {
      const [request, context] = createRequest('http://localhost/api/v1/kra/results/1-5-202412', {
        raceId: '1-5-202412',
      });
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain('Invalid date format');
    });
  });

  describe('Not found cases', () => {
    it('should return 404 when result not found', async () => {
      mockFetchRaceResult.mockResolvedValue(null);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toContain('Race result not found');
    });
  });

  describe('Response structure', () => {
    it('should return ISO timestamp', async () => {
      mockFetchRaceResult.mockResolvedValue(mockResultData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    it('should include all result fields in response', async () => {
      mockFetchRaceResult.mockResolvedValue(mockResultData);

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225',
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
      expect(data.data).toHaveProperty('entries');
      expect(data.data).toHaveProperty('totalEntries');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchRaceResult.mockRejectedValue(new Error('API Error'));

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225',
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
      mockFetchRaceResult.mockRejectedValue('Unknown error');

      const [request, context] = createRequest(
        'http://localhost/api/v1/kra/results/1-5-20241225',
        { raceId: '1-5-20241225' }
      );
      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
