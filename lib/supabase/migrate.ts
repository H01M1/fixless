/**
 * lib/supabase/migrate.ts
 * ========================
 * localStorage → Supabase へのデータ移行処理。
 *
 * 呼び出しタイミング:
 * - ユーザーが初めてログインした直後
 * - AuthProvider の onAuthStateChange で user が確定した後
 *
 * 重複防止:
 * - Supabase に同名・同開始日のサブスクが既にある場合はスキップ
 *
 * 移行後:
 * - localStorage のサブスクデータを削除する
 * - dismissed opportunity のデータは保持する（ローカルのまま）
 */

import { STORAGE_KEYS } from '@/types';
import { SupabaseAdapter } from '@/lib/supabase/adapter';
import type { Subscription, SubscriptionInput } from '@/types';

/**
 * localStorage にサブスクデータがあるかどうかを確認する。
 * SSR 環境では false を返す。
 */
export function hasLocalStorageData(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * localStorage からサブスクデータを取得する。
 */
function getLocalSubscriptions(): Subscription[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) return [];
    return JSON.parse(raw) as Subscription[];
  } catch {
    return [];
  }
}

/**
 * localStorage のサブスクデータを削除する。
 */
function clearLocalSubscriptions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
}

/**
 * localStorage → Supabase 移行処理。
 *
 * @param userId   - ログイン済みユーザーのID
 * @returns        - 移行した件数
 */
export async function migrateLocalToSupabase(userId: string): Promise<number> {
  const localSubs = getLocalSubscriptions();
  if (localSubs.length === 0) return 0;

  const adapter = new SupabaseAdapter(userId);

  // Supabase の既存データを取得（重複チェック用）
  const existingSubs = await adapter.getAllSubscriptions();
  const existingKeys = new Set(
    existingSubs.map((s) => `${s.name}__${s.billingStartDate}`),
  );

  let migratedCount = 0;

  for (const sub of localSubs) {
    // 重複チェック: name + billingStartDate が一致する場合はスキップ
    const key = `${sub.name}__${sub.billingStartDate}`;
    if (existingKeys.has(key)) {
      console.log(`[migrate] スキップ（重複）: ${sub.name}`);
      continue;
    }

    // SubscriptionInput 形式に変換して追加
    const input: SubscriptionInput = {
      serviceId:        sub.serviceId,
      name:             sub.name,
      category:         sub.category,
      iconUrl:          sub.iconUrl,
      amount:           sub.amount,
      billingCycle:     sub.billingCycle,
      billingStartDate: sub.billingStartDate,
      isFreeTrial:      sub.isFreeTrial,
      freeTrialEndDate: sub.freeTrialEndDate,
      memo:             sub.memo,
    };

    try {
      await adapter.addSubscription(input);
      existingKeys.add(key); // 追加済みとしてマーク
      migratedCount++;
      console.log(`[migrate] 移行完了: ${sub.name}`);
    } catch (err) {
      console.error(`[migrate] 移行失敗: ${sub.name}`, err);
    }
  }

  // 移行完了後に localStorage を削除
  if (migratedCount > 0 || localSubs.length > 0) {
    clearLocalSubscriptions();
    console.log(`[migrate] localStorage をクリアしました（${migratedCount}件移行）`);
  }

  return migratedCount;
}
