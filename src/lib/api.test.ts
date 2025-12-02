import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules, fetchRaceById, fetchHistoricalResults, fetchHistoricalResultById } from '../lib/api';

describe('API Client', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.resetModules(); // Important to clear module cache for env variables
    process.env = { ...originalEnv }; // Make a copy of the original environment

    // Mock the global fetch function before each test
    global.fetch = jest.fn((url: RequestInfo | URL) =>
      Promise.resolve({
        ok: true,
        json: () => {
          if (typeof url === 'string' && url.includes('API299')) { // KRA API299 (Horse Race Results)
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
                  numOfRows: 100, pageNo: 1, totalCount: 2,
                },
              },
            });
          } else if (typeof url === 'string' && url.includes('SRVC_OD_API_CRA_RACE_ORGAN')) { // KSPO Cycle (New approved API)
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
                  numOfRows: 50, pageNo: 1, totalCount: 1,
                },
              },
            });
          } else if (typeof url === 'string' && url.includes('SRVC_OD_API_VWEB_MBR_RACE_INFO')) { // KSPO Boat (New approved API)
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
                  numOfRows: 50, pageNo: 1, totalCount: 1,
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

  it('should return dummy horse race data when KRA_API_KEY is not set', async () => {
    delete process.env.KRA_API_KEY; // Ensure API key is not set

    const schedules = await fetchHorseRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'horse');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');
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

  it('should return dummy cycle race data when KSPO_API_KEY is not set', async () => {
    delete process.env.KSPO_API_KEY; // Ensure API key is not set

    const schedules = await fetchCycleRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'cycle');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');
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

  it('should return dummy boat race data when KSPO_API_KEY is not set', async () => {
    delete process.env.KSPO_API_KEY; // Ensure API key is not set

    const schedules = await fetchBoatRaceSchedules('20240115');

    expect(global.fetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'boat');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');
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

// Historical Results API Tests
describe('Historical Results API', () => {
  beforeEach(() => {
    // No API keys set - should use dummy data
    delete process.env.KRA_API_KEY;
    delete process.env.KSPO_API_KEY;
  });

  it('should fetch historical results with pagination', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await fetchHistoricalResults({
      dateFrom: today,
      dateTo: today,
      page: 1,
      limit: 20,
    });

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('limit', 20);
    expect(result).toHaveProperty('totalPages');
    expect(result.items).toBeInstanceOf(Array);
  });

  it('should filter historical results by race type', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await fetchHistoricalResults({
      dateFrom: today,
      dateTo: today,
      types: ['horse'],
    });

    expect(result.items).toBeInstanceOf(Array);
    result.items.forEach(race => {
      expect(race.type).toBe('horse');
    });
  });

  it('should filter historical results by track', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await fetchHistoricalResults({
      dateFrom: today,
      dateTo: today,
      types: ['horse'],
      track: '서울',
    });

    expect(result.items).toBeInstanceOf(Array);
    result.items.forEach(race => {
      expect(race.track).toBe('서울');
    });
  });

  it('should filter historical results by jockey name', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await fetchHistoricalResults({
      dateFrom: today,
      dateTo: today,
      types: ['horse'],
      jockey: '김',
    });

    expect(result.items).toBeInstanceOf(Array);
    // Each result should have at least one entry with jockey containing '김'
    result.items.forEach(race => {
      const hasMatchingJockey = race.results.some(r => r.jockey?.includes('김'));
      expect(hasMatchingJockey).toBe(true);
    });
  });

  it('should fetch a single historical result by ID', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = `horse-1-1-${today}`;
    const result = await fetchHistoricalResultById(id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(id);
    expect(result?.type).toBe('horse');
    expect(result?.results).toBeInstanceOf(Array);
    expect(result?.dividends).toBeInstanceOf(Array);
  });

  it('should return null for invalid historical result ID', async () => {
    const result = await fetchHistoricalResultById('invalid-id');
    expect(result).toBeNull();
  });

  it('should include dividend information in historical results', async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await fetchHistoricalResults({
      dateFrom: today,
      dateTo: today,
      page: 1,
      limit: 5,
    });

    expect(result.items.length).toBeGreaterThan(0);
    const race = result.items[0];
    expect(race.dividends).toBeInstanceOf(Array);
    expect(race.dividends.length).toBeGreaterThan(0);

    const dividend = race.dividends[0];
    expect(dividend).toHaveProperty('type');
    expect(dividend).toHaveProperty('entries');
    expect(dividend).toHaveProperty('amount');
  });
});