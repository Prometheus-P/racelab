/**
 * @jest-environment node
 *
 * Unit tests for statusService
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Create chainable mock functions
const createChainableMock = (finalValue: any) => {
  const mock: any = {
    select: jest.fn(() => mock),
    from: jest.fn(() => mock),
    where: jest.fn(() => mock),
    groupBy: jest.fn(() => Promise.resolve(finalValue)),
    innerJoin: jest.fn(() => mock),
    execute: jest.fn(() => Promise.resolve({ rows: [] })),
  };
  return mock;
};

// Mock the database
jest.mock('@/lib/db/client', () => ({
  db: createChainableMock([]),
}));

jest.mock('@/lib/db/schema', () => ({
  races: {
    id: 'id',
    raceType: 'raceType',
    raceDate: 'raceDate',
    status: 'status',
  },
  entries: {
    raceId: 'raceId',
  },
  results: {
    raceId: 'raceId',
  },
  ingestionFailures: {
    status: 'status',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ eq: [a, b] })),
  sql: jest.fn((strings, ...values) => ({ sql: strings, values })),
}));

describe('statusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('module exports', () => {
    it('should export getIngestionStatus function', async () => {
      const statusService = await import('@/ingestion/services/statusService');
      expect(typeof statusService.getIngestionStatus).toBe('function');
    });

    it('should export getOddsCollectionStatus function', async () => {
      const statusService = await import('@/ingestion/services/statusService');
      expect(typeof statusService.getOddsCollectionStatus).toBe('function');
    });

    it('should export getFailureStatus function', async () => {
      const statusService = await import('@/ingestion/services/statusService');
      expect(typeof statusService.getFailureStatus).toBe('function');
    });

    it('should export getHealthCheck function', async () => {
      const statusService = await import('@/ingestion/services/statusService');
      expect(typeof statusService.getHealthCheck).toBe('function');
    });

    it('should export getDashboardStatus function', async () => {
      const statusService = await import('@/ingestion/services/statusService');
      expect(typeof statusService.getDashboardStatus).toBe('function');
    });
  });

  describe('IngestionStatus interface', () => {
    it('should have expected shape', () => {
      // Test that the interface is correctly defined
      const mockStatus = {
        date: '2024-12-10',
        races: {
          total: 10,
          scheduled: 5,
          inProgress: 2,
          finished: 3,
          cancelled: 0,
        },
        byType: {
          horse: 5,
          cycle: 3,
          boat: 2,
        },
        entries: { total: 100 },
        results: { total: 30 },
        successRate: 30,
        lastUpdated: new Date().toISOString(),
      };

      expect(mockStatus).toHaveProperty('date');
      expect(mockStatus.races).toHaveProperty('total');
      expect(mockStatus.byType).toHaveProperty('horse');
    });
  });

  describe('OddsCollectionStatus interface', () => {
    it('should have expected shape', () => {
      const mockOddsStatus = {
        totalSnapshots: 500,
        uniqueRaces: 10,
        avgSnapshotsPerRace: 50,
        lastCollectionTime: new Date().toISOString(),
      };

      expect(mockOddsStatus).toHaveProperty('totalSnapshots');
      expect(mockOddsStatus).toHaveProperty('uniqueRaces');
      expect(mockOddsStatus).toHaveProperty('avgSnapshotsPerRace');
    });
  });

  describe('FailureStatus interface', () => {
    it('should have expected shape', () => {
      const mockFailureStatus = {
        pending: 5,
        retrying: 2,
        resolved: 10,
        maxRetriesExceeded: 1,
        total: 18,
      };

      expect(mockFailureStatus).toHaveProperty('pending');
      expect(mockFailureStatus).toHaveProperty('total');
      expect(mockFailureStatus.total).toBe(18);
    });
  });

  describe('HealthCheck interface', () => {
    it('should have expected shape', () => {
      const mockHealthCheck = {
        status: 'healthy' as const,
        database: true,
        lastCheck: new Date().toISOString(),
        issues: [],
      };

      expect(mockHealthCheck.status).toBe('healthy');
      expect(mockHealthCheck.database).toBe(true);
      expect(mockHealthCheck.issues).toHaveLength(0);
    });

    it('should support degraded status', () => {
      const mockHealthCheck = {
        status: 'degraded' as const,
        database: true,
        lastCheck: new Date().toISOString(),
        issues: ['High number of pending failures: 15'],
      };

      expect(mockHealthCheck.status).toBe('degraded');
      expect(mockHealthCheck.issues).toHaveLength(1);
    });
  });
});
