'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [sent, setSent]             = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await resetPasswordForEmail(email);
    if (error) {
      setError(error);
      setSubmitting(false);
      return;
    }
    setSent(true);
    setSubmitting(false);
  };

  // 送信完了画面
  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
            <Mail className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">リセットメールを送信しました</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            <span className="font-semibold">{email}</span> にパスワードリセット用のメールを送りました。<br />
            メール内のリンクをクリックして、新しいパスワードを設定してください。
          </p>
          <p className="text-xs text-slate-500 mb-6">
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
          <Link href="/login" className="text-indigo-600 text-sm font-medium hover:underline">
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    );
  }

  // 入力画面
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center text-slate-600 text-sm mb-6 hover:text-slate-900">
          <ArrowLeft size={16} className="mr-1" />
          ログイン画面に戻る
        </Link>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">パスワードを忘れた</h1>
        <p className="text-sm text-slate-500 mb-6">
          登録時のメールアドレスを入力してください。<br />
          パスワードリセット用のリンクをお送りします。
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

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !email}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-600 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed active:bg-indigo-700"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'リセットメールを送信'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
