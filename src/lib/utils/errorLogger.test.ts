// src/lib/utils/errorLogger.test.ts
// Note: errorLogger now uses safeLogger which adds a timestamp prefix
// Console output format: [timestamp] [SEVERITY] message error logData

import {
  logError,
  logApiError,
  logExternalApiError,
  initErrorLogger,
  ErrorSeverity,
} from './errorLogger';

describe('errorLogger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  // Helper to get args accounting for timestamp prefix from safeLogger
  const getLogArgs = (spy: jest.SpyInstance) => {
    const call = spy.mock.calls[0];
    // safeLogger adds timestamp at index 0, so actual args start at index 1
    return {
      timestamp: call[0],
      prefix: call[1],
      message: call[2],
      error: call[3],
      logData: call[4],
    };
  };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  describe('initErrorLogger', () => {
    it('should log info message when Sentry is not available', () => {
      initErrorLogger('https://test@sentry.io/123');

      expect(consoleInfoSpy).toHaveBeenCalled();
      // safeInfo with single arg: [timestamp, message]
      const call = consoleInfoSpy.mock.calls[0];
      expect(call[1]).toBe('[ErrorLogger] Sentry not available, using console fallback');
    });
  });

  describe('logError', () => {
    it('should log error to console with ERROR severity', () => {
      const error = new Error('Test error');
      logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const { prefix, message } = getLogArgs(consoleErrorSpy);
      expect(prefix).toBe('[ERROR]');
      expect(message).toBe('Test error');
    });

    it('should log error to console with FATAL severity', () => {
      const error = new Error('Fatal error');
      logError(error, { severity: ErrorSeverity.FATAL });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const { prefix } = getLogArgs(consoleErrorSpy);
      expect(prefix).toBe('[FATAL]');
    });

    it('should log warning to console with WARNING severity', () => {
      const error = new Error('Warning message');
      logError(error, { severity: ErrorSeverity.WARNING });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const { prefix } = getLogArgs(consoleWarnSpy);
      expect(prefix).toBe('[WARNING]');
    });

    it('should log string messages', () => {
      logError('String error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const { prefix, message } = getLogArgs(consoleErrorSpy);
      expect(prefix).toBe('[ERROR]');
      expect(message).toBe('String error message');
    });

    it('should include context in log data', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'fetchRaces' };
      logError(error, { context });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const { logData } = getLogArgs(consoleErrorSpy);
      expect(logData.context).toEqual(context);
    });

    it('should include tags in log data', () => {
      const error = new Error('Test error');
      const tags = { component: 'RaceList', action: 'fetch' };
      logError(error, { tags });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const { logData } = getLogArgs(consoleErrorSpy);
      expect(logData.tags).toEqual(tags);
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

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should use ERROR severity for 5xx status codes', () => {
      const error = new Error('Server error');
      logApiError(error, {
        endpoint: '/api/races/horse',
        method: 'GET',
        statusCode: 500,
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should use WARNING severity for non-5xx status codes', () => {
      const error = new Error('Not found');
      logApiError(error, {
        endpoint: '/api/races/horse',
        method: 'GET',
        statusCode: 404,
      });

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should include API provider tag for external APIs', () => {
      const error = new Error('KRA API failed');
      logApiError(error, {
        endpoint: 'https://kra.api.go.kr/races',
        method: 'GET',
        isExternalApi: true,
        apiProvider: 'KRA',
      });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const { logData } = getLogArgs(consoleWarnSpy);
      expect(logData.tags['api.provider']).toBe('KRA');
      expect(logData.tags['api.type']).toBe('external');
    });
  });

  describe('logExternalApiError', () => {
    it('should log KRA API errors', () => {
      const error = new Error('KRA API timeout');
      logExternalApiError(error, 'KRA', '/races/today', 5000);

      expect(consoleWarnSpy).toHaveBeenCalled();
      const { logData } = getLogArgs(consoleWarnSpy);
      expect(logData.tags['api.provider']).toBe('KRA');
    });

    it('should log KSPO Cycle API errors', () => {
      const error = new Error('KSPO API error');
      logExternalApiError(error, 'KSPO_CYCLE', '/cycle/races');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const { logData } = getLogArgs(consoleWarnSpy);
      expect(logData.tags['api.provider']).toBe('KSPO_CYCLE');
    });

    it('should log KSPO Boat API errors', () => {
      const error = new Error('KSPO Boat API error');
      logExternalApiError(error, 'KSPO_BOAT', '/boat/races');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const { logData } = getLogArgs(consoleWarnSpy);
      expect(logData.tags['api.provider']).toBe('KSPO_BOAT');
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
