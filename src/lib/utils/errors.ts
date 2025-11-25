// src/lib/utils/errors.ts

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Extract error message from an unknown error type
 * In production, returns a generic message to avoid exposing internal details
 * In development, returns the actual error message for debugging
 */
export function getErrorMessage(error: unknown, fallback = 'Internal server error'): string {
  if (error instanceof Error) {
    // In production, avoid exposing detailed error messages that might leak internal information
    return isDevelopment ? error.message : fallback;
  }
  return fallback;
}

/**
 * Get the full error details (for logging purposes only)
 * Always returns the actual error message regardless of environment
 */
export function getErrorDetails(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}
