import { jest } from '@jest/globals';

describe('resultsService error handling', () => {
  const originalEnv = process.env.DATABASE_URL;
  const originalError = console.error;

  beforeEach(() => {
    jest.resetModules();
    process.env.DATABASE_URL = '';
    console.error = jest.fn();
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalEnv;
    console.error = originalError;
  });

  it('returns mock snapshot data with fallback code when database env is missing', async () => {
    const service = await import('./resultsService');
    const normalized = service.normalizeResultsQuery({ dateFrom: '20231201', dateTo: '20231215', page: 1, limit: 5 });
    if (!normalized.ok) {
      throw new Error('Normalization failed');
    }

    const response = await service.buildResultsResponse(normalized.query);

    expect(response.ok).toBe(true);
    expect(response.meta?.source).toBe('snapshot');
    expect(response.meta?.fallbackCode).toBe('ENV_MISSING');
    expect(response.data.items.length).toBeGreaterThan(0);
  });
});
