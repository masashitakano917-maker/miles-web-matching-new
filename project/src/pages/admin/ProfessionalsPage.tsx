// project/src/pages/admin/ProfessionalsPage.tsx
import React, { useMemo, useState } from 'react';
import Header from '../../components/Header';
import { toast } from 'sonner';
import { Download, Upload, Check, ArrowLeft, List } from 'lucide-react';
import { LABEL_OPTIONS, LabelTag } from '../../lib/labels';
import { useNavigate } from 'react-router-dom';

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
  camera_gear: string;
  labels: LabelTag[];
};

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  initPassword: '',
  postal: '',
  prefecture: '',
  city: '',
  address2: '',
  bio: '',
  camera_gear: '',
  labels: [],
};

const formatPostal = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 7);
  if (digits.length >= 4) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
};

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  let json: any = null;
  try { json = await res.json(); } catch {}
  return { res, json };
}

async function lookupAddressFromZip(zipRaw: string) {
  const zipcode = zipRaw.replace(/\D/g, '');
  if (zipcode.length !== 7) return null;
  const r = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
  const j = await r.json();
  const hit = j?.results?.[0];
  if (!hit) return null;
  return {
    prefecture: hit.address1 as string,
    city: `${hit.address2 ?? ''}${hit.address3 ?? ''}`.trim(),
  };
}

