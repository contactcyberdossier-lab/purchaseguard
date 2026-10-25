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
  const orderIdMatch = cleanedText.match(/order\s*(?:number|#|id|no\.?)\s*[:\-]?\s*([a-z0-9\-]{5,30})/i);
  if (orderIdMatch) {
    orderId = orderIdMatch[1];
  }

  // 3. Extract Total Amount
  let total = 0;
  let currency: any = 'USD';
  const totalMatch = cleanedText.match(/(?:total|amount\s*paid|grand\s*total)\s*[:\-]?\s*([$€£¥₹A-Z]{1,3})?\s*([\d,]+\.\d{2})/i);
  if (totalMatch) {
    total = parseFloat(totalMatch[2].replace(/,/g, ''));
    if (totalMatch[1]) {
      const sym = totalMatch[1].trim();
      if (sym === '$') currency = 'USD';
      else if (sym === '€') currency = 'EUR';
      else if (sym === '£') currency = 'GBP';
      else if (sym === '₹') currency = 'INR';
      else if (SUPPORTED_CURRENCIES.includes(sym as any)) currency = sym;
    }
  }

  // 4. Extract Tracking Number if available
  let trackingNumber: string | null = null;
  const trackingMatch = cleanedText.match(/(?:tracking\s*(?:number|#)?)\s*[:\-]?\s*([a-z0-9]{8,35})/i);
  if (trackingMatch) {
    trackingNumber = trackingMatch[1];
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const extracted: UniversalPurchaseOutput = {
    email_type: emailType,
    is_purchase: true,
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
    confidence: orderId && total > 0 ? Math.max(confidence, 0.92) : 0.75,
    missing_fields: !orderId ? ['order_id'] : [],
  };

  // Determine status based on confidence thresholds
  const status = extracted.confidence >= 0.90 ? 'active' : 'review_needed';

  return { data: extracted, status };
}
