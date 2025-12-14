import Redis from 'ioredis';

let client: Redis | null = null;
let clientPromise: Promise<Redis | null> | null = null;

async function createRedisClient(): Promise<Redis | null> {
  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  const instance = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
  if (instance.status === 'wait') {
    await instance.connect();
  }
  return instance;
}

// Redis 클라이언트를 싱글톤으로 관리하여 커넥션 폭증을 방지
export async function getRedisClient(): Promise<Redis | null> {
  if (client) {
    return client;
  }

  if (!clientPromise) {
    clientPromise = createRedisClient().catch((error) => {
      console.error('[Redis] 클라이언트 생성 실패', error);
      clientPromise = null;
      return null;
    });
  }

  client = await clientPromise;
  return client;
}
