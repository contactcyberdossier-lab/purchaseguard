export const runtime = 'edge';

// ========================================================
// API Route: /api/billing/webhook/lemon-squeezy
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');

    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(webhookSecret);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Convert hex signature to Uint8Array
      const hexSignature = signature.trim();
      const sigBytes = new Uint8Array(
        hexSignature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      const isValid = await crypto.subtle.verify(
        'HMAC',
        cryptoKey,
        sigBytes,
        encoder.encode(rawBody)
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Lemon Squeezy signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const customData = payload.meta?.custom_data;
    const userId = customData?.user_id;

    const supabase = getAdminSupabase();

    if (userId) {
      switch (eventName) {
        case 'subscription_created':
        case 'order_created':
        case 'subscription_resumed':
        case 'subscription_unpaused':
        case 'subscription_payment_success':
        case 'subscription_payment_recovered':
        case 'subscription_plan_changed':
        case 'subscription_updated': {
          const variantName = (
            payload.data?.attributes?.variant_name ||
            payload.data?.attributes?.product_name ||
            ''
          ).toLowerCase();
          const totalAmount =
            (payload.data?.attributes?.total ||
              payload.data?.attributes?.first_order_item?.price ||
              500) / 100;

          // Detect if user switched to Annual Plan vs Monthly Plan
          const isAnnual =
            variantName.includes('annual') ||
            variantName.includes('year') ||
            totalAmount >= 30;

          const status = isAnnual ? 'annual' : 'plus';

          await supabase
            .from('users')
            .update({
              subscription_status: status,
            })
            .eq('id', userId);

          await supabase.from('subscription_events').insert({
            user_id: userId,
            stripe_event_id: `ls_${payload.data?.id || Date.now()}`,
            event_type: eventName,
            amount: totalAmount,
            currency: 'USD',
          });
          break;
        }

        case 'subscription_cancelled':
        case 'subscription_expired':
        case 'order_refunded': {
          await supabase
            .from('users')
            .update({
              subscription_status: 'free',
            })
            .eq('id', userId);
          break;
        }

        case 'subscription_paused':
        case 'subscription_payment_failed': {
          await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', userId);
          break;
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Lemon Squeezy webhook error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}
