import { activateFallbackMode, type FallbackSource } from './fallbackMode';

const QUOTA_KEYWORDS = ['quota', 'limit', 'exceed', 'exceeded', 'quotaover', 'daily', '10,000', '10000'];

function containsQuotaKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return QUOTA_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Inspect API response for quota signals and toggle fallback mode if needed.
 */
export function checkQuotaFromResponse(
  source: FallbackSource,
  response: Response,
  bodySnippet?: string
): boolean {
  const remainingHeader =
    response.headers.get('x-ratelimit-remaining') ??
    response.headers.get('x-quota-remaining') ??
    response.headers.get('remain-req');

  const headerRemaining = remainingHeader ? parseInt(remainingHeader, 10) : Number.NaN;
  const exhaustedHeader = Number.isFinite(headerRemaining) && headerRemaining <= 0;
  const statusSignal = response.status === 429 || response.status === 403;
  const bodySignal = bodySnippet ? containsQuotaKeyword(bodySnippet) : false;

  if (statusSignal || exhaustedHeader || bodySignal) {
    const reason = statusSignal
      ? `status ${response.status}`
      : bodySignal
        ? 'quota keyword in response'
        : 'quota header depleted';
    activateFallbackMode(source, reason);
    return true;
  }

  return false;
}

/**
 * Inspect thrown errors for quota keywords (used when API call never returned a response).
 */
export function checkQuotaFromError(source: FallbackSource, error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (!message) {
    return false;
  }

  if (containsQuotaKeyword(message)) {
    activateFallbackMode(source, message);
    return true;
  }

  return false;
}
