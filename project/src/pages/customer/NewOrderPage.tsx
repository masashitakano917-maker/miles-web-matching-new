// project/src/pages/customer/NewOrderPage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/Header';

type OrderForm = {
  service: string;
  plan: string;
  price: number;
  // 希望日時
  prefer_datetime_1: string;
  prefer_datetime_2: string;
  prefer_datetime_3: string;
  // 住所
  postal: string;
  prefecture: string;
  city: string;
  address2: string;
  // 連絡先
  client_name: string;
  client_email: string;
  client_phone: string;
  // 集合場所（任意）
  meetup: string;
  // 備考
  note: string;
};

const RADIUS_KM = 80; // 通知半径は固定

export default function NewOrderPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const initial: OrderForm = useMemo(
    () => ({
      service: sp.get('service') ?? '',
      plan: sp.get('plan') ?? '',
      price: Number(sp.get('price') ?? 0),
      prefer_datetime_1: '',
      prefer_datetime_2: '',
      prefer_datetime_3: '',
      postal: '',
      prefecture: '',
      city: '',
      address2: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      meetup: '',
      note: '',
    }),
    [sp]
  );

  const [form, setForm] = useState<OrderForm>(initial);

  const onChange = (k: keyof OrderForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const goConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    // 必須チェック（最低限）
    if (!form.client_name || !form.client_email || !form.city || !form.prefecture || !form.address2) {
      alert('必須項目を入力してください。');
      return;
    }
    navigate('/confirm', { state: { ...form, radius_km: RADIUS_KM } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">新規発注</h1>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:underline">ダッシュボードへ</Link>
        </div>

        <div className="mt-2 text-gray-700">
          {form.service && (
            <div className="mb-2">
              <span className="font-semibold">選択中：</span>
              <span>{form.service} / {form.plan}（{form.price.toLocaleString()}円）</span>
            </div>
          )}
        </div>

        <form onSubmit={goConfirm} className="mt-6 space-y-6">
          {/* 希望日時 */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">ご希望日時</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <input className="input" type="datetime-local" value={form.prefer_datetime_1} onChange={onChange('prefer_datetime_1')} />
              <input className="input" type="datetime-local" value={form.prefer_datetime_2} onChange={onChange('prefer_datetime_2')} />
              <input className="input" type="datetime-local" value={form.prefer_datetime_3} onChange={onChange('prefer_datetime_3')} />
            </div>
          </section>

          {/* 住所 */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">案件住所</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <input className="input" placeholder="郵便番号 例: 123-4567" value={form.postal} onChange={onChange('postal')} />
              <input className="input" placeholder="都道府県" value={form.prefecture} onChange={onChange('prefecture')} />
              <input className="input" placeholder="市区町村" value={form.city} onChange={onChange('city')} />
              <input className="input" placeholder="それ以降" value={form.address2} onChange={onChange('address2')} />
            </div>
          </section>

          {/* 連絡先 */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">ご連絡先</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <input className="input" placeholder="お名前 *" value={form.client_name} onChange={onChange('client_name')} />
              <input className="input" placeholder="メール *" value={form.client_email} onChange={onChange('client_email')} />
              <input className="input md:col-span-2" placeholder="電話番号" value={form.client_phone} onChange={onChange('client_phone')} />
            </div>
          </section>

          {/* 集合場所・特記事項 */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">その他</h2>
            <input className="input" placeholder="集合場所（案件住所と違う場合）" value={form.meetup} onChange={onChange('meetup')} />
            <textarea className="input mt-4" placeholder="特記事項" rows={4} value={form.note} onChange={onChange('note')} />
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-xl bg-orange-600 text-white px-6 py-3 hover:bg-orange-700 transition">
              オーダー内容の確認
            </button>
            <Link to="/services" className="text-gray-600 hover:underline">サービス一覧に戻る</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

// Tailwind 合わせの簡易 input クラス
declare global {
  interface HTMLAttributes<T> {
    className?: string;
  }
}
