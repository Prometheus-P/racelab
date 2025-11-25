// src/app/sitemap.test.ts
import sitemap from './sitemap';
import { fetchHorseRaceSchedules, fetchCycleRaceSchedules, fetchBoatRaceSchedules } from '@/lib/api';
import { Race } from '@/types';

jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
  fetchCycleRaceSchedules: jest.fn(),
  fetchBoatRaceSchedules: jest.fn(),
}));

describe('sitemap', () => {
  const mockHorseRaces: Race[] = [
    { id: 'horse-1-1-20240115', type: 'horse', raceNo: 1, track: '서울', startTime: '11:30', distance: 1200, status: 'upcoming', entries: [] },
  ];
  const mockCycleRaces: Race[] = [
    { id: 'cycle-1-1-20240115', type: 'cycle', raceNo: 1, track: '광명', startTime: '11:00', distance: 1000, status: 'upcoming', entries: [] },
  ];

  beforeEach(() => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue(mockHorseRaces);
    (fetchCycleRaceSchedules as jest.Mock).mockResolvedValue(mockCycleRaces);
    (fetchBoatRaceSchedules as jest.Mock).mockResolvedValue([]); // No boat races for this test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a sitemap with static and dynamic routes', async () => {
    const sitemapEntries = await sitemap();

    const urls = sitemapEntries.map(entry => entry.url);

    // Check for static routes
    expect(urls).toContain('https://krace.co.kr/');

    // Check for dynamic race routes
    expect(urls).toContain('https://krace.co.kr/race/horse-1-1-20240115');
    expect(urls).toContain('https://krace.co.kr/race/cycle-1-1-20240115');

    // Check that there are no boat races in the sitemap for this test
    expect(urls.some(url => url.includes('/boat-'))).toBe(false);
  });
});
