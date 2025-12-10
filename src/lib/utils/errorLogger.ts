// src/lib/utils/errorLogger.ts
// Error logging utility for Sentry integration

import * as Sentry from '@sentry/nextjs';

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
  Sentry.init({
    dsn,
    environment: options.environment || process.env.NODE_ENV,
    release: options.release,
    tracesSampleRate: options.tracesSampleRate ?? 0.1,
    // Only capture unhandled errors
    integrations: (integrations) =>
      integrations.filter((integration) => integration.name !== 'Breadcrumbs'),
  });
}

/**
 * Log an error to Sentry
 */
export function logError(
  error: Error | string,
  options: LogErrorOptions = {}
): void {
  const { severity = ErrorSeverity.ERROR, context, tags } = options;

  Sentry.withScope((scope) => {
    // Set severity level
    scope.setTag('severity', severity);

    // Set custom tags
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Set context
    if (context) {
      scope.setContext('error_context', context);
    }

    // Capture the error
    if (typeof error === 'string') {
      Sentry.captureMessage(error, severity as Sentry.SeverityLevel);
    } else {
      Sentry.captureException(error);
    }
  });
}

/**
 * Log an API error with additional API-specific context
 */
export function logApiError(
  error: Error | string,
  apiOptions: ApiErrorOptions
): void {
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
