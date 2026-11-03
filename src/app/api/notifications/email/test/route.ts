export const runtime = 'edge';

// ========================================================
// API Route: /api/notifications/email/test
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTransactionalEmail, buildReturnDeadlineAlertHtml } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const recipientEmail = body.email || user.email;

    const returnDeadlineStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguard-six.vercel.app'}/en/dashboard`;

    const html = buildReturnDeadlineAlertHtml({
      productName: 'Sample Order (Test Item)',
      retailerName: 'Amazon',
      returnDeadline: returnDeadlineStr,
      daysLeft: 3,
      orderId: 'PG-TEST-9921',
      dashboardUrl,
    });

    const result = await sendTransactionalEmail({
      to: recipientEmail,
      subject: `[PurchaseGuard Alert] 3 Days Left to Return Sample Order (Test Item)`,
      htmlContent: html,
      textContent: `PurchaseGuard Return Reminder: 3 days left to return your Sample Order from Amazon. Deadline: ${returnDeadlineStr}. Manage at: ${dashboardUrl}`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to dispatch email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      simulated: Boolean(result.simulated),
      message: result.simulated
        ? 'Test simulated! (Add RESEND_API_KEY in Vercel to connect live email delivery).'
        : `Live test email dispatched successfully to ${recipientEmail}! Check your inbox.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Email test dispatch error' },
      { status: 500 }
    );
  }
}
