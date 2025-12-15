// src/app/api/races/cycle/route.test.ts
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

describe('GET /api/races/cycle', () => {
  const mockCycleRaces: Race[] = [
    {
      id: 'cycle-1-1-20240115',
      type: 'cycle',
      raceNo: 1,
      track: '광명',
      startTime: '11:00',
      distance: 1000,
      status: 'upcoming',
      entries: [],
    },
  ];

  const createMockRequest = (date?: string): NextRequest => {
    const url = date
      ? `https://racelab.kr/api/races/cycle?date=${date}`
      : 'https://racelab.kr/api/races/cycle';
    return new NextRequest(url);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (raceService.getRacesByDateAndType as jest.Mock).mockResolvedValue(mockCycleRaces);
  });

  it('should return cycle race schedules successfully', async () => {
    const response = await GET(createMockRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();

    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.data).toEqual(mockCycleRaces);
    expect(jsonResponse).toHaveProperty('timestamp');
    expect(raceService.getRacesByDateAndType).toHaveBeenCalledTimes(1);
    expect(raceService.getRacesByDateAndType).toHaveBeenCalledWith('20240115', 'cycle');
  });

  it('should handle errors from service', async () => {
    (raceService.getRacesByDateAndType as jest.Mock).mockRejectedValue(new Error('API error'));

    const response = await GET(createMockRequest());

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse).toHaveProperty('error');
    expect(jsonResponse.error.code).toBe('SERVER_ERROR');
    expect(jsonResponse.error.message).toContain('API error');
  });

  it('should use date from query parameter', async () => {
    await GET(createMockRequest('20251130'));

    expect(raceService.getRacesByDateAndType).toHaveBeenCalledWith('20251130', 'cycle');
  });
});
