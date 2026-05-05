'use client';

/**
 * components/auth/LoginButton.tsx
 * ================================
 * Google ログインボタン。
 * 未ログイン状態で「Googleで保存する」を押すと Google OAuth を開始する。
 */

import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface LoginButtonProps {
  /** コンパクト表示（サブテキストを非表示） */
  compact?: boolean;
}

export function LoginButton({ compact = false }: LoginButtonProps) {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className={compact ? '' : 'flex flex-col items-center gap-2'}>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="
          flex items-center justify-center gap-3
          w-full px-5 py-3.5 rounded-xl
          bg-white border-2 border-slate-200
          text-sm font-bold text-slate-700
          shadow-sm active:bg-slate-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-slate-400" strokeWidth={2} />
        ) : (
          /* Google ロゴ（SVG） */
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96l3.007 2.332C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
        )}
        Googleで保存する
      </button>

      {!compact && (
        <p className="text-[10px] text-slate-400 text-center leading-relaxed px-2">
          ログインすると、データをクラウドに保存できます
        </p>
      )}
    </div>
  );
}
