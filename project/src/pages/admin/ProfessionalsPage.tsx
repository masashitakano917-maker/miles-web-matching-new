import React, { useMemo, useState } from 'react';
import Header from '../../components/Header';
import { Upload, UserPlus, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Form = {
  name: string;
  email: string;
  password: string; // Adminが設定
  phone: string;
  postal: string;
  prefecture: string;
  city: string;
  address2: string;
  bio: string;
  labels: string[]; // カンマ区切り入力を配列に
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
  const labelInput = useMemo(() => form.labels.join(','), [form.labels]);

  // 郵便番号→住所 自動補完（ZipCloud）
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
    } catch {
      // 失敗時は何もしない（手入力）
    }
  };

  // 単体登録（保存ボタン）
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
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || '登録に失敗しました');
      }
      alert('登録が完了しました（招待メール送信済み）');
      setForm(emptyForm);
      // 画面上のリストがあるなら、ここで再読込処理を呼ぶ
    } catch (e: any) {
      alert(e.message || 'エラーが発生しました');
    } finally {
      setSaveBusy(false);
    }
  };

  // CSV一括登録：ヘッダー例） name,email,phone,postal,prefecture,city,address2,bio,labels,password
  const handleCsv = async (file?: File | null) => {
    if (!file) return;
    setCsvBusy(true);
    try {
      const text = await file.text();
      const rows = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
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
          labels: (cols[idx('labels')] || '')
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean),
          password: cols[idx('password')] || '', // CSVに初期パス
        };
        if (!payload.name || !payload.email || !payload.password) continue;

        const res = await fetch('/api/admin/professionals/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          // 失敗しても続行。必要ならログ収集
          // eslint-disable-next-line no-console
          console.warn('CSV行の登録に失敗：', rows[i]);
        }
      }
      alert('CSV一括登録を完了しました');
    } catch (e: any) {
      alert(e.message || 'CSV取り込みに失敗しました');
    } finally {
      setCsvBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">プロフェッショナル管理</h1>
        <p className="text-gray-500 mb-8">
          登録/編集・一括CSVインポート、住所（郵便番号→住所）やプロフィール、ラベルなどを管理します。
        </p>

        {/* CSV アップロード */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-gray-900">CSV一括登録</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleCsv(e.target.files?.[0])}
              />
              {csvBusy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> 読み込み中...
                </span>
              ) : (
                'ファイルを選択'
              )}
            </label>
            <button
              onClick={() => {
                const header =
                  'name,email,phone,postal,prefecture,city,address2,bio,labels,password\n';
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
            <p className="text-sm text-gray-500">
              ラベルは複数可（例：<code>food|wedding</code>）。パスワード列は初期パス。
            </p>
          </div>
        </section>

        {/* 単体登録フォーム */}
        <section className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-gray-900">手動で1人ずつ登録</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">氏名 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="pro@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">初期パスワード *</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="8文字以上"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="090-xxxx-xxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">郵便番号</label>
              <input
                value={form.postal}
                onBlur={autofilAddress}
                onChange={(e) => setForm((v) => ({ ...v, postal: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="1500001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">都道府県</label>
              <input
                value={form.prefecture}
                onChange={(e) => setForm((v) => ({ ...v, prefecture: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="東京都"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">市区町村</label>
              <input
                value={form.city}
                onChange={(e) => setForm((v) => ({ ...v, city: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="渋谷区神宮前"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">それ以降</label>
              <input
                value={form.address2}
                onChange={(e) => setForm((v) => ({ ...v, address2: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="1-2-3 〇〇マンション 101"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">自己紹介</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((v) => ({ ...v, bio: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={4}
                placeholder="経験・強み・対応可能ジャンルなど"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">ラベル（カンマ区切り）</label>
              <input
                value={labelInput}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    labels: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="mt-1 w-full rounded-xl border px-3 py-2"
                placeholder="food,wedding,portrait"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saveBusy}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl disabled:opacity-60"
            >
              {saveBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              保存
            </button>
            <button
              onClick={() => setForm(emptyForm)}
              className="inline-flex items-center gap-2 border px-5 py-3 rounded-xl"
            >
              クリア
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
