/**
 * lib/billing.ts
 * ==============
 * 請求に関する計算・フォーマットユーティリティ。
 *
 * 設計方針:
 * - すべて「純粋関数（pure function）」として実装する
 *   → 引数が同じなら必ず同じ値を返す。副作用なし。テストしやすい。
 * - 日付は YYYY-MM-DD 文字列で受け取り、YYYY-MM-DD 文字列で返す
 * - new Date('YYYY-MM-DD') はタイムゾーン問題が起きるため使わない
 *   （JSでは 'YYYY-MM-DD' をUTCとして解釈するため、JSTだと1日ずれる）
 *   代わりに new Date(year, month - 1, day) を使う
 */

import type { BillingCycle } from '@/types';

// ================================================================
// 内部ヘルパー関数（このファイル内でのみ使う）
// ================================================================

/**
 * YYYY-MM-DD 形式の文字列を Date オブジェクトに安全に変換する。
 *
 * ⚠️ なぜ new Date('YYYY-MM-DD') を使わないか:
 *   new Date('2025-06-01') は UTC の 2025-06-01T00:00:00Z として解釈される。
 *   日本時間（JST = UTC+9）で実行すると 2025-06-01T09:00:00+09:00 になり、
 *   日付比較が意図通りに動かない場合がある。
 *   new Date(2025, 5, 1) はローカルタイムで作成されるため安全。
 *
 * @param dateStr - YYYY-MM-DD 形式の文字列
 * @returns ローカルタイムの Date オブジェクト（時刻は 00:00:00）
 */
function parseDateStr(dateStr: string): Date {
  const parts = dateStr.split('-');
  const year  = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1〜12
  const day   = parseInt(parts[2], 10);

  // month は 0始まり（0 = 1月）なので -1 する
  return new Date(year, month - 1, day);
}

/**
 * Date オブジェクトを YYYY-MM-DD 形式の文字列に変換する。
 *
 * ⚠️ date.toISOString() は UTC に変換してしまうため使わない。
 *   getFullYear / getMonth / getDate はローカルタイムを返すので安全。
 *
 * @param date - Date オブジェクト
 * @returns YYYY-MM-DD 形式の文字列
 */
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0'); // 0始まりなので+1
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 日付にサイクル分の期間を加算する（内部ヘルパー）。
 *
 * JS の setMonth() は月末日を自動で丸めてくれる。
 * 例: 1月31日 + 1ヶ月 → setMonth(1) → 2月31日は存在しないので 2月28日（閏年は29日）になる。
 * これは意図した挙動（毎月31日払いの場合、2月は28日払いになる）。
 *
 * @param date - 加算元の Date オブジェクト（変更されない）
 * @param cycle - 請求サイクル
 * @returns 1サイクル加算後の新しい Date オブジェクト
 */
function addOneCycle(date: Date, cycle: BillingCycle): Date {
  // 元の Date を変更しないようにコピー
  const d = new Date(date);

  switch (cycle) {
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() + 3);
      break;
    default:
      // TypeScript の exhaustive check
      // ここに到達した場合は型定義の更新漏れ
      const _exhaustiveCheck: never = cycle;
      void _exhaustiveCheck;
  }

  return d;
}

// ================================================================
// 金額計算
// ================================================================

/**
 * 任意の請求サイクルの金額を「月額換算」して返す。
 *
 * 計算式:
 * - monthly:   そのまま
 * - yearly:    ÷ 12（小数点以下切り捨て）
 * - weekly:    × 52 ÷ 12（1年を52週として計算。切り捨て）
 * - quarterly: ÷ 3（3ヶ月払いを1ヶ月に換算。切り捨て）
 *
 * 切り捨てにする理由:
 * 切り上げると「月額合計 × 12 > 年額合計」になり、ユーザーが混乱するため。
 *
 * @example
 * calcAmountMonthly(12000, 'yearly')   // → 1000
 * calcAmountMonthly(980, 'monthly')    // → 980
 * calcAmountMonthly(980, 'weekly')     // → 4246（980 × 52 ÷ 12 の切り捨て）
 * calcAmountMonthly(3000, 'quarterly') // → 1000
 */
export function calcAmountMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return amount;
    case 'yearly':
      return Math.floor(amount / 12);
    case 'weekly':
      return Math.floor((amount * 52) / 12);
    case 'quarterly':
      return Math.floor(amount / 3);
    default:
      const _exhaustiveCheck: never = cycle;
      void _exhaustiveCheck;
      return amount;
  }
}

/**
 * 任意の請求サイクルの金額を「年額換算」して返す。
 *
 * 計算式:
 * - monthly:   × 12
 * - yearly:    そのまま
 * - weekly:    × 52（1年を52週として計算）
 * - quarterly: × 4（3ヶ月払いを4回として計算）
 *
 * @example
 * calcAmountYearly(1000, 'monthly')   // → 12000
 * calcAmountYearly(12000, 'yearly')   // → 12000
 * calcAmountYearly(980, 'weekly')     // → 50960（980 × 52）
 * calcAmountYearly(3000, 'quarterly') // → 12000
 */
