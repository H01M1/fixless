'use client';

/**
 * components/auth/SyncPrompt.tsx
 * ================================
 * ゲストユーザーが3件以上サブスクを登録したときに表示するバナー。
 * クラウド保存を促すための柔らかいプロンプト。
 *
 * 表示条件:
 * - 未ログイン
 * - subscriptionCount >= 3
 * - localStorage に「dismissed」フラグがない
 */

import { useState, useEffect } from 'react';
import { X, CloudUpload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginButton } from '@/components/auth/LoginButton';

// localStorage のキー
const DISMISSED_KEY = 'fixless_sync_prompt_dismissed';

interface SyncPromptProps {
  subscriptionCount: number;
}

export function SyncPrompt({ subscriptionCount }: SyncPromptProps) {
  const { user, loading } = useAuth();
  const [isDismissed, setIsDismissed] = useState(true); // 初期値 true でちらつき防止

  // localStorage の dismissed フラグを読み込む
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    setIsDismissed(dismissed === 'true');
  }, []);

  // 閉じるボタンを押したとき
  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }
  };

  // 表示条件チェック
  if (loading)                   return null; // 認証確認中
  if (user)                      return null; // ログイン済み
  if (subscriptionCount < 3)     return null; // 3件未満
  if (isDismissed)               return null; // 閉じ済み

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-indigo-200 bg-indigo-50 overflow-hidden">

      {/* ヘッダー */}
      <div className="flex items-start justify-between px-4 pt-4 pb-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <CloudUpload size={16} className="text-indigo-600" strokeWidth={2} />
          </div>
          <p className="text-sm font-bold text-indigo-800">
            データを保存しませんか？
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-full text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors"
          aria-label="閉じる"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* 本文 */}
      <div className="px-4 pt-2 pb-4 space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs text-indigo-700 leading-relaxed">
            Googleでログインすると、登録した{subscriptionCount}件のサブスクをクラウドに保存できます。
          </p>
          <ul className="space-y-1">
            {[
              '機種変更後もデータを引き継げます',
              'スマホとPCで同じデータを確認できます',
              'いつでもログアウトしてゲスト利用に戻れます',
            ].map((text) => (
              <li key={text} className="flex items-start gap-1.5 text-[11px] text-indigo-600">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ログインボタン */}
        <LoginButton compact />

        <p className="text-[10px] text-indigo-400 text-center">
          ログインしなくてもこのまま使い続けられます
        </p>
      </div>
    </div>
  );
}
