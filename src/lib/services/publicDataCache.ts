import { getRedisClient } from '@/lib/cache/redisClient';
import {
  singleFlight,
  onCacheInvalidation,
  invalidateCache,
} from '@/lib/cache/cacheUtils';
import { safeError, safeInfo } from '@/lib/utils/safeLogger';
import { sanitizeForJsonLd } from '@/lib/utils/sanitize';
import type { RaceType } from '@/types';

export interface PublicRaceResult {
  id: string;
  name: string;
  track: string;
  type: RaceType;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
  winners?: string[];
}

export interface CachedRaceResponse {
  data: PublicRaceResult[];
  source: 'cache' | 'upstream' | 'snapshot';
  message?: string;
}

const DEFAULT_TTL_SECONDS = 300; // 기본 5분 TTL
const FINISHED_TTL_SECONDS = 3600; // 종료된 경주는 더 길게 보관

function formatKstDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replaceAll('-', '');
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    // Sanitize external API data to prevent XSS
    return sanitizeForJsonLd(value.trim());
  }
  return fallback;
}

function safeStatus(value: unknown): PublicRaceResult['status'] {
  const normalized = safeString(value).toLowerCase();
  if (normalized === 'live') return 'live';
  if (normalized === 'finished' || normalized === 'end') return 'finished';
  return 'upcoming';
}

function normalizePublicRaceResult(raw: Record<string, unknown>): PublicRaceResult | null {
  // API 응답이 XML/JSON 등 불안정한 포맷일 수 있으므로 방어적으로 파싱
  const id = safeString(raw.id ?? raw.raceId);
  const name = safeString(raw.name ?? raw.raceName ?? '미정 경기');
  const track = safeString(raw.track ?? raw.venue ?? '트랙 미지정');
  const type = (safeString(raw.type ?? raw.sports)?.toLowerCase() as RaceType) || 'horse';
  const startTime = safeString(raw.startTime ?? raw.start_dt ?? '미정');
  const status = safeStatus(raw.status);

  if (!id) {
    // 필수 필드가 없으면 무시
    return null;
  }

  const winners = Array.isArray(raw.winners)
    ? (raw.winners.filter((item) => typeof item === 'string') as string[])
    : undefined;

  return { id, name, track, type, startTime, status, winners };
}

async function persistSnapshot(key: string, payload: unknown) {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(payload), 'EX', 86_400);
  } catch (error) {
    // 스냅샷 저장 실패는 사용자에 노출하지 않음
    safeError('[PublicDataCache] Snapshot 저장 실패', error);
  }
}

async function readCache(key: string): Promise<PublicRaceResult[] | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => normalizePublicRaceResult(item as Record<string, unknown>) !== null) as PublicRaceResult[];
    }
  } catch (error) {
    safeError('[PublicDataCache] 캐시 읽기 실패', error);
  }

  return null;
}

async function writeCache(key: string, data: PublicRaceResult[], ttlSeconds: number) {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    safeError('[PublicDataCache] 캐시 저장 실패', error);
  }
}

function extractXmlValue(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
  return match?.[1] ?? '';
}

function parseXmlRaces(xml: string): PublicRaceResult[] {
  // 공공 데이터 XML 구조가 일정하지 않을 수 있으므로 item/race 노드 모두 허용
  const entries =
    xml.match(/<race[^>]*>[\s\S]*?<\/race>/gi) ?? xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) ?? [];

  return entries
    .map((block) => {
      const record = {
        raceId: extractXmlValue(block, 'raceId') || extractXmlValue(block, 'id'),
        raceName: extractXmlValue(block, 'raceName') || extractXmlValue(block, 'name'),
        venue: extractXmlValue(block, 'track') || extractXmlValue(block, 'venue'),
        sports: extractXmlValue(block, 'type') || extractXmlValue(block, 'sports'),
        start_dt: extractXmlValue(block, 'startTime') || extractXmlValue(block, 'start_dt'),
        status: extractXmlValue(block, 'status'),
      };

      return normalizePublicRaceResult(record);
    })
    .filter((item): item is PublicRaceResult => Boolean(item));
}

