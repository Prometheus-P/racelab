// src/lib/services/raceService.test.ts

import {
  getTodayRaces,
  getRacesByDateAndType,
  getRaceDetail,
} from './raceService';
import { fetchHorseRaceSchedules } from '../api/kraClient';
import { fetchCycleRaceSchedules } from '../api/kspoCycleClient';
import { fetchBoatRaceSchedules } from '../api/kspoBoatClient';
import { fetchRaceById, fetchRaceOdds, fetchRaceResults } from '../api';
import { Race, Entry, Odds, RaceResult } from '@/types';

// Mock dependencies
jest.mock('../api/kraClient');
jest.mock('../api/kspoCycleClient');
jest.mock('../api/kspoBoatClient');
jest.mock('../api');

const mockFetchHorseRaceSchedules = fetchHorseRaceSchedules as jest.MockedFunction<typeof fetchHorseRaceSchedules>;
const mockFetchCycleRaceSchedules = fetchCycleRaceSchedules as jest.MockedFunction<typeof fetchCycleRaceSchedules>;
const mockFetchBoatRaceSchedules = fetchBoatRaceSchedules as jest.MockedFunction<typeof fetchBoatRaceSchedules>;
const mockFetchRaceById = fetchRaceById as jest.MockedFunction<typeof fetchRaceById>;
const mockFetchRaceOdds = fetchRaceOdds as jest.MockedFunction<typeof fetchRaceOdds>;
const mockFetchRaceResults = fetchRaceResults as jest.MockedFunction<typeof fetchRaceResults>;

