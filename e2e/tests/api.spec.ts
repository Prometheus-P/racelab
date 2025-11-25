// e2e/tests/api.spec.ts
import { test, expect } from '@playwright/test';

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
        const raceId = 'horse-1-1-20240115';

        test('GET /api/races/[type]/[id]/entries should return 200', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/horse/${raceId}/entries`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /api/races/[type]/[id]/odds should return 200', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/horse/${raceId}/odds`);
            expect(response.status()).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(Array.isArray(data.data)).toBe(true);
        });

        test('GET /api/races/[type]/[id]/results should return 200', async ({ request }) => {
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
            expect(text).toContain('User-agent');
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
            const response = await request.get(`${baseURL}/api/races/horse/horse-1-1-20240115/entries`);
            const data = await response.json();

            if (data.data.length > 0) {
                const entry = data.data[0];
                expect(entry).toHaveProperty('no');
                expect(entry).toHaveProperty('name');
            }
        });

        test('Odds API should have correct data structure', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/races/horse/horse-1-1-20240115/odds`);
            const data = await response.json();

            if (data.data.length > 0) {
                const odds = data.data[0];
                expect(odds).toHaveProperty('no');
                expect(odds).toHaveProperty('name');
                expect(odds).toHaveProperty('odds');
            }
        });
    });
});
