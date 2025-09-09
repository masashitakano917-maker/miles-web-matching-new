// project/src/App.tsx
import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ServicePage from './pages/ServicePage';
import OrderPage from './pages/OrderPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfessionalsPage from './pages/admin/ProfessionalsPage';
import ProfessionalsListPage from './pages/admin/ProfessionalsListPage';
import ProfilePage from './pages/professional/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// ★ 追加: 顧客の新規発注ページ
import NewOrderPage from './pages/customer/NewOrderPage';

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
        <Route path="/services" element={<ServicePage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/confirm" element={<ConfirmationPage />} />

        {/* ★ 追加: 顧客がログイン後に使う本番用の新規発注ページ */}
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

        {/* Professional */}
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
