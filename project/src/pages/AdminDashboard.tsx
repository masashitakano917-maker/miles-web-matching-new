import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { ClipboardList, UsersRound } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>

          <Link to="/admin/orders" className="block card p-6 hover:shadow-xl transition border border-white/40">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </span>
              <div>
                <div className="font-bold">発注一覧（デモ）</div>
                <p className="text-gray-600 text-sm mt-1">
                  本番ではここにオーダーが並び、郵便番号ベースで候補展開→順次通知（7分）→確定までの進捗が見えます。
                </p>
              </div>
            </div>
          </Link>

          <Link to="/admin/professionals" className="block card p-6 hover:shadow-xl transition border border-white/40">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <UsersRound className="w-6 h-6" />
              </span>
              <div>
                <div className="font-bold">プロフェッショナル管理</div>
                <p className="text-gray-600 text-sm mt-1">
                  登録/編集・一括CSVインポート、住所（郵便番号→住所）やプロフィール、ラベルなどを管理。
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
