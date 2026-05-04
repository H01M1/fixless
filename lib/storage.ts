/**
 * lib/storage.ts
 * ==============
 * localStorage を使ったデータ永続化の実装。
 *
 * 設計方針:
 * - StorageAdapter インターフェースを実装することで、
 *   将来 Supabase 版に差し替えても呼び出し元を変更しなくて済む
 * - Next.js の SSR（サーバーサイドレンダリング）で
 *   "window is not defined" エラーが出ないよう、
 *   localStorage へのアクセスはすべて isClient() チェックで保護する
 * - localStorage のデータが壊れていた場合は空配列にリセットして続行する
 * - addSubscription / updateSubscription では、
 *   amountMonthly・amountYearly・nextBillingDate を自動計算して保存する
 *
 * Phase 2 の Supabase 移行方法:
 * 1. このファイルと同じインターフェースを実装した SupabaseAdapter クラスを作る
 * 2. hooks/useSubscriptions.ts の adapter インスタンスを差し替えるだけで完了
 */

import type {
  Subscription,
  SubscriptionInput,
  SubscriptionUpdateInput,
  StorageAdapter,
} from '@/types';
import {
  STORAGE_KEYS,
  CATEGORIES,
  BILLING_CYCLES,
} from '@/types';
import {
  calcAmountMonthly,
  calcAmountYearly,
  calcNextBillingDate,
} from '@/lib/billing';

// ================================================================
// 内部ユーティリティ
// ================================================================

/**
 * ブラウザ環境かどうかを確認する。
 *
 * Next.js では getServerSideProps や API Routes など
 * サーバー側で実行されるコードでは window が存在しない。
 * localStorage を使う前に必ずこのチェックを入れる。
 *
 * @returns boolean — true: ブラウザ環境, false: サーバー環境
 */
function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * 一意のIDを生成する。
 *
 * Web Crypto API の randomUUID() を優先して使う。
 * 利用できない環境（古いブラウザ）ではフォールバックを使う。
 *
 * @returns string — ユニークなID文字列
 */
function generateId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // フォールバック（crypto.randomUUID が使えない環境向け）
  // Math.random は暗号的に安全ではないが、MVPのローカルIDには十分
  const timestamp = Date.now().toString(36);
  const random    = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * 現在時刻を ISO 8601 文字列で返す。
 * createdAt / updatedAt の値に使う。
 *
 * @returns string — 例: "2025-06-10T12:34:56.789Z"
 */
function nowISOString(): string {
  return new Date().toISOString();
}

// ================================================================
// バリデーション
// ================================================================

/**
 * バリデーションエラーの型。
 * フィールド名 → エラーメッセージのマッピング。
 */
export type ValidationErrors = Record<string, string>;

/**
 * SubscriptionInput の最低限のバリデーションを行う。
 *
 * @param input - バリデーション対象の入力データ
 * @returns ValidationErrors — エラーがなければ空オブジェクト {}
 *
 * @example
 * const errors = validateSubscriptionInput(input);
 * if (Object.keys(errors).length > 0) {
 *   // エラーがある
 * }
 */
export function validateSubscriptionInput(
  input: SubscriptionInput,
): ValidationErrors {
  const errors: ValidationErrors = {};

  // サービス名
  if (!input.name || !input.name.trim()) {
    errors.name = 'サービス名を入力してください';
  } else if (input.name.trim().length > 100) {
    errors.name = 'サービス名は100文字以内で入力してください';
  }

  // 金額
  if (input.amount === undefined || input.amount === null) {
    errors.amount = '金額を入力してください';
  } else if (!Number.isInteger(input.amount) || input.amount < 1) {
    errors.amount = '金額は1円以上の整数で入力してください';
  } else if (input.amount > 10_000_000) {
    errors.amount = '金額が大きすぎます（1,000万円以下で入力してください）';
  }

  // 請求サイクル
  if (!BILLING_CYCLES.includes(input.billingCycle)) {
    errors.billingCycle = '請求サイクルを選択してください';
  }

  // 請求開始日
  if (!input.billingStartDate) {
    errors.billingStartDate = '請求開始日を入力してください';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.billingStartDate)) {
    errors.billingStartDate = '日付の形式が正しくありません（YYYY-MM-DD）';
  } else {
    // 実際に有効な日付かチェック（例: 2025-13-01 は無効）
    const [y, m, d] = input.billingStartDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (
      date.getFullYear() !== y ||
      date.getMonth()    !== m - 1 ||
      date.getDate()     !== d
    ) {
      errors.billingStartDate = '有効な日付を入力してください';
    }
  }

  // カテゴリ
  if (!CATEGORIES.includes(input.category)) {
    errors.category = 'カテゴリを選択してください';
  }

  // 無料期間終了日（任意だが、入力がある場合はフォーマットチェック）
  if (input.isFreeTrial && input.freeTrialEndDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.freeTrialEndDate)) {
      errors.freeTrialEndDate =
        '無料期間終了日の形式が正しくありません（YYYY-MM-DD）';
    }
  }

  return errors;
}

