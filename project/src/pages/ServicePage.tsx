// project/src/pages/ServicePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Camera, Shield, Users } from 'lucide-react';

type Card = {
  key: 'photo' | 'clean' | 'staff';
  title: string;
  desc: string;
  icon: React.ReactNode;
};

const CARDS: Card[] = [
  {
    key: 'photo',
    title: 'プロフェッショナル写真撮影',
    desc: '不動産・料理・ビジネスポートレート・ウエディングなど、熟練のプロが対応。',
    icon: <Camera className="h-6 w-6 text-orange-600" />,
  },
  {
    key: 'clean',
    title: '清掃サービス',
    desc: 'スタジオからご自宅まで、要件に合わせて丁寧にクリーニング。',
    icon: <Shield className="h-6 w-6 text-orange-600" />,
  },
  {
    key: 'staff',
    title: '人材派遣ソリューション',
    desc: 'イベントや短期案件に最適な人材を柔軟にアサイン。',
    icon: <Users className="h-6 w-6 text-orange-600" />,
  },
];

export default function ServicePage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center">プロフェッショナルサービス</h1>
        <p className="text-center text-gray-600 mt-2">あなたのニーズに合わせた高品質なサービスをご提供します</p>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {CARDS.map((c) => (
            <div key={c.key} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center mb-4">{c.icon}</div>
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="text-gray-600 mt-2">{c.desc}</p>

              <div className="mt-5 flex items-center gap-4">
                <button
                  onClick={() => navigate(`/services?tab=${c.key}`)}
                  className="text-sm text-orange-700 hover:underline"
                >
                  詳細を見る
                </button>
                <button
                  onClick={() => navigate(`/services/plan?service=${c.key}`)}
                  className="ml-auto inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                  オーダーへ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ※ 下部の重複セクションは削除済み */}
      </main>
    </>
  );
}
