// project/src/pages/admin/AdminOrdersPage.tsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';

type Row = {
  id: string;
  created_at?: string;
  client_name?: string;
  client_email?: string;
  address?: string;
  plan_title?: string;
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch('/api/admin/orders');
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || 'failed');
        setRows(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        setErr(e?.message ?? '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const fmt = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">依頼一覧（Admin）</h1>
          <Link to="/admin" className="text-gray-600 hover:underline">Adminトップへ</Link>
        </div>

        {loading && <div className="text-gray-600">読み込み中…</div>}
        {err && <div className="text-red-600">エラー: {err}</div>}

        {!loading && !err && (
          rows.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">まだ依頼はありません。</div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="p-3">受付日時</th>
                    <th className="p-3">プラン</th>
                    <th className="p-3">依頼者</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">住所</th>
                    <th className="p-3">詳細</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="p-3 whitespace-nowrap">{fmt(r.created_at)}</td>
                      <td className="p-3">{r.plan_title || '-'}</td>
                      <td className="p-3">{r.client_name || '-'}</td>
                      <td className="p-3">{r.client_email || '-'}</td>
                      <td className="p-3">{r.address || '-'}</td>
                      <td className="p-3">
                        <Link to={`/request/${r.id}`} className="text-blue-600 hover:underline">詳細</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>
    </div>
  );
}
