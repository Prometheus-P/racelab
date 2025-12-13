import Redis from 'ioredis';

let client: Redis | null = null;

// Redis 클라이언트를 싱글톤으로 관리하여 커넥션 폭증을 방지
export function getRedisClient(): Redis | null {
  if (client) {
    return client;
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
  return client;
}
