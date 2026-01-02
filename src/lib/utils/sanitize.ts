/**
 * Data Sanitization Utilities
 *
 * 외부 API 데이터 및 사용자 입력 sanitize
 * XSS 공격 방지를 위한 유틸리티
 */

/**
 * HTML 특수 문자 이스케이프
 * JSON-LD 및 HTML 컨텍스트에서 XSS 방지
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * JSON-LD용 문자열 sanitize
 * script 태그 삽입 및 특수 문자 이스케이프
 */
export function sanitizeForJsonLd(str: string): string {
  if (typeof str !== 'string') return '';

  // </script> 태그 방지 (JSON-LD 탈출 방지)
  let sanitized = str.replace(/<\/script>/gi, '<\\/script>');

  // 제어 문자 제거
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * 객체 내 모든 문자열 필드 sanitize (JSON-LD용)
 */
export function sanitizeObjectForJsonLd<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeForJsonLd(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObjectForJsonLd(
        value as Record<string, unknown>
      );
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeForJsonLd(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObjectForJsonLd(item as Record<string, unknown>)
            : item
      );
    }
  }

  return result;
}

/**
 * URL 파라미터 sanitize
 * 경로 순회 및 특수 문자 제거
 */
export function sanitizeUrlParam(param: string): string {
  if (typeof param !== 'string') return '';

  // URL 디코딩
  let decoded: string;
  try {
    decoded = decodeURIComponent(param);
  } catch {
    decoded = param;
  }

  // 경로 순회 방지
  decoded = decoded.replace(/\.\./g, '');

  // 스크립트 태그 제거
  decoded = decoded.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // HTML 태그 제거
  decoded = decoded.replace(/<[^>]*>/g, '');

  // 제어 문자 제거
  decoded = decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return decoded.trim();
}

/**
 * 외부 API 응답 데이터 sanitize
 * 문자열 필드에서 잠재적 위험 요소 제거
 */
export function sanitizeApiResponse<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeForJsonLd(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeApiResponse(item)) as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in data) {
      result[key] = sanitizeApiResponse((data as Record<string, unknown>)[key]);
    }
    return result as T;
  }

  return data;
}

/**
 * 안전한 JSON.stringify (JSON-LD용)
 * sanitize 후 문자열화
 */
export function safeJsonStringify(obj: unknown): string {
  const sanitized = sanitizeApiResponse(obj);
  return JSON.stringify(sanitized);
}
