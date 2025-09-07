// project/src/pages/admin/AdminDashboard.tsx
import React from 'react';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import { ClipboardList, Users } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin</h1>

        <div className="space-y-6">
          {/* 依頼一覧 */}
          <Link
            to="/admin/orders"
            className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">依頼一覧</h2>
                <p className="text-gray-600 mt-1">
                  発注（依頼）を一覧で管理します。進捗・並び替え・検索が可能です。
                </p>
              </div>
            </div>
          </Link>

          {/* プロフェッショナル管理（登録/編集） */}
          <Link
            to="/admin/professionals"
            className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">プロフェッショナル管理</h2>
                <p className="text-gray-600 mt-1">
                  登録 / 編集・一括CSVインポート、住所（郵便番号→都道府県/市区町村の自動補完）、
                  プロフィール、ラベルを管理します。
                </p>
              </div>
            </div>
          </Link>

          {/* 新規：プロフェッショナル一覧 */}
          <Link
            to="/admin/professionals/list"
            className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">プロフェッショナル一覧</h2>
                <p className="text-gray-600 mt-1">
                  登録済みのプロフェッショナルを検索・絞り込み（氏名/ラベル/都道府県）して閲覧できます。
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
