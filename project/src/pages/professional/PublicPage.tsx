// project/src/pages/professional/PublicPage.tsx
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type Pro = {
  id: string;
  name: string;
  bio: string | null;
  camera_gear: string | null;
  labels: string[] | null;
};
type Item = { id: string; image_url: string; title: string | null };

export default function PublicPage() {
  const { id } = useParams<{ id: string }>();
  const [pro, setPro] = useState<Pro | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!id) return;
      const { data: p } = await supabase
        .from('professionals')
        .select('id,name,bio,camera_gear,labels')
        .eq('id', id)
        .maybeSingle();
      setPro(p as Pro | null);

      const { data: it } = await supabase
        .from('portfolio_items') // 存在しなくても落ちない
        .select('id,image_url,title')
        .eq('professional_id', id)
        .order('created_at', { ascending: false });
      setItems((it || []) as Item[]);

      setLoading(false);
    }
    run();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {!pro ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-gray-600">{loading ? '読み込み中…' : 'ページが見つかりません。'}</p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{pro.name}</h1>
              <div className="mt-3 text-gray-700 whitespace-pre-wrap">{pro.bio || '自己紹介は未登録です。'}</div>
              {pro.camera_gear && (
                <div className="mt-4">
                  <h2 className="text-sm font-medium text-gray-600">機材</h2>
                  <div className="text-gray-700 whitespace-pre-wrap">{pro.camera_gear}</div>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {(pro.labels || []).map((l) => (
                  <span key={l} className="inline-block rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 text-xs">
                    {l}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h2>
              {items.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-gray-600">
                  まだ作品がありません。
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {items.map((it) => (
                    <figure key={it.id} className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image_url} alt={it.title || ''} className="w-full h-56 object-cover" />
                      {it.title && <figcaption className="px-3 py-2 text-sm text-gray-700">{it.title}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
