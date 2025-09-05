import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/#about', label: 'About Miles' },
  { to: '/#how', label: 'How It Works' },
  { to: '/#faq', label: 'FAQ' },
  { to: '/#contact', label: 'Contact Us' },
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-white/40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="inline-flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </span>
          <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Miles
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((n) => (
            <a key={n.label} href={n.to} className="text-gray-700 hover:text-gray-900">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <NavLink to="/login" className="btn btn-primary px-4 py-2">
              Log in / Sign up
            </NavLink>
          ) : (
            <>
              <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className="px-3 py-2 rounded-lg hover:bg-gray-100">
                Dashboard
              </NavLink>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
