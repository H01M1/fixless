/**
 * lib/csvExport.ts
 * ================
 * 登録サブスクを CSV ファイルとしてエクスポートするユーティリティ。
 *
 * 主な機能:
 * - subscriptionsToCSV(): Subscription[] → CSV 文字列
 * - downloadCSV():        ブラウザでファイルダウンロードをトリガー
 * - getDefaultCsvFilename(): 日付入りのファイル名を生成
 *
 * Excel で日本語が文字化けしないよう、UTF-8 BOM (\uFEFF) を先頭に付与。
 * Windows互換のため改行は CRLF (\r\n)。
 */

import {
  CATEGORY_LABELS,
  BILLING_CYCLE_LABELS,
  type Subscription,
  type SubscriptionStatus,
} from '@/types';

// ================================================================
// 状態の日本語ラベル
// ================================================================

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active:    'アクティブ',
  cancelled: '解約済み',
  paused:    '一時停止',
};

// ================================================================
// ヘルパー
// ================================================================

/**
 * ISO 形式の日付文字列を YYYY/MM/DD に整形。
 * 不正な値や undefined の場合は空文字を返す。
 */
function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

/**
 * CSV のフィールド1つをエスケープ。
 * - カンマ / ダブルクォート / 改行を含む場合は "..." で囲む
 * - 内部のダブルクォートは "" にエスケープ
 */
function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ================================================================
// メイン関数
// ================================================================

/**
 * Subscription の配列を CSV 文字列に変換。
 *
 * @param subscriptions エクスポート対象のサブスク配列
 * @returns BOM 付き UTF-8 / CRLF 区切りの CSV 文字列
 */
export function subscriptionsToCSV(subscriptions: Subscription[]): string {
  const headers = [
    'サービス名',
    'カテゴリ',
    '月額(円)',
    '年額(円)',
    '請求金額(円)',
    '請求サイクル',
    '次回請求日',
    '初回請求日',
    '状態',
    '無料トライアル',
    'メモ',
    '登録日',
  ];

  const rows = subscriptions.map((sub) => [
    sub.name,
    CATEGORY_LABELS[sub.category] ?? sub.category,
    sub.amountMonthly,
    sub.amountYearly,
    sub.amount,
    BILLING_CYCLE_LABELS[sub.billingCycle] ?? sub.billingCycle,
    formatDate(sub.nextBillingDate),
    formatDate(sub.billingStartDate),
    STATUS_LABELS[sub.status] ?? sub.status,
    sub.isFreeTrial ? 'はい' : 'いいえ',
    sub.memo ?? '',
    formatDate(sub.createdAt),
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((field) => escapeCsvField(field)).join(','),
  );

  // BOM (\uFEFF) を先頭に付けると Excel が UTF-8 として正しく開ける
  // 改行は CRLF (\r\n) で Windows 互換
  return '\uFEFF' + csvLines.join('\r\n');
}

/**
 * 今日の日付を含むデフォルトファイル名を生成。
 *
 * @example
 *   getDefaultCsvFilename() // → "minaos-subscriptions-2026-05-07.csv"
 */
export function getDefaultCsvFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `minaos-subscriptions-${y}-${m}-${day}.csv`;
}

/**
 * CSV 文字列をブラウザ経由でダウンロードさせる。
 *
 * 内部的には Blob URL を作成して <a download> をクリックするテクニック。
 * SSR では window が無いので何もしない。
 */
export function downloadCSV(csv: string, filename: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href          = url;
  link.download      = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // メモリリーク防止
  URL.revokeObjectURL(url);
}
