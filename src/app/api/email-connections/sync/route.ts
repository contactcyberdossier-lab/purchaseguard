export const runtime = 'nodejs';

// ========================================================
// API Route: /api/email-connections/sync (Manual & Triggered Sync)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncUserEmailAccounts } from '@/lib/email/sync';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let connectionId: string | undefined;
  try {
    const body = await request.json();
    connectionId = body.connectionId;
  } catch {
    // Optional body
  }

  // Also support query param: /api/email-connections/sync?id=...
  if (!connectionId) {
    connectionId = request.nextUrl.searchParams.get('id') || undefined;
  }

  try {
    const result = await syncUserEmailAccounts(user.id, connectionId, supabase);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Email sync API error:', err);
    return NextResponse.json(
      {
        success: false,
        scannedCount: 0,
        syncedCount: 0,
        message: 'Internal error during inbox synchronization.',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
