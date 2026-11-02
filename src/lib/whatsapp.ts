// ========================================================
// WhatsApp Notification Engine (Twilio / Meta Cloud API)
// ========================================================

export interface WhatsAppMessageParams {
  to: string; // E.164 format, e.g. +1234567890 or +919876543210
  body: string;
  mediaUrl?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Normalizes phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    // Default to + if user omitted leading plus
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Dispatches an automated WhatsApp message to a customer
 */
export async function sendWhatsAppMessage({
  to,
  body,
  mediaUrl,
}: WhatsAppMessageParams): Promise<WhatsAppSendResult> {
  const formattedTo = normalizePhoneNumber(to);

  // Check for Twilio Credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'; // default Twilio sandbox number

  // Check for Meta WhatsApp Cloud API Credentials
  const metaToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // 1. Send via Twilio WhatsApp API if configured
  if (twilioSid && twilioToken && !twilioSid.includes('placeholder')) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = 'Basic ' + btoa(`${twilioSid}:${twilioToken}`);

      const formData = new URLSearchParams();
      formData.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      formData.append('To', `whatsapp:${formattedTo}`);
      formData.append('Body', body);
      if (mediaUrl) {
        formData.append('MediaUrl', mediaUrl);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Twilio WhatsApp dispatch failed' };
      }

      return { success: true, messageId: data.sid };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 2. Send via Meta WhatsApp Cloud API if configured
  if (metaToken && metaPhoneId) {
    try {
      const endpoint = `https://graph.facebook.com/v19.0/${metaPhoneId}/messages`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedTo.replace('+', ''),
          type: 'text',
          text: { preview_url: true, body },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Meta WhatsApp dispatch failed' };
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 3. Send via CallMeBot (100% Free, Zero Cost WhatsApp API)
  const callMeBotKey = process.env.CALLMEBOT_API_KEY;
  if (callMeBotKey) {
    try {
      const encodedText = encodeURIComponent(body);
      const cleanPhone = formattedTo.replace('+', '');
      const endpoint = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${callMeBotKey}`;

      const res = await fetch(endpoint);
      const resText = await res.text();
      if (!res.ok || resText.includes('ERROR')) {
        return { success: false, error: resText || 'CallMeBot WhatsApp dispatch failed' };
      }

      return { success: true, messageId: `cmb-${Date.now()}` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 4. Fallback / Test Simulation Mode
  console.log(`[WhatsApp Simulated Alert] To: ${formattedTo}\nMessage:\n${body}`);
  return {
    success: true,
    simulated: true,
    messageId: `sim-wa-${Date.now()}`,
  };
}

/**
 * Builds formatted WhatsApp message for return deadline alerts
 */
export function formatWhatsAppReturnAlert({
  productName,
  retailerName,
  returnDeadline,
  daysLeft,
  dashboardUrl,
}: {
  productName: string;
  retailerName: string;
  returnDeadline: string;
  daysLeft: number;
  dashboardUrl: string;
}): string {
  const urgencyEmoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '⏰';

  return `${urgencyEmoji} *PurchaseGuard Return Reminder*\n\n` +
    `You have *${daysLeft} day${daysLeft === 1 ? '' : 's'} left* to return your *${productName}* from *${retailerName}*.\n\n` +
    `📅 *Return Deadline:* ${returnDeadline}\n\n` +
    `👉 *Prepare your return or refund letter here:*\n${dashboardUrl}\n\n` +
    `_Retailers make final return determinations based on their policy._`;
}

/**
 * Builds formatted WhatsApp message for warranty alerts
 */
export function formatWhatsAppWarrantyAlert({
  productName,
  retailerName,
  warrantyDeadline,
  dashboardUrl,
}: {
  productName: string;
  retailerName: string;
  warrantyDeadline: string;
  dashboardUrl: string;
}): string {
  return `🛡️ *PurchaseGuard Warranty Alert*\n\n` +
    `The warranty for your *${productName}* from *${retailerName}* expires in *30 days* (${warrantyDeadline}).\n\n` +
    `Inspect the device for any defects before coverage closes:\n${dashboardUrl}`;
}
