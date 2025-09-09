// project/src/pages/DashboardPage.tsx
import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCircle, Camera } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const isPro = user?.role === 'professional';
  const isCustomer = user?.role === 'customer';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {isPro ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/professional/profile"
              className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">プロフィール</h2>
                  <p className="text-gray-600 mt-1">
                    Adminが登録したあなたの情報を確認・更新できます（ラベルは閲覧のみ）。
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/professional/jobs"
              className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">撮影・案件一覧</h2>
                  <p className="text-gray-600 mt-1">
                    自分にアサインされた案件の一覧を確認できます。
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
            <p className="text-gray-700">ようこそ、{user?.email} さん</p>
            <p className="text-gray-500 mt-1">ロール: {user?.role ?? '-'}</p>

            {isCustomer && (
              <div className="mt-6">
                {/* 顧客だけ：新規発注ボタン */}
                <Link to="/order/new" className="btn-primary">
                  新規発注
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
