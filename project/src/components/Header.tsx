import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { href: '/#about', label: 'About Miles' },
  { href: '/#how', label: 'How It Works' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact Us' },
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/60 backdrop-blur-2xl">
      <div className="container-xl h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{background: 'linear-gradient(135deg,var(--brand-from),var(--brand-to))'}}>
            <Camera className="w-5 h-5 text-white" />
          </span>
          <span className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Miles</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map(n => (
            <a key={n.label} href={n.href} className="text-sm font-medium text-gray-700 hover:text-gray-900">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <NavLink to="/login" className="btn btn-primary px-4 py-2 rounded-xl text-sm">
              Log in / Sign up
            </NavLink>
          ) : (
            <>
              <NavLink to={user.role==='admin'?'/admin':'/dashboard'} className="btn-ghost text-sm">Dashboard</NavLink>
              <button
                onClick={async () => { await logout(); navigate('/'); }}
                className="btn-ghost text-sm"
              >Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
