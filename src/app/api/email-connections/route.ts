// ========================================================
// API Route: /api/email-connections (Manage Connected Accounts)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: connections, error } = await supabase
    .from('email_connections')
    .select('id, provider, email_address, connected_at, token_expires_at')
    .eq('user_id', user.id)
    .is('disconnected_at', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections });
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
