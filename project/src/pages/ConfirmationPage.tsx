import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const form = state as any;

  if (!form?.plan) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-red-600">フォーム情報が見つかりません。最初からやり直してください。</div>
        </main>
      </>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    try {
      // TODO: 発注API呼び出し（Supabase + PostGIS + LINE/メール通知バックエンド）
      // - /api/jobs （サーバ）にPOST
      // - サーバ側でジョブ作成→候補展開→最初の1名に通知
      // - 成功レスポンスでダッシュボードへ
      console.log('ORDER_PAYLOAD', form);
      alert('発注が完了しました（ダミー）。運営ダッシュボードに反映＆通知処理に回します。');
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">確認</h1>
        <div className="card p-6 space-y-3">
          <Row l="プラン" v={`${form.service} / ${form.category} / ${form.plan}`} />
          <Row l="金額" v={`${Number(form.price).toLocaleString()} 円`} />
          <Row l="希望日" v={`第1: ${form.date1} / 第2: ${form.date2 || '-'} / 第3: ${form.date3 || '-'}`} />
          <Row l="住所" v={`〒${form.postal} ${form.prefecture}${form.city}${form.address} ${form.other || ''}`} />
          <Row l="発注者" v={`${form.name} / ${form.phone} / ${form.email}`} />
          <Row l="集合場所" v={form.meetingPoint || '-'} />
          <Row l="特記事項" v={form.notes || '-'} />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={submit} disabled={submitting} className="btn btn-primary px-6 py-3 disabled:opacity-60">発注</button>
          <button onClick={() => history.back()} className="px-5 py-3 rounded-xl border hover:bg-gray-50">戻る</button>
        </div>
      </main>
    </>
  );
}

const Row: React.FC<{ l: string; v: string }> = ({ l, v }) => (
  <div className="grid grid-cols-3 gap-2">
    <div className="text-gray-600">{l}</div>
    <div className="col-span-2">{v}</div>
  </div>
);
