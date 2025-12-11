// src/lib/seo/index.ts
// Re-export all SEO utilities

export {
  generateSportsEventSchema,
  generateFAQSchema,
  type SportsEventSchema,
  type FAQSchema,
} from './schemas';

export {
  generateRaceMetadata,
  isHistoricalRace,
  type RaceMetadataInput,
} from './metadata';

export {
  shouldSplitSitemap,
  generateSitemapEntries,
  getStaticSitemapEntries,
  calculateSitemapCount,
  getSitemapChunkParams,
  type RaceForSitemap,
} from './sitemap';
