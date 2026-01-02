// src/lib/utils/errorLogger.ts
// Error logging utility with console fallback
//
// SENTRY STATUS: Disabled due to Next.js 14.2 build incompatibility
// The @sentry/nextjs SDK causes "clientModules undefined" errors during build.
// See: https://github.com/Prometheus-P/racelab/pull/81
//
// To enable Sentry when compatible:
// 1. Install: npm install @sentry/nextjs
// 2. Set NEXT_PUBLIC_SENTRY_DSN in environment variables
// 3. Import Sentry and update the functions below to use it
//
// Current behavior: All errors are logged to console with structured metadata
// Security: Uses safeLogger for production-safe logging with data sanitization

import { safeError, safeWarn, safeInfo } from './safeLogger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Sentry: any = null;

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

export type ErrorSeverityType = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/**
 * Error logger initialization options
 */
export interface ErrorLoggerOptions {
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

/**
 * Error context for additional information
 */
export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Log error options
 */
export interface LogErrorOptions {
  severity?: ErrorSeverityType;
  context?: ErrorContext;
  tags?: Record<string, string>;
}

/**
 * API error logging options
 */
export interface ApiErrorOptions {
  endpoint: string;
  method: string;
  statusCode?: number;
  responseTime?: number;
  isExternalApi?: boolean;
  apiProvider?: string;
}

/**
 * Initialize error logger (Sentry)
 */
export function initErrorLogger(dsn: string, options: ErrorLoggerOptions = {}): void {
  if (Sentry && Sentry.init) {
    Sentry.init({
      dsn,
      environment: options.environment || process.env.NODE_ENV,
      release: options.release,
      tracesSampleRate: options.tracesSampleRate ?? 0.1,
      integrations: (integrations: { name: string }[]) =>
        integrations.filter((integration) => integration.name !== 'Breadcrumbs'),
    });
  } else {
    safeInfo('[ErrorLogger] Sentry not available, using console fallback');
  }
}

/**
 * Log an error to Sentry or console
 */
export function logError(error: Error | string, options: LogErrorOptions = {}): void {
  const { severity = ErrorSeverity.ERROR, context, tags } = options;

  if (Sentry && Sentry.withScope) {
    Sentry.withScope((scope: { setTag: (key: string, value: string) => void; setContext: (name: string, ctx: object) => void }) => {
      scope.setTag('severity', severity);

      if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      if (context) {
        scope.setContext('error_context', context);
      }

      if (typeof error === 'string') {
        Sentry.captureMessage(error, severity);
      } else {
        Sentry.captureException(error);
      }
    });
  } else {
    // Fallback to safe console logging (auto-sanitizes in production)
    const logData = { severity, tags, context };
    const safeLogMethod = severity === 'error' || severity === 'fatal' ? safeError : safeWarn;

    if (typeof error === 'string') {
      safeLogMethod(`[${severity.toUpperCase()}]`, error, logData);
    } else {
      safeLogMethod(`[${severity.toUpperCase()}]`, error.message, error, logData);
    }
  }
}

/**
 * Log an API error with additional API-specific context
 */
export function logApiError(error: Error | string, apiOptions: ApiErrorOptions): void {
  const {
    endpoint,
    method,
    statusCode,
    responseTime,
    isExternalApi = false,
    apiProvider,
  } = apiOptions;

  const tags: Record<string, string> = {
    'api.endpoint': endpoint,
    'api.method': method,
    'api.type': isExternalApi ? 'external' : 'internal',
  };

  if (statusCode) {
    tags['api.status_code'] = String(statusCode);
  }

  if (apiProvider) {
    tags['api.provider'] = apiProvider;
  }

  const context: ErrorContext = {
    endpoint,
    method,
    statusCode,
    responseTime,
    isExternalApi,
    apiProvider,
    timestamp: new Date().toISOString(),
  };

  logError(error, {
    severity: statusCode && statusCode >= 500 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
    context,
    tags,
  });
}

/**
 * Log external API provider errors (KRA, KSPO)
 */
export function logExternalApiError(
  error: Error,
  provider: 'KRA' | 'KSPO_CYCLE' | 'KSPO_BOAT',
  endpoint: string,
  responseTime?: number
): void {
  logApiError(error, {
    endpoint,
    method: 'GET',
    isExternalApi: true,
    apiProvider: provider,
    responseTime,
  });
}
