export const runtime = 'nodejs';

// ========================================================
// API Route: /api/auth/oauth/microsoft (Initiate Outlook Connect)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMicrosoftAuthUrl } from '@/lib/oauth/outlook';

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

  const clientId = process.env.MICROSOFT_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(
      `${origin}/en/dashboard?error=outlook_oauth_missing_credentials#email-sync`
    );
  }

  try {
    const random = crypto.randomUUID().replace(/-/g, '');
    const state = Buffer.from(JSON.stringify({ userId: user.id, random }))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const authUrl = getMicrosoftAuthUrl(state, origin);
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error('Microsoft OAuth initialization error:', err);
    return NextResponse.redirect(
      `${origin}/en/dashboard?error=${encodeURIComponent(err.message || 'outlook_auth_failed')}#email-sync`
    );
  }
}