export function calcAmountYearly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return amount * 12;
    case 'yearly':
      return amount;
    case 'weekly':
      return amount * 52;
    case 'quarterly':
      return amount * 4;
    default:
      const _exhaustiveCheck: never = cycle;
      void _exhaustiveCheck;
      return amount;
  }
}

// ================================================================
// 次回請求日の計算
// ================================================================

/**
 * 請求開始日とサイクルから「次回の請求日」を計算して返す。
 *
 * アルゴリズム:
 * 1. billingStartDate から今日以降になるまで1サイクルずつ加算する
 * 2. 「今日 = 請求日」の場合は今日を返す（当日は請求があるとみなす）
 * 3. billingStartDate が未来の場合はそのまま返す
 *
 * @param billingStartDate - 請求開始日（YYYY-MM-DD）
 * @param cycle - 請求サイクル
 * @returns 次回請求日（YYYY-MM-DD）
 *
 * @example
 * // 今日が 2025-06-10 の場合
 * calcNextBillingDate('2025-01-01', 'monthly')   // → '2025-07-01'
 * calcNextBillingDate('2025-06-10', 'monthly')   // → '2025-06-10'（今日）
 * calcNextBillingDate('2025-07-01', 'monthly')   // → '2025-07-01'（未来）
 * calcNextBillingDate('2025-01-01', 'yearly')    // → '2026-01-01'
 * calcNextBillingDate('2025-01-31', 'monthly')   // → '2025-07-31'（2/28→3/31→...）
 */
export function calcNextBillingDate(
  billingStartDate: string,
  cycle: BillingCycle,
): string {
  // 今日の日付（時刻なし）
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 開始日を Date オブジェクトに変換
  let next = parseDateStr(billingStartDate);

  // 開始日が今日以降の場合はそのまま返す
  if (next >= today) {
    return toDateStr(next);
  }

  // 今日以降になるまで1サイクルずつ加算する
  // 最大ループ回数を設ける（無限ループ防止のフェイルセーフ）
  const MAX_ITERATIONS = 1000;
  let iterations = 0;

  while (next < today && iterations < MAX_ITERATIONS) {
    next = addOneCycle(next, cycle);
    iterations++;
  }

  return toDateStr(next);
}

// ================================================================
// 日数計算
// ================================================================

/**
 * 指定した日付が「今日から何日後か」を返す。
 *
 * - 正の値: 今日より先（未来）
 * - 0:      今日
 * - 負の値: 今日より前（過去）
 *
 * @param dateStr - 対象日付（YYYY-MM-DD）
 * @returns 残り日数（整数）
 *
 * @example
 * // 今日が 2025-06-10 の場合
 * calcDaysUntil('2025-06-17') // → 7
 * calcDaysUntil('2025-06-10') // → 0
 * calcDaysUntil('2025-06-03') // → -7
 */
export function calcDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = parseDateStr(dateStr);

  const diffMs = target.getTime() - today.getTime();
  // ミリ秒 → 日数に変換。Math.round で夏時間の1時間ズレを吸収する
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 指定した日付が今日から N 日以内かどうかを返す。
 * 過去の日付（daysUntil < 0）は false を返す。
 *
 * @param dateStr - 対象日付（YYYY-MM-DD）
 * @param days    - 何日以内か
 *
 * @example
 * // 今日が 2025-06-10 の場合
 * isWithinDays('2025-06-17', 7)  // → true（7日後）
 * isWithinDays('2025-06-18', 7)  // → false（8日後）
 * isWithinDays('2025-06-03', 7)  // → false（過去）
 */
export function isWithinDays(dateStr: string, days: number): boolean {
  const daysUntil = calcDaysUntil(dateStr);
  return daysUntil >= 0 && daysUntil <= days;
}

/**
 * 指定した日付が過去かどうかを返す。
 *
 * @example
 * // 今日が 2025-06-10 の場合
 * isPast('2025-06-09') // → true
 * isPast('2025-06-10') // → false（今日は過去でない）
 */
export function isPast(dateStr: string): boolean {
  return calcDaysUntil(dateStr) < 0;
}

// ================================================================
// フォーマット関数
// ================================================================

/**
 * 金額を日本円表示にフォーマットする。
 *
 * @example
 * formatCurrency(1500)  // → '¥1,500'
 * formatCurrency(980)   // → '¥980'
 * formatCurrency(0)     // → '¥0'
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * YYYY-MM-DD 形式の日付を「月日」形式にフォーマットする。
 * 同年の日付表示に使う。
 *
 * @example
 * formatDate('2025-06-01')  // → '6月1日'
 * formatDate('2025-12-31')  // → '12月31日'
 */
export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  return `${month}月${day}日`;
}

/**
 * YYYY-MM-DD 形式の日付を「年月日」形式にフォーマットする。
 * 解約ガイドや詳細画面など、年が必要な場面で使う。
 *
 * @example
 * formatDateFull('2025-06-01')  // → '2025年6月1日'
 */
export function formatDateFull(dateStr: string): string {
  const parts = dateStr.split('-');
  const year  = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  return `${year}年${month}月${day}日`;
}

