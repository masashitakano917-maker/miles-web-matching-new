import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ServicePage from './pages/ServicePage';
import OrderPage from './pages/OrderPage';
import ConfirmationPage from './pages/ConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';

import ProfessionalsPage from './pages/admin/ProfessionalsPage';

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
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/confirm" element={<ConfirmationPage />} />

        {/* Authed */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
