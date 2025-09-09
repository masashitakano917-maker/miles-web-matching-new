// project/src/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Camera } from 'lucide-react';

type MyItem = {
  id: string;
  created_at?: string;
  plan_title?: string;
  status?: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isPro = user?.role === 'professional';

  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isPro) return;
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);
        const q = new URLSearchParams({ client_email: user.email || '' });
        const res = await fetch(`/api/my-requests?${q.toString()}`);
        const json = await res.json();
        if (!res.ok || !json?.ok) throw new Error(json?.error || 'failed');
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        setErr(e?.message ?? '読み込みに失敗しました');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user, isPro]);

  const fmt = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const hasCustomer = useMemo(() => !!user && !isPro, [user, isPro]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {isPro ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/professional/profile"
              className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">プロフィール</h2>
                  <p className="text-gray-600 mt-1">Adminが登録したあなたの情報を確認・更新できます。</p>
                </div>
              </div>
            </Link>

            <Link
              to="/professional/jobs"
              className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">撮影・案件一覧</h2>
                  <p className="text-gray-600 mt-1">自分にアサインされた案件を確認できます。</p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
              <p className="text-gray-700">ようこそ、{user?.email} さん</p>
              <p className="text-gray-500 mt-1">ロール: {user?.role ?? '-'}</p>

              <Link
                to="/services?tab=photo"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-4 py-2 mt-4 hover:opacity-90"
              >
                新規発注
              </Link>
            </div>

            {hasCustomer && (
              <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">あなたの依頼一覧</h2>
                </div>

                {loading && <div className="text-gray-600">読み込み中…</div>}
                {err && <div className="text-red-600 text-sm">読み込みエラー: {err}</div>}

                {!loading && !err && (
                  items.length === 0 ? (
                    <p className="text-gray-600">まだ依頼はありません。</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {items.map((r) => (
                        <li key={r.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{r.plan_title || '（プラン名 未設定）'}</div>
                            <div className="text-sm text-gray-500 mt-1">受付日時：{fmt(r.created_at)}</div>
                          </div>
                          <Link
                            to={`/request/${r.id}`}
                            className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                          >
                            詳細
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
