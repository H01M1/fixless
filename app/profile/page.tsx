/**
 * app/profile/page.tsx
 * =====================
 * ログイン中ユーザーのプロフィール画面。
 *
 * 表示内容:
 * - アバター + 表示名 + メール
 * - ログイン方法（Google / メール）+ 登録日
 * - 登録サブスク数 + 月額・年額
 * - CSVダウンロードボタン
 * - ログアウトボタン
 * - アカウント削除に関するご案内（運営にメール）
 */

'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  LogOut,
  Download,
  Calendar,
  Package,
  Wallet,
  TrendingUp,
  Loader2,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { calcDashboardSummary } from '@/lib/savings';
import {
  subscriptionsToCSV,
  downloadCSV,
  getDefaultCsvFilename,
} from '@/lib/csvExport';
import { formatCurrency } from '@/lib/billing';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { subscriptions, loading: subsLoading } = useSubscriptions();

  const [isSigningOut, setIsSigningOut] = useState(false);

  // 未ログインならログインページへリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 登録状況の集計
  const summary = useMemo(
    () => calcDashboardSummary(subscriptions, []),
    [subscriptions],
  );

  // ローディング中
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // ユーザー情報抽出
  const email       = user.email ?? '';
  const avatarUrl   = user.user_metadata?.avatar_url as string | undefined;
  const fullName    = user.user_metadata?.full_name  as string | undefined;
  const displayName = fullName || email.split('@')[0];
  const provider    = (user.app_metadata?.provider as string | undefined) ?? 'email';
  const createdAt   = user.created_at ? new Date(user.created_at) : null;
  const initial     = email.charAt(0).toUpperCase();

  const providerLabel = provider === 'google' ? 'Googleアカウント' : 'メールアドレス';

  const formatRegisteredDate = (d: Date | null): string => {
    if (!d) return '-';
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };

  // ハンドラー
  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  };

  const handleExportCSV = () => {
    const csv = subscriptionsToCSV(subscriptions);
    downloadCSV(csv, getDefaultCsvFilename());
  };

  return (
    <div className="min-h-screen px-4 py-5">
      {/* ヘッダー */}
      <Link
        href="/"
        className="inline-flex items-center text-slate-600 text-sm mb-4 hover:text-slate-900"
      >
        <ArrowLeft size={16} className="mr-1" />
        ホームに戻る
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">プロフィール</h1>

      {/* ユーザーカード */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 flex items-center justify-center border-2 border-indigo-200">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={email}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-indigo-600">{initial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-slate-800 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
        </div>
      </section>

      {/* アカウント情報 */}
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-600 mb-2 px-1">アカウント情報</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700">ログイン方法</span>
            </div>
            <span className="text-sm font-medium text-slate-800">{providerLabel}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700">登録日</span>
            </div>
            <span className="text-sm font-medium text-slate-800">
              {formatRegisteredDate(createdAt)}
            </span>
          </div>
        </div>
      </section>

      {/* 登録状況 */}
      {!subsLoading && (
        <section className="mb-5">
          <h2 className="text-sm font-bold text-slate-600 mb-2 px-1">登録状況</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Package size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">登録サブスク数</span>
              </div>
              <span className="text-sm font-bold text-indigo-700">
                {summary.subscriptionCount} 件
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Wallet size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">月額合計</span>
              </div>
              <span className="text-sm font-bold text-slate-800">
                {formatCurrency(summary.totalMonthly)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">年額合計</span>
              </div>
              <span className="text-sm font-bold text-slate-800">
                {formatCurrency(summary.totalYearly)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* データ管理 */}
      <section className="mb-5">
        <h2 className="text-sm font-bold text-slate-600 mb-2 px-1">データ管理</h2>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={subsLoading || subscriptions.length === 0}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <Download size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-slate-800">CSVをダウンロード</span>
          </div>
          <span className="text-xs text-slate-400">{subscriptions.length} 件</span>
        </button>
      </section>

      {/* ログアウト */}
      <section className="mb-5">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-2xl shadow-sm border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 active:bg-rose-50 transition-colors disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <LogOut size={16} />
          )}
          {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
        </button>
      </section>

      {/* アカウント削除について */}
      <p className="text-center text-xs text-slate-500 leading-relaxed mb-4 px-2">
        アカウント削除をご希望の場合は
        <br />
        <a
          href="mailto:m1n40suf1xless@gmail.com"
          className="text-indigo-600 hover:underline"
        >
          m1n40suf1xless@gmail.com
        </a>
        <br />
        までご連絡ください
      </p>
    </div>
  );
}
