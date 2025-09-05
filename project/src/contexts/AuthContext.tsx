import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserType = 'customer' | 'professional' | 'admin';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserType;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserType) => Promise<boolean>;
  signup: (email: string, password: string, role: UserType, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY = 'miles_auth_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初期化（簡易：localStorage）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserType) => {
    // TODO: 実APIに差し替え（Supabase/Authなど）
    if (!email || !password) return false;
    const fakeUser: User = { id: cryptoRandom(), name: email.split('@')[0], email, role };
    setUser(fakeUser);
    localStorage.setItem(LS_KEY, JSON.stringify(fakeUser));
    return true;
  };

  const signup = async (email: string, password: string, role: UserType, name: string) => {
    if (!email || !password || !name) return false;
    const fakeUser: User = { id: cryptoRandom(), name, email, role };
    setUser(fakeUser);
    localStorage.setItem(LS_KEY, JSON.stringify(fakeUser));
    return true;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  };

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

function cryptoRandom() {
  try {
    return window.crypto.getRandomValues(new Uint32Array(4)).join('-');
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
