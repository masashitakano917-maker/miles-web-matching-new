import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';
  const key = process.env.SUPABASE_SERVICE_ROLE || '';

  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE が未設定です');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
