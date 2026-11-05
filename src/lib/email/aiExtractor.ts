// ========================================================
// Universal JSON Schema, AI Extraction Prompt & Validator
// ========================================================

import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '../validations/purchase';
import { detectKnownRetailer, classifyEmail, stripHtml } from './parser';

export const universalPurchaseSchema = z.object({
  email_type: z.enum([
    'order_confirmation',
    'shipping_update',
    'delivery_update',
    'refund_confirmation',
    'return_confirmation',
    'warranty',
    'unrelated',
  ]),
  is_purchase: z.boolean(),
  retailer_name: z.string().min(1),
  retailer_domain: z.string().optional().nullable(),
  order_id: z.string().optional().nullable(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  currency: z.enum(SUPPORTED_CURRENCIES).default('USD'),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().default(1),
      unit_price: z.number().default(0),
      total_price: z.number().default(0),
    })
  ).default([]),
  subtotal: z.number().default(0),
  tax: z.number().default(0),
  shipping: z.number().default(0),
  total: z.number().min(0),
  tracking_number: z.string().optional().nullable(),
  return_policy_url: z.string().optional().nullable(),
  return_window_days: z.number().int().default(30),
  warranty_months: z.number().int().optional().nullable(),
  confidence: z.number().min(0).max(1),
  missing_fields: z.array(z.string()).default([]),
});

export type UniversalPurchaseOutput = z.infer<typeof universalPurchaseSchema>;

/**
 * System Prompt instructing the LLM to output the strict universal JSON schema
 */
export const AI_EXTRACTION_SYSTEM_PROMPT = `
You are the high-accuracy PurchaseGuard Email Parser.
Extract online purchase receipt, delivery, return, or warranty data from the provided raw email text into this exact JSON schema:

{
  "email_type": "order_confirmation | shipping_update | delivery_update | refund_confirmation | return_confirmation | warranty | unrelated",
  "is_purchase": boolean,
  "retailer_name": "string",
  "retailer_domain": "string | null",
  "order_id": "string | null",
  "purchase_date": "YYYY-MM-DD | null",
  "currency": "USD | CAD | GBP | EUR | AUD | NZD | INR | JPY | BRL | MXN | SGD | AED | CHF | SEK | NOK | DKK | PLN | ZAR",
  "items": [
    {
      "name": "string",
      "quantity": 1,
      "unit_price": 0.00,
      "total_price": 0.00
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "shipping": 0.00,
  "total": 0.00,
  "tracking_number": "string | null",
  "return_policy_url": "string | null",
  "return_window_days": 30,
  "warranty_months": null,
  "confidence": 0.00,
  "missing_fields": []
}

Extraction Rules:
1. If the email is promotional, newsletter, spam, or a marketing pitch, set email_type to "unrelated", is_purchase to false, and confidence to 0.00.
2. Purchase date MUST be in YYYY-MM-DD format and cannot be in the future.
3. Order ID and Total MUST appear in the source text.
4. Normalize currency amounts into standard decimals (e.g., 12.99).
5. Confidence scoring:
   - 0.95+ if order ID, date, items, and total are explicitly verified.
   - 0.75-0.89 if some item breakdowns or fields are inferred.
   - < 0.70 if text is ambiguous.
Output ONLY valid JSON. No conversational text.
`;

/**
 * Strict Rule-Based + Fallback Parser Engine
 */
