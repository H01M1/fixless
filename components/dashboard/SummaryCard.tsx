/**
 * components/dashboard/SummaryCard.tsx
 * ======================================
 * ダッシュボードのメインカード。
 *
 * デザイン方針:
 * - 「年間コスト」をヒーロー数値として最も大きく表示
 *   → フリーランス・副業者は月額より「年間でいくら飛んでるか」のほうがインパクトが強い
 * - 月額は「年¥220,800（月¥18,400）」のサブ情報として表示
 * - 登録件数は最下部にコンパクトに
 */

import { formatCurrency } from '@/lib/billing';

interface SummaryCardProps {
  totalMonthly: number;
  totalYearly: number;
  subscriptionCount: number;
}

export function SummaryCard({
  totalMonthly,
  totalYearly,
  subscriptionCount,
}: SummaryCardProps) {
  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-md">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-800 px-6 pt-6 pb-5">

        {/* ラベル */}
        <p className="text-indigo-200 text-xs font-medium tracking-wide mb-1">
          年間で支払う固定費
        </p>

        {/* 年額（メイン・ヒーロー） */}
        <div className="flex items-end gap-1.5 mb-2">
          <span className="text-white text-5xl font-bold tracking-tight leading-none">
            {formatCurrency(totalYearly)}
          </span>
          <span className="text-indigo-300 text-base font-medium mb-1">/年</span>
        </div>

        {/* 月額換算（サブ） */}
        <p className="text-indigo-200 text-sm font-medium mb-4">
          月額換算 <span className="text-white font-semibold">{formatCurrency(totalMonthly)}</span>
        </p>

        {/* セパレーター */}
        <div className="border-t border-indigo-500/50 mb-3" />

        {/* 登録件数 */}
        <div className="flex items-center justify-between">
          <span className="text-indigo-300 text-xs font-medium">登録中のサブスク</span>
          <span className="text-white text-base font-semibold">
            {subscriptionCount}
            <span className="text-indigo-300 text-sm font-normal ml-0.5">件</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// ローディングスケルトン
// ================================================================

export function SummaryCardSkeleton() {
  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-md">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-800 px-6 pt-6 pb-5 animate-pulse">
        <div className="h-3 w-32 bg-indigo-500/60 rounded mb-3" />
        <div className="h-12 w-48 bg-indigo-500/60 rounded mb-3" />
        <div className="h-3 w-36 bg-indigo-500/60 rounded mb-4" />
        <div className="border-t border-indigo-500/50 mb-3" />
        <div className="flex justify-between">
          <div className="h-3 w-28 bg-indigo-500/60 rounded" />
          <div className="h-4 w-12 bg-indigo-500/60 rounded" />
        </div>
      </div>
    </div>
  );
}
