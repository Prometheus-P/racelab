import { db } from '@/lib/db/client';
import { races, results as resultsTable, entries, tracks } from '@/lib/db/schema';
import { HistoricalRace, PaginatedResults, RaceType, ResultsSearchParams } from '@/types';
import { MOCK_HISTORICAL_RACES } from '@/lib/mockHistoricalResults';
import { getKoreanDate, getKoreanDateRange, formatYYYYMMDD } from '@/lib/utils/date';
import {
  and,
  between,
  desc,
  eq,
  ilike,
  inArray,
  sql,
} from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';

export type ResultsErrorCode =
  | 'ENV_MISSING'
  | 'UPSTREAM_FAIL'
  | 'CACHE_MISS'
  | 'DB_FAIL'
  | 'INVALID_QUERY';

export interface ResultsError {
  code: ResultsErrorCode;
  message: string;
  details?: unknown;
}

export interface ResultsMeta {
  cacheHit: boolean;
  generatedAt: string;
  source: 'db' | 'mock' | 'snapshot';
  queryNormalized: NormalizedResultsQuery;
  fallbackCode?: ResultsErrorCode;
  snapshotAt?: string;
}

export interface ResultsApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: ResultsError;
  meta: ResultsMeta;
}

export interface NormalizedResultsQuery {
  dateFrom: string;
  dateTo: string;
  types?: RaceType[];
  track?: string;
  jockey?: string;
  page: number;
  limit: number;
}

export interface NormalizationResult {
  ok: true;
  query: NormalizedResultsQuery;
  warnings?: string[];
}

export interface NormalizationError {
  ok: false;
  error: ResultsError;
}

export type NormalizedOrError = NormalizationResult | NormalizationError;

const CACHE_TTL_MS = 60_000;
const DEFAULT_DAYS = 6; // last 7 days inclusive

interface CachedEntry {
  data: PaginatedResults<HistoricalRace>;
  source: 'db' | 'mock';
  generatedAt: string;
}

const resultsCache = new Map<string, CachedEntry>();
let lastError: ResultsError | undefined;

class ResultsServiceError extends Error {
  public readonly code: ResultsErrorCode;
  public readonly details?: unknown;

