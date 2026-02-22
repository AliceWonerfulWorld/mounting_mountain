'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Calendar, Edit2, Save, X, LogOut, Home } from 'lucide-react';

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const createProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase SSR type issue
        .insert({
          id: user.id,
          username: user.email?.split('@')[0] || null,
          display_name: null,
          avatar_url: null,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`プロフィール作成エラー: ${error.message || JSON.stringify(error)}`);
      }
      
      if (data) {
        setProfile(data);
        setEditedProfile(data);
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'プロフィールの作成に失敗しました。データベースが正しくセットアップされているか確認してください。');
    }
  }, [user, supabase]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // プロフィールが存在しない場合は作成
        if (error.code === 'PGRST116') {
          await createProfile();
        } else {
          throw error;
        }
      } else if (data) {
        setProfile(data);
        setEditedProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user, supabase, createProfile]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchProfile();
  }, [user, authLoading, router, fetchProfile]);

  const handleUpdate = async () => {
    if (!user || !editedProfile) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase SSR type issue
        .update({
          username: editedProfile.username,
          display_name: editedProfile.display_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile!, ...editedProfile });
      setEditing(false);
      setSuccess('プロフィールを更新しました');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-blue-100 flex items-center gap-3">
            <User className="h-10 w-10" />
            プロフィール
          </h1>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-blue-400/50 bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur-sm transition-all hover:bg-blue-800/50"
          >
            <Home className="h-4 w-4" />
            ホーム
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-100 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border-2 border-green-500 text-green-100 px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-zinc-900/80 backdrop-blur-sm border border-blue-400/30 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-blue-300 mb-2">
                <Mail className="h-4 w-4" />
                メールアドレス
              </label>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-300">
                {user.email}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-bold text-blue-300 mb-2 block">
                ユーザー名
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editedProfile.username || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, username: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 focus:border-blue-500 focus:outline-none text-white transition-colors"
                  placeholder="ユーザー名を入力"
                />
              ) : (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3">
                  {profile?.username || '未設定'}
                </div>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm font-bold text-blue-300 mb-2 block">
                表示名
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editedProfile.display_name || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, display_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 focus:border-blue-500 focus:outline-none text-white transition-colors"
                  placeholder="表示名を入力"
                />
              ) : (
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3">
                  {profile?.display_name || '未設定'}
                </div>
              )}
            </div>

            {/* Created At */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-blue-300 mb-2">
                <Calendar className="h-4 w-4" />
                登録日
              </label>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-300">
                {profile?.created_at ? formatDate(profile.created_at) : '不明'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {editing ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Save className="h-5 w-5" />
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditedProfile(profile || {});
                    setError('');
                  }}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-all duration-300 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg"
                >
                  <Edit2 className="h-5 w-5" />
                  編集
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg"
                >
                  <LogOut className="h-5 w-5" />
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-blue-300/60">
          <p>※ プロフィール情報はいつでも変更できます</p>
        </div>
      </div>
    </main>
  );
}
