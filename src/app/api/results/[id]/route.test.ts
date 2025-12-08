/**
 * @jest-environment node
 */

import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the API functions to return test data
jest.mock('@/lib/api', () => ({
  fetchHistoricalResultById: jest.fn().mockImplementation((id: string) => {
    // Validate ID format
    const parts = id.split('-');
    if (parts.length < 4) return Promise.resolve(null);

    const [type, , , date] = parts;
    if (!['horse', 'cycle', 'boat'].includes(type)) return Promise.resolve(null);

    // Return mock data for valid IDs
    return Promise.resolve({
      id,
      type,
      raceNo: 1,
      track: '서울',
      date,
      startTime: '11:30',
      distance: 1200,
      grade: '국산5등급',
      status: 'finished',
      results: [
        { rank: 1, entryNo: 1, name: '말1', jockey: '기수1', time: '72.5' },
        { rank: 2, entryNo: 2, name: '말2', jockey: '기수2', time: '73.1' },
      ],
      dividends: [
        { type: 'win', entries: [1], amount: 3500 },
        { type: 'place', entries: [1, 2], amount: 1200 },
      ],
    });
  }),
}));

describe('GET /api/results/[id]', () => {
  it('should return a single historical race result', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = `horse-1-1-${today}`;
    const url = `https://racelab.kr/api/results/${id}`;
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
    const url = `https://racelab.kr/api/results/invalid-id`;
    const request = new NextRequest(url);

    const response = await GET(request, { params: Promise.resolve({ id: 'invalid-id' }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid ID format', async () => {
    const url = `https://racelab.kr/api/results/`;
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
    const url = `https://racelab.kr/api/results/${id}`;
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
    const url = `https://racelab.kr/api/results/${id}`;
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
