// e2e/tests/api.spec.ts
import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('API Endpoints', () => {
    const baseURL = 'http://localhost:3000';

    test.describe('Race Schedule APIs', () => {
        test('GET /api/races/horse should return 200', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/horse`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /api/races/cycle should return 200', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/cycle`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /api/races/boat should return 200', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/boat`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });
    });

    test.describe('Race Detail APIs', () => {
        // Helper function to get a valid race ID from the race list
        async function getValidRaceId(request: APIRequestContext): Promise<string> {
            const response = await request.get(`${baseURL}/api/races/horse`);
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                return data.data[0].id;
            }
            throw new Error('No races available to test');
        }

        test('GET /api/races/[type]/[id]/entries should return 200', async ({ request }) => {
            const raceId = await getValidRaceId(request);
            const response = await request.get(`${baseURL}/api/races/horse/${raceId}/entries`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /api/races/[type]/[id]/odds should return 200', async ({ request }) => {
            const raceId = await getValidRaceId(request);
            const response = await request.get(`${baseURL}/api/races/horse/${raceId}/odds`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /api/races/[type]/[id]/results should return 200', async ({ request }) => {
            const raceId = await getValidRaceId(request);
            const response = await request.get(`${baseURL}/api/races/horse/${raceId}/results`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /api/races/[type]/[id]/entries with invalid ID should return 404', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/horse/invalid-id/entries`);
            expect(response.status()).toBe(404);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBeDefined();
        });
    });

    test.describe('SEO APIs', () => {
        test('GET /sitemap.xml should return 200', async ({ request }) => {
            const response = await request.get(`${baseURL}/sitemap.xml`);
            expect(response.status()).toBe(200);

            const contentType = response.headers()['content-type'];
            expect(contentType).toContain('xml');
        });

        test('GET /robots.txt should return 200', async ({ request }) => {
            const response = await request.get(`${baseURL}/robots.txt`);
            expect(response.status()).toBe(200);

            const text = await response.text();
            // Case-insensitive check for User-Agent directive
            expect(text.toLowerCase()).toContain('user-agent');
            expect(text).toContain('Sitemap');
        });
    });

    test.describe('API Response Structure', () => {
        test('Race schedule API should have correct data structure', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/horse`);
            const data = await response.json();

            if (data.data.length > 0) {
                const race = data.data[0];
                expect(race).toHaveProperty('id');
                expect(race).toHaveProperty('type');
                expect(race).toHaveProperty('raceNo');
                expect(race).toHaveProperty('track');
                expect(race).toHaveProperty('startTime');
            }
        });

        test('Entries API should have correct data structure', async ({ request }) => {
            // First get a valid race ID
            const racesResponse = await request.get(`${baseURL}/api/races/horse`);
            const racesData = await racesResponse.json();
            if (!racesData.data || racesData.data.length === 0) {
                test.skip();
                return;
            }
            const raceId = racesData.data[0].id;

            const response = await request.get(`${baseURL}/api/races/horse/${raceId}/entries`);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const entry = data.data[0];
                expect(entry).toHaveProperty('no');
                expect(entry).toHaveProperty('name');
            }
        });

        test('Odds API should have correct data structure', async ({ request }) => {
            // First get a valid race ID
            const racesResponse = await request.get(`${baseURL}/api/races/horse`);
            const racesData = await racesResponse.json();
            if (!racesData.data || racesData.data.length === 0) {
                test.skip();
                return;
            }
            const raceId = racesData.data[0].id;

            const response = await request.get(`${baseURL}/api/races/horse/${raceId}/odds`);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const odds = data.data[0];
                expect(odds).toHaveProperty('no');
                expect(odds).toHaveProperty('name');
                expect(odds).toHaveProperty('odds');
            }
        });
    });

    test.describe('Security Tests', () => {
        test('should handle SQL injection attempt in race ID', async ({ request }) => {
            const maliciousId = encodeURIComponent("'; DROP TABLE races; --");
            const response = await request.get(`${baseURL}/api/races/horse/${maliciousId}/entries`);

            // Should return 404 (not found) or 400 (bad request), not 500
            expect([400, 404]).toContain(response.status());
            expect(response.status()).not.toBe(500);
        });

        test('should handle XSS attempt in race ID', async ({ request }) => {
            const xssId = encodeURIComponent("<script>alert('xss')</script>");
            const response = await request.get(`${baseURL}/api/races/horse/${xssId}/entries`);

            expect([400, 404]).toContain(response.status());

            const data = await response.json();
            // Response should not contain unescaped script tag
            expect(JSON.stringify(data)).not.toContain('<script>');
        });

        test('should handle path traversal attempt', async ({ request }) => {
            const traversalId = encodeURIComponent('../../../etc/passwd');
            const response = await request.get(`${baseURL}/api/races/horse/${traversalId}/entries`);

            expect([400, 404]).toContain(response.status());
        });

        test('should not expose sensitive error details', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/invalid-type/invalid-id/entries`);

            const data = await response.json();
            // Error message should not expose internal paths or stack traces
            if (data.error?.message) {
                expect(data.error.message).not.toContain('/Users/');
                expect(data.error.message).not.toContain('node_modules');
                expect(data.error.message).not.toMatch(/at\s+\w+\s+\(/); // No stack traces
            }
        });

        test('should handle oversized race ID gracefully', async ({ request }) => {
            const longId = 'a'.repeat(10000);
            const response = await request.get(`${baseURL}/api/races/horse/${longId}/entries`);

            // Should handle gracefully, not crash or timeout
            expect(response.status()).toBeLessThan(500);
        });
    });

    test.describe('API Timestamp and Caching', () => {
        test('API response should include ISO timestamp', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/horse`);
            const data = await response.json();

            expect(data.timestamp).toBeDefined();
            expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });

        test('API should return consistent structure for all race types', async ({ request }) => {
            const types = ['horse', 'cycle', 'boat'];

            for (const type of types) {
                const response = await request.get(`${baseURL}/api/races/${type}`);
                const data = await response.json();

                expect(data).toHaveProperty('success');
                expect(data).toHaveProperty('data');
                expect(data).toHaveProperty('timestamp');
            }
        });
    });
});
