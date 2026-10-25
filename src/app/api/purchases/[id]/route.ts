// ========================================================
// API Route: /api/purchases/[id] (Get, Update, Delete)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { purchaseSchema } from '@/lib/validations/purchase';
import { syncPurchaseReminders } from '@/lib/reminders';
import { getReceiptSignedUrl } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: purchase, error } = await supabase
    .from('purchases')
    .select('*, purchase_items(*), attachments(*), reminders(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  // Generate secure signed URLs for all attachments
  if (purchase.attachments && purchase.attachments.length > 0) {
    for (const att of purchase.attachments) {
      if (att.file_url) {
        att.signed_download_url = await getReceiptSignedUrl(supabase, att.file_url, 3600);
      }
    }
  }

  return NextResponse.json({ purchase });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = purchaseSchema.partial().safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, ...updateFields } = parsed.data;

    const { data: updatedPurchase, error: updateError } = await supabase
      .from('purchases')
      .update(updateFields)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update reminders if deadlines were modified
    if (updateFields.return_deadline !== undefined || updateFields.warranty_deadline !== undefined) {
      await syncPurchaseReminders(
        supabase,
        updatedPurchase.id,
        updatedPurchase.return_deadline,
        updatedPurchase.warranty_deadline
      );
    }

    return NextResponse.json({ purchase: updatedPurchase });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
