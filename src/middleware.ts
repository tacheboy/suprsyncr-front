// src/middleware.ts
// Route protection middleware

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/onboarding'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow exact root path (Landing Page)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow Next.js internals + API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check for auth token in cookie
  const token = request.cookies.get('usp-access-token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
