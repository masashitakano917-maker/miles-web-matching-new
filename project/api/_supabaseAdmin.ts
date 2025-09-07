// project/api/_supabaseAdmin.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** 必須ENVの取得（無ければ明示的に例外） */
function need(name: string): string {
  const v =
    process.env[name] ||
    (name === 'SUPABASE_URL' ? process.env.VITE_SUPABASE_URL : undefined);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/** Service Role での管理用クライアント（毎回遅延生成） */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || need('VITE_SUPABASE_URL');
  const serviceKey = need('SUPABASE_SERVICE_ROLE');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
