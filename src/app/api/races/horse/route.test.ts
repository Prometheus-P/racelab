// src/app/api/races/horse/route.test.ts
import { NextRequest } from 'next/server';
import { GET } from './route';
import * as raceService from '@/lib/services/raceService';
import { Race } from '@/types';

jest.mock('@/lib/services/raceService');
// Mock apiAuth to pass through without authentication in tests
jest.mock('@/lib/api-helpers/apiAuth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withOptionalApiAuth: (handler: any) => handler,
}));
jest.mock('@/lib/utils/date', () => ({
  getTodayYYYYMMDD: jest.fn(() => '20240115'),
}));

describe('GET /api/races/horse', () => {
  const mockHorseRaces: Race[] = [
    {
      id: 'horse-1-1-20240115',
      type: 'horse',
      raceNo: 1,
      track: '서울',
      startTime: '11:30',
      distance: 1200,
      grade: '국산5등급',
      status: 'upcoming',
      entries: [],
    },
  ];

  const createMockRequest = (date?: string): NextRequest => {
    const url = date
      ? `https://racelab.kr/api/races/horse?date=${date}`
      : 'https://racelab.kr/api/races/horse';
    return new NextRequest(url);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (raceService.getRacesByDateAndType as jest.Mock).mockResolvedValue({
      success: true,
      data: mockHorseRaces,
    });
  });

  describe('Success Cases', () => {
    it('should_return_200_with_horse_races', async () => {
      const response = await GET(createMockRequest());

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');

      const jsonResponse = await response.json();
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data).toEqual(mockHorseRaces);
      expect(jsonResponse).toHaveProperty('timestamp');
    });

    it('should_call_service_with_date_string_and_type', async () => {
      await GET(createMockRequest());

      expect(raceService.getRacesByDateAndType).toHaveBeenCalledTimes(1);
      expect(raceService.getRacesByDateAndType).toHaveBeenCalledWith('20240115', 'horse');
    });

    it('should_return_empty_array_when_no_races', async () => {
      (raceService.getRacesByDateAndType as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const response = await GET(createMockRequest());
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data).toEqual([]);
    });

    it('should_use_date_from_query_parameter', async () => {
      await GET(createMockRequest('20251130'));

      expect(raceService.getRacesByDateAndType).toHaveBeenCalledWith('20251130', 'horse');
    });
  });

  describe('Error Cases', () => {
    it('should_return_502_when_external_api_fails', async () => {
      // "API error" contains "api" keyword → EXTERNAL_API_ERROR → 502
      (raceService.getRacesByDateAndType as jest.Mock).mockRejectedValue(new Error('API error'));

      const response = await GET(createMockRequest());

      expect(response.status).toBe(502);
      const jsonResponse = await response.json();
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error.code).toBe('EXTERNAL_API_ERROR');
    });

    it('should_return_504_when_timeout_occurs', async () => {
      // "timeout" keyword → EXTERNAL_API_TIMEOUT → 504
      const errorMessage = 'Connection timeout';
      (raceService.getRacesByDateAndType as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const response = await GET(createMockRequest());
      const jsonResponse = await response.json();

      expect(response.status).toBe(504);
      expect(jsonResponse.error.code).toBe('EXTERNAL_API_TIMEOUT');
      expect(jsonResponse.error.message).toContain(errorMessage);
    });

    it('should_return_500_for_generic_errors', async () => {
      // Generic error without keywords → INTERNAL_ERROR → 500
      (raceService.getRacesByDateAndType as jest.Mock).mockRejectedValue(new Error('ECONNREFUSED'));

      const response = await GET(createMockRequest());
      expect(response.status).toBe(500);
    });
  });

  describe('Response Format', () => {
    it('should_include_timestamp_in_iso_format', async () => {
      const response = await GET(createMockRequest());
      const jsonResponse = await response.json();

      expect(jsonResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should_return_correct_race_type', async () => {
      const response = await GET(createMockRequest());
      const jsonResponse = await response.json();

      expect(jsonResponse.data[0].type).toBe('horse');
    });
  });
});
