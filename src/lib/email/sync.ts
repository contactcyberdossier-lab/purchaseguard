// ========================================================
// Email Synchronization Engine (Gmail & Outlook)
// Runs directly in Next.js Serverless API routes
// ========================================================

import { getServiceSupabase } from '../supabase/service';
import { decryptToken } from '../security';
import { refreshGoogleAccessToken } from '../oauth/gmail';
import { refreshMicrosoftAccessToken } from '../oauth/outlook';
import { parseAndExtractEmail } from './aiExtractor';
import { calculateDeadlines } from '../deadlines';
import { syncPurchaseReminders } from '../reminders';
import { stripHtml, extractCleanProductName } from './parser';

export interface SyncResult {
  success: boolean;
  scannedCount: number;
  syncedCount: number;
  message: string;
  error?: string;
  details?: {
    inbox: string;
    scanned: number;
    synced: number;
    error?: string;
  }[];
}

/**
 * Extracts all plain text or HTML content from a Gmail payload
 */
function extractBodyFromPayload(payload: any): string {
  if (!payload) return '';
  let text = '';

  if (payload.body?.data) {
    try {
      text += Buffer.from(payload.body.data, 'base64').toString('utf8') + ' ';
    } catch {}
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        try {
          text += Buffer.from(part.body.data, 'base64').toString('utf8') + ' ';
        } catch {}
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        try {
          text += Buffer.from(part.body.data, 'base64').toString('utf8') + ' ';
        } catch {}
      }
      if (part.parts) {
        text += extractBodyFromPayload(part) + ' ';
      }
    }
  }

  return text;
}

/**
 * Syncs email receipts for a specific user, optionally targeting a specific connection
 */
export async function syncUserEmailAccounts(
  userId: string,
  targetConnectionId?: string,
  clientOverride?: any
): Promise<SyncResult> {
  const supabase = clientOverride || getServiceSupabase();

  let query = supabase
    .from('email_connections')
    .select('*')
    .eq('user_id', userId)
    .is('disconnected_at', null);

  if (targetConnectionId) {
    query = query.eq('id', targetConnectionId);
  }

  const { data: connections, error: connErr } = await query;

  if (connErr || !connections || connections.length === 0) {
    return {
      success: false,
      scannedCount: 0,
      syncedCount: 0,
      message: 'No active connected email accounts found. Please connect your Gmail or Outlook account first.',
      error: connErr?.message,
    };
  }

  let totalScanned = 0;
  let totalSynced = 0;
  const details: NonNullable<SyncResult['details']> = [];

  for (const conn of connections) {
    let inboxScanned = 0;
    let inboxSynced = 0;
    let inboxError: string | undefined;

    try {
      // 1. Ensure access token is valid and refreshed if near expiry
      let accessToken = decryptToken(conn.access_token_encrypted);
      const isExpired = new Date(conn.token_expires_at) <= new Date(Date.now() + 5 * 60 * 1000);

      if (isExpired && conn.refresh_token_encrypted) {
        try {
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
        } catch (refreshErr: any) {
          console.error(`Token refresh failed for ${conn.email_address}:`, refreshErr);
        }
      }

      // 2. Fetch messages from Gmail
      if (conn.provider === 'gmail') {
        const syncRes = await syncGmailInbox(supabase, userId, conn.id, accessToken);
        inboxScanned = syncRes.scanned;
        inboxSynced = syncRes.synced;
        inboxError = syncRes.error;
      } else if (conn.provider === 'outlook') {
        const syncRes = await syncOutlookInbox(supabase, userId, conn.id, accessToken);
        inboxScanned = syncRes.scanned;
        inboxSynced = syncRes.synced;
        inboxError = syncRes.error;
      }
    } catch (err: any) {
      console.error(`Error syncing inbox ${conn.email_address}:`, err);
      inboxError = err.message || 'Unknown error syncing inbox';
    }

    totalScanned += inboxScanned;
    totalSynced += inboxSynced;
    details.push({
      inbox: conn.email_address,
      scanned: inboxScanned,
      synced: inboxSynced,
      error: inboxError,
    });
  }

  // Audit log the sync action
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'email_synced',
      metadata: { totalScanned, totalSynced, inboxes: connections.map((c: any) => c.email_address) },
    });
  } catch {}

  const hasErrors = details.some(d => d.error);
  const firstError = details.find(d => d.error)?.error;

  return {
    success: !hasErrors || totalSynced > 0,
    scannedCount: totalScanned,
    syncedCount: totalSynced,
    message: totalSynced > 0
      ? `Successfully synced ${totalSynced} purchase receipt${totalSynced === 1 ? '' : 's'} across your email!`
      : totalScanned > 0
      ? `Scanned ${totalScanned} emails. No new purchase receipts or order confirmations found.`
      : hasErrors
      ? `Inbox sync error: ${firstError}`
      : 'Scanned your recent emails. No receipt or order confirmations found in this inbox.',
    error: firstError,
    details,
  };
}

