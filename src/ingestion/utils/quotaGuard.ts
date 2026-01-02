import { activateFallbackMode, type FallbackSource } from './fallbackMode';

/**
 * 할당량 관련 HTTP 상태 코드
 * - 429: Too Many Requests (표준)
 * - 503: Service Unavailable (일부 API에서 사용)
 */
const QUOTA_STATUS_CODES = [429, 503];

/**
 * 할당량 관련 헤더 이름 (표준 + 공공데이터 API)
 */
const QUOTA_HEADERS = [
  'x-ratelimit-remaining',
  'x-quota-remaining',
  'remain-req',
  'x-rate-limit-remaining',
];

/**
 * 할당량 초과를 명확히 나타내는 패턴 (오탐지 방지)
 * 일반적인 'limit', 'daily' 등은 제외
 */
const QUOTA_ERROR_PATTERNS = [
  /quota\s*(is\s*)?(exceed|over|exhaust)/i,
  /exceeded\s*(your\s*)?(quota|limit)/i,
  /rate\s*limit\s*exceeded/i,
  /too\s*many\s*requests/i,
  /daily\s*(request\s*)?(quota|limit)\s*(exceed|over)/i,
  /10[,.]?000\s*(calls?|requests?)\s*(exceed|over)/i,
  /요청\s*(횟수|한도)\s*(초과|제한)/i,
  /SERVICE_ACCESS_DENIED/i,
  /LIMITED_NUMBER_OF_SERVICE/i,
];

/**
 * 할당량 초과 에러 패턴 매칭 (오탐지 방지 개선)
 */
function matchesQuotaErrorPattern(text: string): boolean {
  return QUOTA_ERROR_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Inspect API response for quota signals and toggle fallback mode if needed.
 *
 * 우선순위 (오탐지 방지):
 * 1. HTTP 상태 코드 (429, 503)
 * 2. Rate limit 헤더 (remaining <= 0)
 * 3. 응답 본문의 명확한 에러 패턴
 */
export function checkQuotaFromResponse(
  source: FallbackSource,
  response: Response,
  bodySnippet?: string
): boolean {
  // 1. HTTP 상태 코드 확인 (가장 신뢰도 높음)
  if (QUOTA_STATUS_CODES.includes(response.status)) {
    activateFallbackMode(source, `status ${response.status}`);
    return true;
  }

  // 2. Rate limit 헤더 확인
  for (const headerName of QUOTA_HEADERS) {
    const value = response.headers.get(headerName);
    if (value !== null) {
      const remaining = parseInt(value, 10);
      if (Number.isFinite(remaining) && remaining <= 0) {
        activateFallbackMode(source, `header ${headerName} depleted`);
        return true;
      }
    }
  }

  // 3. 응답 본문의 명확한 에러 패턴 (오탐지 방지를 위해 정규식 사용)
  if (bodySnippet && matchesQuotaErrorPattern(bodySnippet)) {
    activateFallbackMode(source, 'quota error pattern in response');
    return true;
  }

  return false;
}

/**
 * Inspect thrown errors for quota patterns (used when API call never returned a response).
 *
 * 오탐지 방지를 위해 명확한 에러 패턴만 매칭
 */
export function checkQuotaFromError(source: FallbackSource, error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (!message) {
    return false;
  }

  if (matchesQuotaErrorPattern(message)) {
    activateFallbackMode(source, `error: ${message.slice(0, 100)}`);
    return true;
  }

  return false;
}
