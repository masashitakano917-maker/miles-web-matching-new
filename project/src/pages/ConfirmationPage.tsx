// project/src/pages/ConfirmationPage.tsx
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

type FormState = {
  service: 'photo' | 'clean' | 'staff';
  plan: string;
  price: number;
  date1: string; date2: string; date3: string;
  postal: string; prefecture: string; city: string; line1: string;
  client_name: string; client_email: string; phone: string;
  meetup?: string; note?: string;
  radius_km: number; // 受け取りはするが画面表示はしない（固定80）
};

export default function ConfirmationPage(): JSX.Element {
  const nav = useNavigate();
  const { state } = useLocation();
  const data = state as FormState | undefined;

  const [submitting, setSubmitting] = useState(false);
  const address = useMemo(() => `${data?.prefecture ?? ''}${data?.city ?? ''}${data?.line1 ?? ''}`, [data]);

  if (!data) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="rounded-xl border bg-white p-6">入力データが見つかりません。最初からやり直してください。</div>
        </main>
      </>
    );
  }

  const submit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const noteLines = [
        `【プラン】${data.plan} / ${data.price.toLocaleString()}円`,
        `【第一希望】${data.date1 || '-'}`,
        `【第二希望】${data.date2 || '-'}`,
        `【第三希望】${data.date3 || '-'}`,
        `【電話】${data.phone || '-'}`,
        data.meetup ? `【集合場所】${data.meetup}` : '',
        data.note ? `【特記事項】${data.note}` : '',
      ].filter(Boolean);

      const res = await fetch('/api/matching?action=create_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: data.client_name,
          client_email: data.client_email,
          address,
          note: noteLines.join('\n'),
          radius_km: 80, // ← 常に 80km で送信
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        alert(`作成に失敗しました：${json?.error ?? 'unknown'}`);
        setSubmitting(false);
        return;
      }
      alert('オーダーを受け付けました。近いプロへ順次通知します。');
      nav('/dashboard', { replace: true });
    } catch {
      alert('通信に失敗しました。時間をおいてお試しください。');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">オーダー内容の確認</h1>

          <div className="space-y-3 text-gray-800">
            <Row label="プラン">
              {data.plan}（{data.price.toLocaleString()}円）
            </Row>
            <Row label="第一希望日時">{data.date1 || '-'}</Row>
            <Row label="第二希望日時">{data.date2 || '-'}</Row>
            <Row label="第三希望日時">{data.date3 || '-'}</Row>
            <Row label="案件住所">
              {data.postal}／{address}
            </Row>
            <Row label="氏名">{data.client_name}</Row>
            <Row label="Email">{data.client_email}</Row>
            <Row label="電話">{data.phone || '-'}</Row>
            <Row label="集合場所">{data.meetup || '-'}</Row>
            <Row label="特記事項">{data.note || '-'}</Row>
            {/* 通知半径の行は表示しない */}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => nav(-1)} className="rounded-lg px-4 py-2 border hover:bg-gray-50">
              編集
            </button>
            <button onClick={() => nav('/dashboard', { replace: true })} className="rounded-lg px-4 py-2 border hover:bg-gray-50">
              キャンセル
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className={`rounded-lg px-4 py-2 text-white ${submitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {submitting ? '送信中…' : 'オーダー確定'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-gray-500">{label}</div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}
