// src/app/api/races/horse/route.test.ts
import { GET } from './route'; // The function we are testing
import { fetchHorseRaceSchedules } from '@/lib/api'; // Mock this dependency
import { Race } from '@/types';

// Mock the API client dependency
jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
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

  beforeEach(() => {
    // Reset the mock before each test
    (fetchHorseRaceSchedules as jest.Mock).mockClear();
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(mockHorseRaces);
  });

  it('should return horse race schedules successfully', async () => {
    const request = new Request('http://localhost/api/races/horse');

    const response = await GET(request); // Call the exported GET function

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();

    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.data).toEqual(mockHorseRaces);
    expect(jsonResponse).toHaveProperty('timestamp');
    expect(fetchHorseRaceSchedules).toHaveBeenCalledTimes(1);
    expect(fetchHorseRaceSchedules).toHaveBeenCalledWith(expect.any(String)); // Should call with current date
  });

  it('should handle errors from fetchHorseRaceSchedules', async () => {
    (fetchHorseRaceSchedules as jest.Mock).mockRejectedValue(new Error('API error'));

    const request = new Request('http://localhost/api/races/horse');
    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toContain('application/json');

    const jsonResponse = await response.json();
    expect(jsonResponse.success).toBe(false);
    expect(jsonResponse).toHaveProperty('error');
    expect(jsonResponse.error.code).toBe('SERVER_ERROR');
    expect(jsonResponse.error.message).toContain('API error');
  });
});
