export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ========================================================
// API Route: /api/email-connections (Manage Connected Accounts)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceSupabase } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Try reading with user's authenticated cookie session (passes RLS auth.uid() = user_id)
  let connections: any[] = [];
  const sessionRes = await supabase
    .from('email_connections')
    .select('id, provider, email_address, connected_at, token_expires_at')
    .eq('user_id', user.id)
    .is('disconnected_at', null)
    .order('connected_at', { ascending: false });

  if (!sessionRes.error && sessionRes.data && sessionRes.data.length > 0) {
    connections = sessionRes.data;
  } else {
    // 2. Fallback to service client (if service role key is set)
    const db = getServiceSupabase();
    const adminRes = await db
      .from('email_connections')
      .select('id, provider, email_address, connected_at, token_expires_at')
      .eq('user_id', user.id)
      .is('disconnected_at', null)
      .order('connected_at', { ascending: false });

    if (!adminRes.error && adminRes.data) {
      connections = adminRes.data;
    } else if (sessionRes.data) {
      connections = sessionRes.data;
    }
  }

  return NextResponse.json(
    { connections: connections || [] },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get('id');
  const purgeData = searchParams.get('purge_data') === 'true';

  if (!connectionId) {
    return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
  }

  // Mark connection as disconnected
  const { error: disconnectErr } = await supabase
    .from('email_connections')
    .update({ disconnected_at: new Date().toISOString() })
    .eq('id', connectionId)
    .eq('user_id', user.id);

  if (disconnectErr) {
    return NextResponse.json({ error: disconnectErr.message }, { status: 500 });
  }

  // If user requested to delete all synced email-derived data
  if (purgeData) {
    await supabase
      .from('purchases')
      .delete()
      .eq('user_id', user.id)
      .eq('source', 'email');
  }

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'email_disconnected',
    metadata: { connection_id: connectionId, purged_data: purgeData },
  });

  return NextResponse.json({ success: true });
}
