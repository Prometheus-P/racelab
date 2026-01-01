// src/lib/config/env.ts
/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup to prevent
 * runtime failures due to missing configuration.
 */

interface EnvConfig {
  required: string[];
  optional: string[];
}

// Environment configurations by context
const ENV_CONFIGS: Record<string, EnvConfig> = {
  // Core app (always required)
  core: {
    required: [],
    optional: ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_GA_ID'],
  },

  // Authentication (required for user login)
  auth: {
    required: ['AUTH_SECRET'],
    optional: ['AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'AUTH_KAKAO_ID', 'AUTH_KAKAO_SECRET'],
  },

  // Database (required for data operations)
  database: {
    required: ['DATABASE_URL'],
    optional: ['DIRECT_URL'],
  },

  // Redis (required for caching/rate limiting)
  redis: {
    required: ['REDIS_URL'],
    optional: [],
  },

  // Ingestion/Cron (required for data ingestion)
  ingestion: {
    required: ['CRON_SECRET'],
    optional: ['INGESTION_API_KEY', 'SLACK_WEBHOOK_URL'],
  },

  // External APIs (required for data fetching)
  externalApis: {
    required: [],
    optional: ['KRA_API_KEY', 'KSPO_API_KEY'],
  },

  // B2B API (optional for B2B features)
  b2b: {
    required: [],
    optional: ['B2B_API_KEYS', 'API_KEY_SECRET', 'API_RATE_LIMIT'],
  },
};

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate environment variables for specified contexts
 *
 * @param contexts - Array of context names to validate (e.g., ['auth', 'database'])
 * @returns ValidationResult with missing and warning info
 */
export function validateEnv(contexts: string[]): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const context of contexts) {
    const config = ENV_CONFIGS[context];
    if (!config) {
      warnings.push(`Unknown context: ${context}`);
      continue;
    }

    // Check required vars
    for (const key of config.required) {
      if (!process.env[key]) {
        missing.push(`${key} (${context})`);
      }
    }

    // Check optional vars and warn if missing
    for (const key of config.optional) {
      if (!process.env[key]) {
        warnings.push(`${key} is not set (${context}) - some features may be disabled`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validate and throw if required environment variables are missing
 *
 * @param contexts - Array of context names to validate
 * @throws Error if any required variables are missing
 */
export function validateEnvOrThrow(contexts: string[]): void {
  const result = validateEnv(contexts);

  if (!result.valid) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      ...result.missing.map((m) => `  - ${m}`),
      '',
      'Please check your .env.local file or environment configuration.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  // Log warnings in development
  if (process.env.NODE_ENV === 'development' && result.warnings.length > 0) {
    console.warn('[env] ⚠️ Optional environment variables not set:');
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

/**
 * Validate all critical environment variables for production
 */
export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  validateEnvOrThrow(['auth', 'database', 'redis', 'ingestion']);
}

/**
 * Check if a specific environment variable is set
 */
export function hasEnv(key: string): boolean {
  return !!process.env[key];
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || '';
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as boolean
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}
