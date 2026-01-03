/**
 * GET /api/v1/kra/results Route Tests
 *
 * 경주결과 조회 API 테스트
 * - API299 (기본)
 * - API156 (AI 모드)
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  // API299 (일반 사용자용)
  fetchRaceResultTotal: jest.fn(),
  fetchRaceResultTotalSummary: jest.fn(),
  // API156 (AI학습용)
  fetchRaceResultAI: jest.fn(),
  fetchRaceResultAISummary: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
  getTodayDate: jest.fn(() => '20241225'),
}));

const mockFetchRaceResultTotal = kraApi.fetchRaceResultTotal as jest.MockedFunction<
  typeof kraApi.fetchRaceResultTotal
>;
const mockFetchRaceResultTotalSummary = kraApi.fetchRaceResultTotalSummary as jest.MockedFunction<
  typeof kraApi.fetchRaceResultTotalSummary
>;
const mockFetchRaceResultAI = kraApi.fetchRaceResultAI as jest.MockedFunction<
  typeof kraApi.fetchRaceResultAI
>;
const mockFetchRaceResultAISummary = kraApi.fetchRaceResultAISummary as jest.MockedFunction<
  typeof kraApi.fetchRaceResultAISummary
>;

// Sample mock data for API299
const mockResultData = [
  {
    meet: '1',
    meetName: '서울',
    raceDate: '20241225',
    raceNo: 1,
    raceName: '1경주',
    distance: 1200,
    grade: '4급',
    trackCondition: '양호',
    horseNo: '123',
    horseName: '테스트마1',
    gateNo: 1,
    jockeyName: '김기수',
    trainerName: '박조교',
    position: 1,
    finishTime: '1:12.5',
    winOdds: 2.5,
    placeOdds: 1.2,
  },
  {
    meet: '1',
    meetName: '서울',
    raceDate: '20241225',
    raceNo: 1,
    raceName: '1경주',
    distance: 1200,
    grade: '4급',
    trackCondition: '양호',
    horseNo: '456',
    horseName: '테스트마2',
    gateNo: 2,
    jockeyName: '이기수',
    trainerName: '최조교',
    position: 2,
    finishTime: '1:12.8',
    winOdds: 5.2,
    placeOdds: 2.1,
  },
];

const mockSummaryData = [
  {
    meet: '1',
    meetName: '서울',
    raceDate: '20241225',
    raceNo: 1,
    raceName: '1경주',
    distance: 1200,
    grade: '4급',
    trackCondition: '양호',
    entries: mockResultData,
    totalEntries: 2,
    winner: {
      horseName: '테스트마1',
      jockeyName: '김기수',
      finishTime: '1:12.5',
      winOdds: 2.5,
    },
  },
  {
    meet: '2',
    meetName: '제주',
    raceDate: '20241225',
    raceNo: 1,
    raceName: '1경주',
    distance: 1000,
    grade: '5급',
    trackCondition: '양호',
    entries: [
      {
        meet: '2',
        meetName: '제주',
        raceDate: '20241225',
        raceNo: 1,
        distance: 1000,
        horseNo: '789',
        horseName: '제주마1',
        gateNo: 1,
        jockeyName: '박기수',
        position: 1,
      },
    ],
    totalEntries: 1,
  },
];

// Mock AI data (more detailed)
const mockAIResultData = [
  {
    ...mockResultData[0],
    sex: '수말',
    age: 4,
    burden: 57,
    weight: 480,
    rating: 45,
    jockeyNo: '10',
    trainerNo: '20',
    ownerName: '홍마주',
    timeDiff: '0.0',
    sectionTimes: { g1f: 12.5, g2f: 12.3 },
    distanceFromLead: { s1f: 0, s2f: 0 },
  },
];

const mockAISummaryData = [
  {
    ...mockSummaryData[0],
    weather: '맑음',
    entries: mockAIResultData,
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default mode (API299)', () => {
    it('should return all results from summaries when no meet specified', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue(mockSummaryData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3); // 2 from Seoul + 1 from Jeju
      expect(data.meta.mode).toBe('default');
      expect(mockFetchRaceResultTotalSummary).toHaveBeenCalled();
    });

    it('should return results for specific meet', async () => {
      mockFetchRaceResultTotal.mockResolvedValue(mockResultData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?meet=1'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.meta.meet).toBe('1');
      expect(mockFetchRaceResultTotal).toHaveBeenCalledWith('1', undefined);
    });

    it('should return grouped summaries when grouped=true', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue(mockSummaryData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?grouped=true'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.meta.grouped).toBe(true);
      expect(data.data[0]).toHaveProperty('winner');
    });

    it('should pass date parameter', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      await GET(createRequest('http://localhost/api/v1/kra/results?date=2024-12-25'));

      expect(mockFetchRaceResultTotalSummary).toHaveBeenCalledWith('20241225');
    });
  });

  describe('AI mode (API156)', () => {
    it('should use AI API when mode=ai', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue(mockAISummaryData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?mode=ai'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.mode).toBe('ai');
      expect(mockFetchRaceResultAISummary).toHaveBeenCalled();
    });

    it('should return AI results for specific meet', async () => {
      mockFetchRaceResultAI.mockResolvedValue(mockAIResultData);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?mode=ai&meet=1')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.mode).toBe('ai');
      expect(mockFetchRaceResultAI).toHaveBeenCalledWith('1', undefined);
    });

    it('should return grouped AI summaries', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue(mockAISummaryData);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?mode=ai&grouped=true')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0]).toHaveProperty('weather');
    });
  });

  describe('Cache headers', () => {
    it('should set no-cache for today results', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue(mockSummaryData);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?date=20241225')
      );

      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    });

    it('should set cache headers for past results', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?date=20241201')
      );

      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=3600, stale-while-revalidate=86400'
      );
    });
  });

  describe('isLive flag', () => {
    it('should set isLive true for today', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(data.meta.isLive).toBe(true);
    });

    it('should set isLive false for past dates', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?date=20241201')
      );
      const data = await response.json();

      expect(data.meta.isLive).toBe(false);
    });
  });

  describe('Parameter validation', () => {
    it('should reject invalid meet code', async () => {
      const response = await GET(createRequest('http://localhost/api/v1/kra/results?meet=99'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid meet code');
    });

    it('should reject invalid date format', async () => {
      const response = await GET(createRequest('http://localhost/api/v1/kra/results?date=invalid'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid date format');
    });

    it('should accept YYYYMMDD date format', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?date=20241225'));

      expect(response.status).toBe(200);
    });

    it('should accept YYYY-MM-DD date format', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?date=2024-12-25')
      );

      expect(response.status).toBe(200);
    });

    it('should default to default mode for invalid mode', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?mode=invalid')
      );
      const data = await response.json();

      expect(data.meta.mode).toBe('default');
    });
  });

  describe('Response structure', () => {
    it('should return correct meta information', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue(mockSummaryData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('meet');
      expect(data.meta).toHaveProperty('date');
      expect(data.meta).toHaveProperty('mode');
      expect(data.meta).toHaveProperty('isLive');
    });

    it('should return ISO timestamp', async () => {
      mockFetchRaceResultTotalSummary.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchRaceResultTotalSummary.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchRaceResultTotalSummary.mockRejectedValue('Unknown error');

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
