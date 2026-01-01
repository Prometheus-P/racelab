/**
 * PostgresDataSource Tests
 *
 * TDD 기반 PostgresDataSource 테스트
 * Phase 4a: 실제 DB 연동을 위한 데이터 소스
 */

import type { RaceFilters } from '../executor';

// =============================================================================
// Mock Setup - Must be before imports
// =============================================================================

// Create mock functions that can be configured per test
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLeftJoin = jest.fn();
const mockLimit = jest.fn();

// Setup default chain
const resetMockChain = () => {
  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
  mockWhere.mockReturnValue({ orderBy: mockOrderBy });
  mockLeftJoin.mockReturnValue({ where: mockWhere });
  mockOrderBy.mockResolvedValue([]);
  mockLimit.mockResolvedValue([]);
};

jest.mock('../../db/client', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

jest.mock('../../db/schema', () => ({
  races: { id: 'id', raceDate: 'raceDate', raceType: 'raceType', status: 'status', grade: 'grade', trackId: 'trackId', raceNo: 'raceNo', startTime: 'startTime' },
  entries: { raceId: 'raceId', entryNo: 'entryNo', rating: 'rating', burdenWeight: 'burdenWeight' },
  results: { raceId: 'raceId', entryNo: 'entryNo', finishPosition: 'finishPosition', dividendWin: 'dividendWin', dividendPlace: 'dividendPlace' },
  oddsSnapshots: { raceId: 'raceId', entryNo: 'entryNo', time: 'time', oddsWin: 'oddsWin', oddsPlace: 'oddsPlace', poolTotal: 'poolTotal', poolWin: 'poolWin', popularityRank: 'popularityRank' },
  tracks: { id: 'id', code: 'code', name: 'name' },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  and: jest.fn((...args) => ({ type: 'and', conditions: args })),
  gte: jest.fn((a, b) => ({ type: 'gte', field: a, value: b })),
  lte: jest.fn((a, b) => ({ type: 'lte', field: a, value: b })),
  inArray: jest.fn((a, b) => ({ type: 'inArray', field: a, values: b })),
  asc: jest.fn((a) => ({ type: 'asc', field: a })),
}));

// Now import the module under test
import { PostgresDataSource, checkDatabaseHasData } from './postgres';

// =============================================================================
// PostgresDataSource Class Tests
// =============================================================================

describe('PostgresDataSource', () => {
  let dataSource: PostgresDataSource;

  beforeEach(() => {
    dataSource = new PostgresDataSource();
    jest.clearAllMocks();
    resetMockChain();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(dataSource).toBeInstanceOf(PostgresDataSource);
    });
  });

  describe('getRaceIds', () => {
    it('should return race IDs within date range', async () => {
      const mockRaces = [
        { id: 'horse-seoul-1-20250101' },
        { id: 'horse-seoul-2-20250101' },
        { id: 'horse-busan-1-20250101' },
      ];

      mockWhere.mockResolvedValue(mockRaces);

      const result = await dataSource.getRaceIds('2025-01-01', '2025-01-31');

      expect(result).toEqual([
        'horse-seoul-1-20250101',
        'horse-seoul-2-20250101',
        'horse-busan-1-20250101',
      ]);
    });

    it('should return empty array when no races found', async () => {
      mockWhere.mockResolvedValue([]);

      const result = await dataSource.getRaceIds('2099-01-01', '2099-01-31');

      expect(result).toEqual([]);
    });

    it('should apply race type filter', async () => {
      const mockRaces = [{ id: 'horse-seoul-1-20250101' }];
      mockWhere.mockResolvedValue(mockRaces);

      const filters: RaceFilters = { raceTypes: ['horse'] };
      const result = await dataSource.getRaceIds('2025-01-01', '2025-01-31', filters);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('horse');
    });

    it('should apply tracks filter', async () => {
      const mockRaces = [
        { id: 'horse-seoul-1-20250101' },
        { id: 'horse-busan-1-20250101' },
      ];
      mockWhere.mockResolvedValue(mockRaces);

      const filters: RaceFilters = { tracks: ['seoul'] };
      const result = await dataSource.getRaceIds('2025-01-01', '2025-01-31', filters);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('horse-seoul-1-20250101');
    });

    it('should apply grade filter', async () => {
      const mockRaces = [{ id: 'horse-seoul-1-20250101' }];
      mockWhere.mockResolvedValue(mockRaces);

      const filters: RaceFilters = { grades: ['G1'] };
      const result = await dataSource.getRaceIds('2025-01-01', '2025-01-31', filters);

      expect(result).toHaveLength(1);
    });

    it('should handle date range validation', async () => {
      mockWhere.mockResolvedValue([]);

      // dateFrom > dateTo should still work (empty result)
      const result = await dataSource.getRaceIds('2025-12-31', '2025-01-01');
      expect(result).toEqual([]);
    });
  });

  describe('getRaceContext', () => {
    it('should return RaceContext for valid race ID', async () => {
      const mockRace = {
        race: {
          id: 'horse-seoul-1-20250101',
          raceType: 'horse',
          raceNo: 1,
          raceDate: '2025-01-01',
          grade: 'G1',
          startTime: '14:00:00',
        },
        track: { code: 'seoul' },
      };

      const mockEntries = [
        {
          entryNo: 1,
          raceId: 'horse-seoul-1-20250101',
          rating: 80,
          burdenWeight: '57.0',
        },
        {
          entryNo: 2,
          raceId: 'horse-seoul-1-20250101',
          rating: 75,
          burdenWeight: '55.0',
        },
      ];

      const mockOdds = [
        {
          entryNo: 1,
          oddsWin: '2.5',
          oddsPlace: '1.5',
          poolTotal: 100000000,
          popularityRank: 1,
          time: new Date('2025-01-01T13:55:00Z'),
        },
        {
          entryNo: 2,
          oddsWin: '5.0',
          oddsPlace: '2.0',
          poolTotal: 100000000,
          popularityRank: 2,
          time: new Date('2025-01-01T13:55:00Z'),
        },
      ];

      // First call: get race
      mockWhere.mockResolvedValueOnce([mockRace]);
      // Second call: get entries
      mockWhere.mockResolvedValueOnce(mockEntries);
      // Third call: get odds
      mockOrderBy.mockResolvedValueOnce(mockOdds);

      const result = await dataSource.getRaceContext('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      expect(result?.raceId).toBe('horse-seoul-1-20250101');
      expect(result?.raceType).toBe('horse');
      expect(result?.raceNo).toBe(1);
      expect(result?.track).toBe('seoul');
      expect(result?.entries).toHaveLength(2);
    });

    it('should return null for non-existent race ID', async () => {
      mockWhere.mockResolvedValue([]);

      const result = await dataSource.getRaceContext('non-existent-race');

      expect(result).toBeNull();
    });

    it('should include entry odds data', async () => {
      const mockRace = {
        race: {
          id: 'horse-seoul-1-20250101',
          raceType: 'horse',
          raceNo: 1,
          raceDate: '2025-01-01',
        },
        track: { code: 'seoul' },
      };

      const mockEntries = [
        { entryNo: 1, raceId: 'horse-seoul-1-20250101', rating: 80, burdenWeight: '57.0' },
      ];

      const mockOdds = [
        {
          entryNo: 1,
          oddsWin: '3.5',
          oddsPlace: '1.8',
          poolTotal: 50000000,
          poolWin: 5000000,
          popularityRank: 2,
          time: new Date('2025-01-01T13:00:00Z'),
        },
        {
          entryNo: 1,
          oddsWin: '3.0',
          oddsPlace: '1.6',
          poolTotal: 100000000,
          poolWin: 12000000,
          popularityRank: 1,
          time: new Date('2025-01-01T13:55:00Z'),
        },
      ];

      mockWhere.mockResolvedValueOnce([mockRace]);
      mockWhere.mockResolvedValueOnce(mockEntries);
      mockOrderBy.mockResolvedValueOnce(mockOdds);

      const result = await dataSource.getRaceContext('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      const entry = result?.entries[0];
      expect(entry?.odds_win).toBe(3.0); // Last odds
      expect(entry?.odds_place).toBe(1.6);
      expect(entry?.popularity_rank).toBe(1);
      expect(entry?.pool_total).toBe(100000000);
      expect(entry?.oddsTimeline).toHaveLength(2);
    });

    it('should calculate odds drift correctly', async () => {
      const mockRace = {
        race: {
          id: 'horse-seoul-1-20250101',
          raceType: 'horse',
          raceNo: 1,
          raceDate: '2025-01-01',
        },
        track: { code: 'seoul' },
      };

      const mockEntries = [
        { entryNo: 1, raceId: 'horse-seoul-1-20250101' },
      ];

      // First odds: 5.0, Last odds: 3.0
      // Drift: (3.0 - 5.0) / 5.0 * 100 = -40%
      const mockOdds = [
        {
          entryNo: 1,
          oddsWin: '5.0',
          time: new Date('2025-01-01T12:00:00Z'),
        },
        {
          entryNo: 1,
          oddsWin: '3.0',
          time: new Date('2025-01-01T13:55:00Z'),
        },
      ];

      mockWhere.mockResolvedValueOnce([mockRace]);
      mockWhere.mockResolvedValueOnce(mockEntries);
      mockOrderBy.mockResolvedValueOnce(mockOdds);

      const result = await dataSource.getRaceContext('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      const entry = result?.entries[0];
      expect(entry?.odds_drift_pct).toBeCloseTo(-40, 1);
    });

    it('should calculate odds stddev correctly', async () => {
      const mockRace = {
        race: {
          id: 'horse-seoul-1-20250101',
          raceType: 'horse',
          raceNo: 1,
          raceDate: '2025-01-01',
        },
        track: { code: 'seoul' },
      };

      const mockEntries = [{ entryNo: 1, raceId: 'horse-seoul-1-20250101' }];

      // Odds: 2, 4, 6 -> mean = 4, stddev = sqrt((4+0+4)/3) = sqrt(8/3) ≈ 1.63
      const mockOdds = [
        { entryNo: 1, oddsWin: '2.0', time: new Date('2025-01-01T12:00:00Z') },
        { entryNo: 1, oddsWin: '4.0', time: new Date('2025-01-01T13:00:00Z') },
        { entryNo: 1, oddsWin: '6.0', time: new Date('2025-01-01T14:00:00Z') },
      ];

      mockWhere.mockResolvedValueOnce([mockRace]);
      mockWhere.mockResolvedValueOnce(mockEntries);
      mockOrderBy.mockResolvedValueOnce(mockOdds);

      const result = await dataSource.getRaceContext('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      const entry = result?.entries[0];
      // Mean = 4, variance = ((2-4)^2 + (4-4)^2 + (6-4)^2) / 3 = 8/3
      // stddev = sqrt(8/3) ≈ 1.633
      expect(entry?.odds_stddev).toBeCloseTo(1.633, 2);
    });

    it('should include horse rating and burden weight', async () => {
      const mockRace = {
        race: {
          id: 'horse-seoul-1-20250101',
          raceType: 'horse',
          raceNo: 1,
          raceDate: '2025-01-01',
        },
        track: { code: 'seoul' },
      };

      const mockEntries = [
        { entryNo: 1, raceId: 'horse-seoul-1-20250101', rating: 85, burdenWeight: '57.5' },
      ];

      mockWhere.mockResolvedValueOnce([mockRace]);
      mockWhere.mockResolvedValueOnce(mockEntries);
      mockOrderBy.mockResolvedValueOnce([]);

      const result = await dataSource.getRaceContext('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      const entry = result?.entries[0];
      expect(entry?.horse_rating).toBe(85);
      expect(entry?.burden_weight).toBe(57.5);
    });
  });

  describe('getRaceResult', () => {
    it('should return RaceResultData for finished race', async () => {
      const mockResults = [
        { entryNo: 3, finishPosition: 1, dividendWin: 2500, dividendPlace: 1500 },
        { entryNo: 1, finishPosition: 2, dividendWin: null, dividendPlace: 1200 },
        { entryNo: 5, finishPosition: 3, dividendWin: null, dividendPlace: 2000 },
      ];

      mockWhere.mockResolvedValue(mockResults);

      const result = await dataSource.getRaceResult('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      expect(result?.raceId).toBe('horse-seoul-1-20250101');
      expect(result?.finishPositions.get(3)).toBe(1); // Entry 3 finished 1st
      expect(result?.finishPositions.get(1)).toBe(2); // Entry 1 finished 2nd
      expect(result?.dividends.win.get(3)).toBe(2.5); // 2500 / 1000 = 2.5배
      expect(result?.dividends.place?.get(1)).toBe(1.2); // 1200 / 1000 = 1.2배
    });

    it('should return null when no results found', async () => {
      mockWhere.mockResolvedValue([]);

      const result = await dataSource.getRaceResult('non-existent-race');

      expect(result).toBeNull();
    });

    it('should handle canceled races', async () => {
      const mockResults = [
        { entryNo: 1, finishPosition: 0, dividendWin: null, dividendPlace: null },
      ];

      mockWhere.mockResolvedValue(mockResults);

      const result = await dataSource.getRaceResult('horse-seoul-1-20250101');

      // Position 0 indicates canceled/scratched
      expect(result).not.toBeNull();
      expect(result?.canceled).toBe(true);
    });

    it('should convert dividend values correctly', async () => {
      // Database stores dividends in KRW (e.g., 2500 for 2.5배)
      const mockResults = [
        { entryNo: 1, finishPosition: 1, dividendWin: 12340, dividendPlace: 1050 },
      ];

      mockWhere.mockResolvedValue(mockResults);

      const result = await dataSource.getRaceResult('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      // 12340 / 1000 = 12.34배
      expect(result?.dividends.win.get(1)).toBe(12.34);
      // 1050 / 1000 = 1.05배
      expect(result?.dividends.place?.get(1)).toBe(1.05);
    });
  });

  describe('edge cases', () => {
    it('should handle race with no entries', async () => {
      const mockRace = {
        race: {
          id: 'horse-seoul-1-20250101',
          raceType: 'horse',
          raceNo: 1,
          raceDate: '2025-01-01',
        },
        track: { code: 'seoul' },
      };

      mockWhere.mockResolvedValueOnce([mockRace]);
      mockWhere.mockResolvedValueOnce([]); // No entries
      mockOrderBy.mockResolvedValueOnce([]);

      const result = await dataSource.getRaceContext('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      expect(result?.entries).toHaveLength(0);
    });

    it('should handle race with no odds data', async () => {
      const mockRace = {
        race: {
          id: 'horse-seoul-1-20250101',
          raceType: 'horse',
          raceNo: 1,
          raceDate: '2025-01-01',
        },
        track: { code: 'seoul' },
      };

      const mockEntries = [{ entryNo: 1, raceId: 'horse-seoul-1-20250101' }];

      mockWhere.mockResolvedValueOnce([mockRace]);
      mockWhere.mockResolvedValueOnce(mockEntries);
      mockOrderBy.mockResolvedValueOnce([]); // No odds

      const result = await dataSource.getRaceContext('horse-seoul-1-20250101');

      expect(result).not.toBeNull();
      const entry = result?.entries[0];
      expect(entry?.odds_win).toBeUndefined();
      expect(entry?.oddsTimeline).toHaveLength(0);
    });

    it('should handle database errors gracefully', async () => {
      mockWhere.mockRejectedValue(new Error('DB connection failed'));

      await expect(dataSource.getRaceIds('2025-01-01', '2025-01-31')).rejects.toThrow(
        'DB connection failed'
      );
    });

    it('should extract track code from race ID when track is null', async () => {
      const mockRace = {
        race: {
          id: 'horse-busan-5-20250101',
          raceType: 'horse',
          raceNo: 5,
          raceDate: '2025-01-01',
        },
        track: null,
      };

      mockWhere.mockResolvedValueOnce([mockRace]);
      mockWhere.mockResolvedValueOnce([]);
      mockOrderBy.mockResolvedValueOnce([]);

      const result = await dataSource.getRaceContext('horse-busan-5-20250101');

      expect(result).not.toBeNull();
      expect(result?.track).toBe('busan');
    });
  });
});

// =============================================================================
// checkDatabaseHasData Function Tests
// =============================================================================

describe('checkDatabaseHasData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockChain();
  });

  it('should return true when database has finished races', async () => {
    mockLimit.mockResolvedValue([{ id: 'horse-seoul-1-20250101' }]);
    mockWhere.mockReturnValue({ limit: mockLimit });

    const result = await checkDatabaseHasData();

    expect(result).toBe(true);
  });

  it('should return false when database is empty', async () => {
    mockLimit.mockResolvedValue([]);
    mockWhere.mockReturnValue({ limit: mockLimit });

    const result = await checkDatabaseHasData();

    expect(result).toBe(false);
  });

  it('should return false on database error', async () => {
    mockWhere.mockImplementation(() => {
      throw new Error('Connection failed');
    });

    const result = await checkDatabaseHasData();

    expect(result).toBe(false);
  });
});

// =============================================================================
// Helper Function Tests
// =============================================================================

describe('calculateOddsDrift', () => {
  it('should calculate percentage change correctly', () => {
    // First = 5.0, Last = 3.0
    // (3.0 - 5.0) / 5.0 * 100 = -40%
    const drift = ((3.0 - 5.0) / 5.0) * 100;
    expect(drift).toBe(-40);
  });

  it('should handle increasing odds', () => {
    // First = 3.0, Last = 6.0
    // (6.0 - 3.0) / 3.0 * 100 = +100%
    const drift = ((6.0 - 3.0) / 3.0) * 100;
    expect(drift).toBe(100);
  });
});

describe('calculateOddsStdDev', () => {
  it('should calculate standard deviation correctly', () => {
    const odds = [2, 4, 6];
    const mean = odds.reduce((a, b) => a + b, 0) / odds.length; // 4
    const squaredDiffs = odds.map((x) => Math.pow(x - mean, 2)); // [4, 0, 4]
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / odds.length; // 8/3
    const stddev = Math.sqrt(variance);
    expect(stddev).toBeCloseTo(1.633, 2);
  });
});
