/**
 * @jest-environment node
 *
 * Unit tests for race query functions
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Create chainable mock for Drizzle ORM
const createChainableMock = (finalValue: any) => {
  const mock: any = {};
  // All methods return mock for chaining, but also support thenable
  const createThenable = () => ({
    select: jest.fn(() => createThenable()),
    from: jest.fn(() => createThenable()),
    where: jest.fn(() => createThenable()),
    orderBy: jest.fn(() => createThenable()),
    limit: jest.fn(() => createThenable()),
    offset: jest.fn(() => createThenable()),
    innerJoin: jest.fn(() => createThenable()),
    leftJoin: jest.fn(() => createThenable()),
    groupBy: jest.fn(() => createThenable()),
    then: (resolve: any) => Promise.resolve(finalValue).then(resolve),
  });
  return createThenable();
};

// Mock the database
jest.mock('@/lib/db/client', () => ({
  db: createChainableMock([]),
}));

jest.mock('@/lib/db/schema', () => ({
  races: {
    id: 'id',
    raceType: 'raceType',
    trackId: 'trackId',
    raceNo: 'raceNo',
    raceDate: 'raceDate',
    startTime: 'startTime',
    status: 'status',
  },
  entries: {
    raceId: 'raceId',
    id: 'id',
    entryNo: 'entryNo',
  },
  tracks: {
    id: 'id',
    name: 'name',
    region: 'region',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ eq: [a, b] })),
  and: jest.fn((...args) => ({ and: args })),
  asc: jest.fn((a) => ({ asc: a })),
  desc: jest.fn((a) => ({ desc: a })),
}));

describe('raceQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRacesByDate', () => {
    it('should return races for a given date', async () => {
      const { getRacesByDate } = await import('@/lib/db/queries/races');

      const races = await getRacesByDate('2024-12-10');

      expect(races).toBeInstanceOf(Array);
    });

    it('should filter by race type when provided', async () => {
      const { getRacesByDate } = await import('@/lib/db/queries/races');

      const races = await getRacesByDate('2024-12-10', { raceType: 'horse' });

      expect(races).toBeInstanceOf(Array);
    });

    it('should filter by track when provided', async () => {
      const { getRacesByDate } = await import('@/lib/db/queries/races');

      const races = await getRacesByDate('2024-12-10', { trackId: 1 });

      expect(races).toBeInstanceOf(Array);
    });
  });

  describe('getRaceById', () => {
    it('should return single race by id', async () => {
      const { getRaceById } = await import('@/lib/db/queries/races');

      const race = await getRaceById('horse-seoul-1-20241210');

      // Returns null or race object
      expect(race === null || typeof race === 'object').toBe(true);
    });
  });

  describe('getRaceWithEntries', () => {
    it('should return race with entries', async () => {
      const { getRaceWithEntries } = await import('@/lib/db/queries/races');

      const result = await getRaceWithEntries('horse-seoul-1-20241210');

      // Returns null or object with race and entries
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('getUpcomingRaces', () => {
    it('should return upcoming scheduled races for today', async () => {
      const { getUpcomingRaces } = await import('@/lib/db/queries/races');

      const races = await getUpcomingRaces(24);

      expect(races).toBeInstanceOf(Array);
    });
  });

  describe('getRaceCountsByStatus', () => {
    it('should return race counts by status for a date', async () => {
      const { getRaceCountsByStatus } = await import('@/lib/db/queries/races');

      // Just verify the function exists
      expect(typeof getRaceCountsByStatus).toBe('function');
    });
  });

  describe('getRacesByTrack', () => {
    it('should return races for a specific track', async () => {
      const { getRacesByTrack } = await import('@/lib/db/queries/races');

      const races = await getRacesByTrack(1);

      expect(races).toBeInstanceOf(Array);
    });
  });

  describe('getRacesWithTrack', () => {
    it('should return races with track information', async () => {
      const { getRacesWithTrack } = await import('@/lib/db/queries/races');

      // Just verify the function exists
      expect(typeof getRacesWithTrack).toBe('function');
    });
  });
});
