// ========================================================
// Stripe Billing & Subscription Infrastructure
// ========================================================

export interface PricingPlan {
  id: 'free' | 'plus_monthly' | 'plus_annual';
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'forever';
  priceId?: string;
  features: string[];
  purchaseLimit: number; // 5 for free, unlimited (-1) for plus/annual
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    currency: 'USD',
    interval: 'forever',
    purchaseLimit: 5,
    features: [
      'Up to 5 tracked purchases',
      'Manual purchase entry',
      'Basic return deadline reminders',
      'Standard currency support',
    ],
  },
  plus_monthly: {
    id: 'plus_monthly',
    name: 'PurchaseGuard Plus (Monthly)',
    price: 5,
    currency: 'USD',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_PLUS_MONTHLY,
    purchaseLimit: -1, // Unlimited
    features: [
      'Unlimited purchase tracking',
      'Automated Gmail & Outlook sync',
      'Smart receipt OCR & cloud vault',
      'Automated return & warranty reminders (7d, 3d, 1d)',
      'Pre-filled return & warranty claim templates',
      'Price-drop opportunity alerts',
      '14-day subscription money-back guarantee',
    ],
  },
  plus_annual: {
    id: 'plus_annual',
    name: 'PurchaseGuard Plus (Annual Saver)',
    price: 49,
    currency: 'USD',
    interval: 'year',
    priceId: process.env.STRIPE_PRICE_PLUS_ANNUAL,
    purchaseLimit: -1, // Unlimited
    features: [
      'Everything in Plus Monthly',
      '2 Months Free included (18% savings)',
      'Priority email customer support',
      '14-day subscription money-back guarantee',
    ],
  },
};

/**
 * Returns Stripe client instance
 */
export function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
  }

  // Use dynamic import or standard require to instantiate
  const Stripe = require('stripe');
  return new Stripe(apiKey, {
    apiVersion: '2024-06-20',
    appInfo: {
      name: 'PurchaseGuard',
      version: '1.0.0',
    },
  });
}
