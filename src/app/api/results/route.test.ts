/**
 * @jest-environment node
 */

import { GET, dynamic, fetchCache } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/results', () => {
  it('should return paginated historical results', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `http://localhost:3000/api/results?dateFrom=${today}&dateTo=${today}`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('items');
    expect(json.data).toHaveProperty('total');
    expect(json.data).toHaveProperty('page');
    expect(json.data).toHaveProperty('limit');
    expect(json.data).toHaveProperty('totalPages');
    expect(json).toHaveProperty('timestamp');
  });

  it('should filter by race type', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `http://localhost:3000/api/results?dateFrom=${today}&dateTo=${today}&types=horse`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    json.data.items.forEach((race: { type: string }) => {
      expect(race.type).toBe('horse');
    });
  });

  it('should filter by multiple race types', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `http://localhost:3000/api/results?dateFrom=${today}&dateTo=${today}&types=horse,cycle`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    json.data.items.forEach((race: { type: string }) => {
      expect(['horse', 'cycle']).toContain(race.type);
    });
  });

  it('should filter by track', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `http://localhost:3000/api/results?dateFrom=${today}&dateTo=${today}&types=horse&track=서울`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    json.data.items.forEach((race: { track: string }) => {
      expect(race.track).toBe('서울');
    });
  });

  it('should handle pagination parameters', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `http://localhost:3000/api/results?dateFrom=${today}&dateTo=${today}&page=1&limit=5`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.page).toBe(1);
    expect(json.data.limit).toBe(5);
    expect(json.data.items.length).toBeLessThanOrEqual(5);
  });

  it('should return error for invalid date range', async () => {
    const url = `http://localhost:3000/api/results?dateFrom=20241202&dateTo=20241201`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_DATE_RANGE');
  });

  it('should use default date (today) when not provided', async () => {
    const url = `http://localhost:3000/api/results`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('items');
  });

  it('should opt out of static rendering and send caching headers', async () => {
    const url = `http://localhost:3000/api/results`;
    const request = new NextRequest(url);

    const response = await GET(request);

    expect(dynamic).toBe('force-dynamic');
    expect(fetchCache).toBe('force-no-store');
    expect(response.headers.get('cache-control')).toBe('public, s-maxage=300, stale-while-revalidate=60');
  });

  it('should reject invalid pagination parameters', async () => {
    const url = `http://localhost:3000/api/results?page=0&limit=0`;
    const request = new NextRequest(url);

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_PAGINATION');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
