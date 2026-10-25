// ========================================================
// Standalone Email Synchronization Background Worker
// Deployable on Railway, Render, or Fly.io
// ========================================================

import { createClient } from '@supabase/supabase-js';
import { decryptToken } from '../lib/security';
import { refreshGoogleAccessToken } from '../lib/oauth/gmail';
import { refreshMicrosoftAccessToken } from '../lib/oauth/outlook';
import { parseAndExtractEmail } from '../lib/email/aiExtractor';
import { calculateDeadlines } from '../lib/deadlines';
import { syncPurchaseReminders } from '../lib/reminders';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

export async function processActiveEmailConnections() {
  console.log(`[Worker] Starting email sync run at ${new Date().toISOString()}...`);

  const { data: connections, error } = await supabase
    .from('email_connections')
    .select('*')
    .is('disconnected_at', null);

  if (error || !connections) {
    console.error('[Worker] Failed to query email connections:', error?.message);
    return;
  }

  for (const conn of connections) {
    try {
      await syncUserEmailConnection(conn);
    } catch (err: any) {
      console.error(`[Worker] Error syncing connection ${conn.id} for user ${conn.user_id}:`, err.message);
    }
  }

  console.log('[Worker] Sync run completed.');
}

async function syncUserEmailConnection(conn: any) {
  let accessToken = decryptToken(conn.access_token_encrypted);
  const isExpired = new Date(conn.token_expires_at) <= new Date(Date.now() + 5 * 60 * 1000);

  // Refresh token if nearing expiration
  if (isExpired && conn.refresh_token_encrypted) {
    if (conn.provider === 'gmail') {
      const refreshed = await refreshGoogleAccessToken(conn.refresh_token_encrypted);
      await supabase
        .from('email_connections')
        .update({
          access_token_encrypted: refreshed.accessTokenEncrypted,
          token_expires_at: new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString(),
        })
        .eq('id', conn.id);
      accessToken = decryptToken(refreshed.accessTokenEncrypted);
    } else if (conn.provider === 'outlook') {
      const refreshed = await refreshMicrosoftAccessToken(conn.refresh_token_encrypted);
      await supabase
        .from('email_connections')
        .update({
          access_token_encrypted: refreshed.accessTokenEncrypted,
          token_expires_at: new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString(),
        })
        .eq('id', conn.id);
      accessToken = decryptToken(refreshed.accessTokenEncrypted);
    }
  }

  // Fetch recent messages
  if (conn.provider === 'gmail') {
    await pollGmailMessages(conn.user_id, conn.id, accessToken);
  } else if (conn.provider === 'outlook') {
    await pollOutlookMessages(conn.user_id, conn.id, accessToken);
  }
}

async function pollGmailMessages(userId: string, connectionId: string, accessToken: string) {
  // Query Gmail search with read-only filter for purchase/order confirmation keywords
  const query = 'subject:(order OR confirmation OR shipped OR delivered OR refund OR receipt)';
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${encodeURIComponent(query)}`;

  const res = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.error(`[Gmail] Failed to fetch message list: ${res.statusText}`);
    return;
  }

  const listData = await res.json();
  const messages = listData.messages || [];

  for (const m of messages) {
    // Check if already processed
    const { data: existing } = await supabase
      .from('processed_emails')
      .select('id')
      .eq('user_id', userId)
      .eq('message_id', m.id)
      .single();

    if (existing) continue;

    // Fetch full message
    const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!msgRes.ok) continue;
    const msgData = await msgRes.json();

    const headers = msgData.payload?.headers || [];
    const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
    const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
    const bodyText = msgData.snippet || '';

    const { data: extracted, status } = await parseAndExtractEmail({
      subject,
      senderEmail: from,
      emailBody: bodyText,
    });

    // Record in processed_emails
    await supabase.from('processed_emails').insert({
      user_id: userId,
      email_connection_id: connectionId,
      message_id: m.id,
      email_type: extracted.email_type,
      retailer_detected: extracted.retailer_name,
      extraction_confidence: extracted.confidence,
      raw_reference: `Subject: ${subject} | From: ${from}`,
    });

    if (extracted.is_purchase && extracted.total > 0) {
      // Avoid duplicate order entries
      const { data: duplicate } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('retailer_name', extracted.retailer_name)
        .eq('order_id', extracted.order_id || '')
        .single();

      if (!duplicate) {
        const calculated = calculateDeadlines({
          purchaseDate: extracted.purchase_date || new Date(),
          retailerName: extracted.retailer_name,
          customReturnDays: extracted.return_window_days,
        });

        const { data: purchase } = await supabase
          .from('purchases')
          .insert({
            user_id: userId,
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
            source: 'email',
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
    }
  }
}

async function pollOutlookMessages(userId: string, connectionId: string, accessToken: string) {
  const url = `https://graph.microsoft.com/v1.0/me/messages?$top=15&$search="order OR confirmation OR shipped OR delivered OR receipt"&$select=id,subject,from,bodyPreview,receivedDateTime`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return;

  const data = await res.json();
  const messages = data.value || [];

  for (const m of messages) {
    const { data: existing } = await supabase
      .from('processed_emails')
      .select('id')
      .eq('user_id', userId)
      .eq('message_id', m.id)
      .single();

    if (existing) continue;

    const from = m.from?.emailAddress?.address || '';
    const subject = m.subject || '';
    const bodyText = m.bodyPreview || '';

    const { data: extracted, status } = await parseAndExtractEmail({
      subject,
      senderEmail: from,
      emailBody: bodyText,
    });

    await supabase.from('processed_emails').insert({
      user_id: userId,
      email_connection_id: connectionId,
      message_id: m.id,
      email_type: extracted.email_type,
      retailer_detected: extracted.retailer_name,
      extraction_confidence: extracted.confidence,
      raw_reference: `Subject: ${subject} | From: ${from}`,
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
          user_id: userId,
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
          source: 'email',
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
  }
}

// Runnable if executed directly via Node.js
if (require.main === module) {
  processActiveEmailConnections()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
