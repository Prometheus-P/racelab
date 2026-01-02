/**
 * API Error Codes & HTTP Status Mapping
 *
 * 에러 코드와 HTTP 상태 코드의 표준화된 매핑
 */

/**
 * API Error Codes
 */
export const ErrorCode = {
  // 4xx Client Errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',

  // 5xx Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  EXTERNAL_API_TIMEOUT: 'EXTERNAL_API_TIMEOUT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Error Code to HTTP Status Code Mapping
 */
export const ErrorCodeToStatus: Record<ErrorCodeType, number> = {
  // 4xx
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.RATE_LIMITED]: 429,

  // 5xx
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.EXTERNAL_API_TIMEOUT]: 504,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.CACHE_ERROR]: 500,
};

/**
 * Error Details Interface
 */
export interface ApiErrorDetails {
  code: ErrorCodeType;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Get HTTP status code for an error code
 */
export function getStatusForErrorCode(code: ErrorCodeType): number {
  return ErrorCodeToStatus[code] ?? 500;
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  code: ErrorCodeType,
  message: string,
  details?: Record<string, unknown>
): { error: ApiErrorDetails; status: number; timestamp: string } {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
    status: getStatusForErrorCode(code),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Map generic errors to API error codes
 */
export function mapErrorToCode(error: unknown): ErrorCodeType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('timeout')) {
      return ErrorCode.EXTERNAL_API_TIMEOUT;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorCode.UNAUTHORIZED;
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorCode.FORBIDDEN;
    }
    if (message.includes('not found')) {
      return ErrorCode.NOT_FOUND;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCode.VALIDATION_ERROR;
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return ErrorCode.RATE_LIMITED;
    }
    if (message.includes('database') || message.includes('db ')) {
      return ErrorCode.DATABASE_ERROR;
    }
    if (message.includes('cache') || message.includes('redis')) {
      return ErrorCode.CACHE_ERROR;
    }
    if (message.includes('api') || message.includes('upstream') || message.includes('external')) {
      return ErrorCode.EXTERNAL_API_ERROR;
    }
  }

  return ErrorCode.INTERNAL_ERROR;
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(code: ErrorCodeType): boolean {
  const retryableCodes: ErrorCodeType[] = [
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.EXTERNAL_API_ERROR,
    ErrorCode.EXTERNAL_API_TIMEOUT,
    ErrorCode.RATE_LIMITED,
    ErrorCode.CACHE_ERROR,
  ];
  return retryableCodes.includes(code);
}
