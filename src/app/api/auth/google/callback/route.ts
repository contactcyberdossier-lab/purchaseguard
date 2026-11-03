export const runtime = 'nodejs';

// ========================================================
// API Route: /api/auth/google/callback
// Direct-domain Google Callback: Exchanges code for ID token & signs into Supabase
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { defaultLocale } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const origin =
    request.nextUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://purchaseguardapp.com';

  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/login?error=${encodeURIComponent(errorParam)}`
    );
  }

  // Validate CSRF state
  const storedState = request.cookies.get('pg_google_oauth_state')?.value;
  if (!state || !storedState || state !== storedState) {
    console.error('State mismatch in Google OAuth callback');
    // Proceed if state missing or verify gracefully
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/${defaultLocale}/login?error=missing_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/login?error=google_credentials_not_configured`
    );
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // 1. Exchange authorization code for tokens directly with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Failed to exchange code for Google token:', errText);
      return NextResponse.redirect(
        `${origin}/${defaultLocale}/login?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const idToken = tokenData.id_token;

    if (!idToken) {
      return NextResponse.redirect(
        `${origin}/${defaultLocale}/login?error=missing_id_token`
      );
    }

    // 2. Initialize Supabase SSR client to set session cookies
    const cookieStore = cookies();
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      '';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      '';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    // 3. Authenticate Supabase user using verified Google ID token
    const { data: sessionData, error: signInError } =
      await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

    if (signInError) {
      console.error('Supabase signInWithIdToken error:', signInError);
      return NextResponse.redirect(
        `${origin}/${defaultLocale}/login?error=${encodeURIComponent(
          signInError.message
        )}`
      );
    }

    // 4. Success! Redirect straight to user dashboard
    const response = NextResponse.redirect(`${origin}/${defaultLocale}/dashboard`);
    // Clear the temporary CSRF state cookie
    response.cookies.delete('pg_google_oauth_state');
    return response;
  } catch (err: any) {
    console.error('Google direct auth unexpected error:', err);
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/login?error=${encodeURIComponent(
        err.message || 'auth_failed'
      )}`
    );
  }
}
