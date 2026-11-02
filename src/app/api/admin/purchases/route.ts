export const runtime = 'edge';

// ========================================================
// API Route: /api/admin/purchases (Platform-wide Purchases View)
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
  const q = searchParams.get('q')?.trim();
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  try {
    let query = supabase
      .from('purchases')
      .select('id, user_id, retailer_name, product_name, order_id, purchase_date, total, currency, status, return_deadline, warranty_deadline, created_at, users(email, full_name)');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (q) {
      query = query.or(
        `product_name.ilike.%${q}%,retailer_name.ilike.%${q}%,order_id.ilike.%${q}%`
      );
    }

    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data: purchases, error } = await query;

    if (error) {
      // Fallback if relational join fails
      console.warn('Admin purchases join failed, falling back to flat select:', error.message);
      let fallback = supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') fallback = fallback.eq('status', status);
      if (q) fallback = fallback.or(`product_name.ilike.%${q}%,retailer_name.ilike.%${q}%,order_id.ilike.%${q}%`);

      const res = await fallback;
      if (res.error) throw res.error;
      return NextResponse.json({ purchases: res.data || [] });
    }

    return NextResponse.json({ purchases: purchases || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch global purchases' },
      { status: 500 }
    );
  }
}
