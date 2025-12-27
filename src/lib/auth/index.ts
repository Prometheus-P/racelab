/**
 * Auth exports for use throughout the application
 */

import NextAuth from 'next-auth';
import { authConfig } from './config';

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// Re-export types
export type { Session, User } from 'next-auth';
