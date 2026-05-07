'use client';

/**
 * components/auth/UserMenu.tsx
 * =============================
 * ログイン済みユーザーのアバター・メールアドレス・ログアウトボタン。
 * 未ログインの場合は何も表示しない。
 *
 * v2 変更点:
 * - ドロップダウンに「プロフィール」リンクを追加
 */

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, ChevronDown, Cloud, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen]             = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 未ログインまたはローディング中は何も表示しない
  if (loading || !user) return null;

  const email     = user.email ?? '';
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial   = email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">

      {/* アバターボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 active:bg-slate-100 transition-colors"
      >
        {/* アバター画像 or 頭文字 */}
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 flex items-center justify-center border border-indigo-200">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={email}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-indigo-600">{initial}</span>
          )}
        </div>

        <Cloud size={12} className="text-indigo-500" strokeWidth={2.5} />
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <>
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-lg z-50 overflow-hidden">

            {/* ユーザー情報 */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 flex items-center justify-center border border-indigo-200">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={email}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-indigo-600">{initial}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">ログイン中</p>
                  <p className="text-xs font-medium text-slate-700 truncate">{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Cloud size={11} className="text-indigo-500 flex-shrink-0" strokeWidth={2.5} />
                <p className="text-[10px] text-indigo-600 font-medium">
                  クラウド同期が有効です
                </p>
              </div>
            </div>

            {/* プロフィールリンク（v2 追加） */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="
                w-full flex items-center gap-3 px-4 py-3
                text-sm text-slate-700 font-medium
                hover:bg-slate-50 active:bg-slate-50
                border-b border-slate-100
                transition-colors
              "
            >
              <User size={15} strokeWidth={2} />
              プロフィール
            </Link>

            {/* ログアウトボタン */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="
                w-full flex items-center gap-3 px-4 py-3
                text-sm text-rose-600 font-medium
                hover:bg-rose-50 active:bg-rose-50
                disabled:opacity-50
                transition-colors
              "
            >
              <LogOut size={15} strokeWidth={2} />
              {isSigningOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
