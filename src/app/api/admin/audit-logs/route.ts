export const runtime = 'edge';

// ========================================================
// API Route: /api/admin/audit-logs (Security & Audit Trail)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const auth = await verifyAdminSession(supabase);

  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse || NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

  try {
    let query = supabase
      .from('audit_logs')
      .select('id, user_id, action, ip_hash, user_agent_hash, metadata, created_at, users(email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action && action !== 'all') {
      query = query.eq('action', action);
    }

    const { data: logs, error } = await query;

    if (error) {
      // Flat fallback
      const fallback = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fallback.error) throw fallback.error;
      return NextResponse.json({ logs: fallback.data || [] });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
