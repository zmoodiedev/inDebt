import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isDemo = req.cookies.get('finance_dashboard_demo')?.value === 'true';

  const isLoginPage = nextUrl.pathname === '/login';
  const isAuthApi = nextUrl.pathname.startsWith('/api/auth');
  const isApi = nextUrl.pathname.startsWith('/api/');

  // Always allow auth API routes
  if (isAuthApi) {
    return NextResponse.next();
  }

  // Allow login page
  if (isLoginPage) {
    // Redirect to home if already logged in (or in demo mode)
    if (isLoggedIn || isDemo) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Demo mode bypasses auth for pages (API routes are never hit in demo)
  if (isDemo) {
    return NextResponse.next();
  }

  // For other API routes, return 401 if not authenticated
  if (isApi && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // For pages, redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|sw\\.js|manifest\\.webmanifest).*)',
  ],
};
