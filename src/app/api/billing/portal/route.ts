// ========================================================
// API Route: /api/billing/portal (Stripe Customer Billing Portal)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { locale = 'en' } = await request.json().catch(() => ({}));

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active Stripe customer billing profile found' },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://purchaseguard.app';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/${locale}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to open customer billing portal' },
      { status: 500 }
    );
  }
}
