// sentry.client.config.ts
// Sentry client-side configuration

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: 0.1,

    // Session Replay - disabled for performance
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Only capture unhandled errors
    beforeSend(event) {
      // Filter out known non-critical errors
      if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
        return null;
      }
      return event;
    },
  });
}
