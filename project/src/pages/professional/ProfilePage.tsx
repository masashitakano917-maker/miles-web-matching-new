import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { LABEL_OPTIONS } from '../../lib/labels';
import { toast } from 'sonner';

const formatPostal = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 7);
  if (digits.length >= 4) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits;
};

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  postal: string | null;
  prefecture: string | null;
  city: string | null;
  address2: string | null;
  bio: string | null;
  camera_gear: string | null;
  labels: string[] | null;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [row, setRow] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (!error && data) setRow(data as Row);
    })();
  }, [user]);

  const fetchAddress = async (postalRaw: string) => {
    const zipcode = postalRaw.replace(/\D/g, '');
    if (zipcode.length !== 7) return;
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`
      );
      const json = await res.json();
      if (json?.results?.[0]) {
        const r = json.results[0];
        setRow((s) =>
          s
            ? {
                ...s,
                prefecture: r.address1 ?? s.prefecture,
                city: `${r.address2 ?? ''}${r.address3 ?? ''}` || s.city,
              }
            : s
        );
      }
    } catch {}
  };

  const onSave = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          name: row.name,
          phone: row.phone,
          postal: row.postal ? formatPostal(row.postal) : null,
          prefecture: row.prefecture,
          city: row.city,
          address2: row.address2,
          bio: row.bio,
          camera_gear: row.camera_gear,
          // labels は本人編集不可（Admin 管理）
        })
        .eq('id', row.id);
      if (error) throw error;
      toast.success('保存しました');
    } catch (e: any) {
      toast.error(e?.message ?? '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const onUpdateAuth = async () => {
    try {
      if (newEmail || newPassword) {
        const { error } = await supabase.auth.updateUser({
          email: newEmail || undefined,
          password: newPassword || undefined,
        });
        if (error) throw error;
        // email を変えた場合は professionals.email も同期
        if (newEmail && row) {
          await supabase.from('professionals').update({ email: newEmail }).eq('id', row.id);
        }
        toast.success('アカウント情報を更新しました');
        setNewEmail('');
        setNewPassword('');
      }
    } catch (e: any) {
      toast.error(e?.message ?? '更新に失敗しました');
    }
  };

  if (!row) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-8">読み込み中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 lg:px-0 py-10 space-y-10">
        <h1 className="text-2xl font-bold">プロフィール</h1>

        <section className="rounded-2xl bg-white border p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">氏名</label>
              <input
                className="input mt-1"
                value={row.name}
                onChange={(e) => setRow({ ...row, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">電話番号</label>
              <input
                className="input mt-1"
                value={row.phone ?? ''}
                onChange={(e) => setRow({ ...row, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">郵便番号</label>
              <input
                className="input mt-1"
                value={row.postal ?? ''}
                onChange={(e) =>
                  setRow({ ...row, postal: formatPostal(e.target.value) })
                }
                onBlur={() => row.postal && fetchAddress(row.postal)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">都道府県</label>
              <input
                className="input mt-1"
                value={row.prefecture ?? ''}
                onChange={(e) => setRow({ ...row, prefecture: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">市区町村</label>
              <input
                className="input mt-1"
                value={row.city ?? ''}
                onChange={(e) => setRow({ ...row, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">それ以降</label>
              <input
                className="input mt-1"
                value={row.address2 ?? ''}
                onChange={(e) => setRow({ ...row, address2: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">自己紹介</label>
              <textarea
                className="input mt-1 min-h-[100px]"
                value={row.bio ?? ''}
                onChange={(e) => setRow({ ...row, bio: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">カメラ機材</label>
              <input
                className="input mt-1"
                value={row.camera_gear ?? ''}
                onChange={(e) => setRow({ ...row, camera_gear: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">ラベル（参照のみ）</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(row.labels ?? []).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-xs"
                  >
                    {t}
                  </span>
                ))}
                {(!row.labels || row.labels.length === 0) && (
                  <span className="text-gray-400 text-sm">未設定</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                ラベルの変更は管理者に依頼してください
              </p>
            </div>
          </div>

        </section>

        {/* アカウント（メール・パスワード） */}
        <section className="rounded-2xl bg-white border p-6 space-y-4">
          <div className="font-semibold">アカウント</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">新しいメール</label>
              <input
                className="input mt-1"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={row.email}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">新しいパスワード</label>
              <input
                type="password"
                className="input mt-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8文字以上"
              />
            </div>
          </div>
          <button onClick={onUpdateAuth} className="btn-secondary">
            メール/パスワードを更新
          </button>
        </section>

        <div>
          <button onClick={onSave} disabled={saving} className="btn-primary">
            {saving ? '保存中…' : 'プロフィールを保存'}
          </button>
        </div>
      </main>
    </div>
  );
}
