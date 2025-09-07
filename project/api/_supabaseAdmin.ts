// project/api/_supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceRole) {
  // ここで throw しておくと、/api/debug/health で検知しやすい
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE');
}

export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
