import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../components/Header';
import { Plus, Upload, Download, Trash2, Pencil, Save, X, Tag } from 'lucide-react';

type Professional = {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address2: string; // それ以降
  bio: string;      // 自己紹介
  labels: string[]; // ラベル
  createdAt: number;
  updatedAt: number;
};

// localStorage キー
const KEY = 'miles__professionals_v1';

// ラベル候補（自由入力もOK）
const LABEL_PRESETS = [
  '不動産', 'Food', 'ポートレート', 'ウェディング',
  '清掃', '人材派遣', 'スタジオ', 'イベント'
];

function load(): Professional[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Professional[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function save(list: Professional[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// 超ライトなCSVパーサ（ダブルクォート対応／カンマもある程度OK）
function parseCSV(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  if (lines.length === 0) return rows;

  const headers = splitCSVLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const rec: Record<string, string> = {};
    headers.forEach((h, idx) => (rec[h.trim()] = (cols[idx] ?? '').trim()));
    rows.push(rec);
  }
  return rows;
}
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'; i++; // エスケープ
      } else {
        inQ = !inQ;
      }
    } else if (ch === ',' && !inQ) {
      out.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

const emptyForm: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  email: '',
  phone: '',
  postalCode: '',
  prefecture: '',
  city: '',
  address2: '',
  bio: '',
  labels: [],
};

export default function ProfessionalsPage() {
  const [list, setList] = useState<Professional[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setList(load()); }, []);
  useEffect(() => { save(list); }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p =>
      [p.name, p.email, p.phone, p.prefecture, p.city, p.address2, p.bio, p.postalCode, p.labels.join(' ') ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [list, query]);

  const startEdit = (p: Professional) => {
    setEditingId(p.id);
    setForm({
      name: p.name, email: p.email, phone: p.phone, postalCode: p.postalCode,
      prefecture: p.prefecture, city: p.city, address2: p.address2,
      bio: p.bio, labels: [...p.labels],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const upsert = () => {
    // バリデーション軽め
    if (!form.name.trim()) return alert('氏名は必須です');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return alert('メール形式が不正です');
    const now = Date.now();

    if (editingId) {
      setList(prev => prev.map(p => p.id === editingId ? { ...p, ...form, updatedAt: now } : p));
    } else {
      const id = crypto.randomUUID?.() ?? String(now) + Math.random().toString(16).slice(2);
      setList(prev => [{ id, createdAt: now, updatedAt: now, ...form }, ...prev]);
    }
    resetForm();
  };

  const remove = (id: string) => {
    if (!confirm('削除しますか？')) return;
    setList(prev => prev.filter(p => p.id !== id));
  };

  const onCSV = async (f: File) => {
    const text = await f.text();
    const rows = parseCSV(text);
    // 期待ヘッダ
    // name,email,phone,postalCode,prefecture,city,address2,bio,labels  ← labelsはカンマ区切り
    const now = Date.now();
    const mapped: Professional[] = rows.map(r => ({
      id: crypto.randomUUID?.() ?? String(now) + Math.random().toString(16).slice(2),
      name: r.name ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      postalCode: r.postalCode ?? '',
      prefecture: r.prefecture ?? '',
      city: r.city ?? '',
      address2: r.address2 ?? '',
      bio: r.bio ?? '',
      labels: (r.labels ?? '').split(',').map(s => s.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
    }));
    // 簡易バリデーション
    const clean = mapped.filter(m => m.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email));
    setList(prev => [...clean, ...prev]);
    alert(`インポート: ${clean.length}件（不正行はスキップ）`);
  };

  const downloadTemplate = () => {
    const header = 'name,email,phone,postalCode,prefecture,city,address2,bio,labels\n';
    const sample = '山田太郎,taro@example.com,090-1234-5678,1500001,東京都,渋谷区,神宮前1-2-3,不動産撮影が得意です,不動産,ポートレート\n';
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'professionals_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleLabel = (label: string) => {
    setForm(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">プロフェッショナル管理</h1>

          {/* フォーム：追加/編集 */}
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{editingId ? '編集' : '新規登録'}</h2>
              {editingId ? (
                <button className="text-sm text-gray-600 hover:text-gray-900" onClick={resetForm}>
                  <X className="inline w-4 h-4 mr-1" />
                  キャンセル
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="氏名" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
              <Input label="E-mail" value={form.email} onChange={v => setForm({ ...form, email: v })} required placeholder="name@example.com" />
              <Input label="電話番号" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />

              <Input label="郵便番号" value={form.postalCode} onChange={v => setForm({ ...form, postalCode: v })} placeholder="1230000" />
              <Input label="都道府県" value={form.prefecture} onChange={v => setForm({ ...form, prefecture: v })} />
              <Input label="市区町村" value={form.city} onChange={v => setForm({ ...form, city: v })} />
              <Input label="それ以降" value={form.address2} onChange={v => setForm({ ...form, address2: v })} />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">自己紹介</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  className="input h-28 resize-vertical"
                  placeholder="得意分野や実績など"
                />
              </div>
            </div>

            {/* ラベル */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">ラベル選択</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LABEL_PRESETS.map(lb => (
                  <button
                    key={lb}
                    type="button"
                    onClick={() => toggleLabel(lb)}
                    className={`px-3 py-1.5 rounded-xl border text-sm ${
                      form.labels.includes(lb)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lb}
                  </button>
                ))}
              </div>
              {/* 自由入力 */}
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="カンマ区切りで自由に追加（例: 建築, 企業撮影）"
                  className="input"
                  onBlur={(e) => {
                    const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    if (vals.length) setForm(prev => ({ ...prev, labels: Array.from(new Set([...prev.labels, ...vals])) }));
                    e.currentTarget.value = '';
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">入力後フォーカスを外すと追加されます</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={upsert} className="btn btn-primary px-5 py-3 rounded-2xl">
                {editingId ? (<><Save className="w-4 h-4 mr-2" />更新</>) : (<><Plus className="w-4 h-4 mr-2" />追加</>)}
              </button>
              <button onClick={resetForm} className="btn-ghost">クリア</button>
            </div>
          </div>

          {/* 一括CSV：テンプレDL / 取込 */}
          <div className="card p-6 mb-8">
            <h2 className="font-semibold mb-3">CSV 一括登録</h2>
            <p className="text-sm text-gray-600 mb-3">
              必要ヘッダー：
              <code className="bg-gray-100 px-2 py-1 rounded">name,email,phone,postalCode,prefecture,city,address2,bio,labels</code>
              （labels はカンマ区切り）
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={downloadTemplate} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 inline-flex items-center">
                <Download className="w-4 h-4 mr-2" /> テンプレートをダウンロード
              </button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => {
                const f = e.target.files?.[0]; if (f) onCSV(f); (e.target as HTMLInputElement).value = '';
              }} />
              <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 inline-flex items-center">
                <Upload className="w-4 h-4 mr-2" /> CSVを選択して取り込む
              </button>
            </div>
          </div>

          {/* 一覧 & 検索 */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">登録一覧（{list.length}）</h2>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="氏名 / メール / ラベル などで検索"
              className="input w-72"
            />
          </div>

          <div className="grid gap-3">
            {filtered.map(p => (
              <div key={p.id} className="card p-4 border border-white/40">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.email}・{p.phone || '電話なし'}</div>
                    <div className="text-sm text-gray-600">
                      〒{p.postalCode} {p.prefecture}{p.city}{p.address2 && ` ${p.address2}`}
                    </div>
                    {p.bio && <div className="text-sm text-gray-700 mt-1">{p.bio}</div>}
                    {!!p.labels.length && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {p.labels.map(lb => (
                          <span key={lb} className="px-2 py-0.5 text-xs rounded-full border border-orange-200 bg-orange-50 text-orange-700">
                            {lb}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(p)} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center">
                      <Pencil className="w-4 h-4 mr-1" /> 編集
                    </button>
                    <button onClick={() => remove(p.id)} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 inline-flex items-center text-red-600">
                      <Trash2 className="w-4 h-4 mr-1" /> 削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="text-center text-gray-500 py-10">該当データがありません</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- small UI helpers ---------- */
function Input({
  label, value, onChange, placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        required={required}
      />
    </div>
  );
}
