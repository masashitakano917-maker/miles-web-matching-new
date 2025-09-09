// project/src/pages/PlanSelectPage.tsx
import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';

type Service = 'photo' | 'clean' | 'staff';
type Plan = { label: string; price: number; note?: string };

const PLANS: Record<Service, { title: string; desc?: string; items: Plan[] }> = {
  photo: {
    title: '写真撮影のプランを選択',
    desc: '撮影日の翌々日に納品。',
    items: [
      { label: '20枚撮影', price: 20000 },
      { label: '30枚撮影', price: 29000 },
      { label: '40枚撮影', price: 38000 },
    ],
  },
  clean: {
    title: '清掃サービスのプランを選択',
    items: [
      { label: '1LDK', price: 20000 },
      { label: '2LDK', price: 39000 },
      { label: '3LDK', price: 58000 },
    ],
  },
  staff: {
    title: '人材派遣のプランを選択',
    items: [
      { label: '翻訳 / 通訳（1時間）', price: 3000 },
      { label: 'イベントコンパニオン（1時間）', price: 4000 },
      { label: 'その他のご相談（メール/電話）', price: 0, note: '内容に応じて別途お見積り' },
    ],
  },
};

export default function PlanSelectPage(): JSX.Element {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const service = (sp.get('service') as Service) ?? 'photo';
  const conf = useMemo(() => PLANS[service], [service]);

  const go = (p: Plan) => {
    navigate(`/order/new?service=${service}&plan=${encodeURIComponent(p.label)}&price=${p.price}`);
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(`/services?tab=${service}`)}
          className="text-sm text-orange-700 hover:underline"
        >
          ← サービス一覧に戻る
        </button>

        <h1 className="text-2xl font-bold mt-2">{conf.title}</h1>
        {conf.desc && <p className="text-gray-600 mt-1">{conf.desc}</p>}

        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          {conf.items.map((p) => (
            <div key={p.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold">{p.label}</div>
              <div className="text-gray-700 mt-1">{p.price.toLocaleString()}円</div>
              {p.note && <div className="text-sm text-gray-500 mt-1">{p.note}</div>}

              <button
                onClick={() => go(p)}
                className="mt-4 inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
              >
                このプランでオーダーへ
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
