// project/src/pages/admin/ProfessionalsListPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';

type Pro = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  postal?: string | null;
  prefecture?: string | null;
  city?: string | null;
  labels?: string[] | null;
  updated_at?: string | null;
};

const LABEL_OPTIONS = [
  'real_estate', 'food', 'portrait', 'wedding', 'event', 'product', 'interview',
  'sports', 'architecture', 'fashion', 'travel', 'drone', 'video'
];

const PREFS = [
  'すべて', '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
];

export default function ProfessionalsListPage() {
  const [q, setQ] = useState('');
  const [label, setLabel] = useState<'すべて' | string>('すべて');
  const [pref, setPref] = useState<'すべて' | string>('すべて');

  const [rows, setRows] = useState<Pro[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (label !== 'すべて') p.set('label', label);
    if (pref !== 'すべて') p.set('prefecture', pref);
    p.set('page', String(page));
    p.set('pageSize', String(pageSize));
    return p.toString();
  }, [q, label, pref, page]);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/professionals/list?${qs}`);
      const data = await res.json();
      if (data?.ok) {
        setRows(data.items || []);
        setTotal(data.total || 0);
      } else {
        setRows([]);
        setTotal(0);
      }
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">プロフェッショナル一覧</h1>

        {/* フィルタ */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">氏名で検索</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="氏名の一部で検索"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ラベル</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option>すべて</option>
                {LABEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
              <select
                value={pref}
                onChange={(e) => setPref(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {PREFS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => { setPage(1); fetchList(); }}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 text-white px-4 py-2 font-semibold hover:bg-orange-700 transition"
            >
              検索
            </button>
            <button
              onClick={() => { setQ(''); setLabel('すべて'); setPref('すべて'); setPage(1); }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 hover:bg-gray-50 transition"
            >
              クリア
            </button>
          </div>
        </div>

        {/* テーブル */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">氏名</th>
                  <th className="px-4 py-3 text-left">E-mail</th>
                  <th className="px-4 py-3 text-left">電話</th>
                  <th className="px-4 py-3 text-left">住所</th>
                  <th className="px-4 py-3 text-left">ラベル</th>
                  <th className="px-4 py-3 text-left">更新</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">読み込み中...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">該当なし</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">{r.phone || '-'}</td>
                      <td className="px-4 py-3">
                        {[r.prefecture, r.city].filter(Boolean).join(' ')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(r.labels || []).map((l) => (
                            <span key={l} className="inline-block rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs">
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/professionals`}
                          className="text-orange-600 hover:underline"
                        >
                          編集
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {total}件中 {(rows.length ? (page - 1) * pageSize + 1 : 0)}–
              {(page * pageSize > total ? total : page * pageSize)} を表示
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-50"
              >
                前へ
              </button>
              <span className="text-sm text-gray-700 px-2 py-1.5">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
