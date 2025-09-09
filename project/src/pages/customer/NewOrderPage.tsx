// project/src/pages/customer/NewOrderPage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';

type Form = {
  // プラン情報
  service: 'photo' | 'clean' | 'staff';
  plan: string;
  price: number;

  // 日時（第一〜第三）
  date1: string;
  date2: string;
  date3: string;

  // 住所
  postal: string;
  prefecture: string;
  city: string;
  line1: string;

  // 発注者
  client_name: string;
  client_email: string;
  phone: string;

  // 任意
  meetup?: string;
  note?: string;

  // 通知半径（UIでは非表示・固定 80）
  radius_km: number;
};

const EMPTY: Omit<Form, 'service' | 'plan' | 'price'> = {
  date1: '',
  date2: '',
  date3: '',
  postal: '',
  prefecture: '',
  city: '',
  line1: '',
  client_name: '',
  client_email: '',
  phone: '',
  meetup: '',
  note: '',
  radius_km: 80, // ← 固定
};

export default function NewOrderPage(): JSX.Element {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const service = (sp.get('service') as Form['service']) ?? 'photo';
  const plan = sp.get('plan') ?? '';
  const price = Number(sp.get('price') ?? 0);

  const [form, setForm] = useState<Form>({ service, plan, price, ...EMPTY });

  const planLabel = useMemo(() => {
    const map: Record<Form['service'], string> = {
      photo: '写真撮影',
      clean: '清掃サービス',
      staff: '人材派遣',
    };
    return `${map[form.service]}｜${form.plan}（${form.price.toLocaleString()}円）`;
  }, [form.service, form.plan, form.price]);

  const onChange =
    (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setForm((prev) => ({ ...prev, [key]: v }));
    };

  const canNext =
    !!form.client_name &&
    !!form.client_email &&
    !!form.date1 &&
    !!form.postal &&
    !!form.prefecture &&
    !!form.city &&
    !!form.line1;

  const goConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canNext) return;
    navigate('/order/confirm', { state: form });
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">オーダー詳細</h1>
          <p className="text-gray-700 mt-2">{planLabel}</p>

          <form onSubmit={goConfirm} className="mt-6 space-y-6">
            {/* 日時 */}
            <section>
              <h2 className="font-semibold mb-3">ご希望日時</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">第一希望日時</label>
                  <input type="datetime-local" className="input" value={form.date1} onChange={onChange('date1')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">第二希望日時</label>
                  <input type="datetime-local" className="input" value={form.date2} onChange={onChange('date2')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">第三希望日時</label>
                  <input type="datetime-local" className="input" value={form.date3} onChange={onChange('date3')} />
                </div>
              </div>
            </section>

            {/* 住所 */}
            <section>
              <h2 className="font-semibold mb-3">案件住所</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">郵便番号</label>
                  <input placeholder="123-4567" className="input" value={form.postal} onChange={onChange('postal')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">都道府県</label>
                  <input placeholder="東京都" className="input" value={form.prefecture} onChange={onChange('prefecture')} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm text-gray-600">市区町村</label>
                  <input placeholder="千代田区丸の内" className="input" value={form.city} onChange={onChange('city')} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">それ以降</label>
                  <input placeholder="1-9-1 ○○ビル 10F" className="input" value={form.line1} onChange={onChange('line1')} />
                </div>
              </div>
            </section>

            {/* 発注者 */}
            <section>
              <h2 className="font-semibold mb-3">発注者情報</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="text-sm text-gray-600">氏名 *</label>
                  <input className="input" value={form.client_name} onChange={onChange('client_name')} />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm text-gray-600">Email *</label>
                  <input type="email" className="input" value={form.client_email} onChange={onChange('client_email')} />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm text-gray-600">電話</label>
                  <input className="input" value={form.phone} onChange={onChange('phone')} />
                </div>
              </div>
            </section>

            {/* 任意 */}
            <section>
              <h2 className="font-semibold mb-3">任意</h2>
              <div className="grid md:grid-cols-1 gap-4">
                <div>
                  <label className="text-sm text-gray-600">集合場所（案件住所と違う場合）</label>
                  <input className="input" value={form.meetup ?? ''} onChange={onChange('meetup')} />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm text-gray-600">特記事項</label>
                <textarea className="input h-28" value={form.note ?? ''} onChange={onChange('note')} />
              </div>
              {/* 通知半径は UI から除外（80km 固定） */}
            </section>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={!canNext}
                className={`rounded-lg px-4 py-2 text-white ${canNext ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                オーダー内容を確認
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
