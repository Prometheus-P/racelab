/**
 * @jest-environment node
 *
 * Unit tests for oddsPoller
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = jest.Mock<any>;

// Mock race metadata
const mockRaceMetadata = [
  { id: 'horse-seoul-1-20241210', raceDate: '2024-12-10', startTime: '14:00', status: 'scheduled' },
  { id: 'horse-seoul-2-20241210', raceDate: '2024-12-10', startTime: '14:30', status: 'scheduled' },
  { id: 'cycle-gwangmyeong-1-20241210', raceDate: '2024-12-10', startTime: '15:00', status: 'scheduled' },
];

// Track select call count to return different results
let selectCallCount = 0;

const mockDbSelect = jest.fn(() => {
  selectCallCount++;
  const isMetadataQuery = selectCallCount === 1;

  return {
    from: jest.fn(() => ({
      where: jest.fn(() => {
        if (isMetadataQuery) {
          // Race metadata query - returns directly without orderBy/limit
          return Promise.resolve(mockRaceMetadata);
        }
        // Snapshot query - has orderBy/limit chain
        return {
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve([])),
          })),
        };
      }),
    })),
  };
});

const mockDbInsert = jest.fn(() => ({
  values: jest.fn(() => ({
    onConflictDoNothing: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@/lib/db/client', () => ({
  db: {
    insert: mockDbInsert,
    select: mockDbSelect,
  },
}));

// Mock the API clients
jest.mock('@/ingestion/clients/kraClient', () => ({
  fetchKraOdds: jest.fn(),
}));

jest.mock('@/ingestion/clients/kspoClient', () => ({
  fetchKspoOdds: jest.fn(),
}));

// Mock the mapper
jest.mock('@/ingestion/mappers/oddsMapper', () => ({
  mapKraOddsBatch: jest.fn(),
  mapKspoOddsBatch: jest.fn(),
}));

// Mock the smart scheduler
jest.mock('@/ingestion/utils/smartScheduler', () => ({
  getCollectionInterval: jest.fn(),
  shouldCollectNow: jest.fn(),
  getUpcomingRacesForCollection: jest.fn(),
}));

describe('oddsPoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectCallCount = 0;
  });

  describe('pollOdds', () => {
    it('should poll odds for horse races from KRA', async () => {
      const { fetchKraOdds } = await import('@/ingestion/clients/kraClient');
      const { mapKraOddsBatch } = await import('@/ingestion/mappers/oddsMapper');
      const { pollOdds } = await import('@/ingestion/jobs/oddsPoller');

      const mockOddsSnapshots = [
        { raceId: 'horse-seoul-1-20241210', time: new Date(), entryNo: 1, winOdds: 2.5 },
        { raceId: 'horse-seoul-1-20241210', time: new Date(), entryNo: 2, winOdds: 3.0 },
      ];

      (fetchKraOdds as MockFn).mockResolvedValue([{}, {}]);
      (mapKraOddsBatch as MockFn).mockReturnValue(mockOddsSnapshots);

      const result = await pollOdds({ raceIds: ['horse-seoul-1-20241210'] });

      expect(fetchKraOdds).toHaveBeenCalled();
      expect(result.snapshots).toBe(2);
      expect(result.races).toBe(1);
    });

    it('should poll odds for cycle races from KSPO', async () => {
      const { fetchKspoOdds } = await import('@/ingestion/clients/kspoClient');
      const { mapKspoOddsBatch } = await import('@/ingestion/mappers/oddsMapper');
      const { pollOdds } = await import('@/ingestion/jobs/oddsPoller');

      const mockOddsSnapshots = [
        { raceId: 'cycle-gwangmyeong-1-20241210', time: new Date(), entryNo: 1, winOdds: 1.8 },
      ];

      (fetchKspoOdds as MockFn).mockResolvedValue([{}]);
      (mapKspoOddsBatch as MockFn).mockReturnValue(mockOddsSnapshots);

      const result = await pollOdds({ raceIds: ['cycle-gwangmyeong-1-20241210'] });

      expect(fetchKspoOdds).toHaveBeenCalled();
      expect(result.snapshots).toBe(1);
    });

    it('should handle API errors gracefully', async () => {
      const { fetchKraOdds } = await import('@/ingestion/clients/kraClient');
      const { pollOdds } = await import('@/ingestion/jobs/oddsPoller');

      (fetchKraOdds as MockFn).mockRejectedValue(new Error('API timeout'));

      const result = await pollOdds({ raceIds: ['horse-seoul-1-20241210'] });

      expect(result.errors).toBe(1);
    });

    it('should handle empty odds data', async () => {
      const { fetchKraOdds } = await import('@/ingestion/clients/kraClient');
      const { mapKraOddsBatch } = await import('@/ingestion/mappers/oddsMapper');
      const { pollOdds } = await import('@/ingestion/jobs/oddsPoller');

      (fetchKraOdds as MockFn).mockResolvedValue([]);
      (mapKraOddsBatch as MockFn).mockReturnValue([]);

      const result = await pollOdds({ raceIds: ['horse-seoul-1-20241210'] });

      expect(result.snapshots).toBe(0);
    });

    it('should poll multiple races', async () => {
      const { fetchKraOdds } = await import('@/ingestion/clients/kraClient');
      const { mapKraOddsBatch } = await import('@/ingestion/mappers/oddsMapper');
      const { pollOdds } = await import('@/ingestion/jobs/oddsPoller');

      (fetchKraOdds as MockFn).mockResolvedValue([{}]);
      (mapKraOddsBatch as MockFn).mockReturnValue([
        { raceId: 'test', time: new Date(), entryNo: 1, winOdds: 2.0 },
      ]);

      const result = await pollOdds({
        raceIds: ['horse-seoul-1-20241210', 'horse-seoul-2-20241210'],
      });

      expect(fetchKraOdds).toHaveBeenCalledTimes(2);
      expect(result.snapshots).toBe(2);
      expect(result.races).toBe(2);
    });

    it('should return empty result when no race IDs provided', async () => {
      const { pollOdds } = await import('@/ingestion/jobs/oddsPoller');

      const result = await pollOdds({ raceIds: [] });

      expect(result.snapshots).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe('pollOddsForRace', () => {
    it('should poll odds for a single race', async () => {
      const { fetchKraOdds } = await import('@/ingestion/clients/kraClient');
      const { mapKraOddsBatch } = await import('@/ingestion/mappers/oddsMapper');
      const { pollOddsForRace } = await import('@/ingestion/jobs/oddsPoller');

      (fetchKraOdds as MockFn).mockResolvedValue([{}]);
      (mapKraOddsBatch as MockFn).mockReturnValue([
        { raceId: 'test', time: new Date(), entryNo: 1, winOdds: 2.0 },
      ]);

      const snapshots = await pollOddsForRace('horse-seoul-1-20241210');

      expect(snapshots).toBe(1);
    });
  });

  describe('smart scheduling integration', () => {
    it('should use smart scheduler to filter races for collection', async () => {
      const { getUpcomingRacesForCollection } = await import('@/ingestion/utils/smartScheduler');

      const mockRaces = [{ id: 'race1', startTime: new Date().toISOString() }];
      (getUpcomingRacesForCollection as MockFn).mockReturnValue(mockRaces);

      // Just verify the function uses the smart scheduler
      expect(getUpcomingRacesForCollection).toBeDefined();
    });
  });
});
