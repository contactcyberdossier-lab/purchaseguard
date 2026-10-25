// ========================================================
// API Route: /api/billing/webhook (Stripe Webhook Handler)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripeClient } from '@/lib/stripe';

// Use service role client to bypass RLS for webhook background updates
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET missing' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook verification failed: ${err.message}` }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const customerId = session.customer as string;

        if (userId) {
          const status = planId === 'plus_annual' ? 'annual' : 'plus';

          await supabase
            .from('users')
            .update({
              subscription_status: status,
              stripe_customer_id: customerId,
            })
            .eq('id', userId);

          await supabase.from('subscription_events').insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: (session.currency || 'USD').toUpperCase(),
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status; // active, past_due, canceled

        const mappedStatus =
          status === 'active'
            ? subscription.items.data[0]?.plan?.interval === 'year'
              ? 'annual'
              : 'plus'
            : status === 'past_due'
            ? 'past_due'
            : 'free';

        await supabase
          .from('users')
          .update({ subscription_status: mappedStatus })
          .eq('stripe_customer_id', customerId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        await supabase
          .from('users')
          .update({ subscription_status: 'free' })
          .eq('stripe_customer_id', customerId);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userRecord) {
          await supabase.from('subscription_events').insert({
            user_id: userRecord.id,
            stripe_event_id: event.id,
            event_type: event.type,
            amount: invoice.amount_paid ? invoice.amount_paid / 100 : 0,
            currency: (invoice.currency || 'USD').toUpperCase(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        await supabase
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
