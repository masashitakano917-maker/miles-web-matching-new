// project/api/admin/professionals/create.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

type Body = {
  name: string;
  email: string;
  phone?: string;
  initPassword?: string;
  postal?: string;
  prefecture?: string;
  city?: string;
  address2?: string;
  bio?: string;
  camera_gear?: string;
  labels?: string[]; // ["real_estate","food",...]
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    const b: Body = req.body || {};

    if (!b.name?.trim() || !b.email?.trim()) {
      return res.status(400).json({ ok: false, error: 'name, email are required' });
    }

    // 住所文字列を作成（郵便番号→都道府県→市区町村→以降）
    const postal7 = (b.postal || '').replace(/\D/g, '').slice(0, 7);
    const addr = [
      postal7 && postal7.length === 7 ? `${postal7}` : '',
      b.prefecture || '',
      b.city || '',
      b.address2 || '',
    ].filter(Boolean).join(' ');

    // Google Geocoding
    const { lat, lng } = await geocode(addr);

    const { data, error } = await supabase
      .from('professionals')
      .insert([{
        name: b.name.trim(),
        email: b.email.trim(),
        phone: (b.phone || '').trim() || null,
        postal: postal7 ? (postal7.slice(0,3) + '-' + postal7.slice(3)) : null,
        prefecture: (b.prefecture || '').trim() || null,
        city: (b.city || '').trim() || null,
        address2: (b.address2 || '').trim() || null,
        bio: (b.bio || '') || null,
        camera_gear: (b.camera_gear || '') || null,
        labels: Array.isArray(b.labels) ? b.labels : null,
        // 自動付与
        lat,
        lng,
        // 初期パスワードなど別管理ならここで処理
      }])
      .select('*')
      .single();

    if (error) throw error;
    return res.status(200).json({ ok: true, item: data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal_error' });
  }
}

async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  if (!address) throw new Error('address required for geocoding');
  const key = process.env.GOOGLE_MAPS_API_KEY!;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=ja&key=${key}`;
  const r = await fetch(url);
  const j: any = await r.json();
  if (j.status !== 'OK' || !j.results?.[0]) {
    throw new Error(`Geocoding failed: ${j.status}`);
  }
  const { lat, lng } = j.results[0].geometry.location;
  return { lat, lng };
}
