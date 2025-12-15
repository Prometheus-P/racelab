import {
  fetchHorseRaceSchedules,
  fetchCycleRaceSchedules,
  fetchBoatRaceSchedules,
  fetchRaceById,
  fetchHistoricalResults,
  fetchHistoricalResultById,
} from '../lib/api';

describe('API Client', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.resetModules(); // Important to clear module cache for env variables
    process.env = { ...originalEnv }; // Make a copy of the original environment

    // Mock the global fetch function before each test
    global.fetch = jest.fn(
      (url: RequestInfo | URL) =>
        Promise.resolve({
          ok: true,
          json: () => {
            if (typeof url === 'string' && url.includes('API299')) {
              // KRA API299 (Horse Race Results)
              // Mock response for KRA API299 경주결과종합
              return Promise.resolve({
                response: {
                  header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                  body: {
                    items: {
                      item: [
                        {
                          meet: '서울',
                          rcDate: 20240115,
                          rcNo: 1,
                          chulNo: 1,
                          ord: 1,
                          hrName: '말1',
                          hrNo: '001',
                          jkName: '기수1',
                          jkNo: '101',
                          rcTime: 72.5,
                          age: 3,
                          rank: '국산5등급',
                          schStTime: '2024-01-15T11:30:00',
                        },
                        {
                          meet: '서울',
                          rcDate: 20240115,
                          rcNo: 1,
                          chulNo: 2,
                          ord: 2,
                          hrName: '말2',
                          hrNo: '002',
                          jkName: '기수2',
                          jkNo: '102',
                          rcTime: 73.1,
                          age: 4,
                          rank: '국산5등급',
                          schStTime: '2024-01-15T11:30:00',
                        },
                      ],
                    },
                    numOfRows: 100,
                    pageNo: 1,
                    totalCount: 2,
                  },
                },
              });
            } else if (typeof url === 'string' && url.includes('SRVC_OD_API_CRA_RACE_ORGAN')) {
              // KSPO Cycle (New approved API)
              // Mock response for KSPO cycle race schedules (new approved API format)
              return Promise.resolve({
                response: {
                  header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                  body: {
                    items: {
                      item: [
                        {
                          meet_nm: '광명',
                          stnd_yr: '2024',
                          week_tcnt: '1',
                          day_tcnt: '1',
                          race_no: '1',
                          back_no: '1',
                          racer_nm: '선수1',
                          racer_age: '25',
                          win_rate: '15.5',
                          gear_rate: '3.92',
                        },
                      ],
                    },
                    numOfRows: 50,
                    pageNo: 1,
                    totalCount: 1,
                  },
                },
              });
            } else if (typeof url === 'string' && url.includes('SRVC_OD_API_VWEB_MBR_RACE_INFO')) {
              // KSPO Boat (New approved API)
              // Mock response for KSPO boat race schedules (new approved API format)
              return Promise.resolve({
                response: {
                  header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                  body: {
                    items: {
                      item: [
                        {
                          meet_nm: '미사리',
                          stnd_yr: '2024',
                          week_tcnt: '1',
                          day_tcnt: '1',
                          race_no: '1',
                          back_no: '1',
                          racer_nm: '선수1',
                          racer_age: '28',
                          wght: '52',
                          motor_no: '15',
                          boat_no: '23',
                          tms_6_avg_rank_scr: '3.2',
                        },
                      ],
                    },
                    numOfRows: 50,
                    pageNo: 1,
                    totalCount: 1,
                  },
                },
              });
            }
            return Promise.resolve({});
          },
        }) as Promise<Response>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env after all tests
  });

  it('should fetch horse race schedules from KRA API when API key is set and include entry details', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY'; // Set a dummy API key for this test
    const schedules = await fetchHorseRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551015/API299/Race_Result_total'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'horse');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');
    expect(schedules[0]).toHaveProperty('grade');
    expect(schedules[0]).toHaveProperty('status', 'finished');

    // Entries from API299 are grouped by race
    expect(schedules[0].entries).toBeInstanceOf(Array);
    expect(schedules[0].entries.length).toBeGreaterThan(0);
    const entry = schedules[0].entries[0];
    expect(entry).toHaveProperty('no');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('jockey');
    expect(entry).toHaveProperty('age');
  });

  it('should return empty array when KRA_API_KEY is not set', async () => {
    delete process.env.KRA_API_KEY; // Ensure API key is not set

    const schedules = await fetchHorseRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBe(0);
  });

  it('should fetch cycle race schedules from KSPO API when API key is set and include entry details', async () => {
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY'; // Set a dummy API key for this test

    const schedules = await fetchCycleRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551014/SRVC_OD_API_CRA_RACE_ORGAN'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'cycle');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');

    // New assertions for entries
    expect(schedules[0].entries).toBeInstanceOf(Array);
    expect(schedules[0].entries.length).toBeGreaterThan(0);
    const entry = schedules[0].entries[0];
    expect(entry).toHaveProperty('no');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('age');
    expect(entry).toHaveProperty('recentRecord');
  });

  it('should return empty array when KSPO_API_KEY is not set for cycle', async () => {
    delete process.env.KSPO_API_KEY; // Ensure API key is not set

    const schedules = await fetchCycleRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBe(0);
  });

  it('should fetch boat race schedules from KSPO API when API key is set and include entry details', async () => {
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY'; // Set a dummy API key for this test

    const schedules = await fetchBoatRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://apis.data.go.kr/B551014/SRVC_OD_API_VWEB_MBR_RACE_INFO'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'boat');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');

    // New assertions for entries
    expect(schedules[0].entries).toBeInstanceOf(Array);
    expect(schedules[0].entries.length).toBeGreaterThan(0);
    const entry = schedules[0].entries[0];
    expect(entry).toHaveProperty('no');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('age');
    expect(entry).toHaveProperty('recentRecord');
  });

  it('should return empty array when KSPO_API_KEY is not set for boat', async () => {
    delete process.env.KSPO_API_KEY; // Ensure API key is not set

    const schedules = await fetchBoatRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBe(0);
  });

  it('should fetch a specific race by its ID', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    // API299 returns meet as '서울' which maps to '1', raceNo 1, date 20240115
    const race = await fetchRaceById('horse-1-1-20240115');

    expect(race).not.toBeNull();
    expect(race?.id).toBe('horse-1-1-20240115');
    expect(race?.type).toBe('horse');
    expect(race?.track).toBe('서울');
    expect(race?.status).toBe('finished');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should return null if a race is not found by ID', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    const race = await fetchRaceById('invalid-id');

    expect(race).toBeNull();
  });
});

