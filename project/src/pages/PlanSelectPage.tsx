// project/src/pages/PlanSelectPage.tsx
import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { getService } from '../data/services';

export default function PlanSelectPage() {
  const [sp] = useSearchParams();
  const serviceKey = sp.get('service') ?? 'photo';
  const service = getService(serviceKey);
  const navigate = useNavigate();

  if (!service) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-gray-600">サービスが見つかりません。<Link className="text-orange-700 underline" to="/services">サービス一覧へ戻る</Link></p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">{service.title} のプラン</h1>
        {service.short && <p className="text-gray-600 mt-2">{service.short}</p>}

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {service.plans.map((p) => (
            <button
              key={p.key}
              onClick={() =>
                navigate(`/order?service=${encodeURIComponent(service.key)}&plan=${encodeURIComponent(p.name)}&price=${p.price}`)
              }
              className="text-left rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition"
            >
              <div className="font-semibold">{p.name}</div>
              <div className="mt-1 text-gray-800">{p.price.toLocaleString()}円</div>
              {p.note && <div className="text-xs text-gray-500 mt-1">{p.note}</div>}
              <div className="mt-3 inline-flex rounded-lg bg-orange-600 text-white px-3 py-1 text-sm">このプランでオーダーへ</div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/services" className="text-sm text-gray-600 hover:underline">← サービス一覧に戻る</Link>
        </div>
      </main>
    </>
  );
}
