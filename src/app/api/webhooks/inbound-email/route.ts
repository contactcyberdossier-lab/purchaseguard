// ========================================================
// API Route: /api/webhooks/inbound-email (Forwarded Receipts)
// Forwarding address: receipts@purchaseguard.app
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseAndExtractEmail } from '@/lib/email/aiExtractor';
import { calculateDeadlines } from '@/lib/deadlines';
import { syncPurchaseReminders } from '@/lib/reminders';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    // Supports SendGrid, Postmark, and Resend inbound email webhook format
    const sender = json.from || json.From || json.sender;
    const recipient = json.to || json.To || json.recipient;
    const subject = json.subject || json.Subject || '';
    const body = json.text || json.TextBody || json.html || json.HtmlBody || '';

    if (!sender || !body) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // Look up user by their registered email address
    const cleanSender = sender.match(/<([^>]+)>/)?.[1] || sender.trim();

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanSender.toLowerCase())
      .single();

    if (!user) {
      // Unrecognized user
      return NextResponse.json({ message: 'Sender not recognized as registered user' }, { status: 200 });
    }

    const { data: extracted, status } = await parseAndExtractEmail({
      subject,
      senderEmail: sender,
      emailBody: body,
    });

    if (extracted.is_purchase && extracted.total > 0) {
      const calculated = calculateDeadlines({
        purchaseDate: extracted.purchase_date || new Date(),
        retailerName: extracted.retailer_name,
        customReturnDays: extracted.return_window_days,
      });

      const { data: purchase } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          retailer_name: extracted.retailer_name,
          retailer_domain: extracted.retailer_domain,
          order_id: extracted.order_id,
          purchase_date: extracted.purchase_date,
          currency: extracted.currency,
          subtotal: extracted.subtotal,
          tax: extracted.tax,
          shipping: extracted.shipping,
          total: extracted.total,
          product_name: subject.slice(0, 150),
          tracking_number: extracted.tracking_number,
          return_deadline: calculated.returnDeadline.toISOString().split('T')[0],
          warranty_deadline: calculated.warrantyDeadline.toISOString().split('T')[0],
          status,
          confidence: extracted.confidence,
          source: 'upload',
        })
        .select()
        .single();

      if (purchase) {
        await syncPurchaseReminders(
          supabase,
          purchase.id,
          purchase.return_deadline,
          purchase.warranty_deadline
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
