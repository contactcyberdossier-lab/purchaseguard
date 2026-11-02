export const runtime = 'edge';

// ========================================================
// API Route: /api/notifications/whatsapp/test
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage, formatWhatsAppReturnAlert } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { phone } = await request.json();

    if (!phone || phone.trim().length < 7) {
      return NextResponse.json(
        { error: 'Please provide a valid phone number with country code (e.g. +1... or +91...).' },
        { status: 400 }
      );
    }

    const testMessage = formatWhatsAppReturnAlert({
      productName: 'Sample Order (Test Item)',
      retailerName: 'Amazon',
      returnDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysLeft: 3,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguard-six.vercel.app'}/en/dashboard`,
    });

    const result = await sendWhatsAppMessage({
      to: phone,
      body: `✅ *PurchaseGuard Test Alert*\n\nThis is a verification test to confirm your WhatsApp notifications are working!\n\n` + testMessage,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to dispatch WhatsApp message' }, { status: 500 });
    }

    // Save phone and preference to user profile
    await supabase
      .from('users')
      .update({
        phone_number: phone,
        whatsapp_enabled: true,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      simulated: Boolean(result.simulated),
      message: result.simulated
        ? 'Test simulated! (Add TWILIO_ACCOUNT_SID or WHATSAPP_CLOUD_ACCESS_TOKEN in Vercel to connect to live WhatsApp networks).'
        : 'Live WhatsApp alert dispatched successfully to your phone!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'WhatsApp dispatch error' },
      { status: 500 }
    );
  }
}
