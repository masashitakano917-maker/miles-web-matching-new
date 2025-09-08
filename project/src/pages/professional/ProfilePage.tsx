import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

type Profile = {
  id: string; name: string; email: string;
  phone?: string | null;
  postal?: string | null;
  prefecture?: string | null;
  city?: string | null;
  address2?: string | null;
  bio?: string | null;
  camera_gear?: string | null;
  labels?: string[] | null;
  updated_at?: string | null;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<Profile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/me/profile', {
          headers: { 'x-user-id': user.id },
          cache: 'no-store',
        });
        const j = await r.json();
        if (j?.ok) setData(j.profile);
        else setErr(j?.error || '読み込みに失敗しました');
      } catch {
        setErr('読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 lg:px-0 py-10">
        <h1 className="text-2xl font-bold mb-6">プロフィール</h1>
        {loading && <div className="rounded-xl bg-white border p-6">読み込み中…</div>}
        {!loading && err && <div className="rounded-xl bg-white border p-6">{err}</div>}
        {!loading && !err && data && (
          <div className="rounded-2xl bg-white border p-6 space-y-4">
            <div><div className="text-sm text-gray-500">氏名</div><div className="font-medium">{data.name}</div></div>
            <div><div className="text-sm text-gray-500">E-mail</div><div className="font-medium">{data.email}</div></div>
            <div><div className="text-sm text-gray-500">電話</div><div className="font-medium">{data.phone || '-'}</div></div>
            <div><div className="text-sm text-gray-500">住所</div>
              <div className="font-medium">{[data.prefecture, data.city, data.address2].filter(Boolean).join(' ') || '-'}</div>
            </div>
            <div><div className="text-sm text-gray-500">自己紹介</div><div className="font-medium whitespace-pre-wrap">{data.bio || '-'}</div></div>
            <div><div className="text-sm text-gray-500">機材</div><div className="font-medium whitespace-pre-wrap">{data.camera_gear || '-'}</div></div>
            <div><div className="text-sm text-gray-500">ラベル</div>
              <div className="flex flex-wrap gap-1">
                {(data.labels || []).map((l) => (
                  <span key={l} className="inline-block rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs">{l}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
