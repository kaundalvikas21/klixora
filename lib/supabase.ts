import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for the enquiry insert.
 * Uses the publishable (anon) key — the `enquiries` table is protected by an
 * RLS policy that allows INSERT only, so the key cannot read anyone's data.
 */
export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
