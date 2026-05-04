'use client';

/**
 * hooks/useSubscriptions.ts
 * =========================
 * サブスクデータの読み書きを担当するカスタムフック。
 *
 * 設計方針:
 * - コンポーネントは lib/storage.ts を直接触らず、必ずこの hook 経由でデータを扱う
 * - useEffect 内でのみ localStorage にアクセスするため、SSR で
 *   "window is not defined" エラーは発生しない
 * - Supabase 移行時は localStorageAdapter を supabaseAdapter に差し替えるだけでよい
 *
 * 返り値の設計:
 * - subscriptions: アクティブなサブスク一覧（月額降順ソート済み）
 * - loading:       初回読み込み中は true
 * - error:         エラー時に日本語メッセージ。正常時は null
 * - refresh:       手動で再読み込みしたい場合に呼ぶ（将来の pull-to-refresh 等）
 * - addSubscription / updateSubscription / deleteSubscription / clearSubscriptions:
 *   操作後に自動で state を更新する
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Subscription,
  SubscriptionInput,
  SubscriptionUpdateInput,
} from '@/types';
import { localStorageAdapter } from '@/lib/storage';

// ================================================================
// 返り値の型
// ================================================================

export interface UseSubscriptionsReturn {
  /** アクティブなサブスク一覧（月額降順） */
  subscriptions: Subscription[];

  /** 初回ロード中は true。ロード完了後は false。 */
  loading: boolean;

  /** エラーメッセージ（日本語）。正常時は null。 */
  error: string | null;

  /** データを再読み込みする。localStorage 更新後や pull-to-refresh で使う。 */
  refresh: () => Promise<void>;

  /**
   * サブスクを追加する。
   * @returns 追加後のサブスク。バリデーションエラーや保存失敗時は null。
   */
  addSubscription: (input: SubscriptionInput) => Promise<Subscription | null>;

  /**
   * サブスクを更新する。
   * @returns 更新後のサブスク。IDが存在しない場合や失敗時は null。
   */
  updateSubscription: (
    id: string,
    data: SubscriptionUpdateInput,
  ) => Promise<Subscription | null>;

  /**
   * サブスクを削除する（ソフトデリート）。
   * 削除後は state から即座に取り除く。
   */
  deleteSubscription: (id: string) => Promise<void>;

  /**
   * 全サブスクを削除する（物理削除）。
   * 設定画面の「データをリセット」で使う。
   * 呼び出し前に必ず確認ダイアログを表示すること。
   */
  clearSubscriptions: () => Promise<void>;
}

// ================================================================
// ユーティリティ
// ================================================================

/** サブスクを月額降順でソートする */
function sortByMonthlyDesc(subs: Subscription[]): Subscription[] {
  return [...subs].sort((a, b) => b.amountMonthly - a.amountMonthly);
}

/** エラーから日本語メッセージを取り出す */
function toJapaneseError(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// ================================================================
// useSubscriptions
// ================================================================

export function useSubscriptions(): UseSubscriptionsReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true); // 初回は true
  const [error, setError] = useState<string | null>(null);

  // ─── 読み込み ────────────────────────────────────────────────

  /**
   * localStorage からサブスクを読み込んで state に反映する。
   * useCallback でメモ化して、refresh / useEffect から呼び出す。
   */
  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await localStorageAdapter.getSubscriptions();
      setSubscriptions(sortByMonthlyDesc(data));
    } catch (err) {
      console.error('[useSubscriptions] load error:', err);
      setError(
        'データの読み込みに失敗しました。ページを再読み込みしてください。',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 初回マウント時に localStorage を読み込む。
   * useEffect は必ずクライアント側でのみ実行されるため SSR 安全。
   */
  useEffect(() => {
    load();
  }, [load]);

  // ─── refresh ────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  // ─── addSubscription ────────────────────────────────────────

  const addSubscription = useCallback(
    async (input: SubscriptionInput): Promise<Subscription | null> => {
      try {
        setError(null);
        const newSub = await localStorageAdapter.addSubscription(input);
        // 追加後は state を更新（再読み込みせず、state に直接追加してソート）
        setSubscriptions((prev) => sortByMonthlyDesc([...prev, newSub]));
        return newSub;
      } catch (err) {
        console.error('[useSubscriptions] addSubscription error:', err);
        setError(toJapaneseError(err, 'サブスクの追加に失敗しました。'));
        return null;
      }
    },
    [],
  );

  // ─── updateSubscription ─────────────────────────────────────

  const updateSubscription = useCallback(
    async (
      id: string,
      data: SubscriptionUpdateInput,
    ): Promise<Subscription | null> => {
      try {
        setError(null);
        const updated = await localStorageAdapter.updateSubscription(id, data);

        if (!updated) {
          setError('更新するサブスクが見つかりませんでした。');
          return null;
        }

        // 更新後は該当 ID の要素を差し替えてソート
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
    [],
  );

  // ─── deleteSubscription ─────────────────────────────────────

  const deleteSubscription = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await localStorageAdapter.deleteSubscription(id);
      // ソフトデリート後は state から即座に取り除く
      // （localStorage 上では 'cancelled' として残るが、UI には出さない）
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('[useSubscriptions] deleteSubscription error:', err);
      setError(toJapaneseError(err, 'サブスクの削除に失敗しました。'));
    }
  }, []);

  // ─── clearSubscriptions ─────────────────────────────────────

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

  // ─── return ─────────────────────────────────────────────────

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
