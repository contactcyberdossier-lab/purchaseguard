export const runtime = 'edge';

// ========================================================
// API Route: /api/user/export (GDPR & CCPA Data Export)
// ========================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch full data set
  const [profileRes, purchasesRes, emailConnRes, remindersRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('purchases').select('*, purchase_items(*), attachments(*)').eq('user_id', user.id),
    supabase.from('email_connections').select('id, provider, email_address, connected_at, disconnected_at').eq('user_id', user.id),
    supabase.from('reminders').select('*').in('purchase_id', (
      await supabase.from('purchases').select('id').eq('user_id', user.id)
    ).data?.map(p => p.id) || []),
  ]);

  const exportPayload = {
    export_generated_at: new Date().toISOString(),
    compliance_framework: 'GDPR / CCPA / PIPEDA / LGPD',
    user_profile: profileRes.data,
    purchases: purchasesRes.data || [],
    email_connections: emailConnRes.data || [],
    reminders: remindersRes.data || [],
  };

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'data_export_completed',
    metadata: { items_count: exportPayload.purchases.length },
  });

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="purchaseguard-export-${user.id}-${Date.now()}.json"`,
    },
  });
}
