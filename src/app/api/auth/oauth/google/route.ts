// ========================================================
// API Route: /api/auth/oauth/google (Initiate Gmail Connect)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAuthUrl } from '@/lib/oauth/gmail';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate random state encoded with user ID for CSRF verification
  const random = randomBytes(16).toString('hex');
  const state = Buffer.from(JSON.stringify({ userId: user.id, random })).toString('base64url');

  const authUrl = getGoogleAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
