// src/app/api/races/[type]/[id]/results/route.test.ts
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('GET /api/races/[type]/[id]/results', () => {
    const mockResults = [
        { rank: 1, no: 3, name: '바람돌이', jockey: '박기수', time: '1:23.45', diff: '0' },
        { rank: 2, no: 1, name: '번개', jockey: '김기수', time: '1:23.67', diff: '0.22' },
        { rank: 3, no: 2, name: '청풍', jockey: '이기수', time: '1:24.12', diff: '0.67' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return results for a completed race', async () => {
        (api.fetchRaceResults as jest.Mock).mockResolvedValue(mockResults);

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/results');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockResults);
        expect(data.data).toHaveLength(3);
    });

    it('should return 404 when race not found', async () => {
        (api.fetchRaceResults as jest.Mock).mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/races/horse/invalid-id/results');
        const response = await GET(request, { params: { type: 'horse', id: 'invalid-id' } });

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
    });

    it('should return empty array for race without results', async () => {
        (api.fetchRaceResults as jest.Mock).mockResolvedValue([]);

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/results');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
        (api.fetchRaceResults as jest.Mock).mockRejectedValue(new Error('API error'));

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/results');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
    });

    it('should return results with correct structure', async () => {
        (api.fetchRaceResults as jest.Mock).mockResolvedValue(mockResults);

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/results');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        const data = await response.json();
        expect(data.data[0]).toHaveProperty('rank');
        expect(data.data[0]).toHaveProperty('no');
        expect(data.data[0]).toHaveProperty('name');
        expect(data.data[0]).toHaveProperty('jockey');
        expect(data.data[0]).toHaveProperty('time');
        expect(data.data[0]).toHaveProperty('diff');
    });
});
