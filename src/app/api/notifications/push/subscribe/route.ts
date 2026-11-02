export const runtime = 'edge';

// ========================================================
// API Route: /api/notifications/push/subscribe
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { endpoint, p256dh, auth, userAgent } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Subscription endpoint is required' }, { status: 400 });
    }

    // Upsert subscription into push_subscriptions table
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: p256dh || '',
        auth: auth || '',
        user_agent: userAgent || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,endpoint' }
    );

    if (error) {
      console.warn('Push subscription upsert error:', error.message);
    }

    // Also update push_enabled on public.users
    await supabase
      .from('users')
      .update({ push_enabled: true })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}
