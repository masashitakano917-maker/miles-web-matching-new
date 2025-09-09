// project/src/pages/customer/NewOrderPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

type Form = {
  client_name: string;
  client_email: string;
  postal: string;
  prefecture: string;
  city: string;
  address2: string;
  note: string;
  radius_km: number;
};

const EMPTY: Form = {
  client_name: '',
  client_email: '',
  postal: '',
  prefecture: '',
  city: '',
  address2: '',
  note: '',
  radius_km: 50,
};

const formatPostal = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 7);
  return d.length >= 4 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
};

export default function NewOrderPage(): JSX.Element {
  const nav = useNavigate();
  const [f, setF] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  // サインイン中ユーザーのメールを自動セット（読み取り専用）
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? '';
      setF((s) => ({ ...s, client_email: email }));
    })();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      f.client_name.trim() &&
      (f.client_email.trim() || '').length > 0 &&
      (f.prefecture.trim() || f.city.trim() || f.address2.trim())
    );
  }, [f]);

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const address = [
        f.prefecture.trim(),
        f.city.trim(),
        f.address2.trim(),
        f.postal.replace(/\s/g, ''),
      ]
        .filter(Boolean)
        .join(' ');

      const payload = {
        client_name: f.client_name.trim(),
        client_email: f.client_email.trim(),
        address,
        note: f.note.trim(),
        radius_km: f.radius_km,
      };

      const res = await fetch('/api/matching?action=create_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.error || '送信に失敗しました');

      toast.success('発注を作成しました。近いプロに通知されます。');
      nav('/dashboard', { replace: true });
    } catch (e: any) {
      toast.error(e?.message || '送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 lg:px-0 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">新規発注</h1>
          <Link to="/dashboard" className="btn-ghost" aria-label="ダッシュボードへ">
            ダッシュボードへ
          </Link>
        </div>

        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">お名前 *</label>
              <input
                className="mt-1 input"
                value={f.client_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setF((s) => ({ ...s, client_name: e.target.value }))
                }
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">メール *</label>
              <input
                className="mt-1 input bg-gray-50"
                value={f.client_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setF((s) => ({ ...s, client_email: e.target.value }))
                }
                readOnly
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">郵便番号</label>
              <input
                className="mt-1 input"
                value={f.postal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setF((s) => ({ ...s, postal: formatPostal(e.target.value) }))
                }
                placeholder="123-4567"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">都道府県</label>
              <input
                className="mt-1 input"
                value={f.prefecture}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setF((s) => ({ ...s, prefecture: e.target.value }))
                }
                placeholder="東京都"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">市区町村</label>
              <input
                className="mt-1 input"
                value={f.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setF((s) => ({ ...s, city: e.target.value }))
                }
                placeholder="千代田区丸の内"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">それ以降</label>
              <input
                className="mt-1 input"
                value={f.address2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setF((s) => ({ ...s, address2: e.target.value }))
                }
                placeholder="1-9-1 ○○ビル 10F"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">依頼メモ</label>
              <textarea
                className="mt-1 input min-h-[100px]"
                value={f.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setF((s) => ({ ...s, note: e.target.value }))
                }
                placeholder="ご希望の日時・内容など"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">通知する半径（km）</label>
              <select
                className="mt-1 input"
                value={f.radius_km}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setF((s) => ({ ...s, radius_km: Number(e.target.value) }))
                }
              >
                {[10, 20, 30, 50, 80].map((n) => (
                  <option key={n} value={n}>
                    {n} km
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className="btn-primary disabled:opacity-60"
            >
              {submitting ? '送信中…' : '発注する'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
