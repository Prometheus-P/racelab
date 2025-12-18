import { NextRequest } from 'next/server';
import { GET } from './route';

function createRequest(url: string) {
  return new NextRequest(url);
}

describe('/api/results', () => {
  it('returns data with ok=true and meta fields for default query', async () => {
    const request = createRequest('http://localhost/api/results');
    const response = await GET(request);
    const body = (await response.json()) as {
      ok: boolean;
      data: { items: unknown[] };
      meta: { source: string; generatedAt: string; cacheHit: boolean; queryNormalized: unknown };
    };

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.meta).toBeDefined();
    expect(body.meta.source).toBeTruthy();
  });

  it('returns validation error for invalid date range', async () => {
    const request = createRequest(
      'http://localhost/api/results?dateFrom=20240102&dateTo=20240101'
    );
    const response = await GET(request);
    const body = (await response.json()) as { ok: boolean; error?: { code: string } };

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe('INVALID_QUERY');
  });
});
