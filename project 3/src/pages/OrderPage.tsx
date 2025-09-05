import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';

type OrderForm = {
  plan: string;
  price: number;
  service: string;
  category: string;

  date1: string;
  date2: string;
  date3: string;

  postal: string;
  prefecture: string;
  city: string;
  address: string;
  other: string;

  name: string;
  phone: string;
  email: string;

  meetingPoint: string;
  notes: string;
};

export default function OrderPage() {
  const [sp] = useSearchParams();
  const initial = useMemo<OrderForm>(() => ({
    plan: sp.get('plan') ?? '',
    price: Number(sp.get('price') ?? 0),
    service: sp.get('service') ?? '',
    category: sp.get('category') ?? '',

    date1: '', date2: '', date3: '',
    postal: '', prefecture: '', city: '', address: '', other: '',
    name: '', phone: '', email: '',
    meetingPoint: '',
    notes: '',
  }), [sp]);

  const [form, setForm] = useState<OrderForm>(initial);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onChange = (k: keyof OrderForm, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const validate = (): string | null => {
    if (!form.plan || !form.price) return 'プランを選択してください（前ページへ戻り、プランを選択してから遷移してください）。';
    if (!form.date1) return '第一希望日を入力してください。';
    if (!/^\d{7}$/.test(form.postal.replace('-', ''))) return '郵便番号は7桁（ハイフンなし）で入力してください。';
    if (!form.prefecture || !form.city || !form.address) return '住所の必須項目（都道府県・市区町村・それ以降）を入力してください。';
    if (!form.name) return '氏名を入力してください。';
    if (!/^[0-9+\-() ]{8,}$/.test(form.phone)) return '電話番号の形式が正しくありません。';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'メールアドレスの形式が正しくありません。';
    return null;
    // 確認ページで最終確認 → 発注API呼び出し
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = validate();
    if (m) { setErr(m); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    // 確認ページへ
    navigate('/confirm', { state: form });
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">オーダーフォーム</h1>

        <div className="card p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">プラン</div>
              <div className="font-semibold">{form.service} / {form.category} / {form.plan}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">金額</div>
              <div className="font-semibold">{form.price.toLocaleString()} 円</div>
            </div>
          </div>
        </div>

        {err && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{err}</div>}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="card p-6 grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">第一候補</label>
              <input type="date" className="input" value={form.date1} onChange={(e) => onChange('date1', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">第二候補</label>
              <input type="date" className="input" value={form.date2} onChange={(e) => onChange('date2', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">第三候補</label>
              <input type="date" className="input" value={form.date3} onChange={(e) => onChange('date3', e.target.value)} />
            </div>
          </div>

          <div className="card p-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">郵便番号（7桁・ハイフンなし）</label>
              <input className="input" maxLength={7} value={form.postal} onChange={(e) => onChange('postal', e.target.value.replace(/[^0-9]/g,''))} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">都道府県</label>
              <input className="input" value={form.prefecture} onChange={(e) => onChange('prefecture', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">市区町村</label>
              <input className="input" value={form.city} onChange={(e) => onChange('city', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">それ以降</label>
              <input className="input" value={form.address} onChange={(e) => onChange('address', e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">その他情報</label>
              <textarea className="input min-h-[80px]" value={form.other} onChange={(e) => onChange('other', e.target.value)} />
            </div>
          </div>

          <div className="card p-6 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">発注者氏名</label>
              <input className="input" value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">電話番号</label>
              <input className="input" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input className="input" type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">集合場所</label>
              <input className="input" value={form.meetingPoint} onChange={(e) => onChange('meetingPoint', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">撮影に関する特記事項</label>
              <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => onChange('notes', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary px-6 py-3">確認ページへ</button>
            <button type="button" className="px-5 py-3 rounded-xl border hover:bg-gray-50" onClick={() => history.back()}>戻る</button>
          </div>
        </form>
      </main>
    </>
  );
}
