// project/api/requests/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const RADIUS_KM = 50;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const { client_name, client_email, address, note } = req.body || {};
    if (!client_name || !client_email || !address) {
      return res.status(400).json({ ok: false, error: 'client_name, client_email, address are required' });
    }

    const { lat, lng } = await geocode(address);

    // 1) requests に保存
    const { data: request, error: reqErr } = await supabase
      .from('requests')
      .insert([{ client_name, client_email, address, lat, lng, note }])
      .select('*')
      .single();

    if (reqErr) throw reqErr;

    // 2) 最初の候補に通知を開始
    await fetch(`${process.env.APP_BASE_URL}/api/match/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: request.id, radius_km: RADIUS_KM }),
    });

    return res.status(200).json({ ok: true, request });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal_error' });
  }
}

async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  const key = process.env.GOOGLE_MAPS_API_KEY!;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  const r = await fetch(url);
  const j: any = await r.json();
  if (j.status !== 'OK' || !j.results?.[0]) {
    throw new Error(`Geocoding failed: ${j.status}`);
  }
  const { lat, lng } = j.results[0].geometry.location;
  return { lat, lng };
}
