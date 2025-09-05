import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import { Upload, UserPlus, Save, Loader2, Search, Pencil, Trash2, KeyRound } from 'lucide-react';

type Form = {
  name: string;
  email: string;
  password: string;
  phone: string;
  postal: string;
  prefecture: string;
  city: string;
  address2: string;
  bio: string;
  labels: string[];
};

type Pro = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  postal: string | null;
  prefecture: string | null;
  city: string | null;
  address2: string | null;
  bio: string | null;
  labels: string[] | null;
  created_at: string;
};

const emptyForm: Form = {
  name: '',
  email: '',
  password: '',
  phone: '',
  postal: '',
  prefecture: '',
  city: '',
  address2: '',
  bio: '',
  labels: [],
};

export default function ProfessionalsPage() {
  const [form, setForm] = useState<Form>(emptyForm);
  const [csvBusy, setCsvBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const [items, setItems] = useState<Pro[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [pref, setPref] = useState('');
  const [label, setLabel] = useState('');
  const [page, setPage] = useState(1);
  const size = 20;

  const labelInput = useMemo(() => form.labels.join(','), [form.labels]);

  // 郵便番号→住所 自動補完
  const autofilAddress = async () => {
    const z = (form.postal || '').replace(/\D/g, '');
    if (z.length !== 7) return;
    try {
      const r = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${z}`);
      const j = await r.json();
      const d = j?.results?.[0];
      if (d) {
        setForm((v) => ({
          ...v,
          prefecture: d.address1 || v.prefecture,
          city: `${d.address2 || ''}${d.address3 || ''}` || v.city,
        }));
      }
    } catch {}
  };

  // ---- 作成（保存）
  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) {
      alert('氏名・メール・パスワードは必須です。');
      return;
    }
    setSaveBusy(true);
    try {
      const res = await fetch('/api/admin/professionals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || '登録に失敗しました');
      alert('登録が完了しました（招待メール送信済み）');
      setForm(emptyForm);
      load();
    } catch (e: any) {
      alert(e.message || 'エラーが発生しました');
    } finally {
      setSaveBusy(false);
    }
  };

  // ---- CSV一括登録
  const handleCsv = async (file?: File | null) => {
    if (!file) return;
    setCsvBusy(true);
    try {
      const text = await file.text();
      const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (rows.length < 2) {
        alert('CSVにデータがありません');
        return;
      }
      const header = rows[0].split(',').map((h) => h.trim());
      const idx = (k: string) => header.findIndex((h) => h.toLowerCase() === k);

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        const payload: Form = {
          name: cols[idx('name')] || '',
          email: cols[idx('email')] || '',
          phone: cols[idx('phone')] || '',
          postal: cols[idx('postal')] || '',
          prefecture: cols[idx('prefecture')] || '',
          city: cols[idx('city')] || '',
          address2: cols[idx('address2')] || '',
          bio: cols[idx('bio')] || '',
          labels: (cols[idx('labels')] || '').split('|').map((s) => s.trim()).filter(Boolean),
          password: cols[idx('password')] || '',
        };
        if (!payload.name || !payload.email || !payload.password) continue;

        const r = await fetch('/api/admin/professionals/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!r.ok) console.warn('CSV 1行失敗:', rows[i]);
      }
      alert('CSV一括登録を完了しました');
      load();
    } catch (e: any) {
      alert(e.message || 'CSV取り込みに失敗しました');
    } finally {
      setCsvBusy(false);
    }
  };

  // ---- 一覧ロード
  const load = async (p = page) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (pref) params.set('pref', pref);
    if (label) params.set('label', label);
    params.set('page', String(p));
    params.set('size', String(size));

    const res = await fetch(`/api/admin/professionals/list?${params.toString()}`);
    const json = await res.json();
    if (json?.ok) {
      setItems(json.items || []);
      setTotal(json.total || 0);
      setPage(json.page || 1);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 行の編集（名前だけ例。必要に応じてUI拡張）
  const updateName = async (row: Pro, newName: string) => {
    const res = await fetch('/api/admin/professionals/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, name: newName }),
    });
    const json = await res.json();
    if (json?.ok) load();
  };

  const deleteRow = async (row: Pro) => {
    if (!confirm(`削除しますか？\n${row.name} (${row.email})`)) return;
    const res = await fetch('/api/admin/professionals/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id }),
    });
    const json = await res.json();
    if (json?.ok) load();
  };

  const resetPassword = async (row: Pro) => {
    if (!confirm(`パスワード再設定リンクをメール送信しますか？\n${row.email}`)) return;
    const res = await fetch('/api/admin/professionals/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: row.email }),
    });
    const json = await res.json();
    if (json?.ok) alert('送信しました');
  };

  // UI ここから
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">プロフェッショナル管理</h1>
        <p className="text-gray-500 mb-8">
          登録/編集・一括CSVインポート、住所（郵便番号→住所）やプロフィール、ラベルなどを管理します。
        </p>

        {/* CSV */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-gray-900">CSV一括登録</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={(e) => handleCsv(e.target.files?.[0])} />
              {csvBusy ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> 読み込み中...</span> : 'ファイルを選択'}
            </label>
            <button
              onClick={() => {
                const header = 'name,email,phone,postal,prefecture,city,address2,bio,labels,password\n';
                const blob = new Blob([header], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'professionals_template.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50"
            >
              テンプレートをダウンロード
            </button>
            <p className="text-sm text-gray-500">ラベルは <code>food|wedding</code> のように | 区切り。パスワード列は初期パス。</p>
          </div>
        </section>

        {/* 単体登録 */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-gray-900">手動で1人ずつ登録</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 左右入力群（前回と同じ） */}
            <div>
              <label className="block text-sm font-medium text-gray-700">氏名 *</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">email *</label>
              <input type="email" className="mt-1 w-full rounded-xl border px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">初期パスワード *</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">phone</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">郵便番号</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.postal} onBlur={autofilAddress} onChange={(e) => setForm({ ...form, postal: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">都道府県</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.prefecture} onChange={(e) => setForm({ ...form, prefecture: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">市区町村</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">それ以降</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">自己紹介</label>
              <textarea rows={4} className="mt-1 w-full rounded-xl border px-3 py-2" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">ラベル（カンマ区切り）</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={labelInput} onChange={(e) => setForm({ ...form, labels: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button onClick={handleSave} disabled={saveBusy} className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl disabled:opacity-60">
              {saveBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
            </button>
            <button onClick={() => setForm(emptyForm)} className="inline-flex items-center gap-2 border px-5 py-3 rounded-xl">クリア</button>
          </div>
        </section>

        {/* 一覧＆検索 */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-gray-900">検索・一覧</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <input className="rounded-xl border px-3 py-2" placeholder="名前検索" value={q} onChange={(e) => setQ(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" placeholder="ラベル検索（完全一致1つ）" value={label} onChange={(e) => setLabel(e.target.value)} />
            <input className="rounded-xl border px-3 py-2" placeholder="都道府県" value={pref} onChange={(e) => setPref(e.target.value)} />
            <button onClick={() => load(1)} className="rounded-xl border px-3 py-2 hover:bg-gray-50">検索</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">氏名</th>
                  <th className="py-2 pr-4">email</th>
                  <th className="py-2 pr-4">都道府県</th>
                  <th className="py-2 pr-4">ラベル</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span>{r.name}</span>
                        <button className="text-gray-400 hover:text-gray-600" onClick={async () => {
                          const v = prompt('新しい氏名', r.name);
                          if (v && v !== r.name) await updateName(r, v);
                        }}>
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 pr-4">{r.email}</td>
                    <td className="py-2 pr-4">{r.prefecture ?? ''}</td>
                    <td className="py-2 pr-4">{(r.labels || []).join(', ')}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-gray-50" onClick={() => resetPassword(r)}>
                          <KeyRound className="w-4 h-4" /> Reset PW
                        </button>
                        <button className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600" onClick={() => deleteRow(r)}>
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td className="py-6 text-center text-gray-400" colSpan={5}>該当なし</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ページャ */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>全 {total} 件</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p); }} className="rounded-lg border px-3 py-1 disabled:opacity-50">Prev</button>
              <span>{page}</span>
              <button disabled={(page * size) >= total} onClick={() => { const p = page + 1; setPage(p); load(p); }} className="rounded-lg border px-3 py-1 disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
