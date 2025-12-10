/**
 * @jest-environment node
 *
 * Unit tests for entryPoller
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
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

// Mock the API clients
jest.mock('@/ingestion/clients/kraClient', () => ({
  fetchKraEntries: jest.fn(),
}));

jest.mock('@/ingestion/clients/kspoClient', () => ({
  fetchKspoEntries: jest.fn(),
}));

// Mock the mapper
jest.mock('@/ingestion/mappers/entryMapper', () => ({
  mapKraEntries: jest.fn(),
  mapKspoEntries: jest.fn(),
}));

describe('entryPoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pollEntries', () => {
    it('should poll entries for horse races from KRA', async () => {
      const { fetchKraEntries } = await import('@/ingestion/clients/kraClient');
      const { mapKraEntries } = await import('@/ingestion/mappers/entryMapper');
      const { pollEntries } = await import('@/ingestion/jobs/entryPoller');

      const mockEntries = [{ id: 'entry-1' }, { id: 'entry-2' }];

      (fetchKraEntries as jest.Mock).mockResolvedValue([{}, {}]);
      (mapKraEntries as jest.Mock).mockReturnValue(mockEntries);

      const result = await pollEntries({ raceIds: ['horse-seoul-1-20241210'] });

      expect(fetchKraEntries).toHaveBeenCalled();
      expect(result.collected).toBe(2);
    });

    it('should poll entries for cycle races from KSPO', async () => {
      const { fetchKspoEntries } = await import('@/ingestion/clients/kspoClient');
      const { mapKspoEntries } = await import('@/ingestion/mappers/entryMapper');
      const { pollEntries } = await import('@/ingestion/jobs/entryPoller');

      const mockEntries = [{ id: 'entry-1' }];

      (fetchKspoEntries as jest.Mock).mockResolvedValue([{}]);
      (mapKspoEntries as jest.Mock).mockReturnValue(mockEntries);

      const result = await pollEntries({ raceIds: ['cycle-gwangmyeong-1-20241210'] });

      expect(fetchKspoEntries).toHaveBeenCalled();
      expect(result.collected).toBe(1);
    });

    it('should handle API errors gracefully', async () => {
      const { fetchKraEntries } = await import('@/ingestion/clients/kraClient');
      const { pollEntries } = await import('@/ingestion/jobs/entryPoller');

      (fetchKraEntries as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await pollEntries({ raceIds: ['horse-seoul-1-20241210'] });

      expect(result.errors).toBe(1);
    });

    it('should poll multiple races', async () => {
      const { fetchKraEntries } = await import('@/ingestion/clients/kraClient');
      const { mapKraEntries } = await import('@/ingestion/mappers/entryMapper');
      const { pollEntries } = await import('@/ingestion/jobs/entryPoller');

      (fetchKraEntries as jest.Mock).mockResolvedValue([{}]);
      (mapKraEntries as jest.Mock).mockReturnValue([{ id: 'entry-1' }]);

      const result = await pollEntries({
        raceIds: ['horse-seoul-1-20241210', 'horse-seoul-2-20241210'],
      });

      expect(fetchKraEntries).toHaveBeenCalledTimes(2);
      expect(result.collected).toBe(2);
    });

    it('should return empty result when no race IDs provided', async () => {
      const { pollEntries } = await import('@/ingestion/jobs/entryPoller');

      const result = await pollEntries({ raceIds: [] });

      expect(result.collected).toBe(0);
      expect(result.errors).toBe(0);
    });
  });
});
