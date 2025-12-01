// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      crawlDelay: 1,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
