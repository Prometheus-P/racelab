// src/app/api/races/boat/route.test.ts
import { GET } from './route'; // The function we are testing
import { fetchBoatRaceSchedules } from '@/lib/api'; // Mock this dependency
import { Race } from '@/types';
import { getTodayYYYYMMDD } from '@/lib/utils/date';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  fetchBoatRaceSchedules: jest.fn(),
}));

// Mock the date utility to control the date in tests
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
    // Reset the mock before each test
    (fetchBoatRaceSchedules as jest.Mock).mockClear();
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue(mockBoatRaces);
    (getTodayYYYYMMDD as jest.Mock).mockClear();
    (getTodayYYYYMMDD as jest.Mock).mockReturnValue('20240115');
  });

  it('should return boat race schedules successfully', async () => {
    const response = await GET(createMockRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();

    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.data).toEqual(mockBoatRaces);
    expect(jsonResponse).toHaveProperty('timestamp');
    expect(fetchBoatRaceSchedules).toHaveBeenCalledTimes(1);
    expect(fetchBoatRaceSchedules).toHaveBeenCalledWith('20240115');
    expect(getTodayYYYYMMDD).toHaveBeenCalledTimes(1);
  });

  it('should handle errors from fetchBoatRaceSchedules', async () => {
    (fetchBoatRaceSchedules as jest.Mock).mockRejectedValue(new Error('API error'));

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

    expect(fetchBoatRaceSchedules).toHaveBeenCalledWith('20251130');
  });
});
