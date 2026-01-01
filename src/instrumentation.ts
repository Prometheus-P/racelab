// src/instrumentation.ts
/**
 * Next.js Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * Used for environment validation and initialization.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run validation in production or when explicitly testing
  if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
    const { validateEnvOrThrow } = await import('@/lib/config/env');

    try {
      // Validate critical environment variables
      validateEnvOrThrow(['auth', 'database']);

      console.log('[instrumentation] ✅ Environment validation passed');
    } catch (error) {
      console.error('[instrumentation] ❌ Environment validation failed');
      console.error(error instanceof Error ? error.message : error);

      // In production, fail fast to prevent running with missing config
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}
