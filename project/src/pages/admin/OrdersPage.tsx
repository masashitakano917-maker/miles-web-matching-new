import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';

type Order = {
  id: string;
  customer_name: string | null;
  service: string | null;
  prefecture: string | null;
  city: string | null;
  status: string | null;
  scheduled_at: string | null;
  created_at: string | null;
};

export default function OrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, service, prefecture, city, status, scheduled_at, created_at')
        .order('created_at', { ascending: false });
      if (!error && data) setRows(data as Order[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 lg:px-0 py-10">
        <h1 className="text-2xl font-bold mb-6">依頼管理</h1>

        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">作成</th>
                <th className="px-4 py-3 text-left">依頼者</th>
                <th className="px-4 py-3 text-left">サービス</th>
                <th className="px-4 py-3 text-left">地域</th>
                <th className="px-4 py-3 text-left">予約</th>
                <th className="px-4 py-3 text-left">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center" colSpan={6}>
                    読み込み中…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    依頼はありません
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{new Date(r.created_at!).toLocaleString()}</td>
                    <td className="px-4 py-3">{r.customer_name}</td>
                    <td className="px-4 py-3">{r.service}</td>
                    <td className="px-4 py-3">
                      {r.prefecture} {r.city}
                    </td>
                    <td className="px-4 py-3">
                      {r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
