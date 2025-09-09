// project/api/my-requests.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// [サービス] ... の行から表示用タイトルを抽出
function extractPlanTitle(note?: string | null): string | null {
  if (!note) return null;
  const line = note.split('\n').find((l) => l.startsWith('[サービス]'));
  return line ? line.replace(/^\[サービス\]\s*/, '').trim() : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'method not allowed' });
    }

    const client_email = String(req.query.client_email || '').trim().toLowerCase();
    const id = (req.query.id ? String(req.query.id) : '').trim();

    if (!client_email) {
      return res.status(400).json({ ok: false, error: 'client_email required' });
    }

    // ---- 詳細（id指定）----
    if (id) {
      // requests 優先で取り、無ければ orders をフォールバック
      const r1 = await sb
        .from('requests')
        .select('id,created_at,status,note,address,client_name,client_email,client_phone')
        .eq('id', id)
        .maybeSingle();

      let row = r1.data;
      if (!row) {
        const r2 = await sb
          .from('orders')
          .select('id,created_at,note,address,client_name,client_email')
          .eq('id', id)
          .maybeSingle();
        row = r2.data as any;
      }
      if (!row) return res.status(404).json({ ok: false, error: 'not found' });
      if ((row.client_email || '').toLowerCase() !== client_email) {
        return res.status(403).json({ ok: false, error: 'forbidden' });
      }

      return res.status(200).json({
        ok: true,
        request: {
          ...row,
          plan_title: extractPlanTitle(row.note),
          status: row.status || 'pending',
        },
      });
    }

    // ---- 一覧（orders を参照）----
    const { data, error } = await sb
      .from('orders')
      .select('id, created_at, note, address, client_email')
      .eq('client_email', client_email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const items = (data || []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      plan_title: extractPlanTitle(r.note) || '（プラン不明）',
      address: r.address || '',
      status: 'pending',
    }));

    return res.status(200).json({ ok: true, items });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
