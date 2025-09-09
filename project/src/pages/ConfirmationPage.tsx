// project/src/pages/ConfirmationPage.tsx
import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

type ConfirmState = {
  // プラン表示用
  service: string;          // 例: "photo" / "clean" / "staff" あるいは日本語ラベル
  plan: string;             // 例: "20枚撮影" / "1LDK" / "翻訳・通訳" など
  price: number;

  // 希望日時（datetime-local の文字列を想定）
  prefer_datetime_1: string;
  prefer_datetime_2: string;
  prefer_datetime_3: string;

  // 住所・連絡
  postal: string;
  prefecture: string;
  city: string;
  address2: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  meetup: string;
  note: string;

  // 互換用（古いstateに残っている可能性）
  radius_km?: number;

  // ある場合は優先して使う（PlanSelectPageから渡る想定）
  plan_key?: string;                  // '20' | '30' | '40' | '1ldk' | '2ldk' | '3ldk' | 'translate' | 'companion' | 'other'
  service_code?: 'photo' | 'clean' | 'staff';
  plan_title?: string;                // 表示名（任意）
};

// 日時を "YYYY/MM/DD HH:mm" に整形
const fmt = (s?: string) => {
  if (!s) return '-';
  const d = new Date(s);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// 日本語ラベル等から plan_key を推測（保険）
function derivePlanKey(service: string, plan: string): string | undefined {
  const sv = service.toLowerCase();
  const p = plan.toLowerCase();

  if (sv.includes('photo') || sv.includes('写真')) {
    if (p.includes('20')) return '20';
    if (p.includes('30')) return '30';
    if (p.includes('40')) return '40';
  }
  if (sv.includes('clean') || sv.includes('掃除') || sv.includes('クリーニング')) {
    if (p.includes('1ldk') || p.startsWith('1')) return '1ldk';
    if (p.includes('2ldk') || p.startsWith('2')) return '2ldk';
    if (p.includes('3ldk') || p.startsWith('3')) return '3ldk';
  }
  if (sv.includes('staff') || sv.includes('スタッフ')) {
    if (p.includes('翻訳') || p.includes('通訳') || p.includes('translate')) return 'translate';
    if (p.includes('コンパニオン') || p.includes('companion')) return 'companion';
    return 'other';
  }
  return undefined;
}

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

  const planTitle =
    payload.plan_title ??
    `${payload.service} / ${payload.plan}（${payload.price.toLocaleString()}円）`;

  const submit = async () => {
    try {
      setSending(true);

      // service / plan_key は PlanSelectPage から来る値を最優先。
      const serviceForApi =
        payload.service_code ?? (['photo', 'clean', 'staff'].includes(payload.service as any) ? (payload.service as any) : undefined) ?? 'photo';
      const planKeyForApi =
        payload.plan_key ?? derivePlanKey(payload.service, payload.plan) ?? '20';

      const body = {
        // 依頼者
        client_name: payload.client_name,
        client_email: payload.client_email,
        phone: payload.client_phone || undefined,

        // 住所（分割で送る：APIがジオコーディング）
        postal: payload.postal,
        prefecture: payload.prefecture,
        city: payload.city,
        address2: payload.address2,

        // サービス／プラン
        service: serviceForApi,
        plan_key: planKeyForApi,
        plan_title: planTitle,

        // 希望日時（API側でそのまま保存）
        first_pref_at: payload.prefer_datetime_1 || undefined,
        second_pref_at: payload.prefer_datetime_2 || undefined,
        third_pref_at: payload.prefer_datetime_3 || undefined,

        // 備考
        note: [
          payload.meetup ? `【集合場所】${payload.meetup}` : '',
          payload.note ? `【特記事項】${payload.note}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      };

      const res = await fetch('/api/matching?action=create_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
          <div className="mt-2 text-gray-800">{planTitle}</div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-6">
          <h2 className="text-lg font-semibold">内容</h2>
          <ul className="mt-2 text-gray-800 space-y-1">
            <li>第一希望日：{fmt(payload.prefer_datetime_1)}</li>
            <li>第二希望日：{fmt(payload.prefer_datetime_2)}</li>
            <li>第三希望日：{fmt(payload.prefer_datetime_3)}</li>
            <li>
              住所: {payload.postal}{' '}
              {payload.prefecture}
              {payload.city}
              {payload.address2}
            </li>
            {payload.meetup && <li>集合場所: {payload.meetup}</li>}
            <li>氏名: {payload.client_name}</li>
            <li>Email: {payload.client_email}</li>
            {payload.client_phone && <li>電話: {payload.client_phone}</li>}
            {payload.note && <li>特記事項: {payload.note}</li>}
            {/* 通知半径は仕様により非表示に変更 */}
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
          <Link to="/dashboard" className="text-gray-600 hover:underline">
            キャンセル
          </Link>
        </div>
      </main>
    </div>
  );
}
