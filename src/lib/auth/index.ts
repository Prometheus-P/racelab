/**
 * Auth exports for use throughout the application
 *
 * IMPORTANT: This module exports full auth with database adapter.
 * For middleware (Edge Runtime), import from ./auth.config instead.
 */

import NextAuth from 'next-auth';
import { authConfig } from './config';

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// Re-export types
export type { Session, User } from 'next-auth';
