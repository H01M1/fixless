'use client';

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { hasLocalStorageData, migrateLocalToSupabase } from '@/lib/supabase/migrate';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) { setLoading(false); return; }

    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn('[AuthProvider] getSession timeout - forcing loading=false');
        setLoading(false);
      }
    }, 5000);

    supabase.auth.getSession()
      .then((res: { data: { session: Session | null } }) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setUser(res.data.session?.user ?? null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        console.error('[AuthProvider] getSession error:', err);
        setUser(null);
        setLoading(false);
      });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (cancelled) return;
        const newUser = session?.user ?? null;
        setUser(newUser);
        setLoading(false);
        if (event === 'SIGNED_IN' && newUser && hasLocalStorageData()) {
          try {
            await migrateLocalToSupabase(newUser.id);
          } catch (err) {
            console.error('[AuthProvider] 移行失敗:', err);
          }
        }
      },
    );

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      authListener.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase未初期化' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // 日本語化
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'メールアドレスまたはパスワードが間違っています' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'メール確認が完了していません。受信箱をご確認ください' };
      }
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase未初期化', needsConfirmation: false };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'このメールアドレスは登録済みです', needsConfirmation: false };
      }
      if (error.message.includes('Password should be')) {
        return { error: 'パスワードは6文字以上にしてください', needsConfirmation: false };
      }
      return { error: error.message, needsConfirmation: false };
    }

    // セッションが返ってこない = 確認メール送信済み
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }, []);
  const resetPasswordForEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase未初期化' };

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: 'Supabase未初期化' };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      if (error.message.includes('Password should be')) {
        return { error: 'パスワードは6文字以上にしてください' };
      }
      if (error.message.includes('same as the')) {
        return { error: '現在のパスワードと同じです' };
      }
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setUser(null);
      return;
    }

    try {
      // signOut が固まる場合があるので3秒タイムアウトで保護
      // （無効なリフレッシュトークン等が原因で稀に Promise が解決しない）
      await Promise.race([
        supabase.auth.signOut(),
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (err) {
      console.error('[AuthProvider] signOut error (continuing):', err);
    } finally {
      // signOut が成功・失敗・タイムアウトのいずれでも user を null にする
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPasswordForEmail,
      updatePassword,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}