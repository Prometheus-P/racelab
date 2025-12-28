/**
 * Next.js Middleware for Auth Protection
 * Uses Edge-compatible auth config (no database adapter)
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
