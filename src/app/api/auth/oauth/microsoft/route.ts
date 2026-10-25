export const runtime = 'edge';

// ========================================================
// API Route: /api/auth/oauth/microsoft (Initiate Outlook Connect)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMicrosoftAuthUrl } from '@/lib/oauth/outlook';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const random = crypto.randomUUID().replace(/-/g, '');
  const state = btoa(JSON.stringify({ userId: user.id, random })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const authUrl = getMicrosoftAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
