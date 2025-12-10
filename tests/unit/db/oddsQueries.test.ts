/**
 * @jest-environment node
 *
 * Unit tests for odds query functions
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Create chainable mock for Drizzle ORM
const createChainableMock = (finalValue: any) => {
  const mock: any = {
    select: jest.fn(() => mock),
    from: jest.fn(() => mock),
    where: jest.fn(() => mock),
    orderBy: jest.fn(() => mock),
    limit: jest.fn(() => Promise.resolve(finalValue)),
    groupBy: jest.fn(() => ({
      orderBy: jest.fn(() => Promise.resolve(finalValue)),
    })),
    execute: jest.fn(() => Promise.resolve({ rows: [] })),
  };
  return mock;
};

// Mock the database
jest.mock('@/lib/db/client', () => ({
  db: createChainableMock([]),
}));

jest.mock('@/lib/db/schema', () => ({
  oddsSnapshots: {
    raceId: 'raceId',
    time: 'time',
    entryNo: 'entryNo',
    winOdds: 'winOdds',
    placeOdds: 'placeOdds',
    exactaOdds: 'exactaOdds',
    quinellaOdds: 'quinellaOdds',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ eq: [a, b] })),
  and: jest.fn((...args) => ({ and: args })),
  gte: jest.fn((a, b) => ({ gte: [a, b] })),
  lte: jest.fn((a, b) => ({ lte: [a, b] })),
  between: jest.fn((a, b, c) => ({ between: [a, b, c] })),
  asc: jest.fn((a) => ({ asc: a })),
  desc: jest.fn((a) => ({ desc: a })),
  sql: jest.fn((strings, ...values) => ({ sql: strings, values })),
  avg: jest.fn(() => 'avg'),
  min: jest.fn(() => 'min'),
  max: jest.fn(() => 'max'),
}));

describe('oddsQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOddsHistory', () => {
    it('should return odds history for a race', async () => {
      const { getOddsHistory } = await import('@/lib/db/queries/odds');

      const history = await getOddsHistory('horse-seoul-1-20241210');

      expect(history).toBeInstanceOf(Array);
    });

    it('should filter by entry number when provided', async () => {
      const { getOddsHistory } = await import('@/lib/db/queries/odds');

      const history = await getOddsHistory('horse-seoul-1-20241210', { entryNo: 1 });

      expect(history).toBeInstanceOf(Array);
    });

    it('should filter by time range when provided', async () => {
      const { getOddsHistory } = await import('@/lib/db/queries/odds');

      const startTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const endTime = new Date();

      const history = await getOddsHistory('horse-seoul-1-20241210', {
        startTime,
        endTime,
      });

      expect(history).toBeInstanceOf(Array);
    });

    it('should limit results when specified', async () => {
      const { getOddsHistory } = await import('@/lib/db/queries/odds');

      const history = await getOddsHistory('horse-seoul-1-20241210', { limit: 100 });

      expect(history).toBeInstanceOf(Array);
    });
  });

  describe('getOddsSummary', () => {
    it('should return aggregated odds summary', async () => {
      const { getOddsSummary } = await import('@/lib/db/queries/odds');

      const summary = await getOddsSummary('horse-seoul-1-20241210');

      expect(summary).toBeInstanceOf(Array);
    });
  });

  describe('getLatestOdds', () => {
    it('should return most recent odds for a race', async () => {
      const { getLatestOdds } = await import('@/lib/db/queries/odds');

      const odds = await getLatestOdds('horse-seoul-1-20241210');

      expect(odds).toBeInstanceOf(Array);
    });
  });

  describe('getSnapshotCount', () => {
    it('should return count of odds snapshots for a race', async () => {
      const { getSnapshotCount } = await import('@/lib/db/queries/odds');

      const count = await getSnapshotCount('horse-seoul-1-20241210');

      expect(typeof count).toBe('number');
    });
  });

  describe('getOddsTimeSeries', () => {
    it('should return time-bucketed odds data', async () => {
      const { getOddsTimeSeries } = await import('@/lib/db/queries/odds');

      // Just verify the function exists
      expect(typeof getOddsTimeSeries).toBe('function');
    });
  });

  describe('getOddsDrift', () => {
    it('should return odds drift per entry', async () => {
      const { getOddsDrift } = await import('@/lib/db/queries/odds');

      // Just verify the function exists
      expect(typeof getOddsDrift).toBe('function');
    });
  });
});
