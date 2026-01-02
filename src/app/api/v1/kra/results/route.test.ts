/**
 * GET /api/v1/kra/results Route Tests
 *
 * AI학습용 경주결과 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchRaceResultAI: jest.fn(),
  fetchRaceResultAISummary: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchRaceResultAI = kraApi.fetchRaceResultAI as jest.MockedFunction<
  typeof kraApi.fetchRaceResultAI
>;
const mockFetchRaceResultAISummary = kraApi.fetchRaceResultAISummary as jest.MockedFunction<
  typeof kraApi.fetchRaceResultAISummary
>;

// Sample mock data
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
    weather: '맑음',
    horseNo: '123',
    horseName: '테스트마1',
    gateNo: 1,
    sex: '수말',
    age: 4,
    burden: 57,
    weight: 480,
    rating: 45,
    jockeyNo: '10',
    jockeyName: '김기수',
    trainerNo: '20',
    trainerName: '박조교',
    ownerName: '홍마주',
    position: 1,
    finishTime: '1:12.5',
    timeDiff: '0.0',
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
    weather: '맑음',
    horseNo: '456',
    horseName: '테스트마2',
    gateNo: 2,
    sex: '암말',
    age: 5,
    burden: 55,
    weight: 460,
    rating: 42,
    jockeyNo: '11',
    jockeyName: '이기수',
    trainerNo: '21',
    trainerName: '최조교',
    ownerName: '정마주',
    position: 2,
    finishTime: '1:12.8',
    timeDiff: '0.3',
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
    weather: '맑음',
    entries: mockResultData,
    totalEntries: 2,
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
    weather: '흐림',
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
        sex: '수말',
        age: 3,
        jockeyName: '박기수',
        position: 1,
      },
    ],
    totalEntries: 1,
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('List mode (default)', () => {
    it('should return all results from summaries when no meet specified', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue(mockSummaryData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3); // 2 from Seoul + 1 from Jeju
      expect(mockFetchRaceResultAISummary).toHaveBeenCalled();
    });

    it('should return results for specific meet', async () => {
      mockFetchRaceResultAI.mockResolvedValue(mockResultData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?meet=1'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.meta.meet).toBe('1');
      expect(mockFetchRaceResultAI).toHaveBeenCalledWith('1', undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue([]);

      await GET(createRequest('http://localhost/api/v1/kra/results?date=2024-12-25'));

      expect(mockFetchRaceResultAISummary).toHaveBeenCalledWith('20241225');
    });
  });

  describe('Grouped mode', () => {
    it('should return grouped summaries when grouped=true', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue(mockSummaryData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?grouped=true'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2); // 2 race summaries
      expect(data.meta.grouped).toBe(true);
    });

    it('should filter grouped results by meet', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue([mockSummaryData[0]]);

      const response = await GET(
        createRequest('http://localhost/api/v1/kra/results?grouped=true&meet=1')
      );
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(mockFetchRaceResultAISummary).toHaveBeenCalledWith(undefined, '1');
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
      mockFetchRaceResultAISummary.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?date=20241225'));

      expect(response.status).toBe(200);
    });

    it('should accept YYYY-MM-DD date format', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results?date=2024-12-25'));

      expect(response.status).toBe(200);
    });
  });

  describe('Response structure', () => {
    it('should return correct meta information', async () => {
      mockFetchRaceResultAISummary.mockResolvedValue(mockSummaryData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
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
      mockFetchRaceResultAISummary.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchRaceResultAISummary.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchRaceResultAISummary.mockRejectedValue('Unknown error');

      const response = await GET(createRequest('http://localhost/api/v1/kra/results'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
