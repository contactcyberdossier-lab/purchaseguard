// ========================================================
// Admin Authentication & Privilege Verification Helper
// ========================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role: 'user' | 'admin';
  subscription_status?: string;
  created_at: string;
}

export interface AdminSessionResult {
  isAdmin: boolean;
  user: any | null;
  profile: UserProfile | null;
  errorResponse?: NextResponse;
}

/**
 * Checks if the caller has valid active session and admin privileges.
 * For use in API route handlers and Server Components.
 */
export async function verifyAdminSession(supabase: SupabaseClient): Promise<AdminSessionResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      isAdmin: false,
      user: null,
      profile: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      ),
    };
  }

  // Fetch role from public.users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, full_name, role, subscription_status, created_at')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      isAdmin: false,
      user,
      profile: null,
      errorResponse: NextResponse.json(
        { error: 'User profile not found.' },
        { status: 403 }
      ),
    };
  }

  const isAdmin = profile.role === 'admin';

  if (!isAdmin) {
    return {
      isAdmin: false,
      user,
      profile,
      errorResponse: NextResponse.json(
        { error: 'Forbidden. Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }

  return {
    isAdmin: true,
    user,
    profile,
  };
}
