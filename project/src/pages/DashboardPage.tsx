// project/src/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Camera } from 'lucide-react';

type MyRequest = {
  id: string;
  created_at?: string;
  status?: string;        // 例: 'pending' | 'matched' | 'cancelled' など
  service?: string;       // 'photo' | 'clean' | 'staff' 等
  plan_key?: string;      // '20' | '30' | '1ldk' … 等
  plan_title?: string;    // 表示用タイトルがあれば利用
  note?: string;
  // ほか DB 由来の任意フィールドが来ても any で吸収
  [k: string]: any;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isPro = user?.role === 'professional';

  // ------- 顧客の依頼一覧（最小版） -------
  const [reqs, setReqs] = useState<MyRequest[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isPro) return; // プロは読み込まない
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);
        // API 側に用意してある想定の一覧取得アクション
        const res = await fetch('/api/matching?action=list_my_requests');
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || 'failed to load');
        }
        setReqs(Array.isArray(json.requests) ? json.requests : []);
      } catch (e: any) {
        setErr(e?.message ?? '読み込みに失敗しました');
        setReqs([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user, isPro]);

  const fmt = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const planLabel = (r: MyRequest) => {
    if (r.plan_title) return r.plan_title;
    // ざっくりフォールバック（表示用）
    const sv = r.service ?? '';
    const key = r.plan_key ? ` / ${r.plan_key}` : '';
    return `${sv}${key}`;
  };

  const statusBadge = (s?: string) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
    switch ((s || '').toLowerCase()) {
      case 'matched':
        return <span className={`${base} bg-green-100 text-green-700`}>マッチング中</span>;
      case 'cancelled':
      case 'canceled':
        return <span className={`${base} bg-gray-100 text-gray-600`}>キャンセル</span>;
      case 'done':
      case 'completed':
        return <span className={`${base} bg-blue-100 text-blue-700`}>完了</span>;
      default:
        return <span className={`${base} bg-orange-100 text-orange-700`}>受付中</span>;
    }
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
                  <p className="text-gray-600 mt-1">
                    Adminが登録したあなたの情報を確認・更新できます（ラベルは閲覧のみ）。
                  </p>
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
                  <p className="text-gray-600 mt-1">自分にアサインされた案件の一覧を確認できます。</p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 顧客のウェルカムと新規発注 */}
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

            {/* 顧客：自分の依頼一覧（最小版） */}
            {hasCustomer && (
              <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">あなたの依頼一覧</h2>
                </div>

                {loading && <div className="text-gray-600">読み込み中…</div>}
                {err && <div className="text-red-600 text-sm">読み込みエラー: {err}</div>}

                {!loading && !err && (
                  <>
                    {(!reqs || reqs.length === 0) ? (
                      <p className="text-gray-600">まだ依頼はありません。</p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {reqs.map((r) => (
                          <li key={r.id} className="py-4 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900 truncate">
                                  {planLabel(r)}
                                </span>
                                {statusBadge(r.status)}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                受付日時：{fmt(r.created_at)}
                              </div>
                            </div>
                            {/* 詳細ページは別タスク想定。リンク先は後で差し替え */}
                            <button
                              type="button"
                              className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                              disabled
                              title="詳細画面は準備中です"
                            >
                              詳細
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