// ================================================================
// localStorage の読み書きヘルパー
// ================================================================

/**
 * localStorage から全サブスク（active + cancelled 両方）を読み込む。
 * JSON のパースに失敗した場合や壊れたデータの場合は空配列を返す。
 */
function readAllFromStorage(): Subscription[] {
  if (!isClient()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    // 配列でない場合はデータが壊れているのでリセット
    if (!Array.isArray(parsed)) {
      console.warn('[FixLess] localStorage のサブスクデータが壊れていたためリセットしました');
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
      return [];
    }

    // 各要素が Subscription の最低限の形を持っているか確認
    // （壊れた要素をフィルタして無視する）
    const valid = parsed.filter(isValidSubscription);

    if (valid.length < parsed.length) {
      console.warn(
        `[FixLess] ${parsed.length - valid.length}件の壊れたサブスクデータを除外しました`,
      );
    }

    return valid;
  } catch (error) {
    console.error('[FixLess] localStorage の読み込みに失敗しました:', error);
    return [];
  }
}

/**
 * サブスクの配列を localStorage に保存する。
 *
 * @throws localStorage への書き込みが失敗した場合（容量超過など）はエラーをスローする
 */
function writeToStorage(subscriptions: Subscription[]): void {
  if (!isClient()) return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.SUBSCRIPTIONS,
      JSON.stringify(subscriptions),
    );
  } catch (error) {
    // localStorage の容量制限（通常 5MB）に達した可能性がある
    console.error('[FixLess] localStorage への保存に失敗しました:', error);
    throw new Error(
      'データの保存に失敗しました。ブラウザの空き容量を確認してください。',
    );
  }
}

/**
 * オブジェクトが最低限 Subscription の形を持つか確認する型ガード。
 * JSON.parse 後のデータの簡易チェックに使う。
 */
function isValidSubscription(obj: unknown): obj is Subscription {
  if (typeof obj !== 'object' || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.id             === 'string' &&
    typeof s.name           === 'string' &&
    typeof s.amount         === 'number' &&
    typeof s.billingCycle   === 'string' &&
    typeof s.billingStartDate === 'string' &&
    typeof s.status         === 'string'
  );
}

// ================================================================
// 計算ヘルパー（addSubscription・updateSubscription で使う）
// ================================================================

/**
 * 入力データから自動計算フィールドを含む完全なサブスクデータを組み立てる。
 * amount / billingCycle / billingStartDate が変わったとき必ず再計算する。
 */
function computeDerivedFields(data: {
  amount: number;
  billingCycle: Subscription['billingCycle'];
  billingStartDate: string;
}): {
  amountMonthly:   number;
  amountYearly:    number;
  nextBillingDate: string;
} {
  return {
    amountMonthly:   calcAmountMonthly(data.amount, data.billingCycle),
    amountYearly:    calcAmountYearly(data.amount, data.billingCycle),
    nextBillingDate: calcNextBillingDate(data.billingStartDate, data.billingCycle),
  };
}

// ================================================================
// LocalStorageAdapter の実装
// ================================================================

/**
 * localStorage を使った StorageAdapter の実装クラス。
 *
 * 使い方（hooks/useSubscriptions.ts での例）:
 * ```ts
 * import { localStorageAdapter } from '@/lib/storage';
 *
 * const subs = await localStorageAdapter.getSubscriptions();
 * ```
 *
 * Phase 2 で Supabase に移行する場合:
 * ```ts
 * // lib/supabaseAdapter.ts を作成して同じインターフェースで実装する
 * // 呼び出し元（hooks）の変更は不要
 * import { supabaseAdapter } from '@/lib/supabaseAdapter';
 * ```
 */
