/**
 * Security Audit Logger
 *
 * 보안 관련 이벤트를 로깅하여 사고 추적 및 분석 지원
 * 프로덕션 환경에서 구조화된 로그 출력
 */

import { safeLog } from './safeLogger';

export type AuditEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'API_KEY_INVALID'
  | 'API_KEY_EXPIRED'
  | 'API_KEY_SUSPENDED'
  | 'PERMISSION_DENIED'
  | 'SUSPICIOUS_ACTIVITY';

export interface AuditEvent {
  type: AuditEventType;
  timestamp: string;
  clientId?: string;
  apiKeyPrefix?: string;
  ipAddress?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

/**
 * IP 주소 마스킹 (프라이버시 보호)
 */
function maskIpAddress(ip: string | null): string {
  if (!ip) return 'unknown';

  // IPv4: xxx.xxx.xxx.123 → xxx.xxx.xxx.***
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.**`;
    }
  }

  // IPv6: truncate to first segment
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts[0]}:${parts[1]}:**:**:**:**:**:**`;
  }

  return 'masked';
}

/**
 * API 키 프리픽스 추출 (전체 키 노출 방지)
 */
function getApiKeyPrefix(apiKey: string | null | undefined): string {
  if (!apiKey) return 'none';
  return `${apiKey.slice(0, 8)}...`;
}

/**
 * Request에서 클라이언트 정보 추출
 */
export function extractClientInfo(request: Request): {
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
} {
  const headers = request.headers;

  // IP 주소 (프록시 고려)
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');
  const rawIp = cfConnectingIp || forwardedFor?.split(',')[0] || realIp;

  return {
    ipAddress: maskIpAddress(rawIp),
    userAgent: headers.get('user-agent')?.slice(0, 100) || 'unknown',
    endpoint: new URL(request.url).pathname,
    method: request.method,
  };
}

/**
 * 보안 감사 이벤트 로깅
 */
export function logAuditEvent(event: AuditEvent): void {
  const logEntry = {
    audit: true,
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  // 프로덕션에서는 구조화된 JSON 로그
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(logEntry));
  } else {
    safeLog('info', '[AUDIT]', event.type, logEntry);
  }
}

/**
 * 인증 성공 로깅
 */
export function logAuthSuccess(
  request: Request,
  clientId: string,
  apiKey?: string
): void {
  const clientInfo = extractClientInfo(request);

  logAuditEvent({
    type: 'AUTH_SUCCESS',
    timestamp: new Date().toISOString(),
    clientId,
    apiKeyPrefix: getApiKeyPrefix(apiKey),
    ...clientInfo,
  });
}

/**
 * 인증 실패 로깅
 */
export function logAuthFailure(
  request: Request,
  reason: 'INVALID_KEY' | 'EXPIRED' | 'SUSPENDED' | 'NO_KEY',
  apiKey?: string | null
): void {
  const clientInfo = extractClientInfo(request);

  const typeMap: Record<string, AuditEventType> = {
    INVALID_KEY: 'API_KEY_INVALID',
    EXPIRED: 'API_KEY_EXPIRED',
    SUSPENDED: 'API_KEY_SUSPENDED',
    NO_KEY: 'AUTH_FAILURE',
  };

  logAuditEvent({
    type: typeMap[reason] || 'AUTH_FAILURE',
    timestamp: new Date().toISOString(),
    apiKeyPrefix: getApiKeyPrefix(apiKey),
    ...clientInfo,
    details: { reason },
  });
}

/**
 * Rate Limit 초과 로깅
 */
export function logRateLimitExceeded(
  request: Request,
  clientId: string,
  limit: number,
  resetIn: number
): void {
  const clientInfo = extractClientInfo(request);

  logAuditEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
    clientId,
    ...clientInfo,
    details: { limit, resetIn },
  });
}

/**
 * 권한 거부 로깅
 */
export function logPermissionDenied(
  request: Request,
  clientId: string,
  feature: string,
  requiredTier: string
): void {
  const clientInfo = extractClientInfo(request);

  logAuditEvent({
    type: 'PERMISSION_DENIED',
    timestamp: new Date().toISOString(),
    clientId,
    ...clientInfo,
    details: { feature, requiredTier },
  });
}

/**
 * 의심스러운 활동 로깅
 */
export function logSuspiciousActivity(
  request: Request,
  reason: string,
  details?: Record<string, unknown>
): void {
  const clientInfo = extractClientInfo(request);

  logAuditEvent({
    type: 'SUSPICIOUS_ACTIVITY',
    timestamp: new Date().toISOString(),
    ...clientInfo,
    details: { reason, ...details },
  });
}
