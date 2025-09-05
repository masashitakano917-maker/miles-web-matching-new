import React from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';

type Plan = { name: string; price: number; unit?: string; extra?: string };
type Category = { key: string; title: string; plans: Plan[] };

const PHOTO_CATEGORIES: Category[] = [
  {
    key: 'realestate',
    title: '不動産物件撮影',
    plans: [
      { name: '20枚納品', price: 20000, extra: '追加1枚 1,000円' },
      { name: '30枚納品', price: 29000, extra: '追加1枚 1,000円' },
      { name: '40枚納品', price: 39000, extra: '追加1枚 1,000円' },
    ],
  },
  {
    key: 'food',
    title: 'Food撮影',
    plans: [
      { name: '10メニュー', price: 15000, extra: '追加1メニュー 1,000円' },
      { name: '15メニュー', price: 22000, extra: '追加1メニュー 1,000円' },
      { name: '20メニュー', price: 28000, extra: '追加1メニュー 1,000円' },
    ],
  },
  {
    key: 'portrait',
    title: 'ビジネスポートレート',
    plans: [
      { name: '20枚納品', price: 20000, extra: '追加1枚 1,000円' },
      { name: '30枚納品', price: 29000, extra: '追加1枚 1,000円' },
      { name: '40枚納品', price: 39000, extra: '追加1枚 1,000円' },
    ],
  },
  {
    key: 'wedding',
    title: 'ウエディング撮影',
    plans: [
      { name: '20枚納品', price: 20000, extra: '追加1枚 1,000円' },
      { name: '30枚納品', price: 29000, extra: '追加1枚 1,000円' },
      { name: '40枚納品', price: 39000, extra: '追加1枚 1,000円' },
    ],
  },
];

const CLEAN_CATEGORIES: Category[] = [
  { key: 'studio', title: 'Studio', plans: [{ name: 'Studio', price: 8000 }] },
  { key: '1ldk', title: '1LDK', plans: [{ name: '1LDK', price: 12000 }] },
  { key: '2ldk', title: '2LDK', plans: [{ name: '2LDK', price: 16000 }] },
  { key: '3ldk', title: '3LDK', plans: [{ name: '3LDK', price: 20000 }] },
];

export default function ServicePage() {
  const [sp] = useSearchParams();
  const tab = sp.get('tab') ?? 'photo';
  const navigate = useNavigate();

  const section = tab === 'clean' ? CLEAN_CATEGORIES : PHOTO_CATEGORIES;
  const serviceLabel = tab === 'clean' ? 'お掃除サービス' : '写真撮影';

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{serviceLabel}</h1>
          <nav className="flex gap-2">
            <NavLink to="/services?tab=photo" className={({isActive}) => `px-3 py-2 rounded-lg ${tab==='photo' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>写真撮影</NavLink>
            <NavLink to="/services?tab=clean" className={({isActive}) => `px-3 py-2 rounded-lg ${tab==='clean' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}>お掃除</NavLink>
            <NavLink to="/services?tab=staff" className="px-3 py-2 rounded-lg hover:bg-gray-100">人材派遣</NavLink>
          </nav>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {section.map((cat) => (
            <div key={cat.key} className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{cat.title}</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {cat.plans.map((p, idx) => (
                  <button
                    key={idx}
                    className="border rounded-xl p-4 text-left hover:shadow-md transition group"
                    onClick={() => navigate(`/order?service=${encodeURIComponent(serviceLabel)}&category=${encodeURIComponent(cat.title)}&plan=${encodeURIComponent(p.name)}&price=${p.price}`)}
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-gray-700 mt-1">{p.price.toLocaleString()}円</div>
                    {p.extra && <div className="text-sm text-gray-500 mt-1">{p.extra}</div>}
                    <div className="text-sm text-blue-600 mt-2 group-hover:underline">オーダーへ</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
