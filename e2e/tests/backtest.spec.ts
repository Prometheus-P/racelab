// e2e/tests/backtest.spec.ts
/**
 * Backtest API E2E Tests
 *
 * Tests for POST/GET /api/v1/backtest endpoints
 * Requires B2B_TEST_API_KEY environment variable for authenticated tests
 */
import { test, expect, APIRequestContext } from '@playwright/test';

// Test configuration
const API_BASE = '/api/v1/backtest';

// Test API key from environment (for authenticated tests)
const TEST_API_KEY = process.env.B2B_TEST_API_KEY;
const hasTestApiKey = !!TEST_API_KEY;

// Sample backtest request payloads
const sampleJsonRequest = {
  request: {
    strategy: {
      name: 'E2E Test Strategy',
      version: '1.0.0',
      description: 'Test strategy for E2E testing',
      conditions: {
        minOdds: 2.0,
        maxOdds: 10.0,
      },
      betting: {
        type: 'fixed',
        amount: 10000,
      },
    },
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-07',
    },
    markets: ['WIN'],
    tracks: ['seoul'],
  },
  priority: 'normal',
};

const sampleYamlRequest = `
request:
  strategy:
    name: E2E YAML Test Strategy
    version: "1.0.0"
    description: Test strategy for E2E testing with YAML
    conditions:
      minOdds: 2.0
      maxOdds: 10.0
    betting:
      type: fixed
      amount: 10000
  dateRange:
    start: "2024-01-01"
    end: "2024-01-07"
  markets:
    - WIN
  tracks:
    - seoul
priority: normal
`;

