// src/lib/seo/sitemap.ts
// Sitemap generation utilities for SEO optimization

import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';
const MAX_URLS_PER_SITEMAP = 50000;

export interface RaceForSitemap {
  id: string;
  status: string;
  date: string;
  updatedAt?: string;
}

/**
 * Check if sitemap should be split into multiple files
 * Google limit is 50,000 URLs per sitemap
 */
export function shouldSplitSitemap(totalUrls: number): boolean {
  return totalUrls >= MAX_URLS_PER_SITEMAP;
}

/**
 * Generate sitemap entries from race data
 * Sets appropriate priority and changeFrequency based on race status
 */
export function generateSitemapEntries(
  races: RaceForSitemap[]
): MetadataRoute.Sitemap {
  return races.map((race) => ({
    url: `${BASE_URL}/race/${race.id}`,
    lastModified: race.updatedAt ? new Date(race.updatedAt) : new Date(race.date),
    changeFrequency: race.status === 'finished' ? 'never' : 'hourly',
    priority: race.status === 'upcoming' ? 0.9 : 0.7,
  }));
}

/**
 * Get static pages for sitemap (homepage, results, guide, etc.)
 */
export function getStaticSitemapEntries(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/results`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}

/**
 * Calculate number of sitemap files needed
 */
export function calculateSitemapCount(
  totalUrls: number,
  urlsPerSitemap: number = 10000
): number {
  return Math.ceil(totalUrls / urlsPerSitemap);
}

/**
 * Get paginated races for a specific sitemap chunk
 */
export function getSitemapChunkParams(
  total: number,
  urlsPerChunk: number = 10000
): Array<{ id: string }> {
  const chunkCount = calculateSitemapCount(total, urlsPerChunk);
  return Array.from({ length: chunkCount }, (_, i) => ({ id: String(i) }));
}
