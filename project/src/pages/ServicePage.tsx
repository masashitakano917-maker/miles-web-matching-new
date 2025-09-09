// project/src/pages/ServicePage.tsx
import React from 'react';
import { Link, NavLink, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { SERVICES } from '../data/services';

export default function ServicePage() {
  const [sp] = useSearchParams();
  const tab = (sp.get('tab') ?? 'photo') as string;

  const cards = [
    { key: 'photo', icon: '📷', desc: '不動産・料理・ビジネスポートレート・ウェディングなど、熟練のプロが対応。' },
    { key: 'clean', icon: '🛡️', desc: 'スタジオからご自宅まで、要件に合わせて丁寧にクリーニング。' },
    { key: 'staff', icon: '👥', desc: 'イベントや短期案件に最適な人材を柔軟にアサイン。' },
  ];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center">プロフェッショナルサービス</h1>
        <p className="text-center text-gray-600 mt-3">あなたのニーズに合わせた高品質なサービスをご提供します</p>

        <div className="flex items-center justify-center gap-2 mt-8">
          <NavLink to="/services?tab=photo" className={({ isActive }) =>
            `px-3 py-2 rounded-lg ${tab === 'photo' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`
          }>写真撮影</NavLink>
          <NavLink to="/services?tab=clean" className={({ isActive }) =>
            `px-3 py-2 rounded-lg ${tab === 'clean' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`
          }>お掃除</NavLink>
          <NavLink to="/services?tab=staff" className={({ isActive }) =>
            `px-3 py-2 rounded-lg ${tab === 'staff' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`
          }>人材派遣</NavLink>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {cards.map((c) => (
            <div key={c.key} className={`rounded-2xl border ${tab === c.key ? 'border-orange-300' : 'border-gray-200'} bg-white p-6 shadow-sm`}>
              <div className="text-3xl">{c.icon}</div>
              <h2 className="text-lg font-semibold mt-2">
                {SERVICES.find((s) => s.key === c.key)?.title ?? ''}
              </h2>
              <p className="text-gray-600 text-sm mt-2">{c.desc}</p>
              <div className="flex items-center gap-3 mt-4">
                <Link
                  to={`/services/plan?service=${c.key}`}
                  className="inline-flex items-center rounded-xl bg-orange-600 text-white px-4 py-2 text-sm hover:bg-orange-700 transition"
                >
                  オーダーへ
                </Link>
                <Link to={`/services?tab=${c.key}`} className="text-sm text-orange-700 hover:underline">
                  詳細を見る
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 以前の下部大枠（重複説明ブロック）は完全削除 */}
      </main>
    </>
  );
}
