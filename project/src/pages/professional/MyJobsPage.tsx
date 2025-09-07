// project/src/pages/professional/MyJobsPage.tsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ProRow = { id: string };
type OrderRow = {
  id: string;
  title: string | null;
  status: string | null;
  scheduled_at: string | null;
  created_at: string | null;
};

export default function MyJobsPage() {
  const { user } = useAuth();
  const [proId, setProId] = useState<string | null>(null);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!user) return;
      // 自分の professional.id を取得
      const { data: pro, error: e1 } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle<ProRow>();

      if (e1 || !pro) {
        setLoading(false);
        return;
      }
      setProId(pro.id);

      // 自分の案件一覧
      const { data, error } = await supabase
        .from('orders') // 存在しない場合は空扱い
        .select('id,title,status,scheduled_at,created_at')
        .eq('professional_id', pro.id)
        .order('created_at', { ascending: false });

      if (!error && data) setRows(data as OrderRow[]);
      setLoading(false);
    }
    run();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">撮影・案件一覧</h1>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">案件名</th>
                  <th className="px-4 py-3 text-left">ステータス</th>
                  <th className="px-4 py-3 text-left">撮影予定日</th>
                  <th className="px-4 py-3 text-left">作成日</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">読み込み中...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">まだ案件がありません。</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{r.title ?? '-'}</td>
                      <td className="px-4 py-3">{r.status ?? '-'}</td>
                      <td className="px-4 py-3">{r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : '-'}</td>
                      <td className="px-4 py-3">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!proId && (
          <p className="text-sm text-gray-500 mt-4">
            プロフィールが未登録のようです。管理者にご連絡ください。
          </p>
        )}
      </main>
    </div>
  );
}
