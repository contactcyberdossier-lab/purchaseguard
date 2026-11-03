export const runtime = 'edge';

// ========================================================
// API Route: /api/auth/status (Environment & Supabase Diagnostics)
// ========================================================

import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    '';

  const isConfigured = Boolean(url && key && !url.includes('placeholder'));

  let hostname = 'NOT_SET';
  try {
    if (url) {
      hostname = new URL(url).hostname;
    }
  } catch {
    hostname = 'INVALID_URL';
  }

  const hasWhatsappToken = Boolean(
    process.env.WHATSAPP_CLOUD_ACCESS_TOKEN ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    process.env.WHATSAPP_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    process.env.META_WHATSAPP_TOKEN
  );
  const hasWhatsappPhoneId = Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.WHATSAPP_PHONE_ID ||
    process.env.PHONE_NUMBER_ID ||
    process.env.WHATSAPP_NUMBER_ID
  );
  const hasCallMeBot = Boolean(process.env.CALLMEBOT_API_KEY);
  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID);

  return NextResponse.json({
    status: isConfigured ? 'ok' : 'misconfigured',
    supabaseHost: hostname,
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    keyFormat: key ? (key.startsWith('sb_') ? 'modern_publishable' : key.startsWith('eyJ') ? 'jwt_anon' : 'unknown') : 'none',
    whatsapp: {
      hasCloudToken: hasWhatsappToken,
      hasPhoneId: hasWhatsappPhoneId,
      hasCallMeBot,
      hasTwilio,
    },
    timestamp: new Date().toISOString(),
  });
}
