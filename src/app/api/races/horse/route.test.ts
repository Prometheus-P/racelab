// src/app/api/races/horse/route.test.ts
import { GET } from './route';
import { fetchHorseRaceSchedules } from '@/lib/api';
import { Race } from '@/types';

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

  const createMockRequest = (date?: string) => {
    const url = date
      ? `http://localhost:3000/api/races/horse?date=${date}`
      : 'http://localhost:3000/api/races/horse';
    return new Request(url);
  };

  beforeEach(() => {
    (fetchHorseRaceSchedules as jest.Mock).mockClear();
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(mockHorseRaces);
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

    it('should_call_api_with_date_string', async () => {
      await GET(createMockRequest());

      expect(fetchHorseRaceSchedules).toHaveBeenCalledTimes(1);
      expect(fetchHorseRaceSchedules).toHaveBeenCalledWith(expect.stringMatching(/^\d{8}$/));
    });

    it('should_return_empty_array_when_no_races', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue([]);

      const response = await GET(createMockRequest());
      const jsonResponse = await response.json();

      expect(response.status).toBe(200);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data).toEqual([]);
    });

    it('should_use_date_from_query_parameter', async () => {
      await GET(createMockRequest('20251130'));

      expect(fetchHorseRaceSchedules).toHaveBeenCalledWith('20251130');
    });
  });

  describe('Error Cases', () => {
    it('should_return_500_when_api_fails', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockRejectedValue(new Error('API error'));

      const response = await GET(createMockRequest());

      expect(response.status).toBe(500);
      const jsonResponse = await response.json();
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error.code).toBe('SERVER_ERROR');
    });

    it('should_include_error_message_in_response', async () => {
      const errorMessage = 'Connection timeout';
      (fetchHorseRaceSchedules as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const response = await GET(createMockRequest());
      const jsonResponse = await response.json();

      expect(jsonResponse.error.message).toContain(errorMessage);
    });

    it('should_handle_network_errors', async () => {
      (fetchHorseRaceSchedules as jest.Mock).mockRejectedValue(new Error('ECONNREFUSED'));

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
