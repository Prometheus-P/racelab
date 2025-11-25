# 에러 처리 가이드

> KRace 프로젝트의 에러 처리 패턴, 사용자 메시지, 복구 전략을 정의합니다.

## 목차

1. [에러 분류 체계](#에러-분류-체계)
2. [클라이언트 에러 처리](#클라이언트-에러-처리)
3. [서버 에러 처리](#서버-에러-처리)
4. [API 에러 응답](#api-에러-응답)
5. [React Error Boundary](#react-error-boundary)
6. [사용자 친화적 메시지](#사용자-친화적-메시지)
7. [로깅 및 모니터링](#로깅-및-모니터링)
8. [복구 전략](#복구-전략)

---

## 에러 분류 체계

### 에러 타입 계층

```typescript
// src/lib/errors/types.ts

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 유효성 검사 에러 (400)
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly details?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * 인증 에러 (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * 권한 에러 (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = '접근 권한이 없습니다') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * 리소스 없음 에러 (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource}를 찾을 수 없습니다: ${identifier}`
      : `${resource}를 찾을 수 없습니다`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 외부 서비스 에러 (503)
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    public readonly originalError?: Error
  ) {
    super(`외부 서비스 오류: ${service}`, 'EXTERNAL_SERVICE_ERROR', 503);
    this.name = 'ExternalServiceError';
  }
}

/**
 * 요청 제한 에러 (429)
 */
export class RateLimitError extends AppError {
  constructor(
    public readonly retryAfter?: number
  ) {
    super('요청 한도를 초과했습니다', 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}
```

### 에러 코드 정의

```typescript
// src/lib/errors/codes.ts

export const ErrorCodes = {
  // 일반 에러 (1xxx)
  UNKNOWN: 'E1000',
  VALIDATION: 'E1001',
  INVALID_INPUT: 'E1002',

  // 인증/인가 에러 (2xxx)
  UNAUTHORIZED: 'E2001',
  FORBIDDEN: 'E2002',
  TOKEN_EXPIRED: 'E2003',

  // 리소스 에러 (3xxx)
  NOT_FOUND: 'E3001',
  ALREADY_EXISTS: 'E3002',
  CONFLICT: 'E3003',

  // 외부 서비스 에러 (4xxx)
  KSPO_API_ERROR: 'E4001',
  KRA_API_ERROR: 'E4002',
  NETWORK_ERROR: 'E4003',
  TIMEOUT: 'E4004',

  // 내부 에러 (5xxx)
  INTERNAL_ERROR: 'E5001',
  DATABASE_ERROR: 'E5002',
  CACHE_ERROR: 'E5003',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

---

## 클라이언트 에러 처리

### API 요청 에러 처리

```typescript
// src/lib/api/client.ts

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        throw this.handleApiError(response.status, data.error);
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // 네트워크 에러
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ExternalServiceError('Network', error);
      }

      throw new AppError(
        '요청 처리 중 오류가 발생했습니다',
        ErrorCodes.UNKNOWN,
        500
      );
    }
  }

  private handleApiError(
    status: number,
    error?: { code: string; message: string }
  ): AppError {
    const message = error?.message || '알 수 없는 오류가 발생했습니다';
    const code = error?.code || ErrorCodes.UNKNOWN;

    switch (status) {
      case 400:
        return new ValidationError(message);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError('리소스');
      case 429:
        return new RateLimitError();
      case 503:
        return new ExternalServiceError('API');
      default:
        return new AppError(message, code, status);
    }
  }
}

export const apiClient = new ApiClient();
```

### React Query 에러 처리

```typescript
// src/hooks/useRaces.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { AppError, ExternalServiceError } from '@/lib/errors';
import type { Race } from '@/types';

export function useRaces(
  options?: Omit<UseQueryOptions<Race[], AppError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Race[], AppError>({
    queryKey: ['races', 'today'],
    queryFn: () => apiClient.request<Race[]>('/races/today'),
    retry: (failureCount, error) => {
      // 외부 서비스 에러는 재시도
      if (error instanceof ExternalServiceError && failureCount < 3) {
        return true;
      }
      // 4xx 에러는 재시도하지 않음
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}
```

### 폼 에러 처리

```typescript
// src/components/forms/BetForm.tsx
'use client';

import { useState } from 'react';
import { ValidationError } from '@/lib/errors';

interface FormErrors {
  [field: string]: string;
}

export function BetForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setGlobalError(null);

    try {
      const result = await submitBet(formData);
      // 성공 처리
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.details) {
          // 필드별 에러 표시
          const fieldErrors: FormErrors = {};
          for (const [field, messages] of Object.entries(error.details)) {
            fieldErrors[field] = messages[0];
          }
          setErrors(fieldErrors);
        } else if (error.field) {
          setErrors({ [error.field]: error.message });
        } else {
          setGlobalError(error.message);
        }
      } else if (error instanceof AppError) {
        setGlobalError(error.message);
      } else {
        setGlobalError('처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  };

  return (
    <form action={handleSubmit}>
      {globalError && (
        <div role="alert" className="text-red-600 mb-4">
          {globalError}
        </div>
      )}

      <div>
        <input
          name="amount"
          type="number"
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? 'amount-error' : undefined}
        />
        {errors.amount && (
          <span id="amount-error" className="text-red-600 text-sm">
            {errors.amount}
          </span>
        )}
      </div>

      <button type="submit">베팅하기</button>
    </form>
  );
}
```

---

## 서버 에러 처리

### API 라우트 에러 처리

```typescript
// src/lib/api/error-handler.ts

import { NextResponse } from 'next/server';
import { AppError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // 운영 에러 (예상된 에러)
  if (error instanceof AppError && error.isOperational) {
    logger.warn('Operational error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    });

    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    // ValidationError는 상세 정보 포함
    if (error instanceof ValidationError && error.details) {
      response.error.details = error.details;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // 예상치 못한 에러
  logger.error('Unexpected error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  // 프로덕션에서는 상세 정보 숨김
  const message =
    process.env.NODE_ENV === 'production'
      ? '서버 오류가 발생했습니다'
      : error instanceof Error
        ? error.message
        : '알 수 없는 오류';

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
      },
    },
    { status: 500 }
  );
}
```

### API 라우트 래퍼

```typescript
// src/lib/api/route-handler.ts

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from './error-handler';

type RouteHandler<T = unknown> = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse<T>>;

export function withErrorHandling<T>(
  handler: RouteHandler<T>
): RouteHandler<T | { success: false; error: unknown }> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// 사용 예시
// app/api/races/route.ts
import { withErrorHandling } from '@/lib/api/route-handler';
import { NotFoundError } from '@/lib/errors';

export const GET = withErrorHandling(async (request) => {
  const races = await fetchRaces();

  if (races.length === 0) {
    throw new NotFoundError('경주');
  }

  return NextResponse.json({
    success: true,
    data: races,
  });
});
```

### 외부 API 에러 처리

```typescript
// src/lib/external/kspo-client.ts

import { ExternalServiceError, RateLimitError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const KSPO_BASE_URL = process.env.KSPO_API_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function fetchKspoData<T>(
  endpoint: string,
  retryCount = 0
): Promise<T> {
  try {
    const response = await fetch(`${KSPO_BASE_URL}${endpoint}`, {
      headers: {
        'X-API-Key': process.env.KSPO_API_KEY!,
      },
      next: { revalidate: 60 }, // ISR 캐싱
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      throw new RateLimitError(retryAfter);
    }

    if (!response.ok) {
      throw new Error(`KSPO API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // 재시도 가능한 에러
    if (
      retryCount < MAX_RETRIES &&
      error instanceof Error &&
      !error.message.includes('429')
    ) {
      logger.warn(`KSPO API retry ${retryCount + 1}/${MAX_RETRIES}`, {
        endpoint,
        error: error.message,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount))
      );

      return fetchKspoData<T>(endpoint, retryCount + 1);
    }

    logger.error('KSPO API failed', {
      endpoint,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ExternalServiceError(
      'KSPO',
      error instanceof Error ? error : undefined
    );
  }
}
```

---

## API 에러 응답

### 표준 에러 응답 형식

```typescript
// 성공 응답
{
  "success": true,
  "data": { ... }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "E3001",
    "message": "경주를 찾을 수 없습니다",
    "details": {
      // 선택적 상세 정보
    }
  }
}

// 유효성 검사 에러 응답
{
  "success": false,
  "error": {
    "code": "E1001",
    "message": "입력값이 올바르지 않습니다",
    "details": {
      "amount": ["금액은 1,000원 이상이어야 합니다"],
      "raceId": ["유효하지 않은 경주 ID입니다"]
    }
  }
}
```

### HTTP 상태 코드 가이드

| 상태 코드 | 의미 | 사용 사례 |
|-----------|------|-----------|
| 200 | OK | 성공적인 조회 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 유효성 검사 실패 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 리소스 충돌 |
| 429 | Too Many Requests | 요청 제한 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |
| 503 | Service Unavailable | 외부 서비스 오류 |

---

## React Error Boundary

### 전역 Error Boundary

```tsx
// src/components/error-boundary/GlobalErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold mb-4">
                문제가 발생했습니다
              </h1>
              <p className="text-gray-600 mb-6">
                페이지를 불러오는 중 오류가 발생했습니다.
              </p>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### Next.js error.tsx

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error('Page error', {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-6">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : '요청을 처리하는 중 문제가 발생했습니다.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
            <a
              href="/"
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              홈으로
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Next.js not-found.tsx

```tsx
// app/not-found.tsx

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
```

---

## 사용자 친화적 메시지

### 메시지 맵핑

```typescript
// src/lib/errors/messages.ts

const userMessages: Record<string, string> = {
  // 네트워크 에러
  NETWORK_ERROR: '네트워크 연결을 확인해 주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',

  // 인증/인가
  AUTHENTICATION_ERROR: '로그인이 필요합니다.',
  AUTHORIZATION_ERROR: '접근 권한이 없습니다.',
  TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해 주세요.',

  // 리소스
  NOT_FOUND: '요청하신 정보를 찾을 수 없습니다.',
  ALREADY_EXISTS: '이미 존재하는 항목입니다.',

  // 외부 서비스
  EXTERNAL_SERVICE_ERROR: '서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해 주세요.',
  KSPO_API_ERROR: '경주 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.',

  // 요청 제한
  RATE_LIMIT_ERROR: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',

  // 기본
  INTERNAL_ERROR: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
};

export function getUserMessage(code: string): string {
  return userMessages[code] || userMessages.UNKNOWN;
}
```

### 에러 표시 컴포넌트

```tsx
// src/components/ui/ErrorMessage.tsx

import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'toast' | 'banner';
}

export function ErrorMessage({
  message,
  onRetry,
  onDismiss,
  variant = 'inline',
}: ErrorMessageProps) {
  if (variant === 'toast') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </button>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800">{message}</span>
          </div>
          <div className="flex items-center gap-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-red-600 hover:text-red-800"
              >
                다시 시도
              </button>
            )}
            {onDismiss && (
              <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // inline (default)
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 로깅 및 모니터링

### Logger 구현

```typescript
// src/lib/logger/index.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string = 'krace') {
    this.serviceName = serviceName;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...context,
    };

    // 개발 환경: 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      const coloredLevel = this.getColoredLevel(level);
      console[level === 'debug' ? 'log' : level](
        `${timestamp} [${coloredLevel}] ${message}`,
        context || ''
      );
      return;
    }

    // 프로덕션: JSON 형식 (로그 수집기 친화적)
    console[level === 'debug' ? 'log' : level](JSON.stringify(logEntry));
  }

  private getColoredLevel(level: LogLevel): string {
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    return `${colors[level]}${level.toUpperCase()}\x1b[0m`;
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
```

### 에러 추적 통합

```typescript
// src/lib/monitoring/error-tracking.ts

import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface ErrorReport {
  error: Error;
  context?: Record<string, unknown>;
  user?: { id: string; email?: string };
  tags?: Record<string, string>;
}

export function reportError(report: ErrorReport) {
  const { error, context, user, tags } = report;

  // 운영 에러는 경고 레벨로
  if (error instanceof AppError && error.isOperational) {
    logger.warn('Operational error reported', {
      code: error.code,
      message: error.message,
      ...context,
    });
    return;
  }

  // 치명적 에러는 에러 레벨로
  logger.error('Error reported', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
    user,
    tags,
  });

  // 외부 에러 추적 서비스로 전송 (예: Sentry)
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context, user, tags });
  // }
}
```

---

## 복구 전략

### 자동 재시도

```typescript
// src/lib/utils/retry.ts

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: () => true,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxRetries || !opts.shouldRetry?.(error)) {
        throw error;
      }

      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// 사용 예시
const data = await withRetry(
  () => fetchKspoData('/races'),
  {
    maxRetries: 3,
    shouldRetry: (error) => {
      // 4xx 에러는 재시도하지 않음
      return !(error instanceof AppError && error.statusCode < 500);
    },
  }
);
```

### Fallback 데이터

```typescript
// src/lib/api/with-fallback.ts

import { logger } from '@/lib/logger';

interface FallbackOptions<T> {
  fallbackData: T;
  shouldUseFallback?: (error: unknown) => boolean;
}

export async function withFallback<T>(
  fn: () => Promise<T>,
  options: FallbackOptions<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (options.shouldUseFallback?.(error) !== false) {
      logger.warn('Using fallback data', {
        error: error instanceof Error ? error.message : String(error),
      });
      return options.fallbackData;
    }
    throw error;
  }
}

// 사용 예시
const races = await withFallback(
  () => fetchTodayRaces(),
  {
    fallbackData: [], // 빈 배열 반환
    shouldUseFallback: (error) => error instanceof ExternalServiceError,
  }
);
```

### 캐시 기반 복구

```typescript
// src/lib/cache/stale-while-revalidate.ts

import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

interface SWROptions {
  key: string;
  ttl: number; // 정상 TTL
  staleTtl: number; // stale 데이터 TTL
}

export async function staleWhileRevalidate<T>(
  fn: () => Promise<T>,
  options: SWROptions
): Promise<T> {
  const { key, ttl, staleTtl } = options;

  try {
    // 새 데이터 가져오기 시도
    const freshData = await fn();

    // 캐시에 저장
    await cache.set(key, freshData, staleTtl);
    await cache.set(`${key}:fresh`, true, ttl);

    return freshData;
  } catch (error) {
    // 실패 시 stale 캐시 확인
    const staleData = await cache.get<T>(key);

    if (staleData !== null) {
      logger.warn('Serving stale data', { key });
      return staleData;
    }

    throw error;
  }
}
```

---

## 체크리스트

### 에러 처리 구현 체크리스트

- [ ] 모든 API 라우트에 에러 핸들러 적용
- [ ] 적절한 HTTP 상태 코드 반환
- [ ] 사용자 친화적 메시지 제공
- [ ] 민감한 정보 노출 방지
- [ ] Error Boundary로 React 에러 처리
- [ ] 에러 로깅 구현
- [ ] 외부 API 실패 시 graceful degradation
- [ ] 재시도 로직 구현

### 테스트 체크리스트

- [ ] 에러 케이스 테스트 작성
- [ ] Error Boundary 동작 테스트
- [ ] 에러 메시지 표시 테스트
- [ ] 복구 로직 테스트

---

## 참고 자료

- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
