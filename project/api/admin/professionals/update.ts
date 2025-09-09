// project/api/admin/professionals/update.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

type Body = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  postal?: string;
  prefecture?: string;
  city?: string;
  address2?: string;
  bio?: string;
  camera_gear?: string;
  labels?: string[];
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    const b: Body = req.body || {};
    if (!b.id) return res.status(400).json({ ok: false, error: 'id required' });

    // 直前状態を取得（住所変更検出＆既存lat/lng保持のため）
    const { data: before, error: be } = await supabase
      .from('professionals')
      .select('postal,prefecture,city,address2,lat,lng')
      .eq('id', b.id)
      .single();
    if (be || !before) return res.status(404).json({ ok: false, error: 'not found' });

    const postal7 = (b.postal ?? before.postal ?? '').replace(/\D/g, '').slice(0, 7);
    const addr = [
      postal7 && postal7.length === 7 ? `${postal7}` : '',
      (b.prefecture ?? before.prefecture) || '',
      (b.city ?? before.city) || '',
      (b.address2 ?? before.address2) || '',
    ].filter(Boolean).join(' ');

    // 住所に変化がある or lat/lngが未設定なら再ジオコード
    const addressChanged =
      (b.postal ?? '') !== undefined ||
      (b.prefecture ?? '') !== undefined ||
      (b.city ?? '') !== undefined ||
      (b.address2 ?? '') !== undefined;

    let newLat = before.lat;
    let newLng = before.lng;

    if (addressChanged || before.lat == null || before.lng == null) {
      try {
        const pos = await geocode(addr);
        newLat = pos.lat;
        newLng = pos.lng;
      } catch (e) {
        // 失敗しても既存座標は維持（住所ミス時の救済）
      }
    }

    const { data, error } = await supabase
      .from('professionals')
      .update({
        name: b.name?.trim(),
        email: b.email?.trim(),
        phone: b.phone?.trim(),
        postal: postal7 ? (postal7.slice(0,3) + '-' + postal7.slice(3)) : null,
        prefecture: b.prefecture,
        city: b.city,
        address2: b.address2,
        bio: b.bio,
        camera_gear: b.camera_gear,
        labels: Array.isArray(b.labels) ? b.labels : undefined,
        lat: newLat,
        lng: newLng,
      })
      .eq('id', b.id)
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
