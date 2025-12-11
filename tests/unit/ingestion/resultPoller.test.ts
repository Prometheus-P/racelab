/**
 * @jest-environment node
 *
 * Unit tests for resultPoller
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = jest.Mock<any>;

// Mock the database
jest.mock('@/lib/db/client', () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        onConflictDoUpdate: jest.fn(() => Promise.resolve()),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve()),
      })),
    })),
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

// Mock the API clients
jest.mock('@/ingestion/clients/kraClient', () => ({
  fetchKraResults: jest.fn(),
}));

jest.mock('@/ingestion/clients/kspoClient', () => ({
  fetchKspoResults: jest.fn(),
}));

// Mock the mapper
jest.mock('@/ingestion/mappers/resultMapper', () => ({
  mapKraResults: jest.fn(),
  mapKspoResults: jest.fn(),
}));

describe('resultPoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pollResults', () => {
    it('should poll results for horse races from KRA', async () => {
      const { fetchKraResults } = await import('@/ingestion/clients/kraClient');
      const { mapKraResults } = await import('@/ingestion/mappers/resultMapper');
      const { pollResults } = await import('@/ingestion/jobs/resultPoller');

      const mockResults = [
        { id: 'result-1', position: 1 },
        { id: 'result-2', position: 2 },
      ];

      (fetchKraResults as MockFn).mockResolvedValue([{}, {}]);
      (mapKraResults as MockFn).mockReturnValue(mockResults);

      const result = await pollResults({ raceIds: ['horse-seoul-1-20241210'] });

      expect(fetchKraResults).toHaveBeenCalled();
      expect(result.collected).toBe(2);
    });

    it('should poll results for boat races from KSPO', async () => {
      const { fetchKspoResults } = await import('@/ingestion/clients/kspoClient');
      const { mapKspoResults } = await import('@/ingestion/mappers/resultMapper');
      const { pollResults } = await import('@/ingestion/jobs/resultPoller');

      const mockResults = [{ id: 'result-1', position: 1 }];

      (fetchKspoResults as MockFn).mockResolvedValue([{}]);
      (mapKspoResults as MockFn).mockReturnValue(mockResults);

      const result = await pollResults({ raceIds: ['boat-misari-1-20241210'] });

      expect(fetchKspoResults).toHaveBeenCalled();
      expect(result.collected).toBe(1);
    });

    it('should handle API errors gracefully', async () => {
      const { fetchKraResults } = await import('@/ingestion/clients/kraClient');
      const { pollResults } = await import('@/ingestion/jobs/resultPoller');

      (fetchKraResults as MockFn).mockRejectedValue(new Error('API Error'));

      const result = await pollResults({ raceIds: ['horse-seoul-1-20241210'] });

      expect(result.errors).toBe(1);
    });

    it('should handle empty results (race may not be finished)', async () => {
      const { fetchKraResults } = await import('@/ingestion/clients/kraClient');
      const { mapKraResults } = await import('@/ingestion/mappers/resultMapper');
      const { pollResults } = await import('@/ingestion/jobs/resultPoller');

      (fetchKraResults as MockFn).mockResolvedValue([]);
      (mapKraResults as MockFn).mockReturnValue([]);

      const result = await pollResults({ raceIds: ['horse-seoul-1-20241210'] });

      expect(result.skipped).toBe(1);
      expect(result.errors).toBe(0);
    });

    it('should poll multiple races', async () => {
      const { fetchKraResults } = await import('@/ingestion/clients/kraClient');
      const { mapKraResults } = await import('@/ingestion/mappers/resultMapper');
      const { pollResults } = await import('@/ingestion/jobs/resultPoller');

      (fetchKraResults as MockFn).mockResolvedValue([{}]);
      (mapKraResults as MockFn).mockReturnValue([{ id: 'result-1' }]);

      const result = await pollResults({
        raceIds: ['horse-seoul-1-20241210', 'horse-seoul-2-20241210'],
      });

      expect(fetchKraResults).toHaveBeenCalledTimes(2);
      expect(result.collected).toBe(2);
    });

    it('should return empty result when no race IDs provided', async () => {
      const { pollResults } = await import('@/ingestion/jobs/resultPoller');

      const result = await pollResults({ raceIds: [] });

      expect(result.collected).toBe(0);
      expect(result.errors).toBe(0);
    });
  });
});
