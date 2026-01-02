/**
 * GET /api/v1/kra/races Route Tests
 *
 * 경주정보 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchRaceInfo: jest.fn(),
  fetchRaceSchedule: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchRaceInfo = kraApi.fetchRaceInfo as jest.MockedFunction<typeof kraApi.fetchRaceInfo>;
const mockFetchRaceSchedule = kraApi.fetchRaceSchedule as jest.MockedFunction<typeof kraApi.fetchRaceSchedule>;

// Sample mock data
const mockRaceInfoData = [
  {
    meet: '1',
    meetName: '서울',
    raceDate: '20241225',
    raceNo: 1,
    raceName: '1경주',
    distance: 1200,
    grade: '4급',
    startTime: '11:00',
    entryCount: 12,
  },
  {
    meet: '1',
    meetName: '서울',
    raceDate: '20241225',
    raceNo: 2,
    raceName: '2경주',
    distance: 1400,
    grade: '3급',
    startTime: '11:30',
    entryCount: 10,
  },
];

const mockScheduleData = [
  {
    meet: '1',
    meetName: '서울',
    raceDate: '20241225',
    totalRaces: 2,
    races: mockRaceInfoData,
  },
  {
    meet: '2',
    meetName: '제주',
    raceDate: '20241225',
    totalRaces: 1,
    races: [
      {
        meet: '2',
        meetName: '제주',
        raceDate: '20241225',
        raceNo: 1,
        distance: 1200,
      },
    ],
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/races', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('List mode (default)', () => {
    it('should return all races from schedule when no meet specified', async () => {
      mockFetchRaceSchedule.mockResolvedValue(mockScheduleData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3); // 2 from Seoul + 1 from Jeju
      expect(mockFetchRaceSchedule).toHaveBeenCalled();
    });

    it('should return races for specific meet', async () => {
      mockFetchRaceInfo.mockResolvedValue(mockRaceInfoData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races?meet=1'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.meta.meet).toBe('1');
      expect(mockFetchRaceInfo).toHaveBeenCalledWith('1', undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchRaceSchedule.mockResolvedValue([]);

      await GET(createRequest('http://localhost/api/v1/kra/races?date=2024-12-25'));

      expect(mockFetchRaceSchedule).toHaveBeenCalledWith('20241225');
    });
  });

  describe('Grouped mode', () => {
    it('should return grouped schedule when grouped=true', async () => {
      mockFetchRaceSchedule.mockResolvedValue(mockScheduleData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races?grouped=true'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2); // 2 schedules
      expect(data.meta.grouped).toBe(true);
    });

    it('should filter grouped schedule by meet', async () => {
      mockFetchRaceSchedule.mockResolvedValue(mockScheduleData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races?grouped=true&meet=1'));
      const data = await response.json();

      expect(data.data).toHaveLength(1);
      expect(data.data[0].meet).toBe('1');
    });
  });

  describe('Parameter validation', () => {
    it('should reject invalid meet code', async () => {
      const response = await GET(createRequest('http://localhost/api/v1/kra/races?meet=99'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid meet code');
    });

    it('should reject invalid date format', async () => {
      const response = await GET(createRequest('http://localhost/api/v1/kra/races?date=invalid'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_PARAMETER');
      expect(data.error.message).toContain('Invalid date format');
    });

    it('should accept YYYYMMDD date format', async () => {
      mockFetchRaceSchedule.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races?date=20241225'));

      expect(response.status).toBe(200);
    });

    it('should accept YYYY-MM-DD date format', async () => {
      mockFetchRaceSchedule.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races?date=2024-12-25'));

      expect(response.status).toBe(200);
    });
  });

  describe('Response structure', () => {
    it('should return correct meta information', async () => {
      mockFetchRaceSchedule.mockResolvedValue(mockScheduleData);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races'));
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
      mockFetchRaceSchedule.mockResolvedValue([]);

      const response = await GET(createRequest('http://localhost/api/v1/kra/races'));
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchRaceSchedule.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/races'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchRaceSchedule.mockRejectedValue('Unknown error');

      const response = await GET(createRequest('http://localhost/api/v1/kra/races'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
