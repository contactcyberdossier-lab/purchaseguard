import { createClient } from '@supabase/supabase-js';

/**
 * Returns a high-privilege Supabase client using SUPABASE_SERVICE_ROLE_KEY,
 * falling back to anon key. Used for background syncing, webhooks, and administrative tasks.
 */
export function getServiceSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://placeholder.supabase.co';

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    '';

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
