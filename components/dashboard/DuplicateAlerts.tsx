/**
 * components/dashboard/DuplicateAlerts.tsx
 * ==========================================
 * 重複サブスクをカテゴリ単位で目立たせて表示するコンポーネント。
 *
 * 表示条件:
 * - SavingOpportunity の中で type === 'duplicate' かつ dismissed === false のものを抽出
 * - 1 つも該当がなければ何も表示しない
 *
 * 各カードに表示:
 * - カテゴリの絵文字
 * - 「カテゴリ名が重複しています」
 * - 重複しているサービス名一覧
 * - そのカテゴリ全体の月額合計
 * - タップで /savings へ遷移
 */

'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SavingOpportunity } from '@/types';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/billing';

interface DuplicateAlertsProps {
  /** ダッシュボード集計の savingOpportunities をそのまま渡す */
  opportunities: SavingOpportunity[];
}

export function DuplicateAlerts({ opportunities }: DuplicateAlertsProps) {
  // 重複候補のみ抽出（dismissed は除外）
  const duplicates = opportunities.filter(
    (op) => op.type === 'duplicate' && !op.dismissed,
  );

  if (duplicates.length === 0) return null;

  return (
    <div className="mx-4 mt-3 space-y-2">
      {duplicates.map((op) => {
        // グループ全体の月額合計
        const groupTotal = op.subscriptions.reduce(
          (sum, s) => sum + s.amountMonthly,
          0,
        );

        // 最初のサブスクからカテゴリを取得（同カテゴリのはず）
        const category = op.subscriptions[0]?.category ?? 'other';
        const emoji = CATEGORY_EMOJIS[category];
        const categoryLabel = CATEGORY_LABELS[category];
        const serviceNames = op.subscriptions.map((s) => s.name).join('・');

        return (
          <Link
            key={op.id}
            href="/savings"
            className="block rounded-xl border border-amber-200 bg-amber-50 active:bg-amber-100 transition-colors px-4 py-3"
          >
            <div className="flex items-center gap-3">
              {/* カテゴリ絵文字 */}
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {emoji}
              </span>

              {/* メイン情報 */}
              <div className="flex-1 min-w-0">
                <p className="text-amber-900 text-xs font-semibold mb-0.5">
                  {categoryLabel}が重複しています
                </p>
                <p className="text-amber-800 text-sm font-bold leading-tight truncate">
                  {serviceNames}
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  この{categoryLabel}だけで{' '}
                  <span className="font-bold">{formatCurrency(groupTotal)}/月</span>
                </p>
              </div>

              {/* 矢印 */}
              <ChevronRight
                size={16}
                className="text-amber-500 flex-shrink-0"
                strokeWidth={2.5}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}