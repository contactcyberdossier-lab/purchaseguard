export const runtime = 'nodejs';

// ========================================================
// API Route: /api/auth/oauth/microsoft/callback (Outlook Callback)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { exchangeMicrosoftCodeForTokens } from '@/lib/oauth/outlook';
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
      await exchangeMicrosoftCodeForTokens(code, origin);

    const rawEmail =
      emailAddress && emailAddress !== 'connected-outlook'
        ? emailAddress
        : (user.email || 'connected-outlook');
    const normalizedEmail = rawEmail.toLowerCase().trim();

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const adminDb = getServiceSupabase();

    const connPayload = {
      user_id: user.id,
      provider: 'outlook',
      email_address: normalizedEmail,
      access_token_encrypted: accessTokenEncrypted,
      refresh_token_encrypted: refreshTokenEncrypted,
      token_expires_at: expiresAt,
      connected_at: new Date().toISOString(),
      disconnected_at: null,
    };

    let saveSuccess = false;
    let lastError: any = null;

    // Try authenticated user session client first (passes RLS auth.uid() = user.id), fallback to service client
    for (const client of [supabase, adminDb]) {
      try {
        // Ensure user row exists in public.users to satisfy foreign key constraint
        const { data: userRow } = await client
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!userRow) {
          await client.from('users').insert({
            id: user.id,
            email: normalizedEmail,
            full_name: user.user_metadata?.full_name || '',
            subscription_status: 'free',
          });
        }

        // Check if connection already exists (case-insensitive) to avoid ON CONFLICT constraint mismatch
        const { data: existing } = await client
          .from('email_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('provider', 'outlook')
          .ilike('email_address', normalizedEmail)
          .maybeSingle();

        if (existing?.id) {
          const { error: updateErr } = await client
            .from('email_connections')
            .update(connPayload)
            .eq('id', existing.id);
          if (!updateErr) {
            saveSuccess = true;
            break;
          }
          lastError = updateErr;
        } else {
          const { error: insertErr } = await client
            .from('email_connections')
            .insert(connPayload);
          if (!insertErr) {
            saveSuccess = true;
            break;
          }
          lastError = insertErr;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!saveSuccess) {
      console.error('Email connection save error:', lastError);
      const errMsg = lastError?.message || lastError?.details || 'connection_save_failed';
      return NextResponse.redirect(
        `${origin}/${defaultLocale}/dashboard?error=${encodeURIComponent(errMsg)}#email-sync`
      );
    }

    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'outlook_connected',
        metadata: { email: normalizedEmail },
      });
    } catch {}

    let syncParams = '';
    try {
      const syncResult = await syncUserEmailAccounts(user.id, undefined, supabase);
      if (syncResult.syncedCount > 0) {
        syncParams = `&synced=${syncResult.syncedCount}`;
      } else if (syncResult.error) {
        syncParams = `&sync_error=${encodeURIComponent(syncResult.error)}`;
      }
    } catch (syncErr: any) {
      console.warn('Initial sync warning:', syncErr);
    }

    return NextResponse.redirect(
      `${origin}/${defaultLocale}/dashboard?status=outlook_connected${syncParams}#email-sync`
    );
  } catch (err: any) {
    console.error('Microsoft OAuth error:', err);
    return NextResponse.redirect(
      `${origin}/${defaultLocale}/dashboard?error=${encodeURIComponent(err.message || 'oauth_failed')}`
    );
  }
}
