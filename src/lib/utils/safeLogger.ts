/**
 * Production-Safe Logger
 *
 * 프로덕션 환경에서 민감 데이터를 자동으로 마스킹하는 로거
 * console.error 대체용으로 사용
 */

const SENSITIVE_PATTERNS = [
  // API Keys
  /serviceKey=([^&\s]+)/gi,
  /api[_-]?key[=:]\s*["']?([^"'\s&]+)/gi,
  /x-api-key[=:]\s*["']?([^"'\s]+)/gi,
  /authorization[=:]\s*["']?bearer\s+([^"'\s]+)/gi,
  // Database credentials
  /password[=:]\s*["']?([^"'\s@]+)/gi,
  /postgres(ql)?:\/\/[^:]+:([^@]+)@/gi,
  /mysql:\/\/[^:]+:([^@]+)@/gi,
  // Tokens
  /token[=:]\s*["']?([a-zA-Z0-9_-]{20,})/gi,
  /jwt[=:]\s*["']?([a-zA-Z0-9._-]+)/gi,
  // Email (partial masking)
  /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  // IP Addresses
  /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g,
];

const SENSITIVE_KEYS = [
  'password',
  'apiKey',
  'api_key',
  'serviceKey',
  'service_key',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'secret',
  'credential',
  'authorization',
  'auth',
  'key',
  'privateKey',
  'private_key',
];

/**
 * 문자열에서 민감 데이터를 마스킹
 */
function sanitizeString(str: string): string {
  let result = str;

  SENSITIVE_PATTERNS.forEach((pattern) => {
    result = result.replace(pattern, (match, group1, group2) => {
      // URL 파라미터의 경우 (serviceKey=xxx)
      if (match.includes('=')) {
        const [key] = match.split('=');
        return `${key}=[REDACTED]`;
      }
      // 이메일의 경우 부분 마스킹
      if (group2 && match.includes('@')) {
        const localPart = group1;
        const domain = group2;
        return `${localPart.substring(0, 2)}***@${domain}`;
      }
      // IP 주소의 경우
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(match)) {
        return 'xxx.xxx.xxx.xxx';
      }
      return '[REDACTED]';
    });
  });

  return result;
}

/**
 * 객체에서 민감 데이터를 재귀적으로 마스킹
 */
function sanitizeObject(obj: unknown, depth = 0): unknown {
  // 순환 참조 방지
  if (depth > 10) return '[MAX_DEPTH]';

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: sanitizeString(obj.message),
      stack: process.env.NODE_ENV === 'production' ? undefined : obj.stack,
    };
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // 민감한 키의 값은 완전히 마스킹
      if (SENSITIVE_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeObject(value, depth + 1);
      }
    }

    return result;
  }

  return String(obj);
}

/**
 * 프로덕션 환경 여부 확인
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 안전한 로깅 - 프로덕션에서 민감 데이터 자동 마스킹
 */
export function safeLog(level: 'log' | 'info' | 'warn' | 'error', ...args: unknown[]): void {
  const sanitizedArgs = isProduction() ? args.map((arg) => sanitizeObject(arg)) : args;

  const prefix = `[${new Date().toISOString()}]`;

  switch (level) {
    case 'log':
      console.log(prefix, ...sanitizedArgs);
      break;
    case 'info':
      console.info(prefix, ...sanitizedArgs);
      break;
    case 'warn':
      console.warn(prefix, ...sanitizedArgs);
      break;
    case 'error':
      console.error(prefix, ...sanitizedArgs);
      break;
  }
}

/**
 * 안전한 에러 로깅 (console.error 대체)
 */
export function safeError(...args: unknown[]): void {
  safeLog('error', ...args);
}

/**
 * 안전한 경고 로깅 (console.warn 대체)
 */
export function safeWarn(...args: unknown[]): void {
  safeLog('warn', ...args);
}

/**
 * 안전한 정보 로깅 (console.info 대체)
 */
export function safeInfo(...args: unknown[]): void {
  safeLog('info', ...args);
}

/**
 * API 에러 로깅 (민감 정보 자동 제거)
 */
export function logApiErrorSafe(
  error: Error | string,
  context: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
  }
): void {
  const sanitizedContext = sanitizeObject(context);
  const errorMessage = error instanceof Error ? error.message : error;

  safeError('[API Error]', sanitizeString(errorMessage), sanitizedContext);
}
