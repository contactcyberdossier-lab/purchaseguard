export const runtime = 'edge';

// ========================================================
// API Route: /api/billing/checkout (Stripe Checkout Session)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripeClient, PRICING_PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { planId, locale = 'en' } = await request.json();
    const plan = PRICING_PLANS[planId];

    if (!plan || plan.id === 'free') {
      return NextResponse.json({ error: 'Invalid subscription plan selected' }, { status: 400 });
    }

    // Support Lemon Squeezy checkout for both Monthly ($5/mo) and Annual ($49/yr)
    const lemonMonthlyUrl =
      process.env.LEMON_SQUEEZY_PLUS_MONTHLY_URL ||
      'https://purchaseguard.lemonsqueezy.com/checkout/buy/07cef99e-3591-4114-be45-f4042ca3c614';

    const lemonAnnualUrl =
      process.env.LEMON_SQUEEZY_PLUS_ANNUAL_URL ||
      lemonMonthlyUrl;

    const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder'));

    if (lemonMonthlyUrl && (!hasStripe || process.env.PREFERRED_BILLING_GATEWAY === 'lemonsqueezy')) {
      const emailParam = encodeURIComponent(user.email || '');
      const targetUrl = planId === 'plus_annual' && lemonAnnualUrl ? lemonAnnualUrl : lemonMonthlyUrl;
      const redirectCheckoutUrl = `${targetUrl}?embed=1&media=0&checkout[custom][user_id]=${user.id}&checkout[email]=${emailParam}`;
      return NextResponse.json({ url: redirectCheckoutUrl });
    }

    const stripe = getStripeClient();

    // Fetch user profile from Supabase to retrieve or link Stripe customer ID
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update in Supabase
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguard.app';

    // Create Checkout Session with Stripe Tax enabled
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `PurchaseGuard ${plan.interval === 'year' ? 'Annual' : 'Monthly'} Subscription with 14-day money-back guarantee.`,
            },
            unit_amount: plan.price * 100, // cents
            recurring: {
              interval: plan.interval as 'month' | 'year',
            },
          },
          quantity: 1,
        },
      ],
      automatic_tax: {
        enabled: true,
      },
      customer_update: {
        address: 'auto',
      },
      tax_id_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
      success_url: `${origin}/${locale}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/dashboard/billing?status=canceled`,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
