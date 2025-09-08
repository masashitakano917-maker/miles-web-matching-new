// project/src/pages/admin/ProfessionalsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import { toast } from 'sonner';
import { Download, Upload, Check } from 'lucide-react';
import { LABEL_OPTIONS, LabelTag } from '../../lib/labels';
import { useLocation, useNavigate } from 'react-router-dom';

type FormState = {
  name: string;
  email: string;
  phone: string;
  initPassword: string;     // 新規登録時のみ使用（編集では非表示）
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

export default function ProfessionalsPage() {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const editId = params.get('id'); // ← あると編集モード
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(!!editId);

  // 新規は name/email/initPassword、編集は name/email があれば保存可
  const canSave = useMemo(() => {
    const base = form.name.trim() && form.email.trim();
    if (editId) return !!base;
    return base && form.initPassword.trim().length >= 8;
  }, [form, editId]);

  // 郵便番号 onBlur → 住所自動取得（zipcloud）
  const fetchAddress = async (postalRaw: string) => {
    const zipcode = postalRaw.replace(/\D/g, '');
    if (zipcode.length !== 7) return;
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`
      );
      const json = await res.json();
      if (json?.results?.[0]) {
        const r = json.results[0]; // {address1,address2,address3}
        setForm((s) => ({
          ...s,
          prefecture: r.address1 ?? s.prefecture,
          city: `${r.address2 ?? ''}${r.address3 ?? ''}` || s.city,
        }));
      }
    } catch {
      /* noop */
    }
  };

  const toggleLabel = (tag: LabelTag) => {
    setForm((s) => {
      const exists = s.labels.includes(tag);
      return { ...s, labels: exists ? s.labels.filter((t) => t !== tag) : [...s.labels, tag] };
    });
  };

  // 編集モードなら初期ロードで詳細取得
  useEffect(() => {
    if (!editId) return;
    (async () => {
      setLoadingEdit(true);
      try {
        const r = await fetch(
          `/api/admin/professionals/detail?id=${encodeURIComponent(editId)}`,
          { cache: 'no-store' }
        );
        const j = await r.json();
        if (j?.ok && j.item) {
          setForm((s) => ({
            ...s,
            ...j.item,
            postal: j.item.postal ? formatPostal(String(j.item.postal)) : '',
            labels: Array.isArray(j.item.labels) ? j.item.labels : [],
            initPassword: '', // 編集では使用しない
          }));
        } else {
          toast.error(j?.error || '読み込みに失敗しました');
        }
      } catch {
        toast.error('読み込みに失敗しました');
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [editId]);

  // CSV 取り込み（登録専用）
  const onUploadCSV = async (file: File) => {
    try {
      const text = await file.text();
      // ヘッダー：name,email,phone,postal,prefecture,city,address2,bio,camera_gear,labels
      const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (rows.length <= 1) return toast.error('行がありません');

      const [header, ...lines] = rows;
      const headers = header.split(',').map((h) => h.trim());
      const idx = (k: string) => headers.indexOf(k);

      let ok = 0;
      for (const line of lines) {
        const cols = line.split(',');
        const payload = {
          name: cols[idx('name')] ?? '',
          email: cols[idx('email')] ?? '',
          phone: cols[idx('phone')] ?? '',
          initPassword: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
          postal: formatPostal(cols[idx('postal')] ?? ''),
          prefecture: cols[idx('prefecture')] ?? '',
          city: cols[idx('city')] ?? '',
          address2: cols[idx('address2')] ?? '',
          bio: cols[idx('bio')] ?? '',
          camera_gear: cols[idx('camera_gear')] ?? '',
          labels: (cols[idx('labels')] ?? '')
            .split('|')
            .map((v) => v.trim())
            .filter(Boolean),
        };

        const res = await fetch('/api/admin/professionals/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          body: JSON.stringify(payload),
          cache: 'no-store',
        });
        if (res.ok) ok++;
      }
      toast.success(`CSV 登録完了：${ok} 件`);
      navigate('/admin/professionals/list', { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'CSV 取込に失敗しました');
    }
  };

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // 共通ペイロード
      const base = {
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        postal: formatPostal(form.postal),
        prefecture: form.prefecture || '',
        city: form.city || '',
        address2: form.address2 || '',
        bio: form.bio || '',
        camera_gear: form.camera_gear || '',
        labels: form.labels || [],
      };

      const url = editId ? '/api/admin/professionals/update' : '/api/admin/professionals/create';
      const payload = editId
        ? { id: editId, ...base } // 更新時は initPassword 送らない
        : { ...base, initPassword: form.initPassword };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || '保存に失敗しました');

      toast.success(editId ? '更新しました' : '登録しました');
      setForm(EMPTY);
      navigate('/admin/professionals/list', { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const title = editId ? 'プロフェッショナル編集' : 'プロフェッショナル登録';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 lg:px-0 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/professionals/list')}
              className="btn-secondary"
            >
              一覧へ
            </button>
          </div>
        </div>

        {/* CSV 一括登録（編集時は表示しない） */}
        {!editId && (
          <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="font-semibold">CSV 一括登録</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const header =
                      'name,email,phone,postal,prefecture,city,address2,bio,camera_gear,labels';
                    const sample =
                      '山田 太郎,pro@example.com,09000000000,1500001,東京都,渋谷区神宮前,1-2-3 ○○マンション 101,プロフィール例,SONY α7SIII | FE 24-70,real_estate|food|portrait';
                    const blob = new Blob([`${header}\n${sample}`], {
                      type: 'text/csv;charset=utf-8',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'professionals_template.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  テンプレートをダウンロード
                </button>

                <label className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  CSV を選択
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUploadCSV(f);
                    }}
                  />
                </label>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              ヘッダー：name,email,phone,postal,prefecture,city,address2,bio,camera_gear,labels
              / labels は <code>|</code> 区切り
            </p>
          </section>
        )}

        {/* 入力フォーム */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-6">
          {loadingEdit ? (
            <div className="text-gray-600">読み込み中…</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">氏名 *</label>
                  <input
                    className="mt-1 input"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">email *</label>
                  <input
                    className="mt-1 input"
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    placeholder="pro@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">電話番号</label>
                  <input
                    className="mt-1 input"
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="090-xxxx-xxxx"
                  />
                </div>

                {/* 新規登録時だけ初期パスワードを表示 */}
                {!editId && (
                  <div>
                    <label className="text-sm text-gray-600">初期パスワード *</label>
                    <input
                      className="mt-1 input"
                      value={form.initPassword}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, initPassword: e.target.value }))
                      }
                      placeholder="8文字以上"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">郵便番号</label>
                  <input
                    className="mt-1 input"
                    value={form.postal}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, postal: formatPostal(e.target.value) }))
                    }
                    onBlur={() => fetchAddress(form.postal)}
                    placeholder="123-4567"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">都道府県</label>
                  <input
                    className="mt-1 input bg-gray-50"
                    value={form.prefecture}
                    onChange={(e) => setForm((s) => ({ ...s, prefecture: e.target.value }))}
                    placeholder="東京都"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">市区町村</label>
                  <input
                    className="mt-1 input bg-gray-50"
                    value={form.city}
                    onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                    placeholder="渋谷区神宮前"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">それ以降</label>
                  <input
                    className="mt-1 input"
                    value={form.address2}
                    onChange={(e) => setForm((s) => ({ ...s, address2: e.target.value }))}
                    placeholder="1-2-3 ○○マンション 101"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">自己紹介</label>
                  <textarea
                    className="mt-1 input min-h-[100px]"
                    value={form.bio}
                    onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                    placeholder="経験・強み・対応可能ジャンルなど"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">カメラ機材（カメラマンのみ）</label>
                  <input
                    className="mt-1 input"
                    value={form.camera_gear}
                    onChange={(e) => setForm((s) => ({ ...s, camera_gear: e.target.value }))}
                    placeholder="例) SONY α7SIII / FE 24-70 / 70-200 …"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">ラベル（複数選択可）</label>
                  <div className="mt-2 grid sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {LABEL_OPTIONS.map((tag) => {
                      const active = form.labels.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleLabel(tag)}
                          className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-2 ${
                            active
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {active && <Check className="w-4 h-4" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onSave}
                  disabled={!canSave || saving}
                  className="btn-primary disabled:opacity-60"
                >
                  {saving ? (editId ? '更新中…' : '保存中…') : editId ? '更新する' : '登録する'}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
