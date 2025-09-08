import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type Pro = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
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
  const [row, setRow] = useState<Pro | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setErr(null);
      try {
        // まず user_id で検索
        let { data, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // 見つからない/エラーなら email でフォールバック
        if (error || !data) {
          const { data: list, error: e2 } = await supabase
            .from('professionals')
            .select('*')
            .eq('email', user.email!)
            .order('updated_at', { ascending: false })
            .limit(1);
          if (e2) throw e2;
          data = (list && list[0]) || null;
        }

        if (!data) throw new Error('not found');
        setRow(data as Pro);
      } catch (e: any) {
        setErr(e?.message || '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">プロフィール</h1>

        {loading && <div className="card p-6">読み込み中…</div>}
        {!loading && err && <div className="card p-6">読み込みに失敗しました</div>}

        {!loading && row && (
          <div className="card p-6 space-y-4">
            <div><b>氏名</b><div>{row.name}</div></div>
            <div><b>E-mail</b><div>{row.email}</div></div>
            <div><b>電話</b><div>{row.phone || '-'}</div></div>
            <div><b>住所</b><div>{[row.prefecture, row.city, row.address2].filter(Boolean).join(' ') || '-'}</div></div>
            <div><b>自己紹介</b><div className="whitespace-pre-wrap">{row.bio || '-'}</div></div>
            <div><b>機材</b><div className="whitespace-pre-wrap">{row.camera_gear || '-'}</div></div>
            <div>
              <b>ラベル</b>
              <div className="flex flex-wrap gap-1 mt-1">
                {(row.labels || []).map((l) => (
                  <span key={l} className="inline-block rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs">{l}</span>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              最終更新: {row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
