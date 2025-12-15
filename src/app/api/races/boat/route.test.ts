// src/app/api/races/boat/route.test.ts
import { GET } from './route';
import * as raceService from '@/lib/services/raceService';
import { Race } from '@/types';

jest.mock('@/lib/services/raceService');
// Mock apiAuth to pass through without authentication in tests
jest.mock('@/lib/api-helpers/apiAuth', () => ({
  withOptionalApiAuth: (handler: (req: Request) => Promise<Response>) => handler,
}));
jest.mock('@/lib/utils/date', () => ({
  getTodayYYYYMMDD: jest.fn(() => '20240115'),
}));

describe('GET /api/races/boat', () => {
  const mockBoatRaces: Race[] = [
    {
      id: 'boat-1-1-20240115',
      type: 'boat',
      raceNo: 1,
      track: '미사리',
      startTime: '10:30',
      status: 'upcoming',
      entries: [],
    },
  ];

  const createMockRequest = (date?: string) => {
    const url = date
      ? `https://racelab.kr/api/races/boat?date=${date}`
      : 'https://racelab.kr/api/races/boat';
    return new Request(url);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (raceService.getRacesByDateAndType as jest.Mock).mockResolvedValue(mockBoatRaces);
  });

  it('should return boat race schedules successfully', async () => {
    const response = await GET(createMockRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();

    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.data).toEqual(mockBoatRaces);
    expect(jsonResponse).toHaveProperty('timestamp');
    expect(raceService.getRacesByDateAndType).toHaveBeenCalledTimes(1);
    expect(raceService.getRacesByDateAndType).toHaveBeenCalledWith('20240115', 'boat');
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

    expect(raceService.getRacesByDateAndType).toHaveBeenCalledWith('20251130', 'boat');
  });
});
