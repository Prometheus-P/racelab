/**
 * @jest-environment node
 *
 * Unit tests for schedulePoller
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Mock the database
jest.mock('@/lib/db/client', () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock the API clients
jest.mock('@/ingestion/clients/kraClient', () => ({
  fetchKraSchedules: jest.fn(),
}));

jest.mock('@/ingestion/clients/kspoClient', () => ({
  fetchKspoSchedules: jest.fn(),
}));

// Mock the mappers
jest.mock('@/ingestion/mappers/scheduleMapper', () => ({
  mapKraSchedules: jest.fn(),
  mapKspoSchedules: jest.fn(),
}));

describe('schedulePoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pollSchedules', () => {
    it('should poll all race types by default', async () => {
      const { fetchKraSchedules } = await import('@/ingestion/clients/kraClient');
      const { fetchKspoSchedules } = await import('@/ingestion/clients/kspoClient');
      const { mapKraSchedules, mapKspoSchedules } = await import(
        '@/ingestion/mappers/scheduleMapper'
      );
      const { pollSchedules } = await import('@/ingestion/jobs/schedulePoller');

      (fetchKraSchedules as jest.Mock).mockResolvedValue([]);
      (fetchKspoSchedules as jest.Mock).mockResolvedValue([]);
      (mapKraSchedules as jest.Mock).mockReturnValue([]);
      (mapKspoSchedules as jest.Mock).mockReturnValue([]);

      const result = await pollSchedules();

      expect(fetchKraSchedules).toHaveBeenCalled();
      expect(fetchKspoSchedules).toHaveBeenCalledTimes(2); // cycle and boat
      expect(result.collected).toBe(0);
      expect(result.errors).toBe(0);
    });

    it('should only poll horse races when specified', async () => {
      const { fetchKraSchedules } = await import('@/ingestion/clients/kraClient');
      const { fetchKspoSchedules } = await import('@/ingestion/clients/kspoClient');
      const { mapKraSchedules } = await import('@/ingestion/mappers/scheduleMapper');
      const { pollSchedules } = await import('@/ingestion/jobs/schedulePoller');

      (fetchKraSchedules as jest.Mock).mockResolvedValue([]);
      (mapKraSchedules as jest.Mock).mockReturnValue([]);

      const result = await pollSchedules({ raceTypes: ['horse'] });

      expect(fetchKraSchedules).toHaveBeenCalled();
      expect(fetchKspoSchedules).not.toHaveBeenCalled();
      expect(result.collected).toBe(0);
    });

    it('should use provided date for polling', async () => {
      const { fetchKraSchedules } = await import('@/ingestion/clients/kraClient');
      const { fetchKspoSchedules } = await import('@/ingestion/clients/kspoClient');
      const { mapKraSchedules, mapKspoSchedules } = await import(
        '@/ingestion/mappers/scheduleMapper'
      );
      const { pollSchedules } = await import('@/ingestion/jobs/schedulePoller');

      (fetchKraSchedules as jest.Mock).mockResolvedValue([]);
      (fetchKspoSchedules as jest.Mock).mockResolvedValue([]);
      (mapKraSchedules as jest.Mock).mockReturnValue([]);
      (mapKspoSchedules as jest.Mock).mockReturnValue([]);

      await pollSchedules({ date: '2024-12-15' });

      expect(fetchKraSchedules).toHaveBeenCalledWith('2024-12-15');
    });

    it('should count collected races correctly', async () => {
      const { fetchKraSchedules } = await import('@/ingestion/clients/kraClient');
      const { fetchKspoSchedules } = await import('@/ingestion/clients/kspoClient');
      const { mapKraSchedules, mapKspoSchedules } = await import(
        '@/ingestion/mappers/scheduleMapper'
      );
      const { pollSchedules } = await import('@/ingestion/jobs/schedulePoller');

      const mockHorseRaces = [{ id: 'horse-1' }, { id: 'horse-2' }];
      const mockCycleRaces = [{ id: 'cycle-1' }];

      (fetchKraSchedules as jest.Mock).mockResolvedValue([{}, {}]);
      (fetchKspoSchedules as jest.Mock).mockResolvedValue([{}]);
      (mapKraSchedules as jest.Mock).mockReturnValue(mockHorseRaces);
      (mapKspoSchedules as jest.Mock).mockImplementation((_items, _date, type) =>
        type === 'cycle' ? mockCycleRaces : []
      );

      const result = await pollSchedules();

      expect(result.collected).toBe(3); // 2 horse + 1 cycle
      expect(result.errors).toBe(0);
    });

    it('should count errors when API fails', async () => {
      const { fetchKraSchedules } = await import('@/ingestion/clients/kraClient');
      const { fetchKspoSchedules } = await import('@/ingestion/clients/kspoClient');
      const { mapKspoSchedules } = await import('@/ingestion/mappers/scheduleMapper');
      const { pollSchedules } = await import('@/ingestion/jobs/schedulePoller');

      (fetchKraSchedules as jest.Mock).mockRejectedValue(new Error('API Error'));
      (fetchKspoSchedules as jest.Mock).mockResolvedValue([]);
      (mapKspoSchedules as jest.Mock).mockReturnValue([]);

      const result = await pollSchedules();

      expect(result.errors).toBe(1); // KRA failed
    });
  });
});
