// src/lib/api/fetcher.ts

import { ExternalApiError, ApiErrorCode } from './errors';

/** Timeout for API requests (10 seconds) */
const API_TIMEOUT_MS = 10000;

/**
 * Result of an API fetch operation
 */
export interface FetchResult<T> {
  data: T[];
  isStale?: boolean;
  warning?: string;
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
 * @param dateParamName Name of the date parameter in the API request (default: 'rc_date')
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
  dateParamName: string = 'rc_date'
): Promise<unknown[]> {
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
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

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
      console.error(`${apiName} API timeout after ${API_TIMEOUT_MS}ms`);
      throw new ExternalApiError(apiName, {
        code: ApiErrorCode.EXTERNAL_API_TIMEOUT,
        message: `${apiName} request timed out`,
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
  dateParamName: string = 'rc_date'
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
      dateParamName
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
