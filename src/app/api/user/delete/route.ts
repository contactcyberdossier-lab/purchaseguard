// ========================================================
// API Route: /api/user/delete (Account & Data Deletion)
// ========================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { confirmation } = await request.json();
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation string "DELETE" is required' },
        { status: 400 }
      );
    }

    // 1. Remove storage files from receipts bucket
    const { data: userFiles } = await supabase.storage.from('receipts').list(user.id);
    if (userFiles && userFiles.length > 0) {
      const pathsToDelete = userFiles.map(f => `${user.id}/${f.name}`);
      await supabase.storage.from('receipts').remove(pathsToDelete);
    }

    // 2. Cascade delete from public.users (foreign keys cascade to purchases, reminders, etc.)
    await supabase.from('users').delete().eq('id', user.id);

    // 3. Sign out session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: 'Account and associated records deleted permanently' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Deletion failed' },
      { status: 500 }
    );
  }
}
