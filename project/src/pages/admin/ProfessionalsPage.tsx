// project/src/pages/admin/ProfessionalsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';

type FormState = {
  name: string;
  email: string;
  phone: string;
  initPassword: string;
  postal: string;
  prefecture: string;
  city: string;
  address2: string;
  bio: string;
  labels: string[]; // ← 選択式
};

// 選べるラベル（必要に応じて増減OK）
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

export default function ProfessionalsPage() {
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
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // 郵便番号：入力のたびに数字だけへ正規化 → 7桁になったら「123-4567」へ整形
  const handlePostalChange = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '').slice(0, 7);
    const formatted =
      digits.length >= 4 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
    setForm((f) => ({ ...f, postal: formatted }));
  };

  // 住所のオートフィル（あなたの既存Zip→住所API呼び出しをここで呼ぶ想定）
  useEffect(() => {
    const digits = form.postal.replace(/[^\d]/g, '');
    if (digits.length !== 7) return;
    // 例: 既存のユーティリティ fetchAddressByZip(digits)
    // ↓ダミー：必要なら実装をあなたの既存関数へ置換
    (async () => {
      try {
        // ここを既存のAPIに差し替え
        // const { prefecture, city } = await fetchAddressByZip(digits);
        // setForm((f) => ({ ...f, prefecture, city }));
      } catch {
        /* noop */
      }
    })();
  }, [form.postal]);

  const toggleLabel = (label: string) => {
    setForm((f) => {
      const exists = f.labels.includes(label);
      return {
        ...f,
        labels: exists ? f.labels.filter((l) => l !== label) : [...f.labels, label],
      };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/professionals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('プロフェッショナルを登録しました');
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
    } catch (err: any) {
      toast.error('登録に失敗しました: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const header =
      'name,email,phone,postal,prefecture,city,address2,bio,labels\n';
    const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'professionals_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onUploadCsv = async () => {
    if (!csvFile) {
      toast.message('CSVファイルを選択してください');
      return;
    }
    const body = new FormData();
    body.append('file', csvFile);
    const res = await fetch('/api/admin/professionals/bulk', {
      method: 'POST',
      body,
    });
    if (!res.ok) {
      toast.error('CSVインポートに失敗しました');
      return;
    }
    toast.success('CSVインポートを受け付けました');
    setCsvFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-2">プロフェッショナル管理</h1>
        <p className="text-gray-500 mb-8">
          登録/編集・一括CSVインポート、住所（郵便番号→住所）やプロフィール、ラベルなどを管理します。
        </p>

        {/* CSV */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold">CSV一括登録</h2>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={onUploadCsv}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              アップロード
            </button>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              テンプレートをダウンロード
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            ヘッダー例：name,email,phone,postal,prefecture,city,address2,bio,labels（labelsはカンマ区切り）
          </p>
        </section>

        {/* 手動登録 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold mb-6">手動で1人ずつ登録</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">氏名 *</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">email *</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">初期パスワード *</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.initPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, initPassword: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">phone</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">郵便番号</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="例: 123-4567"
                value={form.postal}
                onChange={(e) => handlePostalChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">都道府県</label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
                value={form.prefecture}
                onChange={(e) =>
                  setForm((f) => ({ ...f, prefecture: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">市区町村</label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-gray-50"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">それ以降</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.address2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address2: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">自己紹介</label>
              <textarea
                className="w-full rounded-lg border px-3 py-2"
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>

            {/* ラベル：選択式（複数） */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">ラベル（複数選択可）</label>
              <div className="flex flex-wrap gap-2">
                {LABEL_OPTIONS.map((label) => {
                  const active = form.labels.includes(label);
                  return (
                    <button
                      type="button"
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`px-3 py-1.5 rounded-full border text-sm ${
                        active
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
