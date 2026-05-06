'use client';

/**
 * components/auth/LoginButton.tsx
 * ================================
 * ログインボタン。
 * クリックするとログインページ（/login）に遷移する。
 * /login で Google or メール+パスワード を選択できる。
 */

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, LogIn } from 'lucide-react';

interface LoginButtonProps {
  /** コンパクト表示（サブテキストを非表示） */
  compact?: boolean;
}

export function LoginButton({ compact = false }: LoginButtonProps) {
  const router = useRouter();
  const { loading } = useAuth();

  return (
    <div className={compact ? '' : 'flex flex-col items-center gap-2'}>
      <button
        type="button"
        onClick={() => router.push('/login')}
        disabled={loading}
        className="
          flex items-center justify-center gap-2
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
          <>
            <LogIn size={16} className="text-slate-700" strokeWidth={2} />
            ログイン
          </>
        )}
      </button>

      {!compact && (
        <p className="text-[10px] text-slate-400 text-center leading-relaxed px-2">
          ログインすると、データをクラウドに保存できます
        </p>
      )}
    </div>
  );
}