/**
 * Scans a Gmail inbox for order and delivery receipts
 */
async function syncGmailInbox(
  supabase: any,
  userId: string,
  connectionId: string,
  accessToken: string
): Promise<{ scanned: number; synced: number; error?: string }> {
  // Query Gmail search with verified purchase/receipt criteria, filtering out promotional spam
  const query = '(from:(amazon OR flipkart OR myntra OR apple OR swiggy OR zomato OR croma OR meesho OR reliance OR shopify OR bestbuy OR walmart OR target OR namecheap OR hostinger OR godaddy OR google OR uber OR ebay OR nike OR adidas OR blinkit OR zepto OR nykaa OR ajio) OR subject:(order OR confirmation OR invoice OR receipt OR "tax invoice" OR "bill details" OR delivered OR shipped OR purchase OR "e-receipt" OR booking OR ticket)) -subject:(deal OR sale OR discount OR "in your cart" OR "rate your" OR "review your" OR newsletter OR OTP OR "recommendation" OR "price drop" OR "left behind" OR "top picks")';
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=${encodeURIComponent(query)}`;

  const res = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMsg = errorBody.error?.message || `Gmail API returned status ${res.status}`;
    console.error(`[Gmail API Error]`, errorMsg);
    return { scanned: 0, synced: 0, error: errorMsg };
  }

  const listData = await res.json();
  const messages: { id: string; threadId: string }[] = listData.messages || [];

  let scanned = 0;
  let synced = 0;

  for (const m of messages) {
    // Check if already processed
    const { data: existing } = await supabase
      .from('processed_emails')
      .select('id, email_type')
      .eq('user_id', userId)
      .eq('message_id', m.id)
      .maybeSingle();

    if (existing && existing.email_type !== 'unrelated') continue;

    // Fetch full message payload
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!msgRes.ok) continue;
    const msgData = await msgRes.json();

    const headers: { name: string; value: string }[] = msgData.payload?.headers || [];
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';

    // Extract email body text
    const extractedBody = extractBodyFromPayload(msgData.payload);
    const bodyText = `${msgData.snippet || ''}\n${stripHtml(extractedBody)}`;

    // Resolve accurate purchase date from email header or internalDate
    let purchaseDateStr = new Date().toISOString().split('T')[0];
    if (msgData.internalDate) {
      try {
        const ms = parseInt(msgData.internalDate, 10);
        if (!isNaN(ms)) {
          purchaseDateStr = new Date(ms).toISOString().split('T')[0];
        }
      } catch {}
    }

    const { data: extracted, status } = await parseAndExtractEmail({
      subject,
      senderEmail: from,
      emailBody: bodyText,
    });

    // Record in processed_emails audit table
    if (existing) {
      await supabase
        .from('processed_emails')
        .update({
          email_type: extracted.email_type,
          retailer_detected: extracted.retailer_name,
          extraction_confidence: extracted.confidence,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('processed_emails').insert({
        user_id: userId,
        email_connection_id: connectionId,
        message_id: m.id,
        email_type: extracted.email_type,
        retailer_detected: extracted.retailer_name,
        extraction_confidence: extracted.confidence,
        raw_reference: `Subject: ${subject.slice(0, 200)} | From: ${from.slice(0, 100)}`,
      });
    }

    scanned++;

    // If it's a purchase confirmation, add to purchases table
    if (extracted.is_purchase) {
      // Check for duplicate order ID or existing purchase record
      let duplicateQuery = supabase
        .from('purchases')
        .select('id, tracking_number, total, product_name')
        .eq('user_id', userId)
        .eq('retailer_name', extracted.retailer_name);

      if (extracted.order_id) {
        duplicateQuery = duplicateQuery.eq('order_id', extracted.order_id);
      } else {
        duplicateQuery = duplicateQuery.eq('purchase_date', purchaseDateStr);
      }

      const { data: duplicate } = await duplicateQuery.maybeSingle();

      if (!duplicate) {
        const calculated = calculateDeadlines({
          purchaseDate: new Date(purchaseDateStr),
          retailerName: extracted.retailer_name,
          customReturnDays: extracted.return_window_days,
        });

        const productName =
          extracted.items[0]?.name ||
          extractCleanProductName(subject, bodyText, extracted.retailer_name);

        const { data: purchase, error: pErr } = await supabase
          .from('purchases')
          .insert({
            user_id: userId,
            retailer_name: extracted.retailer_name,
            retailer_domain: extracted.retailer_domain,
            order_id: extracted.order_id || `ORD-${m.id.slice(0, 10).toUpperCase()}`,
            purchase_date: purchaseDateStr,
            currency: extracted.currency,
            subtotal: extracted.subtotal,
            tax: extracted.tax,
            shipping: extracted.shipping,
            total: extracted.total,
            product_name: productName,
            tracking_number: extracted.tracking_number,
            return_deadline: calculated.returnDeadline.toISOString().split('T')[0],
            warranty_deadline: calculated.warrantyDeadline.toISOString().split('T')[0],
            status,
            confidence: extracted.confidence,
            source: 'email',
          })
          .select()
          .single();

        if (!pErr && purchase) {
          synced++;
          await syncPurchaseReminders(
            supabase,
            purchase.id,
            purchase.return_deadline,
            purchase.warranty_deadline
          );
        }
      } else {
        // Upgrade existing purchase record with higher-accuracy details (e.g. tracking number or final total)
        const updates: any = {};
        if (extracted.tracking_number && !duplicate.tracking_number) {
          updates.tracking_number = extracted.tracking_number;
        }
        if (extracted.total > 0 && (!duplicate.total || duplicate.total === 0)) {
          updates.total = extracted.total;
          updates.subtotal = extracted.subtotal;
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from('purchases').update(updates).eq('id', duplicate.id);
        }
      }
    }
  }

  return { scanned, synced };
}

/**
 * Scans an Outlook inbox for order and delivery receipts
 */
async function syncOutlookInbox(
  supabase: any,
  userId: string,
  connectionId: string,
  accessToken: string
): Promise<{ scanned: number; synced: number; error?: string }> {
  const url = `https://graph.microsoft.com/v1.0/me/messages?$top=100&$search="order OR confirmation OR shipped OR delivered OR receipt OR invoice"&$select=id,subject,from,bodyPreview,receivedDateTime,body`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const errorMsg = errorBody.error?.message || `Microsoft Graph returned status ${res.status}`;
    return { scanned: 0, synced: 0, error: errorMsg };
  }

  const data = await res.json();
  const messages = data.value || [];

  let scanned = 0;
  let synced = 0;

  for (const m of messages) {
    const { data: existing } = await supabase
      .from('processed_emails')
      .select('id, email_type')
      .eq('user_id', userId)
      .eq('message_id', m.id)
      .maybeSingle();

    if (existing && existing.email_type !== 'unrelated') continue;

    const from = m.from?.emailAddress?.address || '';
    const subject = m.subject || '';
    const bodyHtml = m.body?.content || '';
    const bodyText = `${m.bodyPreview || ''}\n${stripHtml(bodyHtml)}`;

    let purchaseDateStr = new Date().toISOString().split('T')[0];
    if (m.receivedDateTime) {
      try {
        purchaseDateStr = new Date(m.receivedDateTime).toISOString().split('T')[0];
      } catch {}
    }

    const { data: extracted, status } = await parseAndExtractEmail({
      subject,
      senderEmail: from,
      emailBody: bodyText,
    });

    if (existing) {
      await supabase
        .from('processed_emails')
        .update({
          email_type: extracted.email_type,
          retailer_detected: extracted.retailer_name,
          extraction_confidence: extracted.confidence,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('processed_emails').insert({
        user_id: userId,
        email_connection_id: connectionId,
        message_id: m.id,
        email_type: extracted.email_type,
        retailer_detected: extracted.retailer_name,
        extraction_confidence: extracted.confidence,
        raw_reference: `Subject: ${subject.slice(0, 200)} | From: ${from.slice(0, 100)}`,
      });
    }

    scanned++;

    if (extracted.is_purchase) {
      let duplicateQuery = supabase
        .from('purchases')
        .select('id, tracking_number, total, product_name')
        .eq('user_id', userId)
        .eq('retailer_name', extracted.retailer_name);

      if (extracted.order_id) {
        duplicateQuery = duplicateQuery.eq('order_id', extracted.order_id);
      } else {
        duplicateQuery = duplicateQuery.eq('purchase_date', purchaseDateStr);
      }

      const { data: duplicate } = await duplicateQuery.maybeSingle();

      if (!duplicate) {
        const calculated = calculateDeadlines({
          purchaseDate: new Date(purchaseDateStr),
          retailerName: extracted.retailer_name,
          customReturnDays: extracted.return_window_days,
        });

        const productName =
          extracted.items[0]?.name ||
          extractCleanProductName(subject, bodyText, extracted.retailer_name);

        const { data: purchase, error: pErr } = await supabase
          .from('purchases')
          .insert({
            user_id: userId,
            retailer_name: extracted.retailer_name,
            retailer_domain: extracted.retailer_domain,
            order_id: extracted.order_id || `ORD-${m.id.slice(0, 10).toUpperCase()}`,
            purchase_date: purchaseDateStr,
            currency: extracted.currency,
            subtotal: extracted.subtotal,
            tax: extracted.tax,
            shipping: extracted.shipping,
            total: extracted.total,
            product_name: productName,
            tracking_number: extracted.tracking_number,
            return_deadline: calculated.returnDeadline.toISOString().split('T')[0],
            warranty_deadline: calculated.warrantyDeadline.toISOString().split('T')[0],
            status,
            confidence: extracted.confidence,
            source: 'email',
          })
          .select()
          .single();

        if (!pErr && purchase) {
          synced++;
          await syncPurchaseReminders(
            supabase,
            purchase.id,
            purchase.return_deadline,
            purchase.warranty_deadline
          );
        }
      } else {
        // Upgrade existing purchase record with higher-accuracy details (e.g. tracking number or final total)
        const updates: any = {};
        if (extracted.tracking_number && !duplicate.tracking_number) {
          updates.tracking_number = extracted.tracking_number;
        }
        if (extracted.total > 0 && (!duplicate.total || duplicate.total === 0)) {
          updates.total = extracted.total;
          updates.subtotal = extracted.subtotal;
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from('purchases').update(updates).eq('id', duplicate.id);
        }
      }
    }
  }

  return { scanned, synced };
}
