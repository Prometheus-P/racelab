const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

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

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://pagead2.googlesyndication.com https://apis.data.go.kr",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
