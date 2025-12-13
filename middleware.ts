
import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Redis from 'ioredis';
import { createHash } from 'crypto';
import { clients, Client } from './src/lib/db/schema/clients';
import { eq } from 'drizzle-orm';

// --- CONFIGURATION ---

const RATE_LIMIT_CONFIG = {
  bronze: { limit: 10, window: 60 }, // 10 requests per minute
  silver: { limit: 100, window: 60 }, // 100 requests per minute
  gold: { limit: Infinity, window: 60 }, // Unlimited
};

const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;

// --- CLIENT INITIALIZATION ---

// Initialize clients outside the middleware function to reuse connections.
let db;
let redis;

if (DATABASE_URL && REDIS_URL) {
  try {
    const queryClient = postgres(DATABASE_URL);
    db = drizzle(queryClient, { schema: { clients } });
    redis = new Redis(REDIS_URL);

    console.log('Database and Redis clients initialized successfully.');

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  } catch (error) {
    console.error('Failed to initialize database or Redis client:', error);
    db = null;
    redis = null;
  }
} else {
  console.error('DATABASE_URL or REDIS_URL environment variables are not set.');
  db = null;
  redis = null;
}

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith('/api/races/') || pathname.startsWith('/api/v1/');
}


// --- MIDDLEWARE ---

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Only apply middleware to protected paths
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Ensure clients are initialized
  if (!db || !redis) {
    console.error('Middleware execution failed: Clients not initialized.');
    return new NextResponse('Internal Server Error: Service not configured.', { status: 500 });
  }

  const apiKey = req.headers.get('X-API-KEY');

  if (!apiKey) {
    return new NextResponse('API Key is required.', { status: 401 });
  }

  const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');

  let client: Client | undefined;
  try {
    client = await db.query.clients.findFirst({
      where: eq(clients.apiKeyHash, apiKeyHash),
    });
  } catch (error) {
    console.error('Database query failed:', error);
    return new NextResponse('Internal Server Error.', { status: 500 });
  }

  if (!client || client.status !== 'active') {
    return new NextResponse('Forbidden: Invalid or inactive API Key.', { status: 403 });
  }

  const tierConfig = RATE_LIMIT_CONFIG[client.tier];

  // Gold tier has unlimited access
  if (tierConfig.limit === Infinity) {
    return NextResponse.next();
  }

  const clientKey = `rate_limit:${client.id}`;
  let currentUsage: number;

  try {
    const pipeline = redis.pipeline();
    pipeline.incr(clientKey);
    pipeline.ttl(clientKey);
    const results = await pipeline.exec();

    // Check if the command results are valid
    if (!results || results.length < 2 || results[0][0] || results[1][0]) {
      console.error('Invalid response from Redis pipeline:', results);
      // Fallback: allow request but log error.
      return NextResponse.next();
    }

    currentUsage = results[0][1] as number;
    const ttl = results[1][1] as number;

    // If the key is new, set the expiration
    if (ttl === -1) {
      await redis.expire(clientKey, tierConfig.window);
    }

    if (currentUsage > tierConfig.limit) {
      return new NextResponse('Too Many Requests.', { status: 429 });
    }
  } catch (error) {
    console.error('Redis command failed:', error);
    // Fallback for when Redis is down: allow request to proceed but log the error.
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

// --- MIDDLEWARE CONFIG ---

export const config = {
  matcher: '/api/:path*',
};
