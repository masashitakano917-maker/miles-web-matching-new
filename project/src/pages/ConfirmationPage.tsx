// project/src/pages/ConfirmationPage.tsx
import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

type ConfirmState = {
  service?: 'photo' | 'clean' | 'staff';
  plan_key?: string;     // '20' / '30' / '1ldk' など
  plan?: string;         // 表示名
  price?: number;

  prefer_datetime_1?: string;
  prefer_datetime_2?: string;
  prefer_datetime_3?: string;

  postal?: string;
  prefecture?: string;
  city?: string;
  address2?: string;

  client_name: string;
  client_email: string;
  client_phone?: string;

  meetup?: string;
  note?: string;
};

function fmt(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function ConfirmationPage() {
  const { state } = useLocation() as { state?: ConfirmState };
  const navigate = useNavigate();
  const payload = useMemo<ConfirmState | null>(() => state ?? null, [state]);
  const [sending, setSending] = useState(false);

  if (!payload) {
    navigate('/order', { replace: true });
    return null;
  }

  const fullAddress = `${payload.prefecture ?? ''}${payload.city ?? ''}${payload.address2 ?? ''}`;
  const price = payload.price ?? 0;

  const submit = async () => {
    try {
      setSending(true);
      const res = await fetch('/api/matching?action=create_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: payload.client_name,
          client_email: payload.client_email,
          client_phone: payload.client_phone || undefined,
          address: fullAddress,
          service: payload.service,     // 任意（あればマッチングで使用）
          plan_key: payload.plan_key,   // 任意（あればマッチングで使用）
          note: [
            `[サービス] ${payload.service ?? ''} / ${payload.plan ?? ''}（${price.toLocaleString()}円）`,
            `[希望日時] ${fmt(payload.prefer_datetime_1)} / ${fmt(payload.prefer_datetime_2)} / ${fmt(payload.prefer_datetime_3)}`,
            payload.meetup ? `[集合場所] ${payload.meetup}` : '',
            payload.client_phone ? `[電話] ${payload.client_phone}` : '',
            payload.note ? `[特記事項] ${payload.note}` : '',
          ].filter(Boolean).join('\n'),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'failed');
      navigate('/dashboard', { replace: true });
    } catch {
      alert('送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">オーダー内容の確認</h1>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold">選択プラン</h2>
          <div className="mt-2 text-gray-800">
            {(payload.service ?? '')} / {(payload.plan ?? '')}（{price.toLocaleString()}円）
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold">内容</h2>
          <ul className="mt-2 text-gray-800 space-y-1">
            <li>第一希望日: {fmt(payload.prefer_datetime_1)}</li>
            <li>第二希望日: {fmt(payload.prefer_datetime_2)}</li>
            <li>第三希望日: {fmt(payload.prefer_datetime_3)}</li>
            <li>住所: {payload.postal ?? ''} {fullAddress}</li>
            {payload.meetup && <li>集合場所: {payload.meetup}</li>}
            <li>氏名: {payload.client_name}</li>
            <li>Email: {payload.client_email}</li>
            {payload.client_phone && <li>電話: {payload.client_phone}</li>}
            {payload.note && <li>特記事項: {payload.note}</li>}
          </ul>
        </section>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={sending}
            className="rounded-xl bg-orange-600 text-white px-6 py-3 hover:bg-orange-700 disabled:opacity-60"
          >
            {sending ? '送信中…' : 'オーダー送信'}
          </button>
          <button
            onClick={() => navigate('/order', { state: payload })}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 hover:bg-gray-50"
          >
            編集に戻る
          </button>
          <Link to="/dashboard" className="text-gray-600 hover:underline">キャンセル</Link>
        </div>
      </main>
    </div>
  );
}
