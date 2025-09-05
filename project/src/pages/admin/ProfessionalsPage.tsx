// project/src/pages/admin/ProfessionalsPage.tsx
// Admin > プロフェッショナル管理（CSV一括 + 手動登録）
// 変更点：ラベルを自由入力→選択式（複数選択）に変更、郵便番号のハイフン自動付与を実装

import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import { toast } from 'sonner';
import { Download, Upload, Check, X } from 'lucide-react';

// 手動フォーム状態
type FormState = {
  name: string;
  email: string;
  phone: string;
  initPassword: string;
  postal: string;         // 表示は "123-4567" に自動整形
  prefecture: string;
  city: string;
  address2: string;
  bio: string;
  labels: string[];       // 選択式に
};

// 選べるラベル（必要に応じて増減OK）
const LABEL_OPTIONS = [
  'wedding',
  'portrait',
  'food',
  'real_estate',
  'event',
  'product',
  'fashion',
  'travel',
  'sports',
  'corporate',
  'family',
];

// 郵便番号の表示整形：数字だけを抽出して 3-4 でハイフン付与
function formatPostal(input: string) {
  const digits = (input || '').replace(/\D/g, '').slice(0, 7);
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

export default function ProfessionalsPage() {
  // ===== 手動登録フォーム =====
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    initPassword: '',
    postal: '',
    prefecture: '',
    city: '',
    address2: '',
    bio: '',
    labels: [],
  });
  const [saving, setSaving] = useState(false);

  // ===== CSV インポート（既存のまま） =====
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ====== フィールド変更ハンドラ ======
  const onChange = (key: keyof FormState, value: string) => {
    if (key === 'postal') {
      // 入力されたらその場でフォーマット
      setForm((p) => ({ ...p, postal: formatPostal(value) }));
      return;
    }
    setForm((p) => ({ ...p, [key]: value }));
  };

  // 郵便番号をフォーカスアウトした際も最終整形（数字だけで7桁→3-4の形へ）
  const onPostalBlur = () => {
    setForm((p) => ({ ...p, postal: formatPostal(p.postal) }));
  };

  // ラベルのトグル（選択式）
  const toggleLabel = (label: string) => {
    setForm((p) => {
      const exists = p.labels.includes(label);
      return { ...p, labels: exists ? p.labels.filter((l) => l !== label) : [...p.labels, label] };
    });
  };

  // ====== CSVテンプレートDL（既存列名のまま、labelsはカンマ区切り） ======
  const downloadTemplate = () => {
    const header = [
      'name',
      'email',
      'phone',
      'postal',
      'prefecture',
      'city',
      'address2',
      'bio',
      'labels',       // カンマ区切り: 例) wedding,food
      'initPassword', // 初期パスワード
    ].join(',');
    const blob = new Blob([header + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'professionals_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ====== CSVアップロード（そのまま） ======
  const onUpload = async () => {
    if (!csvFile) {
      toast.error('CSVファイルを選択してください');
      return;
    }
    setUploading(true);
    try {
      const text = await csvFile.text();
      // サーバー側で CSV を解析するなら、丸ごと渡す
      const res = await fetch('/api/admin/professionals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'csv', data: text }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'CSV取り込みに失敗しました');
      }
      toast.success('CSVの取り込みに成功しました');
      setCsvFile(null);
    } catch (e: any) {
      toast.error(e.message || 'CSV取り込みに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  // ====== 手動登録：保存 ======
  const onSave = async () => {
    // バリデーション（最低限）
    if (!form.name.trim()) {
      toast.error('氏名は必須です');
      return;
    }
    if (!form.email.trim()) {
      toast.error('email は必須です');
      return;
    }
    if (!form.initPassword || form.initPassword.length < 8) {
      toast.error('初期パスワードは8文字以上にしてください');
      return;
    }

    setSaving(true);
    try {
      // 送信用に整形（postalはそのまま "123-4567" を渡す）
      const payload = { ...form, labels: form.labels };

      const res = await fetch('/api/admin/professionals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'single', data: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || '保存に失敗しました');

      toast.success('登録しました');
      // フォーム初期化
      setForm({
        name: '',
        email: '',
        phone: '',
        initPassword: '',
        postal: '',
        prefecture: '',
        city: '',
        address2: '',
        bio: '',
        labels: [],
      });
    } catch (e: any) {
      toast.error(e.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">プロフェッショナル管理</h1>
          <p className="text-gray-500 mt-2">
            登録/編集・一括CSVインポート、住所（郵便番号→自動整形）、プロフィール、<span className="font-semibold">ラベル（選択式）</span> などを管理します。
          </p>

          {/* CSV 一括登録 */}
          <section className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              CSV一括登録
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              ヘッダー例：<code className="px-1 py-0.5 bg-gray-50 rounded">name,email,phone,postal,prefecture,city,address2,bio,labels,initPassword</code>
              （labels は <code>wedding,food</code> のようにカンマ区切り）
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="block w-full sm:w-auto"
              />
              <button
                onClick={onUpload}
                disabled={uploading}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'アップロード中…' : 'アップロード'}
              </button>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                テンプレートをダウンロード
              </button>
            </div>
          </section>

          {/* 手動で1人ずつ登録 */}
          <section className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900">手動で1人ずつ登録</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">氏名 *</label>
                <input
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="pro@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">初期パスワード *</label>
                <input
                  value={form.initPassword}
                  onChange={(e) => onChange('initPassword', e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="8文字以上"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="090-xxxx-xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">郵便番号</label>
                <input
                  value={form.postal}
                  onChange={(e) => onChange('postal', e.target.value)}
                  onBlur={onPostalBlur}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="150-0001"
                />
                <p className="text-xs text-gray-500 mt-1">7桁の数字を入力すると自動で「123-4567」の形になります。</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">都道府県</label>
                <input
                  value={form.prefecture}
                  onChange={(e) => onChange('prefecture', e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="東京都"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">市区町村</label>
                <input
                  value={form.city}
                  onChange={(e) => onChange('city', e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="渋谷区神宮前"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">それ以降</label>
                <input
                  value={form.address2}
                  onChange={(e) => onChange('address2', e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="1-2-3 ○○マンション 101"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">自己紹介</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => onChange('bio', e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  placeholder="経験・強み・対応可能ジャンルなど"
                />
              </div>

              {/* ラベル（選択式） */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">ラベル（複数選択可）</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LABEL_OPTIONS.map((label) => {
                    const active = form.labels.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleLabel(label)}
                        className={[
                          'px-3 py-2 rounded-xl border flex items-center gap-2 transition',
                          active
                            ? 'bg-orange-50 border-orange-400 text-orange-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                        ].join(' ')}
                        aria-pressed={active}
                      >
                        {active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 opacity-0" />}
                        <span className="capitalize">{label.replace('_', ' ')}</span>
                      </button>
                    );
                  })}
                </div>
                {form.labels.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    選択中: {form.labels.map((l) => l.replace('_', ' ')).join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
