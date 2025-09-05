import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Mail, Lock, User, Building, Shield } from 'lucide-react';
import { useAuth, UserType } from '../contexts/AuthContext';

type ColorKey = 'blue' | 'green' | 'purple';
const COLOR = {
  blue:   { border: 'border-indigo-500',   bgFrom: 'from-indigo-50',   bgTo: 'to-indigo-100',   text: 'text-indigo-600',   heading: 'text-indigo-900' },
  green:  { border: 'border-emerald-500',  bgFrom: 'from-emerald-50',  bgTo: 'to-emerald-100',  text: 'text-emerald-600',  heading: 'text-emerald-900' },
  purple: { border: 'border-violet-500',   bgFrom: 'from-violet-50',   bgTo: 'to-violet-100',   text: 'text-violet-600',   heading: 'text-violet-900' },
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error('メールアドレスの形式が正しくありません');
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
    <div className="min-h-screen relative flex items-center justify-center py-16">
      {/* 背景グラデ */}
      <div className="absolute inset-0 -z-10"
           style={{background:'radial-gradient(1200px 600px at 80% -10%, rgba(79,70,229,.15), transparent), radial-gradient(1200px 600px at 0% 120%, rgba(139,92,246,.15), transparent)'}} />
      <div className="container-xl max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* 左：コピー */}
          <div className="hidden md:block">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                   style={{background:'linear-gradient(135deg,var(--brand-from),var(--brand-to))'}}>
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-extrabold">Miles</div>
            </div>
            <h1 className="display text-4xl mb-4"
                style={{background:'linear-gradient(120deg,var(--brand-from),var(--brand-to))',
                        WebkitBackgroundClip:'text', color:'transparent'}}>
              Welcome back
            </h1>
            <p className="text-gray-600">アカウント種別を選んでログイン/登録してください。</p>
          </div>

          {/* 右：カード */}
          <div className="card p-8">
            <h3 className="text-lg font-semibold mb-4">アカウント種別を選択</h3>
            <div className="grid gap-3 mb-6">
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
                      'p-4 rounded-2xl border-2 transition-all text-left',
                      isSelected
                        ? `${c.border} bg-gradient-to-br ${c.bgFrom} ${c.bgTo} shadow`
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isSelected ? c.text : 'text-gray-500'}`} />
                      <div>
                        <div className={`font-semibold ${isSelected ? c.heading : 'text-gray-900'}`}>{ut.title}</div>
                        <div className="text-sm text-gray-600">{ut.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {errMsg && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{errMsg}</div>}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-1">氏名</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input pl-12" required value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="山田 太郎" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input pl-12" type="email" required value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -transl
