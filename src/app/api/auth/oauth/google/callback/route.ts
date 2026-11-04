export const runtime = 'nodejs';

// ========================================================
// API Route: /api/auth/oauth/google/callback (Gmail Callback)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { exchangeGoogleCodeForTokens } from '@/lib/oauth/gmail';
import { syncUserEmailAccounts } from '@/lib/email/sync';
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
    let rawState = '';
    try {
      rawState = Buffer.from(state, 'base64url').toString('utf8');
    } catch {
      rawState = Buffer.from(state.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    }
    const { userId } = JSON.parse(rawState);
    if (userId !== user.id) {
      return NextResponse.redirect(`${origin}/${defaultLocale}/dashboard?error=state_mismatch`);
    }

    const { accessTokenEncrypted, refreshTokenEncrypted, expiresInSeconds, emailAddress } =
      await exchangeGoogleCodeForTokens(code, origin);

    const resolvedEmail =
      emailAddress && emailAddress !== 'connected-gmail'
        ? emailAddress
        : (user.email || 'connected-gmail');

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const adminDb = getServiceSupabase();

    // Ensure user row exists in public.users to satisfy foreign key constraint
    await adminDb.from('users').upsert(
      {
        id: user.id,
        email: user.email || resolvedEmail,
        full_name: user.user_metadata?.full_name || '',
        subscription_status: 'free',
      },
      { onConflict: 'id' }
    );

    // Upsert into email_connections with adminDb to bypass RLS and guarantee persistence
    const { error: upsertErr } = await adminDb.from('email_connections').upsert(
      {
        user_id: user.id,
        provider: 'gmail',
        email_address: resolvedEmail,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        token_expires_at: expiresAt,
        connected_at: new Date().toISOString(),
        disconnected_at: null,
      },
      { onConflict: 'user_id,provider,email_address' }
    );

    if (upsertErr) {
      console.error('Email connection upsert error:', upsertErr);
      return NextResponse.redirect(
        `${origin}/${defaultLocale}/dashboard?error=${encodeURIComponent(upsertErr.message)}#email-sync`
      );
    }

    // Audit log
    await adminDb.from('audit_logs').insert({
      user_id: user.id,
      action: 'gmail_connected',
      metadata: { email: resolvedEmail },
    });

    // Trigger initial automated sync for incoming receipts
    let syncParams = '';
    try {
      const syncResult = await syncUserEmailAccounts(user.id);
      if (syncResult.syncedCount > 0) {
        syncParams = `&synced=${syncResult.syncedCount}`;
      } else if (syncResult.error) {
        syncParams = `&sync_error=${encodeURIComponent(syncResult.error)}`;
      }
    } catch (syncErr: any) {
      console.warn('Initial sync warning:', syncErr);
    }

    return NextResponse.redirect(
      `${origin}/${defaultLocale}/dashboard?status=gmail_connected${syncParams}#email-sync`
    );
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/dashboard?error=${encodeURIComponent(err.message || 'oauth_failed')}`
    );
  }
}
