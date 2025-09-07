// project/src/pages/professional/ProfilePage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

type ProRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  postal: string | null;
  prefecture: string | null;
  city: string | null;
  address2: string | null;
  bio: string | null;
  camera_gear: string | null;
  labels: string[] | null;
  updated_at?: string | null;
};

const PREFS = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
];

function formatPostal(v: string) {
  const d = (v || '').replace(/\D/g, '').slice(0, 7);
  if (d.length < 4) return d;
  return `${d.slice(0, 3)}-${d.slice(3)}`;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [row, setRow] = useState<ProRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSave = useMemo(() => !!row && !!row.name && !!row.email, [row]);

  async function load() {
    if (!user) return;
    // user_id で紐づく 1レコードを取得
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setMsg('読み込みに失敗しました');
      return;
    }
    if (data) {
      // postal は常に「123-4567」表示
      data.postal = formatPostal(data.postal || '');
      setRow(data as ProRow);
    } else {
      setMsg('プロフィールが未登録です。管理者にご連絡ください。');
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  // 郵便番号入力 → 7桁揃ったら住所自動補完
  async function onPostalBlur() {
    if (!row) return;
    const digits = (row.postal || '').replace(/\D/g, '');
    const formatted = formatPostal(row.postal || '');
    setRow({ ...row, postal: formatted });

    if (digits.length !== 7) return;
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`
      );
      const json = await res.json();
      if (json?.results?.[0]) {
        const r = json.results[0];
        setRow((prev) =>
          prev
            ? { ...prev, prefecture: r.address1 || prev.prefecture, city: `${r.address2 ?? ''}${r.address3 ?? ''}` || prev.city }
            : prev
        );
      }
    } catch (e) {
      console.warn('zip lookup failed', e);
    }
  }

  async function onSave() {
    if (!row) return;
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        name: row.name,
        phone: row.phone,
        email: row.email, // 表示と整合のためそのまま
        postal: row.postal ? formatPostal(row.postal) : null,
        prefecture: row.prefecture,
        city: row.city,
        address2: row.address2,
        bio: row.bio,
        camera_gear: row.camera_gear,
        // labels は本人編集不可（Admin 管理）
      };

      const { error } = await supabase
        .from('professionals')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', row.id);

      if (error) throw error;
      setMsg('保存しました');
    } catch (e: any) {
      console.error(e);
      setMsg('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">プロフィール</h1>

        {!row ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-gray-600">{msg ?? '読み込み中...'}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
            {/* 基本情報 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                <input
                  value={row.name || ''}
                  onChange={(e) => setRow({ ...row, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">email</label>
                <input
                  value={row.email || ''}
                  onChange={(e) => setRow({ ...row, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">phone</label>
                <input
                  value={row.phone || ''}
                  onChange={(e) => setRow({ ...row, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="090-xxxx-xxxx"
                />
              </div>
            </div>

            {/* 住所 */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label>
                <input
                  value={row.postal || ''}
                  onChange={(e) => setRow({ ...row, postal: e.target.value })}
                  onBlur={onPostalBlur}
                  placeholder="123-4567"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
                <select
                  value={row.prefecture || ''}
                  onChange={(e) => setRow({ ...row, prefecture: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value=""></option>
                  {PREFS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">市区町村</label>
                <input
                  value={row.city || ''}
                  onChange={(e) => setRow({ ...row, city: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">それ以降</label>
              <input
                value={row.address2 || ''}
                onChange={(e) => setRow({ ...row, address2: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="建物名・部屋番号など"
              />
            </div>

            {/* 自己紹介・機材 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
                <textarea
                  value={row.bio || ''}
                  onChange={(e) => setRow({ ...row, bio: e.target.value })}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カメラ機材</label>
                <textarea
                  value={row.camera_gear || ''}
                  onChange={(e) => setRow({ ...row, camera_gear: e.target.value })}
                  rows={5}
                  placeholder="ボディ・レンズ・照明など"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            {/* ラベル（閲覧のみ） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ラベル（Admin管理）</label>
              <div className="flex flex-wrap gap-2">
                {(row.labels || []).length === 0 ? (
                  <span className="text-gray-500">未設定</span>
                ) : (
                  (row.labels || []).map((l) => (
                    <span
                      key={l}
                      className="inline-block rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 text-xs"
                    >
                      {l}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* アクション */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSave}
                disabled={!canSave || saving}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 text-white px-4 py-2 font-semibold hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
              {row?.id && (
                <Link
                  to={`/pro/${row.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50"
                  target="_blank"
                >
                  公開ページを見る
                </Link>
              )}
              {msg && <span className="text-sm text-gray-600">{msg}</span>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
