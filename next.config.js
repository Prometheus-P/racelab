/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API 라우트 타임아웃 설정
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