describe('RaceService', () => {
  const mockDate = '20251210';

  const mockHorseRace: Race = {
    id: 'horse-1-1-20251210',
    type: 'horse',
    raceNo: 1,
    track: '서울',
    startTime: '10:00',
    status: 'upcoming',
    entries: [{ no: 1, name: '테스트마' }],
  };

  const mockCycleRace: Race = {
    id: 'cycle-1-1-20251210',
    type: 'cycle',
    raceNo: 1,
    track: '광명',
    startTime: '11:00',
    status: 'upcoming',
    entries: [{ no: 1, name: '선수1' }],
  };

  const mockBoatRace: Race = {
    id: 'boat-1-1-20251210',
    type: 'boat',
    raceNo: 1,
    track: '미사리',
    startTime: '12:00',
    status: 'upcoming',
    entries: [{ no: 1, name: '선수1' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodayRaces', () => {
    it('should fetch all race types in parallel and combine results', async () => {
      mockFetchHorseRaceSchedules.mockResolvedValueOnce([mockHorseRace]);
      mockFetchCycleRaceSchedules.mockResolvedValueOnce([mockCycleRace]);
      mockFetchBoatRaceSchedules.mockResolvedValueOnce([mockBoatRace]);

      const result = await getTodayRaces();

      expect(mockFetchHorseRaceSchedules).toHaveBeenCalledTimes(1);
      expect(mockFetchCycleRaceSchedules).toHaveBeenCalledTimes(1);
      expect(mockFetchBoatRaceSchedules).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data).toContainEqual(mockHorseRace);
      expect(result.data).toContainEqual(mockCycleRace);
      expect(result.data).toContainEqual(mockBoatRace);
    });

    it('should return failure when all APIs fail', async () => {
      mockFetchHorseRaceSchedules.mockRejectedValueOnce(new Error('API Error'));
      mockFetchCycleRaceSchedules.mockRejectedValueOnce(new Error('API Error'));
      mockFetchBoatRaceSchedules.mockRejectedValueOnce(new Error('API Error'));

      const result = await getTodayRaces();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      if (!result.success) {
        expect(result.error).toBe('All race APIs failed');
        expect(result.failedTypes).toEqual(['horse', 'cycle', 'boat']);
      }
    });

    it('should return partial results with warnings when some APIs fail', async () => {
      mockFetchHorseRaceSchedules.mockResolvedValueOnce([mockHorseRace]);
      mockFetchCycleRaceSchedules.mockRejectedValueOnce(new Error('API Error'));
      mockFetchBoatRaceSchedules.mockResolvedValueOnce([mockBoatRace]);

      const result = await getTodayRaces();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data).toContainEqual(mockHorseRace);
      expect(result.data).toContainEqual(mockBoatRace);
      if (result.success) {
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings?.[0]).toContain('cycle');
      }
    });
  });

  describe('getRacesByDateAndType', () => {
    it('should fetch horse races for specified date', async () => {
      mockFetchHorseRaceSchedules.mockResolvedValueOnce([mockHorseRace]);

      const result = await getRacesByDateAndType(mockDate, 'horse');

      expect(mockFetchHorseRaceSchedules).toHaveBeenCalledWith(mockDate);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockHorseRace]);
    });

    it('should fetch cycle races for specified date', async () => {
      mockFetchCycleRaceSchedules.mockResolvedValueOnce([mockCycleRace]);

      const result = await getRacesByDateAndType(mockDate, 'cycle');

      expect(mockFetchCycleRaceSchedules).toHaveBeenCalledWith(mockDate);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCycleRace]);
    });

    it('should fetch boat races for specified date', async () => {
      mockFetchBoatRaceSchedules.mockResolvedValueOnce([mockBoatRace]);

      const result = await getRacesByDateAndType(mockDate, 'boat');

      expect(mockFetchBoatRaceSchedules).toHaveBeenCalledWith(mockDate);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockBoatRace]);
    });

    it('should fetch all race types when type is not specified', async () => {
      mockFetchHorseRaceSchedules.mockResolvedValueOnce([mockHorseRace]);
      mockFetchCycleRaceSchedules.mockResolvedValueOnce([mockCycleRace]);
      mockFetchBoatRaceSchedules.mockResolvedValueOnce([mockBoatRace]);

      const result = await getRacesByDateAndType(mockDate);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should return failure on error for single type', async () => {
      mockFetchHorseRaceSchedules.mockRejectedValueOnce(new Error('API Error'));

      const result = await getRacesByDateAndType(mockDate, 'horse');

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      if (!result.success) {
        expect(result.failedTypes).toEqual(['horse']);
      }
    });
  });

  describe('getRaceDetail', () => {
    const mockEntries: Entry[] = [
      { no: 1, name: '테스트마', jockey: '기수1' },
      { no: 2, name: '테스트마2', jockey: '기수2' },
    ];

    const mockOdds: Odds = {
      win: 2.5,
      place: 1.8,
      quinella: 5.2,
    };

    const mockResults: RaceResult[] = [
      { rank: 1, no: 1, name: '테스트마', jockey: '기수1', odds: 2.5 },
      { rank: 2, no: 2, name: '테스트마2', jockey: '기수2', odds: 3.0 },
    ];

    it('should fetch race detail with entries, odds, and results', async () => {
      const raceWithEntries = { ...mockHorseRace, entries: mockEntries };
      mockFetchRaceById.mockResolvedValueOnce(raceWithEntries);
      mockFetchRaceOdds.mockResolvedValueOnce(mockOdds);
      mockFetchRaceResults.mockResolvedValueOnce(mockResults);

      const result = await getRaceDetail('horse-1-1-20251210');

      expect(mockFetchRaceById).toHaveBeenCalledWith('horse-1-1-20251210');
      expect(mockFetchRaceOdds).toHaveBeenCalledWith('horse-1-1-20251210');
      expect(mockFetchRaceResults).toHaveBeenCalledWith('horse-1-1-20251210');

      expect(result).not.toBeNull();
      expect(result?.race).toEqual(raceWithEntries);
      expect(result?.entries).toEqual(mockEntries);
      expect(result?.odds).toEqual(mockOdds);
      expect(result?.results).toEqual(mockResults);
    });

    it('should return null when race is not found', async () => {
      mockFetchRaceById.mockResolvedValueOnce(null);

      const result = await getRaceDetail('invalid-id');

      expect(result).toBeNull();
      expect(mockFetchRaceOdds).not.toHaveBeenCalled();
      expect(mockFetchRaceResults).not.toHaveBeenCalled();
    });

    it('should return race with null odds and empty results when not available', async () => {
      mockFetchRaceById.mockResolvedValueOnce(mockHorseRace);
      mockFetchRaceOdds.mockResolvedValueOnce(null);
      mockFetchRaceResults.mockResolvedValueOnce([]);

      const result = await getRaceDetail('horse-1-1-20251210');

      expect(result).not.toBeNull();
      expect(result?.race).toEqual(mockHorseRace);
      expect(result?.odds).toBeNull();
      expect(result?.results).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      mockFetchRaceById.mockResolvedValueOnce(mockHorseRace);
      mockFetchRaceOdds.mockRejectedValueOnce(new Error('Odds Error'));
      mockFetchRaceResults.mockRejectedValueOnce(new Error('Results Error'));

      const result = await getRaceDetail('horse-1-1-20251210');

      expect(result).not.toBeNull();
      expect(result?.race).toEqual(mockHorseRace);
      expect(result?.odds).toBeNull();
      expect(result?.results).toEqual([]);
    });
  });
});
