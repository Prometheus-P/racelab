// src/lib/api/fetcher.ts

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

  try {
    const response = await fetch(finalUrl, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`${apiName} API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const items = data.response?.body?.items?.item || [];

    return items;
  } catch (error) {
    console.error(`${apiName} API fetch failed:`, error);
    return [];
  }
}
