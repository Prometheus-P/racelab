// src/lib/api/errors.test.ts

import {
  ApiError,
  ExternalApiError,
  ApiErrorCode,
  ErrorMessages,
  toApiError,
  createSuccessResponse,
  createErrorResponse,
  WARNING_STALE_DATA,
} from './errors';

describe('API Error Module', () => {
  describe('ApiError', () => {
    it('should create error with code and default message', () => {
      const error = new ApiError(ApiErrorCode.NOT_FOUND);

      expect(error.code).toBe(ApiErrorCode.NOT_FOUND);
      expect(error.userMessage).toBe(ErrorMessages[ApiErrorCode.NOT_FOUND]);
      expect(error.statusCode).toBe(404);
      expect(error.isRetryable).toBe(false);
    });

    it('should create error with custom message', () => {
      const error = new ApiError(ApiErrorCode.SERVER_ERROR, {
        message: 'Custom internal message',
      });

      expect(error.message).toBe('Custom internal message');
      expect(error.userMessage).toBe(ErrorMessages[ApiErrorCode.SERVER_ERROR]);
    });

    it('should create error with custom status code', () => {
      const error = new ApiError(ApiErrorCode.BAD_REQUEST, {
        statusCode: 422,
      });

      expect(error.statusCode).toBe(422);
    });

    it('should create retryable error for external API errors', () => {
      const error = new ApiError(ApiErrorCode.EXTERNAL_API_ERROR);

      expect(error.isRetryable).toBe(true);
    });

    it('should preserve cause error', () => {
      const cause = new Error('Original error');
      const error = new ApiError(ApiErrorCode.SERVER_ERROR, { cause });

      expect(error.cause).toBe(cause);
    });
  });

  describe('ExternalApiError', () => {
    it('should create error with API name', () => {
      const error = new ExternalApiError('KRA API299');

      expect(error.apiName).toBe('KRA API299');
      expect(error.code).toBe(ApiErrorCode.EXTERNAL_API_ERROR);
      expect(error.statusCode).toBe(502);
      expect(error.isRetryable).toBe(true);
    });

    it('should create error with original status', () => {
      const error = new ExternalApiError('KSPO Cycle', {
        originalStatus: 503,
      });

      expect(error.originalStatus).toBe(503);
    });

    it('should create timeout error', () => {
      const error = new ExternalApiError('KRA API299', {
        code: ApiErrorCode.EXTERNAL_API_TIMEOUT,
      });

      expect(error.code).toBe(ApiErrorCode.EXTERNAL_API_TIMEOUT);
    });
  });

  describe('toApiError', () => {
    it('should return same error if already ApiError', () => {
      const original = new ApiError(ApiErrorCode.NOT_FOUND);
      const result = toApiError(original);

      expect(result).toBe(original);
    });

    it('should convert AbortError to timeout error', () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      const result = toApiError(abortError);

      expect(result.code).toBe(ApiErrorCode.EXTERNAL_API_TIMEOUT);
    });

    it('should convert timeout message to timeout error', () => {
      const error = new Error('Request timeout exceeded');
      const result = toApiError(error);

      expect(result.code).toBe(ApiErrorCode.EXTERNAL_API_TIMEOUT);
    });

    it('should convert network error to unavailable error', () => {
      const error = new Error('network error');
      const result = toApiError(error);

      expect(result.code).toBe(ApiErrorCode.EXTERNAL_API_UNAVAILABLE);
    });

    it('should convert fetch error to unavailable error', () => {
      const error = new Error('fetch failed');
      const result = toApiError(error);

      expect(result.code).toBe(ApiErrorCode.EXTERNAL_API_UNAVAILABLE);
    });

    it('should use default code for unknown errors', () => {
      const error = new Error('Unknown error');
      const result = toApiError(error, ApiErrorCode.BAD_REQUEST);

      expect(result.code).toBe(ApiErrorCode.BAD_REQUEST);
    });

    it('should handle non-Error objects', () => {
      const result = toApiError('string error');

      expect(result.code).toBe(ApiErrorCode.SERVER_ERROR);
    });
  });

  describe('Response Helpers', () => {
    describe('createSuccessResponse', () => {
      it('should create success response with data', () => {
        const data = { id: '1', name: 'Test' };
        const response = createSuccessResponse(data);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(data);
        expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it('should create success response with warning', () => {
        const data = [{ id: '1' }];
        const response = createSuccessResponse(data, WARNING_STALE_DATA);

        expect(response.success).toBe(true);
        expect(response.warning).toBe(WARNING_STALE_DATA);
      });
    });

    describe('createErrorResponse', () => {
      it('should create error response from ApiError', () => {
        const error = new ApiError(ApiErrorCode.NOT_FOUND);
        const response = createErrorResponse(error);

        expect(response.success).toBe(false);
        expect(response.error?.code).toBe(ApiErrorCode.NOT_FOUND);
        expect(response.error?.message).toBe(ErrorMessages[ApiErrorCode.NOT_FOUND]);
        expect(response.error?.isRetryable).toBe(false);
      });

      it('should include isRetryable flag', () => {
        const error = new ApiError(ApiErrorCode.EXTERNAL_API_ERROR);
        const response = createErrorResponse(error);

        expect(response.error?.isRetryable).toBe(true);
      });
    });
  });

  describe('Error Messages', () => {
    it('should have Korean messages for all error codes', () => {
      Object.values(ApiErrorCode).forEach((code) => {
        expect(ErrorMessages[code]).toBeDefined();
        expect(typeof ErrorMessages[code]).toBe('string');
      });
    });

    it('should have stale data warning message', () => {
      expect(WARNING_STALE_DATA).toContain('데이터 제공 기관');
    });
  });
});
