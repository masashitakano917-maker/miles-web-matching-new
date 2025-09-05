import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Menu, X, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navigation = [
    { name: 'About Miles', href: '#about' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'FAQ', href: '#faq' },
    { name: 'お問い合わせ', href: '#contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isScrolled ? 'bg-orange-500' : 'bg-white bg-opacity-20'
            }`}>
              <Camera className={`h-6 w-6 transition-colors duration-300 ${
                isScrolled ? 'text-white' : 'text-white'
              }`} />
            </div>
            <span className={`text-3xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-orange-500' : 'text-white'
            }`}>Miles</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors duration-300 hover:text-orange-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <button className={`p-2 transition-colors duration-200 hover:text-orange-500 ${
                  isScrolled ? 'text-gray-600' : 'text-white'
                }`}>
                  <Bell className="h-6 w-6" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center space-x-3 transition-colors duration-200 p-2 rounded-xl ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-50' 
                        : 'text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="hidden sm:block font-semibold">{user.name}</span>
                  </button>
                
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-[10000] border border-gray-200">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 font-medium"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        ダッシュボード
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-2 font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>ログアウト</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-orange-500 text-white px-8 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                ログイン
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-xl transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="px-4 pt-2">
              {user ? (
                <div className="flex gap-2">
                  <Link
                    to="/dashboard"
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ダッシュボード
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="flex-1 px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block w-full px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}