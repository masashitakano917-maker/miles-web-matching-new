import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {!user ? (
          <div className="text-gray-700">ログインしてください。</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-semibold mb-2">ようこそ、{user.name} さん</h2>
              <div className="text-gray-600">ロール: {user.role}</div>
            </div>

            {user.role === 'customer' && (
              <div className="card p-6">
                <h3 className="font-semibold mb-2">発注はこちら</h3>
                <div className="flex gap-3">
                  <NavLink to="/services?tab=photo" className="px-4 py-2 rounded-xl border hover:bg-gray-50">写真撮影</NavLink>
                  <NavLink to="/services?tab=clean" className="px-4 py-2 rounded-xl border hover:bg-gray-50">お掃除</NavLink>
                </div>
              </div>
            )}

            {user.role === 'professional' && (
              <div className="card p-6">
                <h3 className="font-semibold mb-2">案件通知</h3>
                <p className="text-gray-600 text-sm">順次通知でOKを押すと担当確定（デモでは未接続）</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
