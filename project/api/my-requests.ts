// project/api/my-requests.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

// [サービス] ... が note の先頭行に入っている想定なので、表示用タイトルを抽出
function extractPlanTitle(note?: string | null): string | null {
  if (!note) return null;
  const line = note.split('\n').find((l) => l.startsWith('[サービス]'));
  if (!line) return null;
  return line.replace(/^\[サービス\]\s*/, '').trim();
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'method not allowed' });
    }

    const email = String(req.query.client_email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ ok: false, error: 'client_email required' });
    }

    const { data, error } = await supabase
      .from('requests')
      .select('id, created_at, status, note')
      .eq('client_email', email)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const requests = (data || []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      status: r.status ?? 'pending',
      plan_title: extractPlanTitle(r.note),
      // 必要ならここに追加フィールドを載せる
    }));

    return res.status(200).json({ ok: true, requests });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? 'server error' });
  }
}
