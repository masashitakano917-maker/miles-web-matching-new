// project/src/App.tsx
import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ServicePage from './pages/ServicePage';
import PlanSelectPage from './pages/PlanSelectPage'; // プラン一覧
import NewOrderPage from './pages/customer/NewOrderPage'; // 新しい発注フォーム
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ProfessionalsPage from './pages/admin/ProfessionalsPage';
import ProfessionalsListPage from './pages/admin/ProfessionalsListPage';

import ProfilePage from './pages/professional/ProfilePage';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Footer from './components/Footer'; // ★追加

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}

function RequireRole({
  role,
  children,
}: {
  role: 'admin' | 'customer' | 'professional';
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user || user.role !== role) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      {/* 画面全体の高さを確保してフッターを下に固定 */}
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            {/* 公開ページ */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/services" element={<ServicePage />} />

            {/* プラン一覧（オレンジの「オーダーへ」から遷移） */}
            <Route
              path="/services/plan"
              element={
                <RequireAuth>
                  <RequireRole role="customer">
                    <PlanSelectPage />
                  </RequireRole>
                </RequireAuth>
              }
            />

            {/* 発注フォーム（/order と /order/new の両方で到達可） */}
            <Route
              path="/order"
              element={
                <RequireAuth>
                  <RequireRole role="customer">
                    <NewOrderPage />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="/order/new"
              element={
                <RequireAuth>
                  <RequireRole role="customer">
                    <NewOrderPage />
                  </RequireRole>
                </RequireAuth>
              }
            />

            {/* 内容確認 */}
            <Route
              path="/confirm"
              element={
                <RequireAuth>
                  <RequireRole role="customer">
                    <ConfirmationPage />
                  </RequireRole>
                </RequireAuth>
              }
            />

            {/* ダッシュボード */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <RequireRole role="admin">
                    <AdminDashboard />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/professionals"
              element={
                <RequireAuth>
                  <RequireRole role="admin">
                    <ProfessionalsPage />
                  </RequireRole>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/professionals/list"
              element={
                <RequireAuth>
                  <RequireRole role="admin">
                    <ProfessionalsListPage />
                  </Role>
                </RequireAuth>
              }
            />

            {/* Professional 本人ページ */}
            <Route
              path="/professional/profile"
              element={
                <RequireAuth>
                  <RequireRole role="professional">
                    <ProfilePage />
                  </RequireRole>
                </RequireAuth>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* 共通フッター */}
        <Footer />
      </div>
    </AuthProvider>
  );
}
