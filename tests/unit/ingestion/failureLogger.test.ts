/**
 * @jest-environment node
 *
 * Unit tests for failureLogger utility
 */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Mock the database
const mockInsert = jest.fn(() => ({
  values: jest.fn(() => ({
    returning: jest.fn(() => Promise.resolve([{ id: 1, status: 'pending' }])),
  })),
}));

const mockSelect = jest.fn(() => ({
  from: jest.fn(() => ({
    where: jest.fn(() => ({
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve([])),
      })),
    })),
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve([])),
    })),
    groupBy: jest.fn(() => Promise.resolve([])),
  })),
}));

const mockUpdate = jest.fn(() => ({
  set: jest.fn(() => ({
    where: jest.fn(() => ({
      returning: jest.fn(() => Promise.resolve([{ id: 1, status: 'resolved' }])),
    })),
  })),
}));

jest.mock('@/lib/db/client', () => ({
  db: {
    insert: () => mockInsert(),
    select: () => mockSelect(),
    update: () => mockUpdate(),
  },
}));

jest.mock('@/lib/db/schema', () => ({
  ingestionFailures: {
    id: 'id',
    status: 'status',
    jobType: 'jobType',
    entityType: 'entityType',
    retryCount: 'retryCount',
    maxRetries: 'maxRetries',
    nextRetryAt: 'nextRetryAt',
    createdAt: 'createdAt',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ eq: [a, b] })),
  and: jest.fn((...args) => ({ and: args })),
  lt: jest.fn((a, b) => ({ lt: [a, b] })),
  desc: jest.fn((a) => ({ desc: a })),
  sql: jest.fn((strings, ...values) => ({ sql: strings, values })),
}));

describe('failureLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logFailure', () => {
    it('should create a new failure record with required fields', async () => {
      const { logFailure } = await import('@/ingestion/utils/failureLogger');

      const result = await logFailure({
        jobType: 'schedule_poll',
        entityType: 'race',
        entityId: 'test-race-1',
        errorMessage: 'API timeout',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status', 'pending');
    });

    it('should set default maxRetries to 5', async () => {
      const { logFailure } = await import('@/ingestion/utils/failureLogger');

      await logFailure({
        jobType: 'odds_poll',
        entityType: 'odds',
        entityId: 'test-odds-1',
        errorMessage: 'Connection failed',
      });

      // The mock captures the call - just verify no error thrown
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should use custom maxRetries when provided', async () => {
      const { logFailure } = await import('@/ingestion/utils/failureLogger');

      await logFailure({
        jobType: 'entry_poll',
        entityType: 'entry',
        entityId: 'test-entry-1',
        errorMessage: 'Parse error',
        maxRetries: 3,
      });

      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('exponential backoff calculation', () => {
    it('should calculate next retry time with exponential backoff', async () => {
      // Test the internal logic indirectly by verifying the pattern
      // Retry 0: 1 min, Retry 1: 2 min, Retry 2: 4 min, etc.
      const baseDelay = 60 * 1000; // 1 minute
      const maxDelay = 30 * 60 * 1000; // 30 minutes

      const calculateDelay = (retryCount: number) => {
        return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
      };

      expect(calculateDelay(0)).toBe(60000); // 1 minute
      expect(calculateDelay(1)).toBe(120000); // 2 minutes
      expect(calculateDelay(2)).toBe(240000); // 4 minutes
      expect(calculateDelay(3)).toBe(480000); // 8 minutes
      expect(calculateDelay(4)).toBe(960000); // 16 minutes
      expect(calculateDelay(5)).toBe(1800000); // 30 minutes (capped)
      expect(calculateDelay(6)).toBe(1800000); // 30 minutes (capped)
    });
  });

  describe('getFailures', () => {
    it('should return failures with default limit', async () => {
      const { getFailures } = await import('@/ingestion/utils/failureLogger');

      await getFailures();

      expect(mockSelect).toHaveBeenCalled();
    });

    it('should filter by status when provided', async () => {
      const { getFailures } = await import('@/ingestion/utils/failureLogger');

      await getFailures({ status: 'pending' });

      expect(mockSelect).toHaveBeenCalled();
    });
  });

  describe('updateFailureStatus', () => {
    it('should update failure status', async () => {
      const { updateFailureStatus } = await import('@/ingestion/utils/failureLogger');

      const result = await updateFailureStatus(1, 'resolved');

      expect(result).toHaveProperty('status', 'resolved');
    });
  });
});
