// project/api/_supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';
  const key = process.env.SUPABASE_SERVICE_ROLE || '';

  if (!url || !key) {
    throw new Error('Missing Supabase env (SUPABASE_URL or SERVICE_ROLE)');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
