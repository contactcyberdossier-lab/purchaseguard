export const runtime = 'edge';

// ========================================================
// API Route: /api/admin/reminders/process
// Manual & Scheduled Dispatch for Approaching Deadlines
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/auth/admin';
import { sendTransactionalEmail, buildReturnDeadlineAlertHtml } from '@/lib/notifications';
import { sendWhatsAppMessage, formatWhatsAppReturnAlert, formatWhatsAppWarrantyAlert } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Allow admin session OR Vercel Cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isCronAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;

  let callerUser: any = null;
  if (!isCronAuthorized) {
    const adminAuth = await verifyAdminSession(supabase);
    if (!adminAuth.isAdmin || adminAuth.errorResponse) {
      return adminAuth.errorResponse || NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    callerUser = adminAuth.user;
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguardapp.com';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const results: Array<{
    purchaseId: string;
    productName: string;
    email: string;
    channels: string[];
    status: 'sent' | 'simulated' | 'failed';
    daysLeft: number;
    error?: string;
  }> = [];

  try {
    // 1. Process standard pending reminders due now
    let { data: dueReminders } = await supabase
      .from('reminders')
      .select('*, purchases(*, users(*))')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .limit(25);

    // 2. If force=true or no pending reminders due yet, find active purchases expiring within 7 days
    if (force || (!dueReminders || dueReminders.length === 0)) {
      const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let purchasesQuery = supabase
        .from('purchases')
        .select('*, users(*)')
        .eq('status', 'active')
        .gte('return_deadline', todayStr)
        .lte('return_deadline', maxDate)
        .limit(10);

      // If called by an admin with force, optionally filter by caller's purchases first
      if (callerUser && force) {
        purchasesQuery = purchasesQuery.eq('user_id', callerUser.id);
      }

      const { data: testPurchases } = await purchasesQuery;

      if (testPurchases && testPurchases.length > 0) {
        for (const p of testPurchases) {
          const u = p.users;
          if (!u || !u.email) continue;

          const deadline = new Date(p.return_deadline);
          const daysLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          const dashboardUrl = `${appUrl}/en/dashboard/purchases/${p.id}`;

          const channelsUsed: string[] = [];

          // Email alert
          const html = buildReturnDeadlineAlertHtml({
            productName: p.product_name,
            retailerName: p.retailer_name,
            returnDeadline: p.return_deadline,
            daysLeft,
            orderId: p.order_id,
            dashboardUrl,
          });

          await sendTransactionalEmail({
            to: u.email,
            subject: `[PurchaseGuard Alert] ${daysLeft} Day${daysLeft === 1 ? '' : 's'} Left to Return ${p.product_name}`,
            htmlContent: html,
          });
          channelsUsed.push('email');

          // WhatsApp alert
          if (u.whatsapp_enabled && u.phone_number) {
            const waText = formatWhatsAppReturnAlert({
              productName: p.product_name,
              retailerName: p.retailer_name,
              returnDeadline: p.return_deadline,
              daysLeft,
              dashboardUrl,
            });

            await sendWhatsAppMessage({
              to: u.phone_number,
              body: waText,
            });
            channelsUsed.push('whatsapp');
          }

          results.push({
            purchaseId: p.id,
            productName: p.product_name,
            email: u.email,
            channels: channelsUsed,
            status: 'sent',
            daysLeft,
          });
        }
      }
    }

    // Process regular pending reminders
    if (dueReminders && dueReminders.length > 0) {
      for (const rem of dueReminders) {
        const p = rem.purchases;
        const u = p?.users;
        if (!u || !u.email) continue;

        const deadline = new Date(p.return_deadline || p.warranty_deadline || todayStr);
        const daysLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const dashboardUrl = `${appUrl}/en/dashboard/purchases/${p.id}`;

        const channelsUsed: string[] = ['email'];

        if (u.whatsapp_enabled && u.phone_number) {
          const waText = rem.reminder_type === 'warranty_deadline'
            ? formatWhatsAppWarrantyAlert({
                productName: p.product_name,
                retailerName: p.retailer_name,
                warrantyDeadline: p.warranty_deadline || p.return_deadline,
                dashboardUrl,
              })
            : formatWhatsAppReturnAlert({
                productName: p.product_name,
                retailerName: p.retailer_name,
                returnDeadline: p.return_deadline,
                daysLeft,
                dashboardUrl,
              });

          await sendWhatsAppMessage({ to: u.phone_number, body: waText });
          channelsUsed.push('whatsapp');
        }

        // Mark as sent
        await supabase
          .from('reminders')
          .update({ status: 'sent', sent_at: now.toISOString() })
          .eq('id', rem.id);

        results.push({
          purchaseId: p.id,
          productName: p.product_name,
          email: u.email,
          channels: channelsUsed,
          status: 'sent',
          daysLeft,
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      dispatched: results,
      message: results.length > 0 
        ? `Successfully dispatched ${results.length} reminder notification(s)!` 
        : 'No pending reminders are due right now. Add a purchase with an approaching return deadline (within 7 days) and re-run.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error executing reminders' }, { status: 500 });
  }
}
