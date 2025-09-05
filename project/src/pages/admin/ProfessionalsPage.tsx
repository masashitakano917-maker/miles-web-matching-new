// src/pages/admin/ProfessionalsPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../components/Header';
import { Upload, UserPlus, FileSpreadsheet, Trash2, RefreshCw } from 'lucide-react';
import type { Professional } from '../../types/professional';
import { listProfessionals, createProfessional, upsertProfessionalsBulk, removeProfessional } from '../../api/professionals';

const labelOptions = [
  '不動産撮影',
  'Food撮影',
  'ポートレート',
  'ウェディング',
  '清掃',
  '人材派遣',
];

function csvToArray(text: string): string[][] {
  const rows: string[][] = [];
  let cell = ''; let row: string[] = []; let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQuote = false; }
      } else { cell += c; }
    } else {
      if (c === '"') { inQuote = true; }
      else if (c === ',') { row.push(cell.trim()); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (cell.length || row.length) { row.push(cell.trim()); rows.push(row); row = []; cell = ''; }
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else { cell += c; }
    }
  }
  if (cell.length || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows.filter(r => r.some(v => v !== ''));
}
const norm = (s: string) => s.replace(/\s+/g, '').replace(/-/g, '').toLowerCase();

export default function ProfessionalsPage() {
  const [items, setItems] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<Omit<Professional, 'id'>>({
    name: '',
    email: '',
    phone: '',
    postal: '',
    prefecture: '',
    city: '',
    address2: '',
    bio: '',
    labels: [],
  });

  const csvTemplate = useMemo(() => {
    const cols = [
      '氏名','email','phone','郵便番号','都道府県','市区町村','それ以降','自己紹介','ラベル（カンマ区切り）',
    ];
    return cols.join(',') + '\n山田太郎,taro@example.com,090-0000-0000,1500001,東京都,渋谷区,神宮前1-2-3,プロフィール文,"不動産撮影,ポートレート"';
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listProfessionals();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const addOne = async () => {
    if (!form.name || !form.email) {
      alert('氏名とEmailは必須です。'); return;
    }
    setLoading(true);
    try {
      const created = await createProfessional(form);
      setItems(prev => [created, ...prev]);
      setForm({ name: '', email: '', phone: '', postal: '', prefecture: '', city: '', address2: '', bio: '', labels: [] });
    } catch (e: any) {
      alert(e.message ?? '保存に失敗しました');
    } finally { setLoading(false); }
  };

  const parseCSV = (text: string): Omit<Professional,'id'>[] => {
    const rows = csvToArray(text);
    if (rows.length === 0) return [];
    const header = rows[0].map(norm);
    const idx = (k: string) => header.indexOf(norm(k));
    const get = (r: string[], k: string) => {
      const i = idx(k); return i >= 0 && r[i] != null ? r[i] : '';
    };
    const out: Omit<Professional,'id'>[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      out.push({
        name: get(r, '氏名') || get(r, 'name'),
        email: get(r, 'email'),
        phone: get(r, 'phone') || get(r, '電話番号'),
        postal: get(r, '郵便番号') || get(r, 'postal'),
        prefecture: get(r, '都道府県') || get(r, 'prefecture'),
        city: get(r, '市区町村') || get(r, 'city'),
        address2: get(r, 'それ以降') || get(r, 'address2'),
        bio: get(r, '自己紹介') || get(r, 'bio'),
        labels: (get(r, 'ラベル') || get(r, 'ラベル（カンマ区切り）') || get(r, 'labels'))
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      });
    }
    return out.filter(r => r.name && r.email);
  };

  const onCSV = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) { alert('CSVに有効な行がありません'); return; }
      const count = await upsertProfessionalsBulk(rows);
      await refresh();
      alert(`${count} 件登録しました`);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      alert(e.message ?? 'CSV取り込みに失敗しました');
    } finally { setLoading(false); }
  };

  const removeRow = async (id: string) => {
    if (!confirm('削除してよろしいですか？')) return;
    setLoading(true);
    try {
      await removeProfessional(id);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (e: any) {
      alert(e.message ?? '削除に失敗しました');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">プロフェッショナル管理</h1>
              <p className="text-gray-600 mt-2">
                登録/編集・一括CSVインポート、住所（郵便番号→住所）やプロフィール、ラベルなどを管理します。
              </p>
            </div>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              更新
            </button>
          </div>

          {/* CSVインポート */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-semibold">CSV一括登録</h2>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onCSV(f);
                }}
                className="block w-full md:w-auto text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => {
                  const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'professionals_template.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Upload className="w-4 h-4" />
                テンプレートをダウンロード
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              ヘッダー例：氏名,email,phone,郵便番号,都道府県,市区町村,それ以降,自己紹介,ラベル（カンマ区切り）
            </p>
          </section>

          {/* 手動登録 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-semibold">手動で1人ずつ登録</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">氏名*</label>
                <input className="w-full rounded-xl border px-3 py-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">email*</label>
                <input className="w-full rounded-xl border px-3 py-2" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">phone</label>
                <input className="w-full rounded-xl border px-3 py-2" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">郵便番号</label>
                <input className="w-full rounded-xl border px-3 py-2" placeholder="例: 1500001" value={form.postal} onChange={e => setForm({ ...form, postal: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">都道府県</label>
                <input className="w-full rounded-xl border px-3 py-2" value={form.prefecture} onChange={e => setForm({ ...form, prefecture: e.target.value })}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">市区町村</label>
                <input className="w-full rounded-xl border px-3 py-2" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">それ以降</label>
                <input className="w-full rounded-xl border px-3 py-2" value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })}/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">自己紹介</label>
                <textarea className="w-full rounded-xl border px-3 py-2" rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">ラベル選択（複数可）</label>
                <div className="flex flex-wrap gap-2">
                  {labelOptions.map(l => {
                    const active = form.labels.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() =>
                          setForm(s => ({
                            ...s,
                            labels: active ? s.labels.filter(x => x !== l) : [...s.labels, l],
                          }))
                        }
                        className={`px-3 py-1.5 rounded-full border text-sm ${active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white hover:bg-gray-50'}`}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={addOne} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60">
                追加する
              </button>
            </div>
          </section>

          {/* 登録済み一覧 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">登録済み</h2>
            {loading && <p className="text-gray-500">読み込み中...</p>}
            {!loading && items.length === 0 ? (
              <p className="text-gray-500">まだありません。CSVインポートか手動登録を行ってください。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">氏名</th>
                      <th className="py-2 pr-4">email</th>
                      <th className="py-2 pr-4">phone</th>
                      <th className="py-2 pr-4">郵便番号</th>
                      <th className="py-2 pr-4">住所</th>
                      <th className="py-2 pr-4">ラベル</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4">{p.email}</td>
                        <td className="py-2 pr-4">{p.phone}</td>
                        <td className="py-2 pr-4">{p.postal}</td>
                        <td className="py-2 pr-4">{`${p.prefecture ?? ''}${p.city ?? ''}${p.address2 ?? ''}`}</td>
                        <td className="py-2 pr-4">{(p.labels ?? []).join(', ')}</td>
                        <td className="py-2 pr-2">
                          <button onClick={() => removeRow(p.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-gray-50">
                            <Trash2 className="w-4 h-4" /> 削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
