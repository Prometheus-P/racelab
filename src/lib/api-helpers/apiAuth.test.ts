// src/lib/api-helpers/apiAuth.test.ts
import { NextRequest } from 'next/server';
import { validateApiAuth, createAuthErrorResponse, withApiAuth } from './apiAuth';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
  } as unknown as NextRequest;
}

describe('apiAuth', () => {
  describe('validateApiAuth', () => {
    it('should reject requests without API key', () => {
      const request = createMockRequest();
      const result = validateApiAuth(request);

      expect(result.authenticated).toBe(false);
      expect(result.errorCode).toBe('UNAUTHORIZED');
    });

    it('should accept X-API-Key header', () => {
      process.env.B2B_API_KEYS = 'test-key-123';
      const request = createMockRequest({ 'x-api-key': 'test-key-123' });
      const result = validateApiAuth(request);

      expect(result.authenticated).toBe(true);
      expect(result.apiKey).toBe('test-key-123');
    });

    it('should accept Authorization Bearer token', () => {
      process.env.B2B_API_KEYS = 'bearer-key-456';
      const request = createMockRequest({ authorization: 'Bearer bearer-key-456' });
      const result = validateApiAuth(request);

      expect(result.authenticated).toBe(true);
    });

    it('should reject invalid API keys', () => {
      process.env.B2B_API_KEYS = 'valid-key';
      const request = createMockRequest({ 'x-api-key': 'invalid-key' });
      const result = validateApiAuth(request);

      expect(result.authenticated).toBe(false);
      expect(result.errorCode).toBe('INVALID_KEY');
    });

    it('should support multiple API keys', () => {
      process.env.B2B_API_KEYS = 'key1,key2,key3';
      const request = createMockRequest({ 'x-api-key': 'key2' });
      const result = validateApiAuth(request);

      expect(result.authenticated).toBe(true);
    });
  });

  describe('createAuthErrorResponse', () => {
    it('should return 401 for UNAUTHORIZED', () => {
      const response = createAuthErrorResponse({
        authenticated: false,
        errorCode: 'UNAUTHORIZED',
        error: 'Missing key',
      });

      expect(response.status).toBe(401);
    });

    it('should return 429 for RATE_LIMITED with Retry-After header', () => {
      const response = createAuthErrorResponse({
        authenticated: false,
        errorCode: 'RATE_LIMITED',
        error: 'Too many requests',
      });

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });

  describe('withApiAuth', () => {
    it('should call handler when authenticated', async () => {
      process.env.B2B_API_KEYS = 'valid-key';
      const mockHandler = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const wrappedHandler = withApiAuth(mockHandler);
      const request = createMockRequest({ 'x-api-key': 'valid-key' });

      await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(request);
    });

    it('should return error when not authenticated', async () => {
      process.env.B2B_API_KEYS = 'valid-key';
      const mockHandler = jest.fn();

      const wrappedHandler = withApiAuth(mockHandler);
      const request = createMockRequest({ 'x-api-key': 'wrong-key' });

      const response = await wrappedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });
  });
});
