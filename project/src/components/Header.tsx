// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

const nav = [
  { href: '/#about', label: 'About Miles' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact Us' },
];

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 h-16 z-50 border-b border-white/20 bg-white/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow">
            <Camera className="w-5 h-5 text-white" />
          </span>
          <span className="text-xl font-extrabold text-gray-900">Miles</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map(n => (
            <a key={n.label} href={n.href} className="text-sm font-medium text-gray-700 hover:text-gray-900">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            Log in / Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
