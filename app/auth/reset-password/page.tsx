'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid]       = useState(false);

  /**
   * メールリンクから来た時のセッション処理
   *
   * Supabase は以下のいずれかでリカバリーセッションを確立する:
   * 1. URL のハッシュに access_token が含まれる場合 → JS クライアントが自動処理
   * 2. URL のクエリに code がある場合 → exchangeCodeForSession で交換
   * 3. PASSWORD_RECOVERY イベント発火
   *
   * すべてに対応するため、複数の方法でセッションを検出する。
   */
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      // PKCE フロー: ?code=... を検出して交換
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (err) {
          console.error('[ResetPassword] code exchange failed:', err);
        }
      }

      // 少し待ってセッションを確認（イベント発火を待つ）
      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;

      const { data } = await supabase.auth.getSession();
      setSessionValid(!!data.session);
      setCheckingSession(false);
    };

    // PASSWORD_RECOVERY または SIGNED_IN イベントでもフラグ立て
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionValid(true);
        setCheckingSession(false);
      }
    });

    init();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }

    setSubmitting(true);

    const { error } = await updatePassword(password);
    if (error) {
      setError(error);
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);

    // 2秒後にホームへリダイレクト
    setTimeout(() => router.push('/'), 2000);
  };

  // ローディング
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // セッション無効（リンク期限切れ・既使用など）
  if (!sessionValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertCircle className="text-rose-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">リンクが無効です</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            このリセットリンクは期限切れか、すでに使用されています。<br />
            再度パスワードリセットをお試しください。
          </p>
          <Link href="/forgot-password" className="text-indigo-600 text-sm font-medium hover:underline">
            パスワードリセットをやり直す
          </Link>
        </div>
      </div>
    );
  }

  // 成功画面
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">パスワードを変更しました</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            新しいパスワードでログインできるようになりました。<br />
            ホーム画面に移動します...
          </p>
        </div>
      </div>
    );
  }

  // 入力フォーム
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">新しいパスワード</h1>
        <p className="text-sm text-slate-500 mb-6">
          新しいパスワードを設定してください。
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              新しいパスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">
              新しいパスワード（確認）
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再入力"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !password || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-600 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed active:bg-indigo-700"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'パスワードを変更'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