class LocalStorageAdapter implements StorageAdapter {
  // ─── getSubscriptions ──────────────────────────────────────────

  /**
   * アクティブな全サブスクを取得する（cancelled を除く）。
   *
   * @returns Promise<Subscription[]> — status: 'active' のサブスクのみ
   */
  async getSubscriptions(): Promise<Subscription[]> {
    const all = readAllFromStorage();
    return all.filter((s) => s.status === 'active');
  }

  // ─── getAllSubscriptions ────────────────────────────────────────

  /**
   * 全サブスクを取得する（cancelled を含む）。
   * 将来の「節約実績」表示や「解約済みの復元」機能で使う。
   *
   * @returns Promise<Subscription[]> — status 問わず全件
   */
  async getAllSubscriptions(): Promise<Subscription[]> {
    return readAllFromStorage();
  }

  // ─── addSubscription ───────────────────────────────────────────

  /**
   * サブスクを1件追加して保存する。
   *
   * 自動付与するフィールド:
   * - id:             generateId() で生成
   * - status:         'active' 固定
   * - amountMonthly:  amount と billingCycle から計算
   * - amountYearly:   amount と billingCycle から計算
   * - nextBillingDate: billingStartDate と billingCycle から計算
   * - createdAt:      現在時刻
   * - updatedAt:      現在時刻
   *
   * @param input - SubscriptionInput（id・計算フィールド・タイムスタンプを除いた入力）
   * @returns Promise<Subscription> — 保存後のサブスク（自動付与フィールドを含む）
   * @throws バリデーションエラーがある場合
   */
  async addSubscription(input: SubscriptionInput): Promise<Subscription> {
    // バリデーション
    const errors = validateSubscriptionInput(input);
    if (Object.keys(errors).length > 0) {
      const messages = Object.values(errors).join('、');
      throw new Error(`入力内容に問題があります: ${messages}`);
    }

    // 自動計算フィールドを計算する
    const derived = computeDerivedFields({
      amount:           input.amount,
      billingCycle:     input.billingCycle,
      billingStartDate: input.billingStartDate,
    });

    const now = nowISOString();

    // 完全なサブスクオブジェクトを組み立てる
    const newSubscription: Subscription = {
      ...input,
      id:        generateId(),
      status:    'active',
      ...derived,
      createdAt: now,
      updatedAt: now,
    };

    // 既存データに追加して保存
    const all = readAllFromStorage();
    writeToStorage([...all, newSubscription]);

    return newSubscription;
  }

  // ─── updateSubscription ────────────────────────────────────────

  /**
   * サブスクを更新する。
   *
   * 自動再計算するフィールド:
   * - amount・billingCycle・billingStartDate のいずれかが変わった場合、
   *   amountMonthly・amountYearly・nextBillingDate を再計算する
   * - updatedAt は常に現在時刻に更新する
   *
   * @param id   - 更新するサブスクのID
   * @param data - 変更したいフィールドだけを含むオブジェクト
   * @returns Promise<Subscription | null> — 更新後のサブスク。IDが存在しない場合は null。
   */
  async updateSubscription(
    id: string,
    data: SubscriptionUpdateInput,
  ): Promise<Subscription | null> {
    const all = readAllFromStorage();
    const index = all.findIndex((s) => s.id === id);

    // 見つからなかった場合
    if (index === -1) {
      console.warn(`[FixLess] updateSubscription: ID "${id}" が見つかりません`);
      return null;
    }

    const existing = all[index];

    // 更新後のデータをマージ（data に含まれるフィールドだけ上書き）
    const merged: Subscription = {
      ...existing,
      ...data,
      id:        existing.id,        // id は変更不可
      userId:    existing.userId,    // userId も変更不可
      createdAt: existing.createdAt, // createdAt は変更不可
      updatedAt: nowISOString(),     // updatedAt は常に更新
    };

    // 金額・サイクル・開始日のいずれかが変わった場合は再計算する
    const needsRecalc =
      data.amount           !== undefined ||
      data.billingCycle     !== undefined ||
      data.billingStartDate !== undefined;

    if (needsRecalc) {
      const derived = computeDerivedFields({
        amount:           merged.amount,
        billingCycle:     merged.billingCycle,
        billingStartDate: merged.billingStartDate,
      });
      Object.assign(merged, derived);
    }

    // 配列の該当インデックスを置き換えて保存
    const updated = [...all];
    updated[index] = merged;
    writeToStorage(updated);

    return merged;
  }

