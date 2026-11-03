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

  let hasWhatsappToken = Boolean(
    process.env.WHATSAPP_CLOUD_ACCESS_TOKEN ||
    process.env.WHATSAPP_ACCESS_TOKEN ||
    process.env.WHATSAPP_TOKEN ||
    process.env.WHATSAPP_API_TOKEN ||
    process.env.WHATSAPP_API_KEY ||
    process.env.META_ACCESS_TOKEN ||
    process.env.META_WHATSAPP_TOKEN ||
    process.env.META_TOKEN ||
    process.env.ACCESS_TOKEN
  );
  let hasWhatsappPhoneId = Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.WHATSAPP_PHONE_ID ||
    process.env.PHONE_NUMBER_ID ||
    process.env.WHATSAPP_NUMBER_ID
  );

  const rawPhone = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  if (rawPhone.startsWith('EAA')) {
    hasWhatsappToken = true;
    hasWhatsappPhoneId = true;
  }
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
    email: {
      hasResendKey: Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('...') && !process.env.RESEND_API_KEY.includes('placeholder')),
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
    },
    gemini: {
      hasKey: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY),
    },
    oauth: {
      googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      microsoftConfigured: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
    },
    timestamp: new Date().toISOString(),
  });
}
