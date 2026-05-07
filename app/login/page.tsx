'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [mode, setMode]                         = useState<Mode>('signin');
  const [email, setEmail]                       = useState('');
  const [password, setPassword]                 = useState('');
  const [submitting, setSubmitting]             = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'signin') {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error);
        setSubmitting(false);
        return;
      }
      router.push('/');
    } else {
      const { error, needsConfirmation } = await signUpWithEmail(email, password);
      if (error) {
        setError(error);
        setSubmitting(false);
        return;
      }
      if (needsConfirmation) {
        setConfirmationSent(true);
        setSubmitting(false);
      } else {
        router.push('/');
      }
    }
  };

  // 確認メール送信済み画面
  if (confirmationSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
            <Mail className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">確認メールを送信しました</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            <span className="font-semibold">{email}</span> に確認メールを送りました。<br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <Link href="/" className="text-indigo-600 text-sm font-medium hover:underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center text-slate-600 text-sm mb-6 hover:text-slate-900">
          <ArrowLeft size={16} className="mr-1" />
          戻る
        </Link>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          {mode === 'signin' ? 'ログイン' : '新規登録'}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {mode === 'signin' ? 'ミナオスにログイン' : 'ミナオスのアカウントを作成'}
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              パスワード
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

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-600 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed active:bg-indigo-700"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              mode === 'signin' ? 'ログイン' : '登録する'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">または</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white border-2 border-slate-200 text-sm font-bold text-slate-700 active:bg-slate-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
          Googleで{mode === 'signin' ? 'ログイン' : '登録'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === 'signin' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="ml-1 text-indigo-600 font-medium hover:underline"
          >
            {mode === 'signin' ? '新規登録' : 'ログイン'}
          </button>
        </p>
      </div>
    </div>
  );
}