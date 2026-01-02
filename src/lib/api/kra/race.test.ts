/**
 * KRA Race Info API Tests
 *
 * 경주정보 조회 API 테스트
 */

import {
  fetchRaceInfo,
  fetchAllRaceInfo,
  fetchRaceSchedule,
  fetchRace,
  fetchRaceInfoSafe,
  hasRacesToday,
  getTotalRaceCount,
  filterRacesByGrade,
  filterRacesByDistance,
  sortRacesByStartTime,
} from './race';
import * as client from './client';
import type { RaceInfo } from './types';

// Mock client module
jest.mock('./client', () => ({
  kraApi: jest.fn(),
  kraApiSafe: jest.fn(),
  kraApiAllMeets: jest.fn(),
  getTodayDate: jest.fn(() => '20241225'),
}));

const mockKraApi = client.kraApi as jest.MockedFunction<typeof client.kraApi>;
const mockKraApiSafe = client.kraApiSafe as jest.MockedFunction<typeof client.kraApiSafe>;
const mockKraApiAllMeets = client.kraApiAllMeets as jest.MockedFunction<typeof client.kraApiAllMeets>;
const mockGetTodayDate = client.getTodayDate as jest.MockedFunction<typeof client.getTodayDate>;

// Sample API response data
const mockRaceInfoItems = [
  {
    meet: '1',
    rcDate: '20241225',
    rcNo: '1',
    rcName: '1경주',
    rcDist: '1200',
    rcClass: '4급',
    rcCond: '4세 이상',
    rcAge: '4세',
    rcSex: '거',
    rcPrize: '50000000',
    rcTime: '11:00',
    rcTrack: '양호',
    rcWeather: '맑음',
    hrCnt: '12',
  },
  {
    meet: '1',
    rcDate: '20241225',
    rcNo: '2',
    rcName: '2경주',
    rcDist: '1400',
    rcClass: '3급',
    rcCond: '3세 이상',
    rcAge: '3세',
    rcSex: null,
    rcPrize: '70000000',
    rcTime: '11:30',
    rcTrack: '양호',
    rcWeather: '맑음',
    hrCnt: '10',
  },
];

const mockMultiMeetItems = [
  { ...mockRaceInfoItems[0], meet: '1', rcNo: '1' },
  { ...mockRaceInfoItems[1], meet: '2', rcNo: '1' },
  { ...mockRaceInfoItems[0], meet: '3', rcNo: '1' },
];