/**
 * 残り日数を日本語で返す。
 * ダッシュボードのバッジや一覧表示で使う。
 *
 * @example
 * formatDaysUntil(0)   // → '今日'
 * formatDaysUntil(1)   // → '明日'
 * formatDaysUntil(7)   // → 'あと7日'
 * formatDaysUntil(-1)  // → '1日前'（過去の場合）
 */
export function formatDaysUntil(daysUntil: number): string {
  if (daysUntil === 0) return '今日';
  if (daysUntil === 1) return '明日';
  if (daysUntil > 1)   return `あと${daysUntil}日`;
  return `${Math.abs(daysUntil)}日前`;
}

/**
 * 請求サイクルを日本語ラベルで返す。
 *
 * @example
 * getBillingCycleLabel('monthly')   // → '月額'
 * getBillingCycleLabel('yearly')    // → '年額'
 * getBillingCycleLabel('quarterly') // → '四半期払い'
 */
export function getBillingCycleLabel(cycle: BillingCycle): string {
  const labels: Record<BillingCycle, string> = {
    monthly:   '月額',
    yearly:    '年額',
    weekly:    '週額',
    quarterly: '四半期払い',
  };
  return labels[cycle];
}

/**
 * 金額と請求サイクルを組み合わせた説明文を返す。
 * 年額・四半期払いの場合は月換算も表示する。
 * フォームのサブテキストやサービス選択画面で使う。
 *
 * @example
 * getBillingCycleNote(12000, 'yearly')   // → '年額（月換算 ¥1,000）'
 * getBillingCycleNote(3000, 'quarterly') // → '四半期払い（月換算 ¥1,000）'
 * getBillingCycleNote(980, 'monthly')    // → '月額'
 * getBillingCycleNote(980, 'weekly')     // → '週額（月換算 ¥4,246）'
 */
export function getBillingCycleNote(amount: number, cycle: BillingCycle): string {
  if (cycle === 'monthly') {
    return '月額';
  }
  const monthly = calcAmountMonthly(amount, cycle);
  return `${getBillingCycleLabel(cycle)}（月換算 ${formatCurrency(monthly)}）`;
}

// ================================================================
// 緊急度判定
// ================================================================

/**
 * 請求の緊急度。
 * ダッシュボードのバッジ色や通知の優先度に使う。
 *
 * - urgent:  7日以内（赤バッジ）
 * - warning: 14日以内（オレンジバッジ）
 * - normal:  それ以外（バッジなし）
 */
export type BillingUrgency = 'urgent' | 'warning' | 'normal';

/**
 * 次回請求日から緊急度を判定して返す。
 *
 * @example
 * // 今日が 2025-06-10 の場合
 * getBillingUrgency('2025-06-14') // → 'urgent'（4日後）
 * getBillingUrgency('2025-06-20') // → 'warning'（10日後）
 * getBillingUrgency('2025-07-01') // → 'normal'（21日後）
 */
export function getBillingUrgency(nextBillingDate: string): BillingUrgency {
  const days = calcDaysUntil(nextBillingDate);
  if (days >= 0 && days <= 7)  return 'urgent';
  if (days >= 0 && days <= 14) return 'warning';
  return 'normal';
}

/**
 * 無料期間終了日から緊急度を判定して返す。
 *
 * @param isFreeTrial      - 無料トライアル中かどうか
 * @param freeTrialEndDate - 無料期間終了日（YYYY-MM-DD）
 * @returns
 *   - null:    無料期間ではない、または既に終了している
 *   - urgent:  3日以内に終了（赤バッジ）
 *   - warning: 7日以内に終了（オレンジバッジ）
 *   - normal:  8日以上先に終了
 *
 * @example
 * // 今日が 2025-06-10 の場合
 * getFreeTrialUrgency(true, '2025-06-12') // → 'urgent'（2日後）
 * getFreeTrialUrgency(true, '2025-06-15') // → 'warning'（5日後）
 * getFreeTrialUrgency(true, '2025-06-20') // → 'normal'（10日後）
 * getFreeTrialUrgency(false, undefined)   // → null
 * getFreeTrialUrgency(true, '2025-06-09') // → null（既に終了）
 */
export function getFreeTrialUrgency(
  isFreeTrial: boolean,
  freeTrialEndDate?: string,
): BillingUrgency | null {
  if (!isFreeTrial || !freeTrialEndDate) return null;

  const days = calcDaysUntil(freeTrialEndDate);

  // 既に終了している場合は null（通常は isFreeTrial が false になるはずだが念のため）
  if (days < 0) return null;

  if (days <= 3) return 'urgent';
  if (days <= 7) return 'warning';
  return 'normal';
}

// ================================================================
// 今日の日付ユーティリティ
// ================================================================

/**
 * 今日の日付を YYYY-MM-DD 形式で返す。
 * テスト時にモックしやすいように関数として分離している。
 *
 * @example
 * getTodayStr() // → '2025-06-10'（実行日による）
 */
export function getTodayStr(): string {
  return toDateStr(new Date());
}
