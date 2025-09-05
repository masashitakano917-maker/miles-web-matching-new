import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,          // 同じURLでOK
  process.env.SUPABASE_SERVICE_ROLE!,      // こっちは機密
  { auth: { autoRefreshToken: false, persistSession: false } }
);