  // ─── deleteSubscription ────────────────────────────────────────

  /**
   * サブスクを削除する（ソフトデリート）。
   * 実際には status を 'cancelled' に変更してデータを残す。
   *
   * データを物理削除しない理由:
   * - 将来の「節約実績」表示（「合計いくら節約した」）に使える
   * - 誤削除からの復元が可能になる（Phase 2 で実装予定）
   *
   * @param id - 削除するサブスクのID
   */
  async deleteSubscription(id: string): Promise<void> {
    const all = readAllFromStorage();
    const index = all.findIndex((s) => s.id === id);

    if (index === -1) {
      console.warn(`[FixLess] deleteSubscription: ID "${id}" が見つかりません`);
      return;
    }

    // status を 'cancelled' に変更して保存（ソフトデリート）
    const updated = [...all];
    updated[index] = {
      ...updated[index],
      status:    'cancelled',
      updatedAt: nowISOString(),
    };

    writeToStorage(updated);
  }

  // ─── clearSubscriptions ────────────────────────────────────────

  /**
   * 全サブスクを削除する（物理削除）。
   * 設定画面の「データをリセット」機能で使う。
   * 実行前に必ず確認ダイアログを表示すること。
   */
  async clearSubscriptions(): Promise<void> {
    if (!isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  }
}

// ================================================================
// シングルトンインスタンスのエクスポート
// ================================================================

/**
 * アプリ全体で使う LocalStorageAdapter のインスタンス。
 *
 * 使い方:
 * ```ts
 * import { localStorageAdapter } from '@/lib/storage';
 *
 * // サブスク取得
 * const subs = await localStorageAdapter.getSubscriptions();
 *
 * // サブスク追加
 * const newSub = await localStorageAdapter.addSubscription({
 *   name: 'Netflix スタンダード',
 *   category: 'video',
 *   amount: 1590,
 *   billingCycle: 'monthly',
 *   billingStartDate: '2025-06-01',
 *   isFreeTrial: false,
 * });
 * ```
 */
export const localStorageAdapter: StorageAdapter & {
  clearSubscriptions(): Promise<void>;
} = new LocalStorageAdapter();

// ================================================================
// dismissed 状態の管理（節約候補の「後で確認」）
// ================================================================

/**
 * dismissed な節約候補IDのリストを localStorage から取得する。
 * savings.ts の calcDashboardSummary() に渡すために使う。
 *
 * @returns string[] — dismissed な opportunity ID の配列
 */
export function getDismissedOpportunityIds(): string[] {
  if (!isClient()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISMISSED_OPPORTUNITIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

/**
 * 節約候補を「後で確認」にする（dismissed に追加する）。
 *
 * @param opportunityId - dismiss する節約候補の ID
 */
export function dismissOpportunity(opportunityId: string): void {
  if (!isClient()) return;

  const current = getDismissedOpportunityIds();
  if (current.includes(opportunityId)) return; // 既に追加済み

  const updated = [...current, opportunityId];

  try {
    localStorage.setItem(
      STORAGE_KEYS.DISMISSED_OPPORTUNITIES,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error('[FixLess] dismissed の保存に失敗しました:', error);
  }
}

/**
 * 節約候補の「後で確認」を解除する（dismissed から削除する）。
 *
 * @param opportunityId - 解除する節約候補の ID
 */
export function undismissOpportunity(opportunityId: string): void {
  if (!isClient()) return;

  const current = getDismissedOpportunityIds();
  const updated  = current.filter((id) => id !== opportunityId);

  try {
    localStorage.setItem(
      STORAGE_KEYS.DISMISSED_OPPORTUNITIES,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error('[FixLess] dismissed の更新に失敗しました:', error);
  }
}

/**
 * dismissed なID一覧をすべてクリアする。
 * 設定画面の「データをリセット」機能で使う。
 */
export function clearDismissedOpportunities(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEYS.DISMISSED_OPPORTUNITIES);
}
