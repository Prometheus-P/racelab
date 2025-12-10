// sentry.server.config.ts
// Sentry server-side configuration

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: 0.1,

    // Only capture unhandled errors
    beforeSend(event) {
      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Sentry Error]', event);
      }
      return event;
    },
  });
}
