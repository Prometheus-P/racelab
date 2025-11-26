import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules, fetchRaceById } from '../lib/api';

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
          if (typeof url === 'string' && url.includes('B551015')) { // KRA API (Horse)
            // Mock response for KRA horse race schedules with basic entry data
            return Promise.resolve({
              response: {
                header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                body: {
                  items: {
                    item: [
                      { meet: '1', rcNo: '1', rcDate: '20240115', rcTime: '11:30', rcDist: '1200', chulNo: '12', rank: '국산5등급',
                        // Adding mock entry data for testing purposes
                        hrNo: '1', hrName: '말1', jkName: '기수1', trName: '조교사1', age: '3', wgHr: '54', rcRst: '1-2-3'
                      },
                    ],
                  },
                  numOfRows: 50, pageNo: 1, totalCount: 1,
                },
              },
            });
          } else if (typeof url === 'string' && url.includes('API214_01')) { // KSPO API (Cycle)
            // Mock response for KSPO cycle race schedules with basic entry data
            return Promise.resolve({
              response: {
                header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                body: {
                  items: {
                    item: [
                      { meet: '1', rcNo: '1', rcTime: '11:00', rcDist: '1000',
                        // Adding mock entry data for testing purposes
                        hrNo: '1', hrName: '선수1', age: '25', recentRecord: '1-2-3'
                      },
                    ],
                  },
                  numOfRows: 50, pageNo: 1, totalCount: 1,
                },
              },
            });
          } else if (typeof url === 'string' && url.includes('API214_02')) { // KSPO API (Boat)
            // Mock response for KSPO boat race schedules with basic entry data
            return Promise.resolve({
              response: {
                header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
                body: {
                  items: {
                    item: [
                      { meet: '1', rcNo: '1', rcTime: '10:30',
                        // Adding mock entry data for testing purposes
                        hrNo: '1', hrName: '선수1', age: '28', recentRecord: '1-2-3'
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
      expect.stringContaining('http://apis.data.go.kr/B551015/API214_17/raceHorse_1'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'horse');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');
    expect(schedules[0]).toHaveProperty('distance');
    expect(schedules[0]).toHaveProperty('grade');

    // New assertions for entries
    expect(schedules[0].entries).toBeInstanceOf(Array);
    expect(schedules[0].entries.length).toBeGreaterThan(0);
    const entry = schedules[0].entries[0];
    expect(entry).toHaveProperty('no');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('jockey');
    expect(entry).toHaveProperty('trainer');
    expect(entry).toHaveProperty('age');
    expect(entry).toHaveProperty('weight');
    expect(entry).toHaveProperty('recentRecord');
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
    expect(schedules[0]).toHaveProperty('distance');
  });

  it('should fetch cycle race schedules from KSPO API when API key is set and include entry details', async () => {
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY'; // Set a dummy API key for this test

    const schedules = await fetchCycleRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://apis.data.go.kr/B551014/API214_01/raceCycle_1'),
      expect.anything()
    );
    expect(schedules).toBeInstanceOf(Array);
    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0]).toHaveProperty('id');
    expect(schedules[0]).toHaveProperty('type', 'cycle');
    expect(schedules[0]).toHaveProperty('raceNo');
    expect(schedules[0]).toHaveProperty('track');
    expect(schedules[0]).toHaveProperty('startTime');
    expect(schedules[0]).toHaveProperty('distance');

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
    expect(schedules[0]).toHaveProperty('distance');
  });

  it('should fetch boat race schedules from KSPO API when API key is set and include entry details', async () => {
    process.env.KSPO_API_KEY = 'TEST_KSPO_API_KEY'; // Set a dummy API key for this test

    const schedules = await fetchBoatRaceSchedules('20240115');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://apis.data.go.kr/B551014/API214_02/raceBoat_1'),
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
    const race = await fetchRaceById('horse-1-1-20240115');

    expect(race).not.toBeNull();
    expect(race?.id).toBe('horse-1-1-20240115');
    expect(race?.type).toBe('horse');
    // fetchRaceById internally calls fetchHorseRaceSchedules which uses fetch
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should return null if a race is not found by ID', async () => {
    process.env.KRA_API_KEY = 'TEST_KRA_API_KEY';
    const race = await fetchRaceById('invalid-id');

    expect(race).toBeNull();
  });
});