import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* 左側ロゴ（クリックでHomeへ） */}
        <Link to="/" onClick={goHome} className="inline-flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Miles</span>
        </Link>

        {/* ナビ */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/#about" className="text-gray-700 hover:text-gray-900">
            About Miles
          </NavLink>
          <NavLink to="/#how-it-works" className="text-gray-700 hover:text-gray-900">
            How It Works
          </NavLink>
          <NavLink to="/#faq" className="text-gray-700 hover:text-gray-900">
            FAQ
          </NavLink>
          <NavLink to="/#contact" className="text-gray-700 hover:text-gray-900">
            Contact Us
          </NavLink>
        </nav>

        {/* 右上：ログイン状態で出し分け */}
        <div className="flex items-center gap-3">
          {!user ? (
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
            >
              Log in / Sign up
            </Link>
          ) : (
            <>
              {/* ロールに応じたダッシュボードリンク */}
              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border hover:bg-gray-50"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border hover:bg-gray-50"
                >
                  Dashboard
                </Link>
              )}

              <button
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/');
                  } catch {
                    // noop
                  }
                }}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
