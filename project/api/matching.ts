// project/api/matching.ts
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

async function geocode(address: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}&language=ja`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.status !== 'OK' || !j.results?.length) {
    throw new Error(`geocoding failed: ${j.status || 'UNKNOWN'}`);
  }
  const loc = j.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

export default async function handler(req, res) {
  try {
    const action = String(req.query.action || '').toLowerCase();

    if (action === 'create_request' && req.method === 'POST') {
      const {
        client_name,
        client_email,
        client_phone,
        address,
        note,
        service,   // 例: 'photo' | 'clean' | 'staff'（任意）
        plan_key,  // 例: '20' | '1ldk' など（任意）
      } = req.body || {};

      if (!client_name || !client_email || !address) {
        return res.status(400).json({ ok: false, error: 'missing fields' });
      }

      // 1) 住所→緯度経度
      const { lat, lng } = await geocode(address);

      // 2) 依頼保存（radius_km は使わない）
      const { data: created, error: iErr } = await supabase
        .from('requests')
        .insert([{
          client_name,
          client_email,
          client_phone: client_phone || null,
          address,
          note: note || null,
          lat, lng,
          status: 'pending',
        }])
        .select('id')
        .single();

      if (iErr) throw iErr;

      // 3) 近隣プロ（80km固定）
      let pros: any[] = [];
      try {
        const { data: nearby, error: nErr } = await supabase.rpc('find_nearby_pros', {
          lat, lng, radius_km: 80,
        });
        if (nErr) throw nErr;
        pros = nearby || [];
      } catch { pros = []; }

      // 3.5) ラベル要件（service & plan_key が送られていれば絞り込み）
      if (service && plan_key && pros.length) {
        const { data: reqLabels } = await supabase
          .from('plan_requirements')
          .select('required_labels')
          .eq('service', service)
          .eq('plan_key', plan_key)
          .single();

        if (reqLabels?.required_labels?.length) {
          pros = pros.filter((p: any) =>
            Array.isArray(p.labels) &&
            reqLabels.required_labels.every((lbl: string) => p.labels.includes(lbl))
          );
        }
      }

      // 4) メール通知（Resend は任意・失敗しても API は成功にする）
      try {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.MAIL_FROM || 'noreply@example.com';
        if (apiKey && pros.length) {
          const toList = pros.map((p: any) => p.email).filter(Boolean).slice(0, 20);
          if (toList.length) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from,
                to: toList,
                subject: 'Miles に新しい依頼が届きました',
                text: `住所: ${address}\n依頼者: ${client_name} (${client_email})\n\n${note || ''}\n\n※このメールに返信しないでください。`,
              }),
            });
          }
        }
      } catch {}

      return res.status(200).json({ ok: true, request_id: created.id, matched: pros.length });
    }

    return res.status(400).json({ ok: false, error: 'unknown action' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
