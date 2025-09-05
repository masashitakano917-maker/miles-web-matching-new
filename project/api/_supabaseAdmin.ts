// project/api/_supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,        // 同じURLを使う
  process.env.SUPABASE_SERVICE_ROLE!,    // サーバー専用の機密キー
  { auth: { autoRefreshToken: false, persistSession: false } }
);
