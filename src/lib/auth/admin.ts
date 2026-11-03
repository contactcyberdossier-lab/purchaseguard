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

  const adminEmails = [
    'contact.cyberdossier@gmail.com',
    'pmanikantasai1996@gmail.com',
    process.env.ADMIN_EMAIL,
  ].filter(Boolean);

  const isEmailAdmin = Boolean(user.email && adminEmails.includes(user.email));

  // Fetch role from public.users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, full_name, role, subscription_status, created_at')
    .eq('id', user.id)
    .single();

  const userProfile: UserProfile = profile || {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || 'Admin',
    role: isEmailAdmin ? 'admin' : 'user',
    subscription_status: 'admin',
    created_at: new Date().toISOString(),
  };

  const isAdmin = userProfile.role === 'admin' || isEmailAdmin;

  if (!isAdmin) {
    return {
      isAdmin: false,
      user,
      profile: userProfile,
      errorResponse: NextResponse.json(
        { error: 'Forbidden. Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }

  return {
    isAdmin: true,
    user,
    profile: userProfile,
  };
}
