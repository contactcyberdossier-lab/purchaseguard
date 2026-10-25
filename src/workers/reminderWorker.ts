// ========================================================
// Automated Deadline Reminders Background Worker
// Deployable on Railway, Render, Fly.io, or scheduled via cron
// ========================================================

import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail, buildReturnDeadlineAlertHtml } from '../lib/notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguard.app';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

export async function processPendingReminders() {
  console.log(`[Reminders Worker] Checking due reminders at ${new Date().toISOString()}...`);

  const now = new Date().toISOString();

  // Find pending reminders due up to now
  const { data: dueReminders, error } = await supabase
    .from('reminders')
    .select('*, purchases(*, users(*))')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .limit(50);

  if (error || !dueReminders) {
    console.error('[Reminders Worker] Query error:', error?.message);
    return;
  }

  console.log(`[Reminders Worker] Found ${dueReminders.length} due reminders.`);

  for (const rem of dueReminders) {
    const purchase = rem.purchases;
    const user = purchase?.users;

    if (!user || !user.email) {
      // Mark as failed if user email is missing
      await supabase.from('reminders').update({ status: 'failed' }).eq('id', rem.id);
      continue;
    }

    // Calculate days remaining
    const deadline = new Date(purchase.return_deadline || purchase.warranty_deadline);
    const today = new Date();
    const daysLeft = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const dashboardUrl = `${APP_URL}/en/dashboard/purchases/${purchase.id}`;

    const subject =
      rem.reminder_type === 'warranty_deadline'
        ? `[Action Required] 30 Days Remaining on Warranty for ${purchase.product_name}`
        : `[Reminder] ${daysLeft} Day${daysLeft === 1 ? '' : 's'} Left to Return ${purchase.product_name}`;

    const html = buildReturnDeadlineAlertHtml({
      productName: purchase.product_name,
      retailerName: purchase.retailer_name,
      returnDeadline: purchase.return_deadline || purchase.warranty_deadline,
      daysLeft,
      orderId: purchase.order_id,
      dashboardUrl,
    });

    const result = await sendTransactionalEmail({
      to: user.email,
      subject,
      htmlContent: html,
    });

    if (result.success) {
      await supabase
        .from('reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', rem.id);

      console.log(`[Reminders Worker] Successfully sent reminder ${rem.id} to ${user.email}`);
    } else {
      console.error(`[Reminders Worker] Failed to send reminder ${rem.id}:`, result.error);
    }
  }
}

if (require.main === module) {
  processPendingReminders()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
