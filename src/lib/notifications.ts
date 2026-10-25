// ========================================================
// Transactional Notification Dispatcher (Resend / Postmark)
// ========================================================

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Dispatches transactional email via Resend API
 */
export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS || 'PurchaseGuard <notifications@purchaseguard.app>';

  if (!apiKey || apiKey === 're_...') {
    console.log(`[Notification Mock] Email to: ${to} | Subject: ${subject}`);
    return { success: true, id: 'mock-email-id' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Resend dispatch failed' };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Generates branded HTML template for return window countdown alerts
 */
export function buildReturnDeadlineAlertHtml({
  productName,
  retailerName,
  returnDeadline,
  daysLeft,
  orderId,
  dashboardUrl,
}: {
  productName: string;
  retailerName: string;
  returnDeadline: string;
  daysLeft: number;
  orderId?: string | null;
  dashboardUrl: string;
}): string {
  const urgencyColor = daysLeft <= 1 ? '#e11d48' : daysLeft <= 3 ? '#d97706' : '#4f46e5';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Return Deadline Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="display: flex; align-items: center; margin-bottom: 24px;">
      <h2 style="color: #4f46e5; margin: 0; font-size: 20px; font-weight: 800;">PurchaseGuard</h2>
    </div>

    <div style="background-color: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="margin: 0; color: ${urgencyColor}; font-size: 16px;">
        ${daysLeft <= 1 ? 'Action Required: Return Window Ends in 1 Day!' : `${daysLeft} Days Left to Return`}
      </h3>
      <p style="margin: 4px 0 0; font-size: 14px; color: #334155;">
        Your return window for <strong>${productName}</strong> closes on <strong>${returnDeadline}</strong>.
      </p>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; color: #64748b;">Retailer:</td>
        <td style="padding: 10px 0; font-weight: 600; text-align: right;">${retailerName}</td>
      </tr>
      ${orderId ? `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; color: #64748b;">Order Number:</td>
        <td style="padding: 10px 0; font-weight: 600; text-align: right;">${orderId}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 10px 0; color: #64748b;">Return Deadline:</td>
        <td style="padding: 10px 0; font-weight: 700; color: ${urgencyColor}; text-align: right;">${returnDeadline}</td>
      </tr>
    </table>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Prepare Return Request in PurchaseGuard
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    
    <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">
      <strong>Notice:</strong> PurchaseGuard helps you track purchases and prepare return, refund, warranty, and price-match requests. The retailer or manufacturer makes the final decision based on their terms of sale.
    </p>
  </div>
</body>
</html>
  `;
}
