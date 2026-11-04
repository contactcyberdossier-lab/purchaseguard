export const runtime = 'nodejs';

// ========================================================
// API Route: /api/auth/oauth/google (Initiate Gmail Connect)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAuthUrl } from '@/lib/oauth/gmail';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const origin =
    request.nextUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://purchaseguardapp.com';

  if (!user) {
    return NextResponse.redirect(`${origin}/en/login`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If OAuth Client credentials are not configured, redirect back gracefully with an informative message
  if (!clientId) {
    return NextResponse.redirect(
      `${origin}/en/dashboard?error=gmail_oauth_missing_credentials#email-sync`
    );
  }

  try {
    // Generate random state encoded with user ID for CSRF verification
    const random = crypto.randomUUID().replace(/-/g, '');
    const state = Buffer.from(JSON.stringify({ userId: user.id, random }))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const authUrl = getGoogleAuthUrl(state, origin);
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error('Google OAuth initialization error:', err);
    return NextResponse.redirect(
      `${origin}/en/dashboard?error=${encodeURIComponent(err.message || 'gmail_auth_failed')}#email-sync`
    );
  }
}