export async function parseAndExtractEmail({
  subject,
  senderEmail,
  emailBody,
}: {
  subject: string;
  senderEmail: string;
  emailBody: string;
}): Promise<{ data: UniversalPurchaseOutput; status: 'active' | 'review_needed' | 'ignored' }> {
  const cleanedText = stripHtml(emailBody);
  const emailType = classifyEmail(subject, cleanedText);

  if (emailType === 'unrelated') {
    return {
      data: {
        email_type: 'unrelated',
        is_purchase: false,
        retailer_name: 'Unknown',
        retailer_domain: null,
        order_id: null,
        purchase_date: null,
        currency: 'USD',
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        tracking_number: null,
        return_policy_url: null,
        return_window_days: 30,
        warranty_months: null,
        confidence: 0,
        missing_fields: [],
      },
      status: 'ignored',
    };
  }

  // 1. Try known retailer match
  const knownRetailer = detectKnownRetailer(senderEmail, subject, cleanedText);
  let retailerName = knownRetailer?.retailerName || 'Online Store';
  let retailerDomain = knownRetailer?.retailerDomain || null;
  let confidence = knownRetailer?.confidence || 0.75;

  // 2. Extract Order ID via regex
  let orderId: string | null = null;
  const orderIdMatch = cleanedText.match(
    /(?:order\s*(?:number|#|id|no\.?)|order\s*id\s*is|order\s*details\s*for)\s*[:\-#]?\s*([a-z0-9\-]{5,35})/i
  );
  if (orderIdMatch && /[a-z0-9]/i.test(orderIdMatch[1]) && !/^[\-_=.]+$/.test(orderIdMatch[1])) {
    orderId = orderIdMatch[1].trim();
  } else {
    // Check for Amazon order format: 123-1234567-1234567
    const amazonOrderMatch = cleanedText.match(/\b\d{3}-\d{7}-\d{7}\b/);
    if (amazonOrderMatch) {
      orderId = amazonOrderMatch[0];
    } else {
      // Check for Flipkart format: OD123456789...
      const fkMatch = cleanedText.match(/\bOD\d{14,22}\b/i);
      if (fkMatch) {
        orderId = fkMatch[0];
      }
    }
  }

  // Fallback: Check subject for Order ID (e.g. Namecheap Order Summary Order# 21850532)
  if (!orderId || !/[a-z0-9]/i.test(orderId)) {
    const subMatch = subject.match(/(?:order\s*(?:number|#|id|no\.?))\s*[:\-#]?\s*([a-z0-9]{5,35})/i);
    if (subMatch && /[a-z0-9]/i.test(subMatch[1])) {
      orderId = subMatch[1].trim();
    }
  }

  // 3. Extract Total Amount and explicit currency symbol
  let total = 0;
  let currency: any = 'USD';
  const totalMatch = cleanedText.match(
    /(?:total|amount\s*paid|grand\s*total|order\s*total|paid|invoice\s*amount)\s*[:\-]?\s*(?:(rs\.?|inr|usd|eur|gbp|aud|cad|[$€£¥₹])\s*)?([$€£¥₹])?\s*([\d,]+(?:\.\d{1,2})?)/i
  );
  if (totalMatch) {
    const rawVal = totalMatch[3]?.replace(/,/g, '');
    if (rawVal && !isNaN(parseFloat(rawVal))) {
      total = parseFloat(rawVal);
    }
    const sym = (totalMatch[1] || totalMatch[2] || '').toLowerCase();
    if (sym === '$' || sym === 'usd') {
      currency = 'USD';
    } else if (sym === '₹' || sym === 'rs' || sym === 'rs.' || sym === 'inr') {
      currency = 'INR';
    } else if (sym === '€' || sym === 'eur') {
      currency = 'EUR';
    } else if (sym === '£' || sym === 'gbp') {
      currency = 'GBP';
    }
  }

  // If no explicit symbol next to total, infer from text context
  if (!totalMatch?.[1] && !totalMatch?.[2]) {
    if (/[₹]|(?:rs\.?|inr)\b/i.test(cleanedText) || senderEmail.includes('.in')) {
      currency = 'INR';
    } else if (/[$]|\busd\b/i.test(cleanedText)) {
      currency = 'USD';
    } else if (/[€]|\beur\b/i.test(cleanedText)) {
      currency = 'EUR';
    } else if (/[£]|\bgbp\b/i.test(cleanedText)) {
      currency = 'GBP';
    }
  }

  // 4. Extract Tracking Number if available
  let trackingNumber: string | null = null;
  const trackingMatch = cleanedText.match(/(?:tracking\s*(?:number|#)?)\s*[:\-]?\s*([a-z0-9]{8,35})/i);
  if (trackingMatch) {
    trackingNumber = trackingMatch[1];
  }

  // Only mark as a new purchase if it is explicitly an order confirmation or warranty with valid order ID or paid amount
  const hasValidPurchaseDetails = orderId !== null || total > 0;
  const isGenuinePurchase =
    (emailType === 'order_confirmation' || emailType === 'warranty') && hasValidPurchaseDetails;

  const todayStr = new Date().toISOString().split('T')[0];

  const extracted: UniversalPurchaseOutput = {
    email_type: emailType,
    is_purchase: isGenuinePurchase,
    retailer_name: retailerName,
    retailer_domain: retailerDomain,
    order_id: orderId,
    purchase_date: todayStr,
    currency,
    items: [{ name: subject.slice(0, 100), quantity: 1, unit_price: total, total_price: total }],
    subtotal: total,
    tax: 0,
    shipping: 0,
    total,
    tracking_number: trackingNumber,
    return_policy_url: null,
    return_window_days: 30,
    warranty_months: 12,
    confidence: orderId && total > 0 ? Math.max(confidence, 0.92) : (hasValidPurchaseDetails ? 0.75 : 0.40),
    missing_fields: !orderId ? ['order_id'] : [],
  };

  // Determine status based on confidence thresholds
  const status = extracted.confidence >= 0.90 ? 'active' : 'review_needed';

  return { data: extracted, status };
}
