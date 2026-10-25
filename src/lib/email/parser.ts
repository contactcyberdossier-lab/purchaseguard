// ========================================================
// Email Normalization, Classification & Retailer Detector
// ========================================================

export type DetectedEmailType =
  | 'order_confirmation'
  | 'shipping_update'
  | 'delivery_update'
  | 'refund_confirmation'
  | 'return_confirmation'
  | 'warranty'
  | 'unrelated';

export interface NormalizedEmail {
  subject: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  receivedDate: Date;
  cleanedText: string;
  html?: string;
  messageId: string;
}

export interface RetailerDetectionResult {
  retailerName: string;
  retailerDomain: string;
  confidence: number;
}

/**
 * Safely strips HTML markup and extracts readable textual contents
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifies email subject and body into purchase categories or unrelated marketing
 */
export function classifyEmail(subject: string, bodyText: string): DetectedEmailType {
  const text = `${subject} ${bodyText}`.toLowerCase();

  // 1. Ignore clear marketing, newsletters, or promo codes
  const marketingKeywords = [
    'unsubscribe',
    'view in browser',
    'flash sale',
    'daily deals',
    'promo code',
    'don’t miss out',
    'exclusive discount',
    'weekly newsletter',
    'new arrivals',
    'clearance',
    'coupon code',
  ];

  // Strong purchase indicators take precedence
  const hasStrongPurchaseIndicator =
    /order\s*(number|#|id|confirmation)/i.test(text) ||
    /your\s*order\s*has\s*been\s*placed/i.test(text) ||
    /thank\s*you\s*for\s*your\s*order/i.test(text) ||
    /receipt\s*for\s*your\s*order/i.test(text);

  const hasMarketingKeyword = marketingKeywords.some(kw => text.includes(kw));

  if (hasMarketingKeyword && !hasStrongPurchaseIndicator) {
    return 'unrelated';
  }

  // 2. Delivery confirmation
  if (
    /delivered|has\s*been\s*delivered|package\s*delivered|delivery\s*confirmation/i.test(text)
  ) {
    return 'delivery_update';
  }

  // 3. Shipping update
  if (
    /your\s*package\s*has\s*shipped|shipped|tracking\s*number|on\s*its\s*way|in\s*transit|dispatched/i.test(text)
  ) {
    return 'shipping_update';
  }

  // 4. Refund confirmation
  if (
    /refund\s*(issued|processed|confirmation)|we\s*have\s*issued\s*a\s*refund|credit\s*memo/i.test(text)
  ) {
    return 'refund_confirmation';
  }

  // 5. Return confirmation
  if (
    /return\s*(received|processed|confirmation|label)|your\s*return\s*is/i.test(text)
  ) {
    return 'return_confirmation';
  }

  // 6. Warranty
  if (
    /warranty\s*(registration|confirmation|certificate|policy)|applecare/i.test(text)
  ) {
    return 'warranty';
  }

  // 7. Order confirmation
  if (hasStrongPurchaseIndicator || /order\s*confirmed|order\s*details|tax\s*invoice/i.test(text)) {
    return 'order_confirmation';
  }

  return 'unrelated';
}

/**
 * Known retailer rule matching based on sender address and body patterns
 */
export function detectKnownRetailer(senderEmail: string, subject: string, bodyText: string): RetailerDetectionResult | null {
  const sender = senderEmail.toLowerCase();
  const text = `${subject} ${bodyText}`.toLowerCase();

  if (sender.includes('amazon') || text.includes('amazon.com') || text.includes('amazon order')) {
    return { retailerName: 'Amazon', retailerDomain: 'amazon.com', confidence: 0.98 };
  }
  if (sender.includes('walmart') || text.includes('walmart.com')) {
    return { retailerName: 'Walmart', retailerDomain: 'walmart.com', confidence: 0.98 };
  }
  if (sender.includes('target') || text.includes('target.com')) {
    return { retailerName: 'Target', retailerDomain: 'target.com', confidence: 0.98 };
  }
  if (sender.includes('bestbuy') || text.includes('bestbuy.com')) {
    return { retailerName: 'Best Buy', retailerDomain: 'bestbuy.com', confidence: 0.98 };
  }
  if (sender.includes('apple') || text.includes('apple.com')) {
    return { retailerName: 'Apple', retailerDomain: 'apple.com', confidence: 0.98 };
  }
  if (sender.includes('ebay') || text.includes('ebay.com')) {
    return { retailerName: 'eBay', retailerDomain: 'ebay.com', confidence: 0.98 };
  }
  if (sender.includes('costco') || text.includes('costco.com')) {
    return { retailerName: 'Costco', retailerDomain: 'costco.com', confidence: 0.95 };
  }
  if (sender.includes('shopify') || text.includes('shopify.com') || text.includes('powered by shopify')) {
    // Extract domain from sender
    const domainMatch = sender.match(/@([a-z0-9.-]+\.[a-z]{2,})/);
    const domain = domainMatch ? domainMatch[1] : 'shopify.com';
    const storeName = domain.split('.')[0].toUpperCase();
    return { retailerName: storeName, retailerDomain: domain, confidence: 0.90 };
  }

  return null;
}
