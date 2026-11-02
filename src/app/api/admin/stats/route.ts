export const runtime = 'edge';

// ========================================================
// API Route: /api/admin/stats (Platform KPI Overview)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin';

export async function GET(_request: NextRequest) {
  const supabase = createClient();
  const auth = await verifyAdminSession(supabase);

  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse || NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // 1. Total users and role/subscription breakdown
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, role, subscription_status, created_at');

    if (usersErr) throw usersErr;

    const totalUsers = users?.length || 0;
    const adminCount = users?.filter((u) => u.role === 'admin').length || 0;
    const freeUsers = users?.filter((u) => !u.subscription_status || u.subscription_status === 'free').length || 0;
    const plusUsers = users?.filter((u) => u.subscription_status === 'plus').length || 0;
    const annualUsers = users?.filter((u) => u.subscription_status === 'annual').length || 0;

    // 2. Total purchases and volume
    const { data: purchases, error: purchasesErr } = await supabase
      .from('purchases')
      .select('id, total, status, created_at, return_deadline');

    if (purchasesErr) throw purchasesErr;

    const totalPurchases = purchases?.length || 0;
    const totalVolume = purchases?.reduce((sum, p) => sum + (Number(p.total) || 0), 0) || 0;

    const today = new Date().toISOString().split('T')[0];
    const activeReturns = purchases?.filter(
      (p) => p.status === 'active' && p.return_deadline && p.return_deadline >= today
    ).length || 0;

    const reviewNeeded = purchases?.filter((p) => p.status === 'review_needed').length || 0;

    // 3. Recent 5 users
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, full_name, role, subscription_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // 4. Recent 5 purchases
    const { data: recentPurchases } = await supabase
      .from('purchases')
      .select('id, retailer_name, product_name, total, currency, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers,
        adminCount,
        freeUsers,
        plusUsers,
        annualUsers,
        totalPurchases,
        totalVolume,
        activeReturns,
        reviewNeeded,
      },
      recentUsers: recentUsers || [],
      recentPurchases: recentPurchases || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to aggregate admin statistics' },
      { status: 500 }
    );
  }
}
