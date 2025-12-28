/**
 * Full NextAuth.js v5 Configuration
 * Includes Drizzle adapter - use this for API routes only
 * For middleware, use auth.config.ts instead
 */

import type { NextAuthConfig } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db/client';
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema';
import { authConfig as baseConfig } from './auth.config';

/**
 * Full auth config with database adapter
 * NOT safe for Edge Runtime - use only in API routes
 */
export const authConfig: NextAuthConfig = {
  ...baseConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
};
