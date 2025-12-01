// src/app/api/races/cycle/route.test.ts
import { GET } from './route'; // The function we are testing
import { fetchCycleRaceSchedules } from '@/lib/api'; // Mock this dependency
import { Race } from '@/types';
import { getTodayYYYYMMDD } from '@/lib/utils/date';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  fetchCycleRaceSchedules: jest.fn(),
}));

// Mock the date utility to control the date in tests
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

  beforeEach(() => {
    // Reset the mock before each test
    (fetchCycleRaceSchedules as jest.Mock).mockClear();
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(mockCycleRaces);
    (getTodayYYYYMMDD as jest.Mock).mockClear();
    (getTodayYYYYMMDD as jest.Mock).mockReturnValue('20240115');
  });

  it('should return cycle race schedules successfully', async () => {
    const response = await GET(); // Call the exported GET function

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();

    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.data).toEqual(mockCycleRaces);
    expect(jsonResponse).toHaveProperty('timestamp');
    expect(fetchCycleRaceSchedules).toHaveBeenCalledTimes(1);
    expect(fetchCycleRaceSchedules).toHaveBeenCalledWith('20240115');
    expect(getTodayYYYYMMDD).toHaveBeenCalledTimes(1);
  });

  it('should handle errors from fetchCycleRaceSchedules', async () => {
    (fetchCycleRaceSchedules as jest.Mock).mockRejectedValue(new Error('API error'));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse).toHaveProperty('error');
    expect(jsonResponse.error.code).toBe('SERVER_ERROR');
    expect(jsonResponse.error.message).toContain('API error');
  });
});
