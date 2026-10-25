// ========================================================
// API Route: /api/auth/oauth/microsoft (Initiate Outlook Connect)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMicrosoftAuthUrl } from '@/lib/oauth/outlook';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const random = randomBytes(16).toString('hex');
  const state = Buffer.from(JSON.stringify({ userId: user.id, random })).toString('base64url');

  const authUrl = getMicrosoftAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
