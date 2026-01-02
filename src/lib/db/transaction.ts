/**
 * Database Transaction Utilities
 *
 * Row-level locking과 안전한 트랜잭션 처리를 위한 유틸리티
 */

import { db } from './client';
import { sql } from 'drizzle-orm';
import { safeInfo } from '@/lib/utils/safeLogger';

/**
 * Transaction isolation levels
 */
export type IsolationLevel = 'read_committed' | 'repeatable_read' | 'serializable';

/**
 * Lock mode for SELECT ... FOR UPDATE
 */
export type LockMode = 'update' | 'share' | 'no_key_update' | 'key_share';

/**
 * Transaction options
 */
export interface TransactionOptions {
  /** Isolation level (default: read_committed) */
  isolationLevel?: IsolationLevel;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Retry count on serialization failure */
  maxRetries?: number;
}

/**
 * Transaction callback type (inferred from db.transaction)
 */
type TransactionCallback<T> = Parameters<typeof db.transaction<T>>[0];

/**
 * Execute a function within a transaction with optional isolation level
 *
 * @param fn - Function to execute within transaction
 * @param options - Transaction options
 * @returns Result of the function
 *
 * @example
 * ```typescript
 * const result = await withTransaction(async (tx) => {
 *   await tx.insert(entries).values(data);
 *   await tx.update(races).set({ status: 'upcoming' });
 *   return { success: true };
 * }, { isolationLevel: 'serializable' });
 * ```
 */
export async function withTransaction<T>(
  fn: TransactionCallback<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const { isolationLevel = 'read_committed', maxRetries = 3 } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Set isolation level if not default
      if (isolationLevel !== 'read_committed') {
        await db.execute(sql`SET TRANSACTION ISOLATION LEVEL ${sql.raw(isolationLevel.toUpperCase().replace('_', ' '))}`);
      }

      const result = await db.transaction(fn);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a serialization failure (can retry)
      const isSerializationFailure =
        lastError.message.includes('could not serialize') ||
        lastError.message.includes('deadlock detected') ||
        lastError.message.includes('40001') || // PostgreSQL serialization_failure
        lastError.message.includes('40P01'); // PostgreSQL deadlock_detected

      if (isSerializationFailure && attempt < maxRetries) {
        const backoffMs = Math.min(100 * Math.pow(2, attempt - 1), 2000);
        safeInfo(`[Transaction] Serialization failure, retrying in ${backoffMs}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error('Transaction failed after max retries');
}

/**
 * Generate SELECT ... FOR UPDATE SQL fragment
 *
 * @param lockMode - Lock mode
 * @param noWait - If true, fail immediately instead of waiting
 * @param skipLocked - If true, skip locked rows
 * @returns SQL fragment
 */
export function forUpdate(
  lockMode: LockMode = 'update',
  noWait = false,
  skipLocked = false
): ReturnType<typeof sql> {
  let lockClause = '';

  switch (lockMode) {
    case 'update':
      lockClause = 'FOR UPDATE';
      break;
    case 'share':
      lockClause = 'FOR SHARE';
      break;
    case 'no_key_update':
      lockClause = 'FOR NO KEY UPDATE';
      break;
    case 'key_share':
      lockClause = 'FOR KEY SHARE';
      break;
  }

  if (noWait) {
    lockClause += ' NOWAIT';
  } else if (skipLocked) {
    lockClause += ' SKIP LOCKED';
  }

  return sql.raw(lockClause);
}

/**
 * Execute SELECT ... FOR UPDATE within a transaction
 *
 * Prevents race conditions by locking selected rows until transaction completes
 *
 * @param tableName - Table to select from
 * @param whereClause - WHERE condition
 * @param options - Lock options
 *
 * @example
 * ```typescript
 * await withTransaction(async (tx) => {
 *   // Lock the race row first
 *   const [race] = await tx.execute(
 *     sql`SELECT * FROM races WHERE id = ${raceId} FOR UPDATE`
 *   );
 *
 *   // Now safe to update
 *   await tx.update(races).set({ status: 'live' }).where(eq(races.id, raceId));
 * });
 * ```
 */
export async function selectForUpdate<T>(
  query: ReturnType<typeof sql>,
  lockMode: LockMode = 'update'
): Promise<T[]> {
  const lockClause = forUpdate(lockMode);
  const fullQuery = sql`${query} ${lockClause}`;
  const result = await db.execute(fullQuery);
  return result.rows as T[];
}

/**
 * Acquire advisory lock (application-level lock)
 *
 * Useful for coordinating across multiple processes
 *
 * @param lockId - Numeric lock identifier
 * @param shared - If true, acquire shared lock (multiple readers)
 * @returns true if lock acquired, false otherwise
 */
export async function tryAdvisoryLock(lockId: number, shared = false): Promise<boolean> {
  const lockFn = shared ? 'pg_try_advisory_lock_shared' : 'pg_try_advisory_lock';
  const result = await db.execute(sql`SELECT ${sql.raw(lockFn)}(${lockId}) as acquired`);
  return (result.rows[0] as { acquired: boolean })?.acquired ?? false;
}

/**
 * Release advisory lock
 */
export async function releaseAdvisoryLock(lockId: number, shared = false): Promise<boolean> {
  const unlockFn = shared ? 'pg_advisory_unlock_shared' : 'pg_advisory_unlock';
  const result = await db.execute(sql`SELECT ${sql.raw(unlockFn)}(${lockId}) as released`);
  return (result.rows[0] as { released: boolean })?.released ?? false;
}

/**
 * Execute function with advisory lock
 *
 * @param lockId - Numeric lock identifier
 * @param fn - Function to execute while holding lock
 * @param timeout - Max wait time in ms (0 = no wait)
 */
export async function withAdvisoryLock<T>(
  lockId: number,
  fn: () => Promise<T>,
  timeout = 5000
): Promise<T> {
  const startTime = Date.now();

  while (true) {
    const acquired = await tryAdvisoryLock(lockId);
    if (acquired) {
      try {
        return await fn();
      } finally {
        await releaseAdvisoryLock(lockId);
      }
    }

    if (timeout === 0 || Date.now() - startTime >= timeout) {
      throw new Error(`Failed to acquire advisory lock ${lockId} within ${timeout}ms`);
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/**
 * Generate a consistent lock ID from a string key
 */
export function stringToLockId(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
