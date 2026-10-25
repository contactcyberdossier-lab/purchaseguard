export const runtime = 'edge';

// ========================================================
// API Route: /api/auth/oauth/microsoft/callback (Outlook Callback)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeMicrosoftCodeForTokens } from '@/lib/oauth/outlook';
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
      await exchangeMicrosoftCodeForTokens(code);

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    await supabase.from('email_connections').upsert(
      {
        user_id: user.id,
        provider: 'outlook',
        email_address: emailAddress,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_expires_at: expiresAt,
        connected_at: new Date().toISOString(),
        disconnected_at: null,
      },
      { onConflict: 'user_id,provider,email_address' }
    );

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'outlook_connected',
      metadata: { email: emailAddress },
    });

    return NextResponse.redirect(`${origin}/${defaultLocale}/dashboard?status=outlook_connected`);
  } catch (err: any) {
    console.error('Microsoft OAuth error:', err);
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/dashboard?error=${encodeURIComponent(err.message || 'oauth_failed')}`
    );
  }
}
