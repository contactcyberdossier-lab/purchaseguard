// ========================================================
// Next.js Global Middleware: i18n + Supabase Auth + Security
// ========================================================

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { locales, defaultLocale, type Locale } from './lib/i18n';

// Static files and internal routes to ignore
const PUBLIC_FILE = /\.(.*)$/;

function getPreferredLocale(request: NextRequest): Locale {
  // 1. Saved cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Accept-Language header
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang
      .split(',')
      .map((item) => item.split(';')[0].trim().substring(0, 2).toLowerCase());

    for (const lang of preferred) {
      if (locales.includes(lang as Locale)) {
        return lang as Locale;
      }
    }
  }

  // 3. Fallback
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, API, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if pathname has a supported locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let currentLocale: Locale = defaultLocale;
  if (pathnameHasLocale) {
    currentLocale = pathname.split('/')[1] as Locale;
  } else {
    // Determine target locale and redirect
    const targetLocale = getPreferredLocale(request);
    const redirectUrl = new URL(`/${targetLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // Refresh Supabase Auth Session safely
  let response = NextResponse.next();
  let user = null;
  try {
    const sessionResult = await updateSession(request);
    response = sessionResult.response;
    user = sessionResult.user;
  } catch (err) {
    console.warn('Middleware updateSession caught error:', err);
  }

  // Authentication Guard
  const isDashboardRoute = pathname.includes('/dashboard');
  const isAuthRoute = pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password');

  // Protect Dashboard
  if (isDashboardRoute && !user) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from auth pages
  if (isAuthRoute && user) {
    const dashboardUrl = new URL(`/${currentLocale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
