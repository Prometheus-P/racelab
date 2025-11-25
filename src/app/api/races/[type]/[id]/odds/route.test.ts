// src/app/api/races/[type]/[id]/odds/route.test.ts
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

describe('GET /api/races/[type]/[id]/odds', () => {
    const mockOdds = [
        { no: 1, name: '번개', odds: 2.3 },
        { no: 2, name: '청풍', odds: 4.1 },
        { no: 3, name: '바람돌이', odds: 6.8 },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return odds for a valid race', async () => {
        (api.fetchRaceOdds as jest.Mock).mockResolvedValue(mockOdds);

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/odds');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockOdds);
        expect(data.data).toHaveLength(3);
    });

    it('should return 404 when race not found', async () => {
        (api.fetchRaceOdds as jest.Mock).mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/races/horse/invalid-id/odds');
        const response = await GET(request, { params: { type: 'horse', id: 'invalid-id' } });

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
        (api.fetchRaceOdds as jest.Mock).mockRejectedValue(new Error('API error'));

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/odds');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
    });

    it('should return odds with correct structure', async () => {
        (api.fetchRaceOdds as jest.Mock).mockResolvedValue(mockOdds);

        const request = new NextRequest('http://localhost:3000/api/races/horse/horse-1-1-20240115/odds');
        const response = await GET(request, { params: { type: 'horse', id: 'horse-1-1-20240115' } });

        const data = await response.json();
        expect(data.data[0]).toHaveProperty('no');
        expect(data.data[0]).toHaveProperty('name');
        expect(data.data[0]).toHaveProperty('odds');
    });
});
