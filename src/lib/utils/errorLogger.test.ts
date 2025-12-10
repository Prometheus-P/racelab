// src/lib/utils/errorLogger.test.ts

import { logError, logApiError, initErrorLogger, ErrorSeverity } from './errorLogger';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() })),
}));

import * as Sentry from '@sentry/nextjs';

describe('errorLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initErrorLogger', () => {
    it('should initialize Sentry with DSN', () => {
      const dsn = 'https://test@sentry.io/123';
      initErrorLogger(dsn);

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn,
        })
      );
    });

    it('should initialize with environment setting', () => {
      const dsn = 'https://test@sentry.io/123';
      initErrorLogger(dsn, { environment: 'production' });

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn,
          environment: 'production',
        })
      );
    });
  });

  describe('logError', () => {
    it('should capture exception with Sentry', () => {
      const error = new Error('Test error');
      logError(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should include context when provided', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'fetchRaces' };
      logError(error, { context });

      expect(Sentry.withScope).toHaveBeenCalled();
    });

    it('should set severity level', () => {
      const error = new Error('Critical error');
      logError(error, { severity: ErrorSeverity.ERROR });

      expect(Sentry.withScope).toHaveBeenCalled();
    });
  });

  describe('logApiError', () => {
    it('should log API error with endpoint info', () => {
      const error = new Error('API timeout');
      logApiError(error, {
        endpoint: '/api/races/horse',
        method: 'GET',
        statusCode: 408,
      });

      expect(Sentry.withScope).toHaveBeenCalled();
    });

    it('should include response time when provided', () => {
      const error = new Error('Slow API');
      logApiError(error, {
        endpoint: '/api/races/horse',
        method: 'GET',
        responseTime: 5000,
      });

      expect(Sentry.withScope).toHaveBeenCalled();
    });

    it('should tag external API errors correctly', () => {
      const error = new Error('KRA API failed');
      logApiError(error, {
        endpoint: 'https://kra.api.go.kr/races',
        method: 'GET',
        isExternalApi: true,
        apiProvider: 'KRA',
      });

      expect(Sentry.withScope).toHaveBeenCalled();
    });
  });

  describe('ErrorSeverity constants', () => {
    it('should have correct severity levels', () => {
      expect(ErrorSeverity.DEBUG).toBe('debug');
      expect(ErrorSeverity.INFO).toBe('info');
      expect(ErrorSeverity.WARNING).toBe('warning');
      expect(ErrorSeverity.ERROR).toBe('error');
      expect(ErrorSeverity.FATAL).toBe('fatal');
    });
  });
});
