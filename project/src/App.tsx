// project/src/App.tsx
import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ServicePage from './pages/ServicePage';

// 旧: import OrderPage from './pages/OrderPage';
import NewOrderPage from './pages/customer/NewOrderPage'; // ★追加（新しい発注フォーム）

import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfessionalsPage from './pages/admin/ProfessionalsPage';
import ProfessionalsListPage from './pages/admin/ProfessionalsListPage';
import ProfilePage from './pages/professional/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* サービス一覧（カード→カテゴリ→プラン→オーダーへ） */}
        <Route path="/services" element={<ServicePage />} />

        {/* ★「/order」を新しい発注ページに割り当て（サービスページのリンクをそのまま活かす） */}
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
        {/* エイリアス：/order/new でも同じページを表示（どちらでもOK） */}
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

        <Route path="/confirm" element={<ConfirmationPage />} />

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
              </RequireRole>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
