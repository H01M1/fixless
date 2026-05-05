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
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
      setUser(res.data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (event === 'SIGNED_IN' && newUser && hasLocalStorageData()) {
          try {
            await migrateLocalToSupabase(newUser.id);
          } catch (err) {
            console.error('[AuthProvider] 移行失敗:', err);
          }
        }
      },
    );

    return () => { authListener.unsubscribe(); };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}