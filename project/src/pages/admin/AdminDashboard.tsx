import React from 'react';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import { Users, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 lg:px-0 py-10 space-y-10">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>

        {/* ショートカットカード */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Link
            to="/admin/professionals"
            className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">プロフェッショナル管理</div>
                <div className="text-gray-500 text-sm">
                  登録・編集・CSV インポート、検索
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">依頼管理</div>
                <div className="text-gray-500 text-sm">
                  依頼の一覧・ステータス
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 既存の検索 UI をここに残している場合はそのコンポーネントをここへ */}
        {/* <ProfessionalSearch /> */}
      </main>
    </div>
  );
}