describe('KRA Race Info API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayDate.mockReturnValue('20241225');
  });

  describe('fetchRaceInfo', () => {
    it('should fetch race info for a specific meet', async () => {
      mockKraApi.mockResolvedValue(mockRaceInfoItems);

      const result = await fetchRaceInfo('1');

      expect(mockKraApi).toHaveBeenCalledWith('RACE_INFO', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
    });

    it('should use provided date instead of today', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchRaceInfo('1', '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('RACE_INFO', '20241201', expect.any(Object));
    });

    it('should return mapped RaceInfo objects', async () => {
      mockKraApi.mockResolvedValue([mockRaceInfoItems[0]]);

      const result = await fetchRaceInfo('1');

      expect(result[0]).toMatchObject({
        meet: '1',
        meetName: '서울',
        raceDate: '20241225',
        raceNo: 1,
        raceName: '1경주',
        distance: 1200,
        grade: '4급',
        prize: 50000000,
        startTime: '11:00',
        entryCount: 12,
      });
    });

    it('should return empty array when no data', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchRaceInfo('1');

      expect(result).toEqual([]);
    });
  });

  describe('fetchAllRaceInfo', () => {
    it('should fetch races from all meets', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockMultiMeetItems);

      const result = await fetchAllRaceInfo();

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('RACE_INFO', '20241225', {
        numOfRows: 100,
      });
      expect(result).toHaveLength(3);
    });

    it('should use provided date', async () => {
      mockKraApiAllMeets.mockResolvedValue([]);

      await fetchAllRaceInfo('20241201');

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('RACE_INFO', '20241201', expect.any(Object));
    });
  });

  describe('fetchRaceSchedule', () => {
    it('should group races by date and meet', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockMultiMeetItems);

      const result = await fetchRaceSchedule();

      expect(result).toHaveLength(3); // 3 meets, 1 race each
      expect(result[0]).toHaveProperty('meet');
      expect(result[0]).toHaveProperty('meetName');
      expect(result[0]).toHaveProperty('raceDate');
      expect(result[0]).toHaveProperty('totalRaces');
      expect(result[0]).toHaveProperty('races');
    });

    it('should sort races by race number within each schedule', async () => {
      const unsortedItems = [
        { ...mockRaceInfoItems[0], meet: '1', rcNo: '3' },
        { ...mockRaceInfoItems[0], meet: '1', rcNo: '1' },
        { ...mockRaceInfoItems[0], meet: '1', rcNo: '2' },
      ];
      mockKraApiAllMeets.mockResolvedValue(unsortedItems);

      const result = await fetchRaceSchedule();

      expect(result[0].races[0].raceNo).toBe(1);
      expect(result[0].races[1].raceNo).toBe(2);
      expect(result[0].races[2].raceNo).toBe(3);
    });
  });

  describe('fetchRace', () => {
    it('should fetch a specific race', async () => {
      mockKraApi.mockResolvedValue([mockRaceInfoItems[0]]);

      const result = await fetchRace('1', 1);

      expect(mockKraApi).toHaveBeenCalledWith('RACE_INFO', '20241225', {
        meet: '1',
        params: { rcNo: '1' },
        numOfRows: 50,
      });
      expect(result).not.toBeNull();
      expect(result?.raceNo).toBe(1);
    });

    it('should return null when race not found', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchRace('1', 99);

      expect(result).toBeNull();
    });

    it('should use provided date', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchRace('1', 1, '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('RACE_INFO', '20241201', expect.any(Object));
    });
  });

  describe('fetchRaceInfoSafe', () => {
    it('should return FetchResult structure', async () => {
      mockKraApiSafe.mockResolvedValue({ data: mockRaceInfoItems });

      const result = await fetchRaceInfoSafe('1');

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(2);
    });

    it('should include isStale and warning when present', async () => {
      mockKraApiSafe.mockResolvedValue({
        data: [],
        isStale: true,
        warning: 'API 지연',
      });

      const result = await fetchRaceInfoSafe('1');

      expect(result.isStale).toBe(true);
      expect(result.warning).toBe('API 지연');
    });
  });

  describe('hasRacesToday', () => {
    it('should return true when races exist', async () => {
      mockKraApi.mockResolvedValue(mockRaceInfoItems);

      const result = await hasRacesToday('1');

      expect(result).toBe(true);
    });

    it('should return false when no races', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await hasRacesToday('1');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockKraApi.mockRejectedValue(new Error('API Error'));

      const result = await hasRacesToday('1');

      expect(result).toBe(false);
    });

    it('should check all meets when no meet specified', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockMultiMeetItems);

      const result = await hasRacesToday();

      expect(result).toBe(true);
      expect(mockKraApiAllMeets).toHaveBeenCalled();
    });
  });

  describe('getTotalRaceCount', () => {
    it('should return race count for specific meet', async () => {
      mockKraApi.mockResolvedValue(mockRaceInfoItems);

      const result = await getTotalRaceCount('1');

      expect(result).toBe(2);
    });

    it('should return 0 on error', async () => {
      mockKraApi.mockRejectedValue(new Error('API Error'));

      const result = await getTotalRaceCount('1');

      expect(result).toBe(0);
    });
  });

  describe('filterRacesByGrade', () => {
    it('should filter races by grade', () => {
      const races: RaceInfo[] = [
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 1, distance: 1200, grade: '4급' },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 2, distance: 1400, grade: '3급' },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 3, distance: 1600, grade: '4급' },
      ];

      const result = filterRacesByGrade(races, '4급');

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.grade === '4급')).toBe(true);
    });
  });

  describe('filterRacesByDistance', () => {
    it('should filter races by minimum distance', () => {
      const races: RaceInfo[] = [
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 1, distance: 1200 },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 2, distance: 1400 },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 3, distance: 1800 },
      ];

      const result = filterRacesByDistance(races, 1400);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.distance >= 1400)).toBe(true);
    });

    it('should filter races by distance range', () => {
      const races: RaceInfo[] = [
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 1, distance: 1200 },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 2, distance: 1400 },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 3, distance: 1800 },
      ];

      const result = filterRacesByDistance(races, 1200, 1500);

      expect(result).toHaveLength(2);
    });
  });

  describe('sortRacesByStartTime', () => {
    it('should sort races by start time', () => {
      const races: RaceInfo[] = [
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 1, distance: 1200, startTime: '13:00' },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 2, distance: 1400, startTime: '11:00' },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 3, distance: 1600, startTime: '12:00' },
      ];

      const result = sortRacesByStartTime(races);

      expect(result[0].startTime).toBe('11:00');
      expect(result[1].startTime).toBe('12:00');
      expect(result[2].startTime).toBe('13:00');
    });

    it('should handle races without start time', () => {
      const races: RaceInfo[] = [
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 1, distance: 1200, startTime: '12:00' },
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 2, distance: 1400 }, // no startTime
        { meet: '1', meetName: '서울', raceDate: '20241225', raceNo: 3, distance: 1600, startTime: '11:00' },
      ];

      const result = sortRacesByStartTime(races);

      // Races without startTime should be sorted last
      expect(result[0].startTime).toBe('11:00');
      expect(result[1].startTime).toBe('12:00');
      expect(result[2].startTime).toBeUndefined();
    });
  });
});
