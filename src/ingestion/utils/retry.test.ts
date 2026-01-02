/**
 * Retry Utility Tests
 */

import { withRetry, createRetryWrapper } from './retry';

// Speed up tests by reducing actual delays
jest.useFakeTimers();

describe('Retry Utility', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const resultPromise = withRetry(fn);
      jest.runAllTimers();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed eventually', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success after retries');

      const resultPromise = withRetry(fn, { maxRetries: 3, initialDelay: 100 });

      // Advance timers for each retry
      await jest.advanceTimersByTimeAsync(100);
      await jest.advanceTimersByTimeAsync(200);
      await jest.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.data).toBe('success after retries');
      expect(result.attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries exceeded', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));

      const resultPromise = withRetry(fn, { maxRetries: 2, initialDelay: 100 });

      // Run all timers to complete retries
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Always fails');
      expect(result.attempts).toBe(3); // Initial + 2 retries
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use default options when none provided', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));

      const resultPromise = withRetry(fn);

      // Default maxRetries is 5, so 6 total attempts
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.attempts).toBe(6);
    });

    it('should call onRetry callback on each retry', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First'))
        .mockRejectedValueOnce(new Error('Second'))
        .mockResolvedValue('done');

      const onRetry = jest.fn();

      const resultPromise = withRetry(fn, {
        maxRetries: 3,
        initialDelay: 100,
        onRetry,
      });

      await jest.runAllTimersAsync();
      await resultPromise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(
        1,
        1,
        expect.objectContaining({ message: 'First' }),
        expect.any(Number)
      );
      expect(onRetry).toHaveBeenNthCalledWith(
        2,
        2,
        expect.objectContaining({ message: 'Second' }),
        expect.any(Number)
      );
    });

    it('should respect isRetryable function', async () => {
      const nonRetryableError = new Error('Non-retryable');
      const fn = jest.fn().mockRejectedValue(nonRetryableError);

      const isRetryable = jest.fn().mockReturnValue(false);

      const resultPromise = withRetry(fn, {
        maxRetries: 3,
        isRetryable,
      });

      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(isRetryable).toHaveBeenCalledWith(nonRetryableError);
    });

    it('should respect maxDelay option', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('1'))
        .mockRejectedValueOnce(new Error('2'))
        .mockRejectedValueOnce(new Error('3'))
        .mockResolvedValue('done');

      const onRetry = jest.fn();

      const resultPromise = withRetry(fn, {
        maxRetries: 5,
        initialDelay: 1000,
        maxDelay: 2000, // Cap at 2000ms
        backoffMultiplier: 2,
        onRetry,
      });

      await jest.runAllTimersAsync();
      await resultPromise;

      // Check that delays are capped
      // 1st retry: 1000ms, 2nd: 2000ms (would be 2000ms), 3rd: 2000ms (would be 4000ms but capped)
      const delays = onRetry.mock.calls.map((call) => call[2]);
      expect(delays.every((d) => d <= 2200)).toBe(true); // Allow for jitter
    });

    it('should track total time', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const resultPromise = withRetry(fn);
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.totalTime).toBeDefined();
      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should convert non-Error thrown values to Error', async () => {
      const fn = jest.fn().mockRejectedValue('string error');

      const resultPromise = withRetry(fn, { maxRetries: 0 });
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('string error');
    });
  });

  describe('createRetryWrapper', () => {
    it('should create wrapper with preset options', async () => {
      const apiRetry = createRetryWrapper({ maxRetries: 2, initialDelay: 50 });
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      const resultPromise = apiRetry(fn);
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should allow overriding options per call', async () => {
      const apiRetry = createRetryWrapper({ maxRetries: 5 });
      const fn = jest.fn().mockRejectedValue(new Error('Fail'));

      const resultPromise = apiRetry(fn, { maxRetries: 1 });
      await jest.runAllTimersAsync();
      await resultPromise;

      expect(fn).toHaveBeenCalledTimes(2); // 1 retry max = 2 attempts
    });
  });

  describe('Default isRetryable behavior', () => {
    it('should retry on TypeError with fetch', async () => {
      const fetchError = new TypeError('Failed to fetch');
      const fn = jest
        .fn()
        .mockRejectedValueOnce(fetchError)
        .mockResolvedValue('success');

      const resultPromise = withRetry(fn, { maxRetries: 1, initialDelay: 10 });
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx server errors', async () => {
      const serverError = new Error('HTTP status: 503');
      const fn = jest
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue('success');

      const resultPromise = withRetry(fn, { maxRetries: 1, initialDelay: 10 });
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 rate limit', async () => {
      const rateLimitError = new Error('status 429 Too Many Requests');
      const fn = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');

      const resultPromise = withRetry(fn, { maxRetries: 1, initialDelay: 10 });
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
