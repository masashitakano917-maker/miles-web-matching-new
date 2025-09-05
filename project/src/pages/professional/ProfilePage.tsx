import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

type Pro = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  postal: string | null;
  prefecture: string | null;
  city: string | null;
  address2: string | null;
  bio: string | null;
  labels: string[] | null;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [pro, setPro] = useState<Pro | null>(null);
  const [busy, setBusy] = useState(false);

  // 自分のレコード取得
  const load = async () => {
    const res = await fetch(`/api/me/profile`);
    const json = await res.json();
    if (json?.ok) setPro(json.item);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!pro) return;
    setBusy(true);
    const res = await fetch(`/api/me/profile/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pro),
    });
    const json = await res.json();
    setBusy(false);
    if (json?.ok) alert('保存しました');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-6">プロフィール</h1>
        {!pro ? (
          <div className="text-gray-500">読み込み中...</div>
        ) : (
          <div className="space-y-4">
            {/* 必要なフィールドを編集 */}
            <div>
              <label className="block text-sm font-medium">氏名</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2"
                     value={pro.name} onChange={(e) => setPro({ ...pro, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">電話</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2"
                     value={pro.phone || ''} onChange={(e) => setPro({ ...pro, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">都道府県</label>
                <input className="mt-1 w-full rounded-xl border px-3 py-2"
                       value={pro.prefecture || ''} onChange={(e) => setPro({ ...pro, prefecture: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">市区町村</label>
                <input className="mt-1 w-full rounded-xl border px-3 py-2"
                       value={pro.city || ''} onChange={(e) => setPro({ ...pro, city: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">それ以降</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2"
                     value={pro.address2 || ''} onChange={(e) => setPro({ ...pro, address2: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">自己紹介</label>
              <textarea rows={4} className="mt-1 w-full rounded-xl border px-3 py-2"
                        value={pro.bio || ''} onChange={(e) => setPro({ ...pro, bio: e.target.value })} />
            </div>

            <button onClick={save} disabled={busy} className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-3">
              {busy ? '保存中…' : '保存'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
