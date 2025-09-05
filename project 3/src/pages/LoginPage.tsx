import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Mail, Lock, User, Building, Shield } from 'lucide-react';
import { useAuth, UserType } from '../contexts/AuthContext';

type ColorKey = 'blue' | 'green' | 'purple';
const COLOR = {
  blue:   { border: 'border-blue-500',   bgFrom: 'from-blue-50',   bgTo: 'to-blue-100',   text: 'text-blue-600',   heading: 'text-blue-900' },
  green:  { border: 'border-green-500',  bgFrom: 'from-green-50',  bgTo: 'to-green-100',  text: 'text-green-600',  heading: 'text-green-900' },
  purple: { border: 'border-purple-500', bgFrom: 'from-purple-50', bgTo: 'to-purple-100', text: 'text-purple-600', heading: 'text-purple-900' },
} as const;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState<UserType>('customer');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const userTypes: Array<{ type: UserType; title: string; description: string; icon: any; color: ColorKey }> = [
    { type: 'customer',     title: 'Customer',     description: 'サービスを利用する方',               icon: User,     color: 'blue' },
    { type: 'professional', title: 'Professional', description: 'お仕事を受ける方（カメラマン等）', icon: Building, color: 'green' },
    { type: 'admin',        title: "Miles'",       description: '運営アカウント',                     icon: Shield,   color: 'purple' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrMsg(null);

    try {
      if (!validateEmail(formData.email)) throw new Error('メールアドレスの形式が正しくありません');
      if (formData.password.length < 6) throw new Error('パスワードは6文字以上を入力してください');

      const ok = isLogin
        ? await login(formData.email, formData.password, selectedUserType)
        : await signup(formData.email, formData.password, selectedUserType, formData.name);
      if (!ok) throw new Error('認証に失敗しました');

      navigate(selectedUserType === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setErrMsg(err?.message ?? 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Miles</span>
          </Link>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-lg text-gray-600">
            {isLogin ? 'ログインして続けましょう' : '1分で登録完了'}
          </p>
        </div>

        <div className="card p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">アカウント種別を選択</h3>
          <div className="grid gap-3">
            {userTypes.map((ut) => {
              const Icon = ut.icon;
              const isSelected = selectedUserType === ut.type;
              const c = COLOR[ut.color];
              return (
                <button
                  key={ut.type}
                  type="button"
                  onClick={() => setSelectedUserType(ut.type)}
                  className={[
                    'p-5 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105',
                    isSelected
                      ? `${c.border} bg-gradient-to-br ${c.bgFrom} ${c.bgTo} shadow-lg`
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${isSelected ? c.text : 'text-gray-500'}`} />
                    <div>
                      <div className={`font-semibold text-lg ${isSelected ? c.heading : 'text-gray-900'}`}>{ut.title}</div>
                      <div className="text-sm text-gray-600">{ut.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-8">
          {errMsg && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{errMsg}</div>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">氏名</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input id="name" className="input pl-12" required value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="山田 太郎" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="email" type="email" className="input pl-12" required value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="password" type="password" className="input pl-12" required value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} placeholder="6文字以上" />
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn btn-primary w-full py-4 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105">
              {isLoading ? 'Loading...' : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsLogin((v) => !v)} className="text-blue-600 hover:text-purple-600 font-medium">
              {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function validateEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
