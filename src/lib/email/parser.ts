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
  const lowerSub = subject.toLowerCase();

  // 1. Strict Subject Guard: Ignore marketing, cart recovery, reviews, and security notifications
  // Ignore system alert notifications or reminders from PurchaseGuard
  if (lowerSub.includes('purchaseguard alert') || text.includes('purchaseguard alert') || text.includes('3 days left to return') || senderEmail.toLowerCase().includes('purchaseguard')) {
    return 'unrelated';
  }

  const isMarketingOrSpamSubject =
    /sale|deal|discount|off\b|%\s*off|recommend|picks?|cart\b|left\s*behind|rate\s*your|review\s*your|feedback|otp\b|one\s*time\s*password|verify|verification|login|alert|password\s*reset|newsletter|trending|price\s*drop|back\s*in\s*stock|hurry|exclusive|flat\s*\d+%/i.test(
      lowerSub
    ) && !/order\s*(confirmation|placed|#|id)|e-?receipt|tax\s*invoice/i.test(lowerSub);

  if (isMarketingOrSpamSubject) {
    return 'unrelated';
  }

  // 2. Ignore marketing, newsletters, promotional pitches, or non-transactional triggers
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
    'still thinking about it',
    'items in your cart',
    'you left something behind',
    'complete your purchase',
    'recommended for you',
    'top picks for you',
    'how was your',
    'rate your experience',
    'rate your purchase',
    'share your feedback',
    'security alert',
    'sign-in attempt',
    'login notification',
    'price drop alert',
  ];

  // Strong purchase indicators take precedence
  const hasStrongPurchaseIndicator =
    /order\s*(number|#|id|confirmation|placed|confirmed|details)/i.test(text) ||
    /your\s*order\s*has\s*been\s*(placed|confirmed)/i.test(text) ||
    /thank\s*you\s*for\s*(your\s*)?(order|purchase)/i.test(text) ||
    /receipt\s*for\s*your\s*order/i.test(text) ||
    /tax\s*invoice|bill\s*details|payment\s*successful|payment\s*received|e-receipt/i.test(text);

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
  if (sender.includes('flipkart') || text.includes('flipkart.com')) {
    return { retailerName: 'Flipkart', retailerDomain: 'flipkart.com', confidence: 0.98 };
  }
  if (sender.includes('myntra') || text.includes('myntra.com')) {
    return { retailerName: 'Myntra', retailerDomain: 'myntra.com', confidence: 0.98 };
  }
  if (sender.includes('swiggy') || text.includes('swiggy.in') || text.includes('swiggy')) {
    return { retailerName: 'Swiggy', retailerDomain: 'swiggy.in', confidence: 0.98 };
  }
  if (sender.includes('zomato') || text.includes('zomato.com') || text.includes('zomato')) {
    return { retailerName: 'Zomato', retailerDomain: 'zomato.com', confidence: 0.98 };
  }
  if (sender.includes('croma') || text.includes('croma.com')) {
    return { retailerName: 'Croma', retailerDomain: 'croma.com', confidence: 0.98 };
  }
  if (sender.includes('meesho') || text.includes('meesho.com')) {
    return { retailerName: 'Meesho', retailerDomain: 'meesho.com', confidence: 0.98 };
  }
  if (sender.includes('reliancedigital') || text.includes('reliance digital')) {
    return { retailerName: 'Reliance Digital', retailerDomain: 'reliancedigital.in', confidence: 0.98 };
  }
  if (sender.includes('blinkit') || text.includes('blinkit.com')) {
    return { retailerName: 'Blinkit', retailerDomain: 'blinkit.com', confidence: 0.98 };
  }
  if (sender.includes('zepto') || text.includes('zeptonow.com')) {
    return { retailerName: 'Zepto', retailerDomain: 'zeptonow.com', confidence: 0.98 };
  }
  if (sender.includes('tataneu') || text.includes('tatadigital')) {
    return { retailerName: 'Tata Neu', retailerDomain: 'tataneu.com', confidence: 0.96 };
  }
  if (sender.includes('samsung') || text.includes('samsung.com')) {
    return { retailerName: 'Samsung', retailerDomain: 'samsung.com', confidence: 0.96 };
  }
  if (sender.includes('nike') || text.includes('nike.com')) {
    return { retailerName: 'Nike', retailerDomain: 'nike.com', confidence: 0.95 };
  }
  if (sender.includes('zara') || text.includes('zara.com')) {
    return { retailerName: 'Zara', retailerDomain: 'zara.com', confidence: 0.95 };
  }
  if (sender.includes('namecheap') || text.includes('namecheap.com') || text.includes('namecheap')) {
    return { retailerName: 'Namecheap', retailerDomain: 'namecheap.com', confidence: 0.98 };
  }
  if (sender.includes('googleplay') || text.includes('google play') || text.includes('google store')) {
    return { retailerName: 'Google', retailerDomain: 'google.com', confidence: 0.98 };
  }
  if (sender.includes('hostinger') || text.includes('hostinger')) {
    return { retailerName: 'Hostinger', retailerDomain: 'hostinger.com', confidence: 0.98 };
  }
  if (sender.includes('godaddy') || text.includes('godaddy')) {
    return { retailerName: 'GoDaddy', retailerDomain: 'godaddy.com', confidence: 0.98 };
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
