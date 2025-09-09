// project/src/pages/ServicePage.tsx
import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { Camera, ShieldCheck, Users } from 'lucide-react';

type TabKey = 'photo' | 'clean' | 'staff';

const TABS: { key: TabKey; label: string; desc: string; icon: React.ComponentType<any> }[] = [
  {
    key: 'photo',
    label: 'プロフェッショナル写真撮影',
    desc: '不動産・料理・ビジネスポートレート・ウェディングなど、熟練のプロが対応。',
    icon: Camera,
  },
  {
    key: 'clean',
    label: '清掃サービス',
    desc: 'スタジオからご自宅まで、要件に合わせて丁寧にクリーニング。',
    icon: ShieldCheck,
  },
  {
    key: 'staff',
    label: '人材派遣ソリューション',
    desc: 'イベントや長期案件に最適な人材を柔軟にアサイン。',
    icon: Users,
  },
];

function useCurrentTab(): TabKey {
  const [sp] = useSearchParams();
  const t = sp.get('tab');
  return (t === 'photo' || t === 'clean' || t === 'staff') ? (t as TabKey) : 'photo';
}

export default function ServicePage(): JSX.Element {
  const tab = useCurrentTab();
  const active = useMemo(() => TABS.find(t => t.key === tab)!, [tab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* 見出し */}
        <section className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 text-center">
            プロフェッショナルサービス
          </h1>
          <p className="mt-3 text-center text-gray-600">
            あなたのニーズに合わせた高品質なサービスをご提供します
          </p>
        </section>

        {/* 3カード（既存リンク維持＆オーダーへ） */}
        <section className="grid gap-6 md:grid-cols-3">
          {TABS.map(({ key, label, desc, icon: Icon }) => (
            <article
              key={key}
              className={`rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden ${
                key === tab ? 'border-orange-300 ring-2 ring-orange-200' : 'border-gray-100'
              }`}
            >
              <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Icon className="h-10 w-10 text-gray-500" />
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 rounded-xl bg-orange-100 items-center justify-center">
                    <Icon className="h-5 w-5 text-orange-600" />
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
                </div>
                <p className="mt-2 text-gray-600">{desc}</p>

                <div className="mt-4 flex items-center gap-3">
                  {/* 既存のリンク仕様を維持 */}
                  <Link
                    to={`/services?tab=${key}`}
                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    詳細を見る →
                  </Link>
                  {/* オーダーへ（既存の /order を使用） */}
                  <Link
                    to={`/order?service=${key}`}
                    className="btn-primary text-sm"
                  >
                    オーダーへ
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* タブ詳細（軽い説明＋CTA） */}
        <section className="mt-10 rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
          <div className="flex items-center gap-3">
            <active.icon className="h-6 w-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">{active.label}</h3>
          </div>
          <p className="mt-3 text-gray-700">{active.desc}</p>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-1">
            {tab === 'photo' && (
              <>
                <li>撮影場所・日時・目的を指定すると、近隣のカメラマンから順次オファー。</li>
                <li>最初にOKしたプロとマッチング成立。</li>
              </>
            )}
            {tab === 'clean' && (
              <>
                <li>規模や要件に応じて作業内容を最適化。立ち会い可否や備品の有無も事前確認。</li>
                <li>近隣の清掃スタッフから順次オファー。</li>
              </>
            )}
            {tab === 'staff' && (
              <>
                <li>イベント運営、受付、撮影アシスタントなど用途に応じて人材を手配。</li>
                <li>人数・スキル・場所・時間を入力するだけで自動マッチング。</li>
              </>
            )}
          </ul>

          <div className="mt-6">
            <Link to={`/order?service=${tab}`} className="btn-primary">
              この内容でオーダーへ
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
