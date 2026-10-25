// ========================================================
// API Route: /api/purchases (List & Create Purchases)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { purchaseSchema } from '@/lib/validations/purchase';
import { calculateDeadlines } from '@/lib/deadlines';
import { syncPurchaseReminders } from '@/lib/reminders';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const query = searchParams.get('q');
  const sortBy = searchParams.get('sort_by') || 'purchase_date';
  const sortDir = searchParams.get('sort_dir') === 'asc' ? true : false;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  let dbQuery = supabase
    .from('purchases')
    .select('*, purchase_items(*), attachments(*)')
    .eq('user_id', user.id);

  if (status && status !== 'all') {
    dbQuery = dbQuery.eq('status', status);
  }

  if (query) {
    dbQuery = dbQuery.or(
      `product_name.ilike.%${query}%,retailer_name.ilike.%${query}%,order_id.ilike.%${query}%`
    );
  }

  dbQuery = dbQuery.order(sortBy, { ascending: sortDir }).limit(limit);

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ purchases: data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = purchaseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Calculate deadlines if not explicitly provided
    let returnDeadlineStr = input.return_deadline;
    let warrantyDeadlineStr = input.warranty_deadline;

    if (!returnDeadlineStr || !warrantyDeadlineStr) {
      const calculated = calculateDeadlines({
        purchaseDate: input.purchase_date,
        retailerName: input.retailer_name,
        customReturnDays: input.custom_return_days,
        customWarrantyMonths: input.custom_warranty_months,
      });

      if (!returnDeadlineStr) {
        returnDeadlineStr = calculated.returnDeadline.toISOString().split('T')[0];
      }
      if (!warrantyDeadlineStr) {
        warrantyDeadlineStr = calculated.warrantyDeadline.toISOString().split('T')[0];
      }
    }

    // Insert purchase record
    const { data: purchase, error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        retailer_name: input.retailer_name,
        retailer_domain: input.retailer_domain || null,
        product_name: input.product_name,
        product_url: input.product_url || null,
        order_id: input.order_id || null,
        tracking_number: input.tracking_number || null,
        carrier: input.carrier || null,
        purchase_date: input.purchase_date,
        currency: input.currency,
        subtotal: input.subtotal,
        tax: input.tax,
        shipping: input.shipping,
        total: input.total,
        return_deadline: returnDeadlineStr,
        warranty_deadline: warrantyDeadlineStr,
        notes: input.notes || null,
        source: 'manual',
        status: 'active',
        confidence: 1.0,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Insert line items if present
    if (input.items && input.items.length > 0) {
      const itemsToInsert = input.items.map((it) => ({
        purchase_id: purchase.id,
        name: it.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.total_price,
      }));
      await supabase.from('purchase_items').insert(itemsToInsert);
    }

    // Sync automated reminder schedules
    await syncPurchaseReminders(
      supabase,
      purchase.id,
      purchase.return_deadline,
      purchase.warranty_deadline
    );

    return NextResponse.json({ purchase }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