async function fetchFromUpstream(date: string): Promise<PublicRaceResult[]> {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;
  const apiUrl = process.env.PUBLIC_DATA_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error('PUBLIC_DATA_API_KEY 또는 API URL 누락');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  const res = await fetch(`${apiUrl}?date=${date}`, {
    headers: {
      'x-api-key': apiKey,
    },
    // 공공데이터 API 응답이 느리거나 불안정한 점을 고려하여 여유 타임아웃 적용
    cache: 'no-store',
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    throw new Error(`API 실패: ${res.status}`);
  }

  const raw = await res
    .json()
    .catch(async () => {
      // XML 응답일 수 있으므로 텍스트를 반환하여 후처리
      const text = await res.text();
      return { races: text };
    })
    .catch(() => ({ races: null }));

  if (Array.isArray(raw)) {
    return raw
      .map((item) => normalizePublicRaceResult(item as Record<string, unknown>))
      .filter((item): item is PublicRaceResult => Boolean(item));
  }

  const races = (raw as { races?: unknown }).races;
  if (Array.isArray(races)) {
    return races
      .map((item) => normalizePublicRaceResult(item as Record<string, unknown>))
      .filter((item): item is PublicRaceResult => Boolean(item));
  }

  if (typeof races === 'string' && races.trim().startsWith('<')) {
    return parseXmlRaces(races);
  }

  return [];
}

/**
 * 캐시된 경주 결과 조회 (Single-flight 패턴 적용)
 *
 * - 동일 날짜에 대한 동시 요청은 하나의 업스트림 호출만 수행
 * - 캐시 스탬피드 방지
 */
export async function fetchRaceResultsWithCache(dateInput?: string): Promise<CachedRaceResponse> {
  const date = dateInput ?? formatKstDate(new Date());
  const cacheKey = `public-data:results:${date}`;
  const snapshotKey = 'public-data:results:last-good';

  // 캐시 히트 시 즉시 반환
  const cached = await readCache(cacheKey);
  if (cached) {
    return { data: cached, source: 'cache' };
  }

  // Single-flight: 동일 날짜에 대한 동시 요청은 하나만 실행
  return singleFlight(cacheKey, async () => {
    // 다른 요청이 이미 캐시를 채웠을 수 있으므로 재확인
    const cachedAgain = await readCache(cacheKey);
    if (cachedAgain) {
      return { data: cachedAgain, source: 'cache' };
    }

    try {
      safeInfo(`[PublicDataCache] Fetching from upstream for ${date}`);
      const data = await fetchFromUpstream(date);
      const ttl = data.every((item) => item.status === 'finished') ? FINISHED_TTL_SECONDS : DEFAULT_TTL_SECONDS;

      await writeCache(cacheKey, data, ttl);
      await persistSnapshot(snapshotKey, { date, data });

      return { data, source: 'upstream' };
    } catch (error) {
      safeError('[PublicDataCache] API 실패, 스냅샷 시도', error);
      const snapshot = await readCache(snapshotKey);
      if (snapshot) {
        return {
          data: snapshot,
          source: 'snapshot',
          message: 'Data Updating... 최근 정상 스냅샷을 사용합니다.',
        };
      }

      return { data: [], source: 'snapshot', message: 'Data Updating... 최신 데이터를 불러오는 중입니다.' };
    }
  });
}

/**
 * 캐시 수동 무효화
 *
 * @param date - 무효화할 날짜 (YYYYMMDD 형식), 없으면 오늘
 */
export async function invalidateRaceResultsCache(date?: string): Promise<void> {
  const targetDate = date ?? formatKstDate(new Date());
  const cacheKey = `public-data:results:${targetDate}`;

  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.del(cacheKey);
      safeInfo(`[PublicDataCache] Cache invalidated: ${cacheKey}`);
    } catch (error) {
      safeError('[PublicDataCache] Cache invalidation failed', error);
    }
  }

  // 무효화 이벤트 발행
  await invalidateCache([cacheKey], 'manual', 'publicDataCache');
}

/**
 * 패턴 기반 캐시 무효화
 *
 * @param pattern - 캐시 키 패턴 (예: 'public-data:results:*')
 */
export async function invalidateRaceResultsCacheByPattern(pattern: string): Promise<number> {
  const redis = await getRedisClient();
  if (!redis) return 0;

  try {
    // Redis SCAN으로 패턴에 맞는 키 찾기
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [newCursor, foundKeys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    if (keys.length > 0) {
      await redis.del(...keys);
      safeInfo(`[PublicDataCache] Invalidated ${keys.length} keys matching pattern: ${pattern}`);

      // 무효화 이벤트 발행
      await invalidateCache(keys, 'manual', 'publicDataCache');
    }

    return keys.length;
  } catch (error) {
    safeError('[PublicDataCache] Pattern invalidation failed', error);
    return 0;
  }
}

/**
 * 캐시 무효화 이벤트 리스너 등록
 *
 * 다른 모듈에서 캐시 무효화 이벤트를 구독할 수 있음
 */
export function registerCacheInvalidationHandler(): () => void {
  return onCacheInvalidation(async (keys) => {
    const redis = await getRedisClient();
    if (!redis) return;

    for (const key of keys) {
      // 와일드카드 패턴인 경우
      if (key.includes('*')) {
        await invalidateRaceResultsCacheByPattern(key);
      } else if (key.startsWith('public-data:results:')) {
        try {
          await redis.del(key);
        } catch (error) {
          safeError(`[PublicDataCache] Failed to delete key: ${key}`, error);
        }
      }
    }
  });
}
