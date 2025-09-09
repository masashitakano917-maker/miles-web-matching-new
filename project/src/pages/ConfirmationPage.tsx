// project/src/pages/ConfirmationPage.tsx
import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

type ConfirmState = {
  service: string;
  plan: string;
  price: number;
  prefer_datetime_1: string;
  prefer_datetime_2: string;
  prefer_datetime_3: string;
  postal: string;
  prefecture: string;
  city: string;
  address2: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  meetup: string;
  note: string;
  radius_km: number;
};

export default function ConfirmationPage() {
  const { state } = useLocation() as { state?: ConfirmState };
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const payload = useMemo(() => state, [state]);

  if (!payload) {
    // 直接アクセス時は発注フォームへ戻す
    navigate('/order', { replace: true });
    return null;
  }

  const fullAddress = `${payload.prefecture}${payload.city}${payload.address2}`;

  const submit = async () => {
    try {
      setSending(true);
      const res = await fetch('/api/matching?action=create_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: payload.client_name,
          client_email: payload.client_email,
          address: fullAddress,
          note: [
            `[サービス] ${payload.service} / ${payload.plan}（${payload.price.toLocaleString()}円）`,
            `[希望日時] ${payload.prefer_datetime_1 || '-'} / ${payload.prefer_datetime_2 || '-'} / ${payload.prefer_datetime_3 || '-'}`,
            payload.meetup ? `[集合場所] ${payload.meetup}` : '',
            payload.client_phone ? `[電話] ${payload.client_phone}` : '',
            payload.note ? `[特記事項] ${payload.note}` : '',
          ].filter(Boolean).join('\n'),
          radius_km: payload.radius_km,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'failed');
      // 成功 → ダッシュボードへ
      navigate('/dashboard', { replace: true });
    } catch (e) {
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
            {payload.service} / {payload.plan}（{payload.price.toLocaleString()}円）
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold">内容</h2>
          <ul className="mt-2 text-gray-800 space-y-1">
            <li>希望日時: {payload.prefer_datetime_1 || '-'} / {payload.prefer_datetime_2 || '-'} / {payload.prefer_datetime_3 || '-'}</li>
            <li>住所: {payload.postal} {payload.prefecture}{payload.city}{payload.address2}</li>
            {payload.meetup && <li>集合場所: {payload.meetup}</li>}
            <li>氏名: {payload.client_name}</li>
            <li>Email: {payload.client_email}</li>
            {payload.client_phone && <li>電話: {payload.client_phone}</li>}
            {payload.note && <li>特記事項: {payload.note}</li>}
            <li>通知半径: {payload.radius_km} km</li>
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