  constructor(code: ResultsErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function normalizeResultsQuery(
  params: Partial<ResultsSearchParams> & {
    page?: string | number;
    limit?: string | number;
    types?: ResultsSearchParams['types'] | string;
  }
): NormalizedOrError {
  const defaultRange = getKoreanDateRange(DEFAULT_DAYS);

  const sanitizeDate = (value: string | undefined): string | null => {
    if (!value) return null;
    const cleaned = value.replace(/-/g, '');
    if (!/^\d{8}$/.test(cleaned)) {
      return 'INVALID';
    }
    return cleaned;
  };

  const rawFrom = sanitizeDate(params.dateFrom);
  const rawTo = sanitizeDate(params.dateTo);

  if (rawFrom === 'INVALID' || rawTo === 'INVALID') {
    return {
      ok: false,
      error: {
        code: 'INVALID_QUERY',
        message: 'Dates must be in YYYYMMDD format',
      },
    };
  }

  const dateFrom = rawFrom ?? defaultRange.start;
  const dateTo = rawTo ?? defaultRange.end;

  if (dateFrom > dateTo) {
    return {
      ok: false,
      error: {
        code: 'INVALID_QUERY',
        message: 'dateFrom must be before or equal to dateTo',
      },
    };
  }

  const parsedPage = Number(params.page ?? 1);
  const parsedLimit = Number(params.limit ?? 20);
  if (
    Number.isNaN(parsedPage) ||
    parsedPage < 1 ||
    Number.isNaN(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > 100
  ) {
    return {
      ok: false,
      error: {
        code: 'INVALID_QUERY',
        message: 'page must be >= 1 and limit must be between 1 and 100',
      },
    };
  }

  const typeList = Array.isArray(params.types)
    ? params.types
    : typeof params.types === 'string'
      ? params.types.split(',')
      : undefined;

  const types = typeList
    ?.map((t) => t.trim())
    .filter((t): t is RaceType => ['horse', 'cycle', 'boat'].includes(t as RaceType));

  const query: NormalizedResultsQuery = {
    dateFrom,
    dateTo,
    types: types && types.length > 0 ? types : undefined,
    track: params.track || undefined,
    jockey: params.jockey || undefined,
    page: parsedPage,
    limit: parsedLimit,
  };

  return { ok: true, query };
}

function getCacheKey(query: NormalizedResultsQuery): string {
  return JSON.stringify(query);
}

function getCachedEntry(
  key: string
): { entry: CachedEntry; fresh: boolean } | undefined {
  const cached = resultsCache.get(key);
  if (!cached) return undefined;

  const age = Date.now() - new Date(cached.generatedAt).getTime();
  return { entry: cached, fresh: age <= CACHE_TTL_MS };
}

function setCache(key: string, entry: CachedEntry): void {
  resultsCache.set(key, entry);
}

function mapResultsToHistoricalRace(
  raceRow: InferModel<typeof races> & { trackName?: string | null; trackCode?: string | null },
  resultRows: Array<{
    raceId: string;
    entryNo: number;
    finishPosition: number;
    time: string | null;
    margin: string | null;
    dividendWin: number | null;
    dividendPlace: number | null;
    jockeyName: string | null;
    entryName: string | null;
  }>
): HistoricalRace {
  const dateValue = raceRow.raceDate instanceof Date ? raceRow.raceDate : new Date(raceRow.raceDate);
  const trackFromId = raceRow.id.split('-')[1];
  const baseTrack = raceRow.trackName || raceRow.trackCode || trackFromId || '트랙 미지정';
  const startTime = raceRow.startTime ? raceRow.startTime.toString().slice(0, 5) : '';

  const sortedResults = [...resultRows].sort((a, b) => a.finishPosition - b.finishPosition);

  const dividends = [] as HistoricalRace['dividends'];
  const winner = sortedResults.find((r) => r.dividendWin !== null);
  if (winner?.dividendWin) {
    dividends.push({
      type: 'win',
      entries: [winner.entryNo],
      amount: Number(winner.dividendWin),
    });
  }

  sortedResults
    .filter((r) => r.dividendPlace)
    .forEach((row) => {
      dividends.push({
        type: 'place',
        entries: [row.entryNo],
        amount: Number(row.dividendPlace),
      });
    });

  return {
    id: raceRow.id,
    type: raceRow.raceType as RaceType,
    raceNo: raceRow.raceNo,
    track: baseTrack,
    date: formatYYYYMMDD(dateValue),
    startTime,
    distance: raceRow.distance ?? undefined,
    grade: raceRow.grade ?? undefined,
    status: raceRow.status === 'canceled' ? 'canceled' : 'finished',
    results: sortedResults.map((row) => ({
      rank: row.finishPosition,
      entryNo: row.entryNo,
      name: row.entryName ?? `출전번호 ${row.entryNo}`,
      jockey: row.jockeyName ?? undefined,
      time: row.time ?? undefined,
      timeDiff: row.margin ?? undefined,
    })),
    dividends,
  };
}

async function fetchFromDatabase(
  query: NormalizedResultsQuery
): Promise<{ data: PaginatedResults<HistoricalRace>; generatedAt: string }> {
  if (!process.env.DATABASE_URL) {
    throw new ResultsServiceError(
      'ENV_MISSING',
      'DATABASE_URL is not configured for historical results'
    );
  }

  const startIso = `${query.dateFrom.slice(0, 4)}-${query.dateFrom.slice(4, 6)}-${query.dateFrom.slice(6, 8)}`;
  const endIso = `${query.dateTo.slice(0, 4)}-${query.dateTo.slice(4, 6)}-${query.dateTo.slice(6, 8)}`;

  const conditions = [between(races.raceDate, startIso, endIso)];

  if (query.types) {
    conditions.push(inArray(races.raceType, query.types));
  }

  if (query.track) {
    conditions.push(ilike(tracks.name, `%${query.track}%`));
  }

  if (query.jockey) {
    conditions.push(
      sql`exists (select 1 from ${entries} e where e.race_id = ${races.id} and e.jockey_name ilike ${`%${query.jockey}%`})`
    );
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
  const offset = (query.page - 1) * query.limit;

  const [raceRows, countRows] = await Promise.all([
    db
      .select({
        id: races.id,
        raceType: races.raceType,
        raceNo: races.raceNo,
        raceDate: races.raceDate,
        startTime: races.startTime,
        distance: races.distance,
        grade: races.grade,
        status: races.status,
        trackName: tracks.name,
        trackCode: tracks.code,
      })
      .from(races)
      .leftJoin(tracks, eq(races.trackId, tracks.id))
      .where(whereClause)
      .orderBy(desc(races.raceDate), desc(races.raceNo))
      .limit(query.limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(races)
      .leftJoin(tracks, eq(races.trackId, tracks.id))
      .where(whereClause),
  ]);

  const total = countRows[0]?.count ?? 0;
  if (raceRows.length === 0) {
    return {
      data: { items: [], total, page: query.page, limit: query.limit, totalPages: 0 },
      generatedAt: new Date().toISOString(),
    };
  }

  const raceIds = raceRows.map((row) => row.id);
  const resultRows = await db
    .select({
      raceId: resultsTable.raceId,
      entryNo: resultsTable.entryNo,
      finishPosition: resultsTable.finishPosition,
      time: resultsTable.time,
      margin: resultsTable.margin,
      dividendWin: resultsTable.dividendWin,
      dividendPlace: resultsTable.dividendPlace,
      jockeyName: entries.jockeyName,
      entryName: entries.name,
    })
    .from(resultsTable)
    .leftJoin(entries, and(eq(resultsTable.raceId, entries.raceId), eq(resultsTable.entryNo, entries.entryNo)))
    .where(inArray(resultsTable.raceId, raceIds))
    .orderBy(resultsTable.raceId, resultsTable.finishPosition);

  const items = raceRows.map((race) => {
    const raceResults = resultRows.filter((row) => row.raceId === race.id);
    return mapResultsToHistoricalRace(race, raceResults);
  });

  const generatedAt = new Date().toISOString();
  return {
    data: {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
    generatedAt,
  };
}

function filterMockResults(query: NormalizedResultsQuery): PaginatedResults<HistoricalRace> {
  let filtered = [...MOCK_HISTORICAL_RACES];

  if (query.types) {
    filtered = filtered.filter((race) => query.types?.includes(race.type));
  }

  filtered = filtered.filter((race) => race.date >= query.dateFrom && race.date <= query.dateTo);

  if (query.track) {
    filtered = filtered.filter((race) => race.track.includes(query.track ?? ''));
  }

  if (query.jockey) {
    const keyword = query.jockey.toLowerCase();
    filtered = filtered.filter((race) =>
      race.results.some((result) => (result.jockey ?? '').toLowerCase().includes(keyword))
    );
  }

  const start = (query.page - 1) * query.limit;
  const items = filtered.slice(start, start + query.limit);

  return {
    items,
    total: filtered.length,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(filtered.length / query.limit),
  };
}

export async function buildResultsResponse(
  query: NormalizedResultsQuery
): Promise<ResultsApiResponse<PaginatedResults<HistoricalRace>>> {
  const cacheKey = getCacheKey(query);
  const cached = getCachedEntry(cacheKey);

  if (cached?.fresh) {
    return {
      ok: true,
      data: cached.entry.data,
      meta: {
        cacheHit: true,
        generatedAt: cached.entry.generatedAt,
        source: cached.entry.source,
        queryNormalized: query,
        snapshotAt: cached.entry.generatedAt,
      },
    };
  }

  try {
    const { data, generatedAt } = await fetchFromDatabase(query);
    const entry: CachedEntry = { data, source: 'db', generatedAt };
    setCache(cacheKey, entry);

    return {
      ok: true,
      data,
      meta: {
        cacheHit: false,
        generatedAt,
        source: 'db',
        queryNormalized: query,
      },
    };
  } catch (error) {
    const serviceError =
      error instanceof ResultsServiceError
        ? error
        : new ResultsServiceError('DB_FAIL', 'Failed to fetch results', error);
    lastError = { code: serviceError.code, message: serviceError.message, details: serviceError.details };
    console.error('[ResultsService] Primary fetch failed:', serviceError.message);
  }

  if (cached) {
    return {
      ok: true,
      data: cached.entry.data,
      meta: {
        cacheHit: true,
        generatedAt: cached.entry.generatedAt,
        source: 'snapshot',
        queryNormalized: query,
        fallbackCode: lastError?.code,
        snapshotAt: cached.entry.generatedAt,
      },
    };
  }

  const mockData = filterMockResults(query);
  const generatedAt = new Date().toISOString();
  const source: ResultsMeta['source'] = lastError ? 'snapshot' : 'mock';
  setCache(cacheKey, { data: mockData, source: 'mock', generatedAt });

  return {
    ok: true,
    data: mockData,
    meta: {
      cacheHit: false,
      generatedAt,
      source,
      queryNormalized: query,
      fallbackCode: lastError?.code,
      snapshotAt: lastError ? generatedAt : undefined,
    },
  };
}

export function getResultsDefaultRange(): { dateFrom: string; dateTo: string } {
  const range = getKoreanDateRange(DEFAULT_DAYS);
  return { dateFrom: range.start, dateTo: range.end };
}

export function getKoreanToday(): string {
  return formatYYYYMMDD(getKoreanDate());
}
