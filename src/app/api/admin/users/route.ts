export const runtime = 'edge';

// ========================================================
// API Route: /api/admin/users (User Management & Role Assignment)
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
  const role = searchParams.get('role');
  const subscription = searchParams.get('subscription');

  try {
    let query = supabase
      .from('users')
      .select('id, email, full_name, role, subscription_status, country, created_at, purchases(id)');

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (subscription && subscription !== 'all') {
      query = query.eq('subscription_status', subscription);
    }

    if (q) {
      query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false });

    let { data: users, error } = await query;

    if (error) {
      console.warn('Admin users join query failed, falling back to flat select:', error.message);
      let fallbackQuery = supabase
        .from('users')
        .select('id, email, full_name, role, subscription_status, country, created_at')
        .order('created_at', { ascending: false });

      if (role && role !== 'all') {
        fallbackQuery = fallbackQuery.eq('role', role);
      }
      if (subscription && subscription !== 'all') {
        fallbackQuery = fallbackQuery.eq('subscription_status', subscription);
      }
      const fallback = await fallbackQuery;
      if (fallback.error) throw fallback.error;
      users = fallback.data;
    }

    // Format with purchase count
    const formatted = (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name || '',
      role: u.role || 'user',
      subscription_status: u.subscription_status || 'free',
      country: u.country || 'US',
      created_at: u.created_at,
      purchase_count: Array.isArray(u.purchases) ? u.purchases.length : 0,
    }));

    return NextResponse.json({ users: formatted });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const auth = await verifyAdminSession(supabase);

  if (!auth.isAdmin || auth.errorResponse) {
    return auth.errorResponse || NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, role, subscription_status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Safety check: Cannot demote oneself if sole admin
    if (userId === auth.user.id && role === 'user') {
      const { data: adminUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if ((adminUsers?.length || 0) <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the only remaining administrator.' },
          { status: 400 }
        );
      }
    }

    const updates: Record<string, any> = {};

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updates.role = role;
    }

    if (subscription_status !== undefined) {
      if (!['free', 'plus', 'annual', 'canceled'].includes(subscription_status)) {
        return NextResponse.json({ error: 'Invalid subscription status' }, { status: 400 });
      }
      updates.subscription_status = subscription_status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, email, full_name, role, subscription_status')
      .single();

    if (updateError) throw updateError;

    // Log the administrative action in audit_logs
    try {
      await supabase.from('audit_logs').insert({
        user_id: auth.user.id,
        action: 'admin_user_update',
        metadata: {
          target_user_id: userId,
          updates,
        },
      });
    } catch {
      // non-blocking
    }

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
