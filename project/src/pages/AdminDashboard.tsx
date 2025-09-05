import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        {user?.role !== 'admin' ? (
          <div className="text-red-600">権限がありません。</div>
        ) : (
          <>
            <div className="card p-6 mb-6">
              <h2 className="font-semibold mb-2">発注一覧（デモ）</h2>
              <p className="text-gray-600 text-sm">本番ではここにオーダーが並び、郵便番号ベースで候補展開→順次通知（7分）→確定までの進捗が見えます。</p>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold mb-2">カメラマン管理（デモ）</h2>
              <p className="text-gray-600 text-sm">登録/編集/一括インポート、位置情報（郵便番号→座標）更新など。</p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
