'use client';
 
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Subscription, SubscriptionInput, SubscriptionUpdateInput } from '@/types';
import { localStorageAdapter } from '@/lib/storage';
import { SupabaseAdapter } from '@/lib/supabase/adapter';
import { useAuth } from '@/hooks/useAuth';
 
export interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addSubscription: (input: SubscriptionInput) => Promise<Subscription | null>;
  updateSubscription: (id: string, data: SubscriptionUpdateInput) => Promise<Subscription | null>;
  deleteSubscription: (id: string) => Promise<void>;
  clearSubscriptions: () => Promise<void>;
}
 
function sortByMonthlyDesc(subs: Subscription[]): Subscription[] {
  return [...subs].sort((a, b) => b.amountMonthly - a.amountMonthly);
}
 
function toJapaneseError(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
 
export function useSubscriptions(): UseSubscriptionsReturn {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const adapter = useMemo(() => {
    if (user) {
      return new SupabaseAdapter(user.id);
    }
    return localStorageAdapter;
  }, [user]);
 
  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await adapter.getSubscriptions();
      setSubscriptions(sortByMonthlyDesc(data));
    } catch (err) {
      console.error('[useSubscriptions] load error:', err);
      setError('データの読み込みに失敗しました。ページを再読み込みしてください。');
    } finally {
      setLoading(false);
    }
  }, [adapter]);
 
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
 
  const refresh = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);
 
  const addSubscription = useCallback(
    async (input: SubscriptionInput): Promise<Subscription | null> => {
      try {
        setError(null);
        const newSub = await adapter.addSubscription(input);
        setSubscriptions((prev) => sortByMonthlyDesc([...prev, newSub]));
        return newSub;
      } catch (err) {
        console.error('[useSubscriptions] addSubscription error:', err);
        setError(toJapaneseError(err, 'サブスクの追加に失敗しました。'));
        return null;
      }
    },
    [adapter],
  );
 
  const updateSubscription = useCallback(
    async (id: string, data: SubscriptionUpdateInput): Promise<Subscription | null> => {
      try {
        setError(null);
        const updated = await adapter.updateSubscription(id, data);
        if (!updated) {
          setError('更新するサブスクが見つかりませんでした。');
          return null;
        }
        setSubscriptions((prev) =>
          sortByMonthlyDesc(prev.map((s) => (s.id === id ? updated : s))),
        );
        return updated;
      } catch (err) {
        console.error('[useSubscriptions] updateSubscription error:', err);
        setError(toJapaneseError(err, 'サブスクの更新に失敗しました。'));
        return null;
      }
    },
    [adapter],
  );
 
  const deleteSubscription = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await adapter.deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('[useSubscriptions] deleteSubscription error:', err);
      setError(toJapaneseError(err, 'サブスクの削除に失敗しました。'));
    }
  }, [adapter]);
 
  const clearSubscriptions = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await localStorageAdapter.clearSubscriptions();
      setSubscriptions([]);
    } catch (err) {
      console.error('[useSubscriptions] clearSubscriptions error:', err);
      setError(toJapaneseError(err, 'データのリセットに失敗しました。'));
    }
  }, []);
 
  return {
    subscriptions,
    loading,
    error,
    refresh,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    clearSubscriptions,
  };
}