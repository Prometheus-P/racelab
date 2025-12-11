/**
 * @jest-environment node
 *
 * Unit tests for sitemap generation utilities
 */
import { describe, expect, it } from '@jest/globals';
import {
  shouldSplitSitemap,
  generateSitemapEntries,
  getStaticSitemapEntries,
  calculateSitemapCount,
  getSitemapChunkParams,
  type RaceForSitemap,
} from '@/lib/seo/sitemap';

describe('shouldSplitSitemap', () => {
  it('returns false for less than 50000 URLs', () => {
    expect(shouldSplitSitemap(49999)).toBe(false);
  });

  it('returns true for exactly 50000 URLs', () => {
    expect(shouldSplitSitemap(50000)).toBe(true);
  });

  it('returns true for more than 50000 URLs', () => {
    expect(shouldSplitSitemap(50001)).toBe(true);
  });

  it('returns false for 0 URLs', () => {
    expect(shouldSplitSitemap(0)).toBe(false);
  });
});

describe('generateSitemapEntries', () => {
  const mockRaces: RaceForSitemap[] = [
    { id: 'race-1', status: 'finished', date: '2025-12-10' },
    { id: 'race-2', status: 'upcoming', date: '2025-12-11' },
    { id: 'race-3', status: 'live', date: '2025-12-11' },
  ];

  it('generates sitemap entries for all races', () => {
    const entries = generateSitemapEntries(mockRaces);

    expect(entries).toHaveLength(3);
  });

  it('includes correct URL format for each race', () => {
    const entries = generateSitemapEntries(mockRaces);

    expect(entries[0].url).toContain('/race/race-1');
    expect(entries[1].url).toContain('/race/race-2');
  });

  it('sets correct priority for finished races (0.7)', () => {
    const races = [{ id: 'finished-race', status: 'finished', date: '2025-12-10' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].priority).toBe(0.7);
  });

  it('sets correct priority for upcoming races (0.9)', () => {
    const races = [{ id: 'upcoming-race', status: 'upcoming', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].priority).toBe(0.9);
  });

  it('sets changeFrequency to never for finished races', () => {
    const races = [{ id: 'finished-race', status: 'finished', date: '2025-12-10' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].changeFrequency).toBe('never');
  });

  it('sets changeFrequency to hourly for upcoming races', () => {
    const races = [{ id: 'upcoming-race', status: 'upcoming', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].changeFrequency).toBe('hourly');
  });

  it('sets changeFrequency to hourly for live races', () => {
    const races = [{ id: 'live-race', status: 'live', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].changeFrequency).toBe('hourly');
  });

  it('uses updatedAt for lastModified when available', () => {
    const races = [
      { id: 'race-1', status: 'finished', date: '2025-12-10', updatedAt: '2025-12-10T15:00:00Z' },
    ];
    const entries = generateSitemapEntries(races);

    expect(entries[0].lastModified).toEqual(new Date('2025-12-10T15:00:00Z'));
  });

  it('falls back to date for lastModified when updatedAt not available', () => {
    const races = [{ id: 'race-1', status: 'finished', date: '2025-12-10' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].lastModified).toEqual(new Date('2025-12-10'));
  });

  it('handles empty array', () => {
    const entries = generateSitemapEntries([]);

    expect(entries).toHaveLength(0);
  });
});

describe('getStaticSitemapEntries', () => {
  it('returns entries for homepage', () => {
    const entries = getStaticSitemapEntries();
    // Homepage is the entry without any path after domain, or priority 1.0
    const homepage = entries.find((e) => e.priority === 1.0);

    expect(homepage).toBeDefined();
    expect(homepage?.changeFrequency).toBe('hourly');
  });

  it('returns entries for results page', () => {
    const entries = getStaticSitemapEntries();
    const results = entries.find((e) => e.url.includes('/results'));

    expect(results).toBeDefined();
    expect(results?.priority).toBe(0.9);
    expect(results?.changeFrequency).toBe('always');
  });

  it('returns entries for guide page', () => {
    const entries = getStaticSitemapEntries();
    const guide = entries.find((e) => e.url.includes('/guide'));

    expect(guide).toBeDefined();
    expect(guide?.priority).toBe(0.8);
    expect(guide?.changeFrequency).toBe('weekly');
  });

  it('returns at least 3 static entries', () => {
    const entries = getStaticSitemapEntries();

    expect(entries.length).toBeGreaterThanOrEqual(3);
  });

  it('all entries have lastModified set', () => {
    const entries = getStaticSitemapEntries();

    entries.forEach((entry) => {
      expect(entry.lastModified).toBeDefined();
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });
});

describe('calculateSitemapCount', () => {
  it('returns 1 for URL count less than chunk size', () => {
    expect(calculateSitemapCount(5000, 10000)).toBe(1);
  });

  it('returns 1 for URL count equal to chunk size', () => {
    expect(calculateSitemapCount(10000, 10000)).toBe(1);
  });

  it('returns 2 for URL count slightly over chunk size', () => {
    expect(calculateSitemapCount(10001, 10000)).toBe(2);
  });

  it('returns correct count for large datasets', () => {
    expect(calculateSitemapCount(35000, 10000)).toBe(4);
  });

  it('uses default chunk size of 10000', () => {
    expect(calculateSitemapCount(25000)).toBe(3);
  });
});

describe('getSitemapChunkParams', () => {
  it('returns array with single chunk for small datasets', () => {
    const params = getSitemapChunkParams(5000, 10000);

    expect(params).toHaveLength(1);
    expect(params[0]).toEqual({ id: '0' });
  });

  it('returns correct number of chunks for large datasets', () => {
    const params = getSitemapChunkParams(35000, 10000);

    expect(params).toHaveLength(4);
    expect(params[0]).toEqual({ id: '0' });
    expect(params[1]).toEqual({ id: '1' });
    expect(params[2]).toEqual({ id: '2' });
    expect(params[3]).toEqual({ id: '3' });
  });

  it('uses default chunk size of 10000', () => {
    const params = getSitemapChunkParams(25000);

    expect(params).toHaveLength(3);
  });
});
