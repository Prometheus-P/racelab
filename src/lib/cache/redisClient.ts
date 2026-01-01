import Redis from 'ioredis';

let client: Redis | null = null;
let clientPromise: Promise<Redis | null> | null = null;
let isShuttingDown = false;

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
  // Don't create new connections during shutdown
  if (isShuttingDown) {
    return null;
  }

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

/**
 * Close Redis client gracefully
 *
 * Call this during application shutdown to properly release connections.
 * Returns a promise that resolves when the client is fully disconnected.
 */
export async function closeRedisClient(): Promise<void> {
  isShuttingDown = true;

  if (!client) {
    return;
  }

  try {
    console.log('[Redis] Closing connection gracefully...');
    await client.quit();
    console.log('[Redis] Connection closed');
  } catch (error) {
    console.error('[Redis] Error during graceful shutdown:', error);
    // Force disconnect if quit fails
    try {
      client.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  } finally {
    client = null;
    clientPromise = null;
  }
}

// Register shutdown handlers (only in non-edge runtime)
if (typeof process !== 'undefined' && process.on) {
  const gracefulShutdown = async (signal: string) => {
    console.log(`[Redis] Received ${signal}, initiating graceful shutdown...`);
    await closeRedisClient();
  };

  // Handle common termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions and unhandled rejections
  process.on('beforeExit', () => gracefulShutdown('beforeExit'));
}
