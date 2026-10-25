export const runtime = 'edge';

// ========================================================
// API Route: /api/auth/oauth/google/callback (Gmail Callback)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeGoogleCodeForTokens } from '@/lib/oauth/gmail';
import { defaultLocale } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/${defaultLocale}/dashboard?error=oauth_missing_code`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/${defaultLocale}/login`);
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    if (userId !== user.id) {
      return NextResponse.redirect(`${origin}/${defaultLocale}/dashboard?error=state_mismatch`);
    }

    const { accessTokenEncrypted, refreshTokenEncrypted, expiresInSeconds, emailAddress } =
      await exchangeGoogleCodeForTokens(code);

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    // Upsert into email_connections
    await supabase.from('email_connections').upsert(
      {
        user_id: user.id,
        provider: 'gmail',
        email_address: emailAddress,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_expires_at: expiresAt,
        connected_at: new Date().toISOString(),
        disconnected_at: null,
      },
      { onConflict: 'user_id,provider,email_address' }
    );

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'gmail_connected',
      metadata: { email: emailAddress },
    });

    return NextResponse.redirect(`${origin}/${defaultLocale}/dashboard?status=gmail_connected`);
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/dashboard?error=${encodeURIComponent(err.message || 'oauth_failed')}`
    );
  }
}
