/**
 * @jest-environment node
 */

import { GET } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/results/[id]', () => {
  it('should return a single historical race result', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = `horse-1-1-${today}`;
    const url = `http://localhost:3000/api/results/${id}`;
    const request = new NextRequest(url);

    const response = await GET(request, { params: Promise.resolve({ id }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('id', id);
    expect(json.data).toHaveProperty('type', 'horse');
    expect(json.data).toHaveProperty('track');
    expect(json.data).toHaveProperty('results');
    expect(json.data).toHaveProperty('dividends');
    expect(json).toHaveProperty('timestamp');
  });

  it('should return 404 for non-existent race', async () => {
    const url = `http://localhost:3000/api/results/invalid-id`;
    const request = new NextRequest(url);

    const response = await GET(request, { params: Promise.resolve({ id: 'invalid-id' }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid ID format', async () => {
    const url = `http://localhost:3000/api/results/`;
    const request = new NextRequest(url);

    const response = await GET(request, { params: Promise.resolve({ id: '' }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_ID');
  });

  it('should include all finishers in results', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = `horse-1-1-${today}`;
    const url = `http://localhost:3000/api/results/${id}`;
    const request = new NextRequest(url);

    const response = await GET(request, { params: Promise.resolve({ id }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.results.length).toBeGreaterThan(0);

    const result = json.data.results[0];
    expect(result).toHaveProperty('rank');
    expect(result).toHaveProperty('entryNo');
    expect(result).toHaveProperty('name');
  });

  it('should include dividend information', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = `horse-1-1-${today}`;
    const url = `http://localhost:3000/api/results/${id}`;
    const request = new NextRequest(url);

    const response = await GET(request, { params: Promise.resolve({ id }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.dividends.length).toBeGreaterThan(0);

    const dividend = json.data.dividends[0];
    expect(dividend).toHaveProperty('type');
    expect(dividend).toHaveProperty('entries');
    expect(dividend).toHaveProperty('amount');
  });
});
