// src/lib/api/fetcher.ts

import { ExternalApiError, ApiErrorCode } from './errors';

/**
 * Default timeout for API requests (10 seconds)
 * Can be overridden per-API using the timeout parameter
 */
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * API-specific timeout configurations (milliseconds)
 * Adjust based on API response characteristics
 */
export const API_TIMEOUTS = {
  /** 빠른 응답이 필요한 API (예: health check, simple lookups) */
  FAST: 5000,
  /** 기본 타임아웃 */
  DEFAULT: 10000,
  /** 느린 API (예: 복잡한 쿼리, 대량 데이터) */
  SLOW: 20000,
  /** 매우 느린 API (예: 배치 처리, 리포트 생성) */
  VERY_SLOW: 30000,
} as const;

/**
 * Result of an API fetch operation
 */
export interface FetchResult<T> {
  data: T[];
  isStale?: boolean;
  warning?: string;
}

/**
 * Options for API fetch
 */
export interface FetchApiOptions {
  /** Name of the date parameter in the API request (default: 'rc_date') */
  dateParamName?: string;
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
}

/**
 * Generic API fetch function with flexible date parameter
 * @param baseUrl Base URL of the API (e.g., https://apis.data.go.kr/B551015)
 * @param endpoint Specific API endpoint (e.g., /API299/Race_Result_total)
 * @param apiKey API key for authentication
 * @param params Additional URL parameters
 * @param rcDate Race date in YYYYMMDD format
 * @param apiName Name of the API for logging/debugging
 * @param envVarName Environment variable name where API key is stored
 * @param options Optional configuration (dateParamName, timeout)
 * @returns Promise resolving to an array of raw API items
 */
export async function fetchApi(
  baseUrl: string,
  endpoint: string,
  apiKey: string | undefined,
  params: Record<string, string>,
  rcDate: string,
  apiName: string,
  envVarName: string,
  options: FetchApiOptions | string = {}
): Promise<unknown[]> {
  // Backward compatibility: if options is a string, treat it as dateParamName
  const opts: FetchApiOptions = typeof options === 'string'
    ? { dateParamName: options }
    : options;

  const dateParamName = opts.dateParamName ?? 'rc_date';
  const timeoutMs = opts.timeout ?? DEFAULT_TIMEOUT_MS;
  if (!apiKey) {
    console.warn(`[${apiName}] ${envVarName} is not set. Returning empty array.`);
    return [];
  }

  const url = new URL(`${baseUrl}${endpoint}`);

  url.searchParams.append('numOfRows', '100');
  url.searchParams.append('pageNo', '1');
  url.searchParams.append(dateParamName, rcDate);
  url.searchParams.append('_type', 'json');

  // Add any additional parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  // serviceKey must be pre-encoded (from data.go.kr "Encoding" key)
  // Append directly to avoid double-encoding by URLSearchParams
  const finalUrl = `${url.toString()}&serviceKey=${apiKey}`;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(finalUrl, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`${apiName} API Error: ${response.status}`);
      throw new ExternalApiError(apiName, {
        originalStatus: response.status,
        message: `${apiName} returned status ${response.status}`,
      });
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    return items;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`${apiName} API timeout after ${timeoutMs}ms`);
      throw new ExternalApiError(apiName, {
        code: ApiErrorCode.EXTERNAL_API_TIMEOUT,
        message: `${apiName} request timed out after ${timeoutMs}ms`,
      });
    }

    // Re-throw ExternalApiError
    if (error instanceof ExternalApiError) {
      throw error;
    }

    // Wrap other errors
    console.error(`${apiName} API fetch failed:`, error);
    throw new ExternalApiError(apiName, {
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? error : undefined,
    });
  }
}

/**
 * Fetch API with fallback to empty array on error
 * Use this when you want graceful degradation instead of throwing
 */
export async function fetchApiSafe(
  baseUrl: string,
  endpoint: string,
  apiKey: string | undefined,
  params: Record<string, string>,
  rcDate: string,
  apiName: string,
  envVarName: string,
  options: FetchApiOptions | string = {}
): Promise<FetchResult<unknown>> {
  try {
    const data = await fetchApi(
      baseUrl,
      endpoint,
      apiKey,
      params,
      rcDate,
      apiName,
      envVarName,
      options
    );
    return { data };
  } catch (error) {
    console.error(`[${apiName}] Failed to fetch, returning empty result:`, error);
    return {
      data: [],
      isStale: true,
      warning: '데이터 제공 기관(API) 지연으로 최신 정보가 표시되지 않을 수 있습니다.',
    };
  }
}
