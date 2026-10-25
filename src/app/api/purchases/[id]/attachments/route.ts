export const runtime = 'edge';

// ========================================================
// API Route: /api/purchases/[id]/attachments (Upload Receipts)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateReceiptFile, uploadReceiptFile, getReceiptSignedUrl } from '@/lib/storage';

export async function POST(
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

  // Ensure purchase belongs to user
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate size and mime type
    const validation = validateReceiptFile({ type: file.type, size: file.size });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { path, error: uploadErr } = await uploadReceiptFile({
      supabase,
      userId: user.id,
      purchaseId: purchase.id,
      fileBuffer: buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr }, { status: 500 });
    }

    // Insert record in attachments table
    const { data: attachment, error: dbErr } = await supabase
      .from('attachments')
      .insert({
        purchase_id: purchase.id,
        file_name: file.name,
        file_url: path,
        file_type: file.type,
        file_size_bytes: file.size,
      })
      .select()
      .single();

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    const signedUrl = await getReceiptSignedUrl(supabase, path, 3600);

    return NextResponse.json(
      { attachment: { ...attachment, signed_download_url: signedUrl } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