describe('Historical Results API - mock data', () => {
  it('should return historical races filtered by type', async () => {
    const result = await fetchHistoricalResults({
      types: ['horse'],
      limit: 20,
    });

    // Should only contain horse races
    result.items.forEach((race) => {
      expect(race.type).toBe('horse');
    });
  });

  it('should return historical races filtered by date range', async () => {
    const result = await fetchHistoricalResults({
      dateFrom: '20241201',
      dateTo: '20241210',
      limit: 20,
    });

    // All races should be within date range
    result.items.forEach((race) => {
      expect(race.date).toMatch(/^2024120[1-9]|20241210$/);
    });
  });

  it('should return paginated results', async () => {
    const result = await fetchHistoricalResults({
      page: 1,
      limit: 5,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
    expect(result.items.length).toBeLessThanOrEqual(5);
    expect(result.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('should find historical race by ID', async () => {
    // First get a race from the list to use its ID
    const list = await fetchHistoricalResults({ limit: 1 });
    if (list.items.length > 0) {
      const raceId = list.items[0].id;
      const detail = await fetchHistoricalResultById(raceId);

      expect(detail).not.toBeNull();
      expect(detail?.id).toBe(raceId);
    }
  });
});

// Note: Auxiliary external API tests were removed during refactoring.
// Individual API clients (kraClient, kspoCycleClient, kspoBoatClient) have their own tests.

// ============================================================================
// Production Hardening Tests (006-production-hardening)
// ============================================================================

describe('fetchTodayAllRaces', () => {
  it('should fetch all race types in parallel and return TodayRacesData structure', async () => {
    // Use the existing mock from the outer describe block
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY';

    const { fetchTodayAllRaces } = await import('../lib/api');
    const result = await fetchTodayAllRaces('20240115');

    expect(result).toHaveProperty('horse');
    expect(result).toHaveProperty('cycle');
    expect(result).toHaveProperty('boat');
    expect(result).toHaveProperty('status');
    expect(Array.isArray(result.horse)).toBe(true);
    expect(Array.isArray(result.cycle)).toBe(true);
    expect(Array.isArray(result.boat)).toBe(true);
    expect(result.status).toHaveProperty('horse');
    expect(result.status).toHaveProperty('cycle');
    expect(result.status).toHaveProperty('boat');
  });

  it('should return empty arrays and OK status when API keys are not set', async () => {
    delete process.env.KRA_API_KEY;
    delete process.env.KSPO_API_KEY;

    const { fetchTodayAllRaces } = await import('../lib/api');
    const result = await fetchTodayAllRaces('20240115');

    expect(result.horse).toEqual([]);
    expect(result.cycle).toEqual([]);
    expect(result.boat).toEqual([]);
    // Still OK because empty arrays are valid responses (not API errors)
    expect(result.status.horse).toBe('OK');
    expect(result.status.cycle).toBe('OK');
    expect(result.status.boat).toBe('OK');
  });
});

// ============================================================================
// US3: Error Handling Tests (006-production-hardening)
// ============================================================================

describe('fetchWithTimeout', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return response if fetch completes within timeout', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { fetchWithTimeout } = await import('../lib/api');
    const response = await fetchWithTimeout('https://example.com/api', {}, 10000);

    expect(response).toBe(mockResponse);
  });

  it('should throw error if fetch exceeds timeout', async () => {
    // Mock a fetch that respects the abort signal
    global.fetch = jest.fn().mockImplementation((_url: string, options: RequestInit) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => resolve({ ok: true }), 200);
        options.signal?.addEventListener('abort', () => {
          clearTimeout(timeout);
          const error = new Error('The operation was aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    });

    const { fetchWithTimeout } = await import('../lib/api');

    await expect(fetchWithTimeout('https://example.com/api', {}, 50)).rejects.toThrow(
      'Request timed out'
    );
  }, 10000);

  it('should pass abort signal to fetch', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { fetchWithTimeout } = await import('../lib/api');
    await fetchWithTimeout('https://example.com/api', { method: 'POST' }, 5000);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        method: 'POST',
        signal: expect.any(AbortSignal),
      })
    );
  });
});

describe('RaceFetchResult handling', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return RaceFetchResult with OK status on successful fetch', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          response: {
            header: { resultCode: '00' },
            body: {
              items: {
                item: [
                  {
                    meet: '서울',
                    rcDate: 20240115,
                    rcNo: 1,
                    chulNo: 1,
                    ord: 1,
                    hrName: '말1',
                    hrNo: '001',
                    jkName: '기수1',
                    jkNo: '101',
                    rcTime: 72.5,
                    age: 3,
                    rank: '국산5등급',
                    schStTime: '2024-01-15T11:30:00',
                  },
                ],
              },
              totalCount: 1,
            },
          },
        }),
    });

    const { fetchRaceByIdWithStatus } = await import('../lib/api');
    const result = await fetchRaceByIdWithStatus('horse-1-1-20240115');

    expect(result.status).toBe('OK');
    expect(result.data).not.toBeNull();
    expect(result.data?.id).toBe('horse-1-1-20240115');
  });

  it('should return RaceFetchResult with NOT_FOUND status when race does not exist', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          response: {
            header: { resultCode: '00' },
            body: { items: { item: [] }, totalCount: 0 },
          },
        }),
    });

    const { fetchRaceByIdWithStatus } = await import('../lib/api');
    const result = await fetchRaceByIdWithStatus('horse-1-1-99999999');

    expect(result.status).toBe('NOT_FOUND');
    expect(result.data).toBeNull();
  });

  it('should return RaceFetchResult with UPSTREAM_ERROR status on API failure', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { fetchRaceByIdWithStatus } = await import('../lib/api');
    const result = await fetchRaceByIdWithStatus('horse-1-1-20240115');

    expect(result.status).toBe('UPSTREAM_ERROR');
    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
  });
});

// Historical Results API Tests
describe('Historical Results API', () => {
  it('should return empty results when API keys are not set', async () => {
    delete process.env.KRA_API_KEY;
    delete process.env.KSPO_API_KEY;

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await fetchHistoricalResults({
      dateFrom: today,
      dateTo: today,
      page: 1,
      limit: 20,
    });

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total', 0);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('limit', 20);
    expect(result).toHaveProperty('totalPages', 0);
    expect(result.items).toEqual([]);
  });

  it('should return null for invalid historical result ID format', async () => {
    const result = await fetchHistoricalResultById('invalid-id');
    expect(result).toBeNull();
  });

  it('should return null when no matching race found by ID', async () => {
    delete process.env.KRA_API_KEY;
    delete process.env.KSPO_API_KEY;

    const result = await fetchHistoricalResultById('horse-1-1-20240101');
    expect(result).toBeNull();
  });
});
