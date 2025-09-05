// project/src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';

type Professional = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  prefecture: string | null;
  city: string | null;
  labels: string[] | null;
};

const LABEL_OPTIONS = [
  'real_estate',
  'food',
  'portrait',
  'wedding',
  'event',
  'product',
  'interview',
  'video',
];

const PREFS = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
];

export default function AdminDashboard() {
  const [name, setName] = useState('');
  const [label, setLabel] = useState<string>('');
  const [pref, setPref] = useState<string>('');
  const [rows, setRows] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (name.trim()) params.set('name', name.trim());
      if (label) params.set('label', label);
      if (pref) params.set('prefecture', pref);
      const res = await fetch('/api/admin/professionals/list?' + params.toString());
      const json = await res.json();
      setRows(json.data ?? []);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-6">Admin</h1>

        {/* 検索フォーム */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="font-semibold mb-4">プロフェッショナル検索</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">名前で検索</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="氏名の一部で検索"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ラベル</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              >
                <option value="">すべて</option>
                {LABEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">都道府県</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={pref}
                onChange={(e) => setPref(e.target.value)}
              >
                <option value="">すべて</option>
                {PREFS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={runSearch}
              className="px-5 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              検索
            </button>
          </div>
        </section>

        {/* 結果リスト */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">検索結果</h2>
          {loading ? (
            <div className="text-gray-500">読み込み中…</div>
          ) : rows.length === 0 ? (
            <div className="text-gray-500">該当なし</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">氏名</th>
                    <th className="py-2 pr-4">email</th>
                    <th className="py-2 pr-4">電話</th>
                    <th className="py-2 pr-4">都道府県</th>
                    <th className="py-2 pr-4">市区町村</th>
                    <th className="py-2 pr-4">ラベル</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{r.name}</td>
                      <td className="py-2 pr-4">{r.email}</td>
                      <td className="py-2 pr-4">{r.phone ?? '-'}</td>
                      <td className="py-2 pr-4">{r.prefecture ?? '-'}</td>
                      <td className="py-2 pr-4">{r.city ?? '-'}</td>
                      <td className="py-2 pr-4">
                        {(r.labels ?? []).length ? (r.labels ?? []).join(', ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
