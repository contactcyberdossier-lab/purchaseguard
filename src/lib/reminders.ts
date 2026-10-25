// ========================================================
// Reminder Scheduling & Management Engine
// ========================================================

import { SupabaseClient } from '@supabase/supabase-js';

export interface ReminderScheduleItem {
  purchase_id: string;
  reminder_type: 'return_deadline' | 'warranty_deadline' | 'delivery' | 'refund_followup';
  scheduled_for: string; // ISO 8601 UTC
  status: 'pending';
}

/**
 * Calculates reminder schedules based on return and warranty deadlines
 */
export function calculateReminderDates(
  purchaseId: string,
  returnDeadline: string | null,
  warrantyDeadline: string | null
): ReminderScheduleItem[] {
  const reminders: ReminderScheduleItem[] = [];
  const now = new Date();

  if (returnDeadline) {
    const returnDate = new Date(`${returnDeadline}T09:00:00Z`);

    // 7 days before
    const d7 = new Date(returnDate);
    d7.setUTCDate(d7.getUTCDate() - 7);
    if (d7 > now) {
      reminders.push({
        purchase_id: purchaseId,
        reminder_type: 'return_deadline',
        scheduled_for: d7.toISOString(),
        status: 'pending',
      });
    }

    // 3 days before
    const d3 = new Date(returnDate);
    d3.setUTCDate(d3.getUTCDate() - 3);
    if (d3 > now) {
      reminders.push({
        purchase_id: purchaseId,
        reminder_type: 'return_deadline',
        scheduled_for: d3.toISOString(),
        status: 'pending',
      });
    }

    // 1 day before
    const d1 = new Date(returnDate);
    d1.setUTCDate(d1.getUTCDate() - 1);
    if (d1 > now) {
      reminders.push({
        purchase_id: purchaseId,
        reminder_type: 'return_deadline',
        scheduled_for: d1.toISOString(),
        status: 'pending',
      });
    }
  }

  if (warrantyDeadline) {
    const warrantyDate = new Date(`${warrantyDeadline}T09:00:00Z`);
    // 30 days before warranty expiration
    const w30 = new Date(warrantyDate);
    w30.setUTCDate(w30.getUTCDate() - 30);
    if (w30 > now) {
      reminders.push({
        purchase_id: purchaseId,
        reminder_type: 'warranty_deadline',
        scheduled_for: w30.toISOString(),
        status: 'pending',
      });
    }
  }

  return reminders;
}

/**
 * Persists calculated reminders to Supabase database
 */
export async function syncPurchaseReminders(
  supabase: SupabaseClient,
  purchaseId: string,
  returnDeadline: string | null,
  warrantyDeadline: string | null
): Promise<void> {
  // First clear any pending reminders for this purchase
  await supabase
    .from('reminders')
    .delete()
    .eq('purchase_id', purchaseId)
    .eq('status', 'pending');

  const newReminders = calculateReminderDates(purchaseId, returnDeadline, warrantyDeadline);

  if (newReminders.length > 0) {
    await supabase.from('reminders').insert(newReminders);
  }
}