export default function ProfessionalsPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const canSave = useMemo(
    () => form.name.trim() && form.email.trim() && form.initPassword.trim().length >= 8,
    [form]
  );

  const fetchAddress = async (postalRaw: string) => {
    const found = await lookupAddressFromZip(postalRaw);
    if (found) {
      setForm((s) => ({
        ...s,
        prefecture: found.prefecture || s.prefecture,
        city: found.city || s.city,
      }));
    }
  };

  const toggleLabel = (tag: LabelTag) => {
    setForm((s) => {
      const exists = s.labels.includes(tag);
      return { ...s, labels: exists ? s.labels.filter((t) => t !== tag) : [...s.labels, tag] };
    });
  };

  const onUploadCSV = async (file: File) => {
    try {
      const text = await file.text();
      const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (rows.length <= 1) { toast.error('CSVにデータ行がありません'); return; }

      const [header, ...lines] = rows;
      const headers = header.split(',').map((h) => h.trim());
      const idx = (k: string) => headers.indexOf(k);

      if (idx('name') === -1 || idx('email') === -1) {
        toast.error('CSVヘッダーに name / email が必要です'); return;
      }

      let ok = 0, ng = 0;
      for (const line of lines) {
        const cols = line.split(',');
        const payload = {
          name: cols[idx('name')] ?? '',
          email: (cols[idx('email')] ?? '').toLowerCase(),
          phone: cols[idx('phone')] ?? '',
          initPassword: crypto.randomUUID().slice(0, 12),
          postal: formatPostal(cols[idx('postal')] ?? ''),
          prefecture: cols[idx('prefecture')] ?? '',
          city: cols[idx('city')] ?? '',
          address2: cols[idx('address2')] ?? '',
          bio: cols[idx('bio')] ?? '',
          camera_gear: cols[idx('camera_gear')] ?? '',
          labels: (cols[idx('labels')] ?? '').split('|').map((v) => v.trim()).filter(Boolean),
        };
        const { res, json } = await postJSON('/api/admin/professionals/create', payload);
        if (res.ok && json?.ok) ok++; else ng++;
      }
      if (ng === 0) toast.success(`CSV 登録完了：${ok} 件`);
      else toast.error(`一部失敗：成功 ${ok} / 失敗 ${ng}`);

      navigate('/admin/professionals/list', { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'CSV 取込に失敗しました');
    }
  };

  const onSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        email: form.email.toLowerCase().trim(),
        postal: formatPostal(form.postal),
      };
      const { res, json } = await postJSON('/api/admin/professionals/create', payload);

      if (!res.ok || !json?.ok) {
        if (res.status === 409) throw new Error('このメールは既に登録されています');
        throw new Error(json?.error || '保存に失敗しました');
      }

      // メール結果をトーストに表示（未設定時はDRYRUNを明示）
      if (json?.mail?.dryRun) {
        toast.success('登録完了（メール送信は未設定のためスキップされました）');
      } else if (json?.mail?.delivered) {
        toast.success('登録完了（確認メールを送信しました）');
      } else {
        toast.success('登録完了（メール送信に失敗しました。環境変数を確認してください）');
      }

      setForm(EMPTY);
      navigate('/admin/professionals/list', { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const template = useMemo(() => {
    const header = 'name,email,phone,postal,prefecture,city,address2,bio,camera_gear,labels';
    const sample = '山田 太郎,pro@example.com,09000000000,1500001,東京都,渋谷区神宮前,1-2-3 ○○マンション 101,プロフィール例,SONY α7SIII | FE 24-70,real_estate|food|portrait';
    return [header, sample].join('\n');
  }, []);

  const downloadTemplate = () => {
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'professionals_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 lg:px-0 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">プロフェッショナル管理</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin', { replace: false })} className="btn-secondary" type="button">
              <ArrowLeft className="w-4 h-4" /> 管理ホームへ
            </button>
            <button onClick={() => navigate('/admin/professionals/list', { replace: false })} className="btn-secondary" type="button">
              <List className="w-4 h-4" /> 一覧へ
            </button>
          </div>
        </div>

        {/* CSV 一括登録 */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="font-semibold">CSV 一括登録</div>
            <div className="flex items-center gap-2">
              <button onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
                <Download className="w-4 h-4" /> テンプレートをダウンロード
              </button>
              <label className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <Upload className="w-4 h-4" /> CSV を選択
                <input type="file" accept=".csv,text/csv" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadCSV(f); }} />
              </label>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-3">
            ヘッダー：name,email,phone,postal,prefecture,city,address2,bio,camera_gear,labels / labels は <code>|</code> 区切り
          </p>
        </section>

        {/* 手動登録 */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="font-semibold">手動で 1 人ずつ登録</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">氏名 *</label>
              <input className="mt-1 input" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="山田 太郎" autoComplete="name" />
            </div>
            <div>
              <label className="text-sm text-gray-600">email *</label>
              <input className="mt-1 input" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="pro@example.com" autoComplete="email" />
            </div>
            <div>
              <label className="text-sm text-gray-600">電話番号</label>
              <input className="mt-1 input" type="tel" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} placeholder="090-xxxx-xxxx" autoComplete="tel" />
            </div>
            <div>
              <label className="text-sm text-gray-600">初期パスワード *</label>
              <input className="mt-1 input" type="password" value={form.initPassword} onChange={(e) => setForm((s) => ({ ...s, initPassword: e.target.value }))} placeholder="8文字以上" autoComplete="new-password" />
            </div>
            <div>
              <label className="text-sm text-gray-600">郵便番号</label>
              <input className="mt-1 input" value={form.postal}
                onChange={(e) => setForm((s) => ({ ...s, postal: formatPostal(e.target.value) }))} onBlur={() => fetchAddress(form.postal)}
                placeholder="123-4567" inputMode="numeric" />
            </div>
            <div>
              <label className="text-sm text-gray-600">都道府県</label>
              <input className="mt-1 input bg-gray-50" value={form.prefecture} onChange={(e) => setForm((s) => ({ ...s, prefecture: e.target.value }))} placeholder="東京都" />
            </div>
            <div>
              <label className="text-sm text-gray-600">市区町村</label>
              <input className="mt-1 input bg-gray-50" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} placeholder="渋谷区神宮前" />
            </div>
            <div>
              <label className="text-sm text-gray-600">それ以降</label>
              <input className="mt-1 input" value={form.address2} onChange={(e) => setForm((s) => ({ ...s, address2: e.target.value }))} placeholder="1-2-3 ○○マンション 101" autoComplete="address-line2" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">自己紹介</label>
              <textarea className="mt-1 input min-h-[100px]" value={form.bio} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} placeholder="経験・強み・対応可能ジャンルなど" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">カメラ機材（カメラマンのみ）</label>
              <input className="mt-1 input" value={form.camera_gear} onChange={(e) => setForm((s) => ({ ...s, camera_gear: e.target.value }))} placeholder="例) SONY α7SIII / FE 24-70 / 70-200 …" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">ラベル（複数選択可）</label>
              <div className="mt-2 grid sm:grid-cols-3 md:grid-cols-4 gap-2">
                {LABEL_OPTIONS.map((tag) => {
                  const active = form.labels.includes(tag);
                  return (
                    <button key={tag} type="button" onClick={() => toggleLabel(tag)}
                      className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-2 ${
                        active ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                      {active && <Check className="w-4 h-4" />} <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={onSave} disabled={!canSave || saving} className="btn-primary disabled:opacity-60" type="button">
              {saving ? '保存中…' : '登録する'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