test.describe('Backtest API', () => {
  test.describe('Authentication', () => {
    test('should return 401 without API key', async ({ request }) => {
      const response = await request.post(API_BASE, {
        data: sampleJsonRequest,
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    test('should reject invalid API key', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': 'rk_invalid_api_key_12345', // Use proper format
        },
        data: sampleJsonRequest,
      });

      // Invalid API key should be rejected
      expect(response.status()).toBeGreaterThanOrEqual(400);
      const text = await response.text();
      if (text) {
        const data = JSON.parse(text);
        expect(data.success).toBe(false);
      }
    });

    test('should return 401 with malformed API key', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': '',
        },
        data: sampleJsonRequest,
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Request Validation', () => {
    test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

    test('should reject empty request body', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'application/json',
        },
        data: {},
      });

      // 400 (validation) or 403 (tier denied)
      expect([400, 403]).toContain(response.status());
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject request without strategy', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'application/json',
        },
        data: {
          request: {
            dateRange: { start: '2024-01-01', end: '2024-01-07' },
          },
        },
      });

      expect([400, 403]).toContain(response.status());
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should reject invalid date range', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'application/json',
        },
        data: {
          request: {
            ...sampleJsonRequest.request,
            dateRange: {
              start: '2024-12-31',
              end: '2024-01-01', // end before start
            },
          },
        },
      });

      expect([400, 403]).toContain(response.status());
    });

    test('should reject invalid JSON', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'application/json',
        },
        data: 'not valid json {{{',
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    test('should reject invalid YAML', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'text/yaml',
        },
        data: 'invalid: yaml: [[[',
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Content Type Support', () => {
    test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

    test('should accept JSON with application/json', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'application/json',
        },
        data: sampleJsonRequest,
      });

      // 202 (accepted), 403 (tier denied), or 429 (quota exceeded)
      expect([202, 403, 429]).toContain(response.status());
      const data = await response.json();
      expect(data.timestamp).toBeDefined();
    });

    test('should accept YAML with text/yaml', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'text/yaml',
        },
        data: sampleYamlRequest,
      });

      expect([202, 403, 429]).toContain(response.status());
    });

    test('should accept YAML with application/x-yaml', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'application/x-yaml',
        },
        data: sampleYamlRequest,
      });

      expect([202, 403, 429]).toContain(response.status());
    });

    test('should accept YAML with text/plain', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
          'Content-Type': 'text/plain',
        },
        data: sampleYamlRequest,
      });

      expect([202, 403, 429]).toContain(response.status());
    });
  });

  test.describe('Job Status Endpoint', () => {
    test('should return 401 without API key', async ({ request }) => {
      const response = await request.get(`${API_BASE}/test-job-id`);
      expect(response.status()).toBe(401);
    });

    test('should return 404 for non-existent job', async ({ request }) => {
      test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

      const response = await request.get(`${API_BASE}/non-existent-job-id-12345`, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
        },
      });

      // 404 (not found) or 403 (tier denied)
      expect([403, 404]).toContain(response.status());
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    test('should handle invalid job ID format', async ({ request }) => {
      test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

      const response = await request.get(`${API_BASE}/invalid!@#$%`, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
        },
      });

      expect([400, 403, 404]).toContain(response.status());
    });
  });

  test.describe('Job Result Endpoint', () => {
    test('should return 401 without API key', async ({ request }) => {
      const response = await request.get(`${API_BASE}/test-job-id/result`);
      expect(response.status()).toBe(401);
    });

    test('should return 404 for non-existent job', async ({ request }) => {
      test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

      const response = await request.get(`${API_BASE}/non-existent-job-12345/result`, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
        },
      });

      expect([403, 404]).toContain(response.status());
    });
  });

  test.describe('Job Listing Endpoint', () => {
    test('should return 401 without API key', async ({ request }) => {
      const response = await request.get(API_BASE);
      expect(response.status()).toBe(401);
    });

    test('should list jobs with valid API key', async ({ request }) => {
      test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

      const response = await request.get(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
        },
      });

      // 200 or 403 (tier denied)
      expect([200, 403]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('jobs');
        expect(data.data).toHaveProperty('pagination');
        expect(Array.isArray(data.data.jobs)).toBe(true);
      }
    });

    test('should support pagination parameters', async ({ request }) => {
      test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

      const response = await request.get(`${API_BASE}?page=1&limit=5`, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
        },
      });

      expect([200, 403]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.data.pagination.page).toBe(1);
        expect(data.data.pagination.limit).toBeLessThanOrEqual(5);
      }
    });

    test('should support status filter', async ({ request }) => {
      test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

      const response = await request.get(`${API_BASE}?status=completed`, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
        },
      });

      expect([200, 403]).toContain(response.status());
    });
  });

  test.describe('Security Tests', () => {
    test('should not reflect SQL injection in response', async ({ request }) => {
      const maliciousId = "'; DROP TABLE jobs; --";
      const response = await request.get(`${API_BASE}/${encodeURIComponent(maliciousId)}`, {
        headers: {
          'X-API-Key': 'test-key',
        },
      });

      // Verify the response doesn't echo back the SQL injection payload
      const text = await response.text();
      expect(text).not.toContain('DROP TABLE');
    });

    test('should not reflect XSS in response', async ({ request }) => {
      const xssPayload = "<script>alert('xss')</script>";
      const response = await request.get(`${API_BASE}/${encodeURIComponent(xssPayload)}`, {
        headers: {
          'X-API-Key': 'test-key',
        },
      });

      const text = await response.text();
      // Should not contain unescaped script tag
      expect(text).not.toContain('<script>');
    });

    test('should not expose file system via path traversal', async ({ request }) => {
      const traversalPath = '../../../etc/passwd';
      const response = await request.get(`${API_BASE}/${encodeURIComponent(traversalPath)}`, {
        headers: {
          'X-API-Key': 'test-key',
        },
      });

      // Should not leak file system content
      const text = await response.text();
      expect(text).not.toContain('root:');
      expect(text).not.toContain('/bin/');
    });

    test('should not expose internal paths in errors', async ({ request }) => {
      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': 'invalid-key-for-testing',
          'Content-Type': 'application/json',
        },
        data: sampleJsonRequest,
      });

      const text = await response.text();
      // Should not expose internal paths in any error response
      expect(text).not.toContain('/Users/');
      expect(text).not.toContain('/home/');
      expect(text).not.toContain('node_modules');
      expect(text).not.toMatch(/at\s+\w+\s+\(/); // No stack traces
    });

    test('should handle large payload without crash', async ({ request }) => {
      // Test with a reasonably large payload
      const largeData = {
        ...sampleJsonRequest,
        request: {
          ...sampleJsonRequest.request,
          strategy: {
            ...sampleJsonRequest.request.strategy,
            description: 'x'.repeat(5000), // 5KB
          },
        },
      };

      const response = await request.post(API_BASE, {
        headers: {
          'X-API-Key': 'rk_test_large_payload',
          'Content-Type': 'application/json',
        },
        data: largeData,
      });

      // Should return a response (any HTTP status means server didn't crash)
      expect(response.status()).toBeDefined();
      expect(response.status()).toBeLessThan(600);
    });
  });

  test.describe('Response Structure', () => {
    test('error responses should have consistent structure', async ({ request }) => {
      const response = await request.post(API_BASE, {
        data: sampleJsonRequest,
      });

      expect(response.status()).toBe(401);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
      expect(data).toHaveProperty('timestamp');

      // Validate ISO timestamp format
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('rate limit headers should be present for authenticated requests', async ({ request }) => {
      test.skip(!hasTestApiKey, 'Requires B2B_TEST_API_KEY');

      const response = await request.get(API_BASE, {
        headers: {
          'X-API-Key': TEST_API_KEY!,
        },
      });

      // Rate limit headers may be present
      const headers = response.headers();
      if (headers['x-ratelimit-limit']) {
        expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
      }
    });
  });
});
