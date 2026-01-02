// src/lib/api/errors.ts
// API Error handling module

/**
 * Error codes for API responses
 */
export const ApiErrorCode = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_PARAMETER: 'INVALID_PARAMETER',

  // Server errors (5xx)
  SERVER_ERROR: 'SERVER_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  EXTERNAL_API_TIMEOUT: 'EXTERNAL_API_TIMEOUT',
  EXTERNAL_API_UNAVAILABLE: 'EXTERNAL_API_UNAVAILABLE',

  // Data errors
  NO_DATA: 'NO_DATA',
  STALE_DATA: 'STALE_DATA',
} as const;

export type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/**
 * User-friendly error messages (Korean)
 */
export const ErrorMessages = {
  [ApiErrorCode.BAD_REQUEST]: '잘못된 요청입니다.',
  [ApiErrorCode.NOT_FOUND]: '요청한 데이터를 찾을 수 없습니다.',
  [ApiErrorCode.INVALID_PARAMETER]: '유효하지 않은 파라미터입니다.',
  [ApiErrorCode.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  [ApiErrorCode.EXTERNAL_API_ERROR]: '데이터 제공 기관에서 오류가 발생했습니다.',
  [ApiErrorCode.EXTERNAL_API_TIMEOUT]:
    '데이터 제공 기관(API) 응답 지연으로 최신 정보가 표시되지 않을 수 있습니다.',
  [ApiErrorCode.EXTERNAL_API_UNAVAILABLE]:
    '데이터 제공 기관 서비스가 일시적으로 중단되었습니다. 잠시 후 다시 시도해 주세요.',
  [ApiErrorCode.NO_DATA]: '해당 날짜에 경주 데이터가 없습니다.',
  [ApiErrorCode.STALE_DATA]:
    '데이터 제공 기관(API) 지연으로 최신 정보가 표시되지 않을 수 있습니다.',
} as const;

/**
 * Warning message for partial data availability
 */
export const WARNING_STALE_DATA =
  '데이터 제공 기관(API) 지연으로 최신 정보가 표시되지 않을 수 있습니다.';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCodeType;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly isRetryable: boolean;

  constructor(
    code: ApiErrorCodeType,
    options?: {
      message?: string;
      statusCode?: number;
      cause?: Error;
      isRetryable?: boolean;
    }
  ) {
    const userMessage = ErrorMessages[code] || 'An error occurred';
    super(options?.message || userMessage);

    this.name = 'ApiError';
    this.code = code;
    this.userMessage = userMessage;
    this.statusCode = options?.statusCode || getDefaultStatusCode(code);
    this.isRetryable = options?.isRetryable ?? isRetryableError(code);

    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * External API Error - for errors from KRA/KSPO APIs
 */
export class ExternalApiError extends ApiError {
  public readonly apiName: string;
  public readonly originalStatus?: number;

  constructor(
    apiName: string,
    options?: {
      code?: ApiErrorCodeType;
      message?: string;
      originalStatus?: number;
      cause?: Error;
    }
  ) {
    super(options?.code || ApiErrorCode.EXTERNAL_API_ERROR, {
      message: options?.message || `${apiName} API error`,
      statusCode: 502,
      cause: options?.cause,
      isRetryable: true,
    });

    this.name = 'ExternalApiError';
    this.apiName = apiName;
    this.originalStatus = options?.originalStatus;
  }
}

/**
 * Get default HTTP status code for error code
 */
function getDefaultStatusCode(code: ApiErrorCodeType): number {
  switch (code) {
    case ApiErrorCode.BAD_REQUEST:
    case ApiErrorCode.INVALID_PARAMETER:
      return 400;
    case ApiErrorCode.NOT_FOUND:
    case ApiErrorCode.NO_DATA:
      return 404;
    case ApiErrorCode.EXTERNAL_API_ERROR:
    case ApiErrorCode.EXTERNAL_API_UNAVAILABLE:
      return 502;
    case ApiErrorCode.EXTERNAL_API_TIMEOUT:
      return 504;
    case ApiErrorCode.STALE_DATA:
      return 203; // Non-Authoritative Information - indicates stale/cached data
    default:
      return 500;
  }
}

/**
 * Retryable error codes
 */
const RETRYABLE_ERROR_CODES: readonly ApiErrorCodeType[] = [
  ApiErrorCode.EXTERNAL_API_ERROR,
  ApiErrorCode.EXTERNAL_API_TIMEOUT,
  ApiErrorCode.EXTERNAL_API_UNAVAILABLE,
  ApiErrorCode.SERVER_ERROR,
] as const;

/**
 * Check if an error is retryable
 */
function isRetryableError(code: ApiErrorCodeType): boolean {
  return RETRYABLE_ERROR_CODES.includes(code);
}

/**
 * Create ApiError from unknown error
 */
export function toApiError(error: unknown, defaultCode?: ApiErrorCodeType): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new ApiError(ApiErrorCode.EXTERNAL_API_TIMEOUT, {
        cause: error,
      });
    }

    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new ApiError(ApiErrorCode.EXTERNAL_API_UNAVAILABLE, {
        cause: error,
      });
    }

    return new ApiError(defaultCode || ApiErrorCode.SERVER_ERROR, {
      message: error.message,
      cause: error,
    });
  }

  return new ApiError(defaultCode || ApiErrorCode.SERVER_ERROR);
}

/**
 * API Response with optional warning
 */
export interface ApiResponseWithWarning<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    isRetryable?: boolean;
  };
  warning?: string;
  timestamp: string;
}

/**
 * Create a success response with optional warning
 */
export function createSuccessResponse<T>(
  data: T,
  warning?: string
): ApiResponseWithWarning<T> {
  return {
    success: true,
    data,
    warning,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error response from ApiError
 */
export function createErrorResponse<T>(error: ApiError): ApiResponseWithWarning<T> {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.userMessage,
      isRetryable: error.isRetryable,
    },
    timestamp: new Date().toISOString(),
  };
}
