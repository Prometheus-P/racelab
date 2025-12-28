/**
 * Next.js Middleware for Auth Protection
 * Protects /dashboard routes and handles redirects
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Auth routes - allow all
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protected routes - require login
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/auth/:path*'],
};
