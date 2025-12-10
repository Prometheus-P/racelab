/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API 라우트 타임아웃 설정
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // SEO-friendly URL redirects
  // Support /{type}/{date}/{track}/{raceNo} pattern → /race/{id}
  async rewrites() {
    return [
      // Pattern: /horse/20251210/seoul/1 → /race/horse-1-1-20251210
      {
        source: '/:type(horse|cycle|boat)/:date(\\d{8})/:track/:raceNo(\\d+)',
        destination: '/race/:type-:meetCode-:raceNo-:date',
        has: [
          {
            type: 'query',
            key: 'meetCode',
          },
        ],
      },
      // Simpler pattern with meetCode in URL
      {
        source: '/:type(horse|cycle|boat)/:date(\\d{8})/:meetCode(\\d+)/:raceNo(\\d+)',
        destination: '/race/:type-:meetCode-:raceNo-:date',
      },
    ];
  },

  // Redirects for old URLs to new SEO-friendly pattern
  async redirects() {
    return [
      // Redirect old /?tab=horse to / with proper state
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
