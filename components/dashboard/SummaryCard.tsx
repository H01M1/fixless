/**
 * components/dashboard/SummaryCard.tsx
 * ======================================
 * ダッシュボードのメインカード。月額合計・年額合計・登録件数を表示する。
 *
 * デザイン方針:
 * - インジゴのグラデーション背景で「固定費の重さ」を視覚的に表現する
 * - 月額合計を最も大きく表示（ユーザーが一番知りたい数値）
 * - 年額合計は月額の下にサブテキストとして表示
 * - 登録件数は右下にさりげなく表示
 */

import { formatCurrency } from '@/lib/billing';

interface SummaryCardProps {
  /** 月額合計（円） */
  totalMonthly: number;
  /** 年額合計（円） */
  totalYearly: number;
  /** アクティブなサブスクの件数 */
  subscriptionCount: number;
}

export function SummaryCard({
  totalMonthly,
  totalYearly,
  subscriptionCount,
}: SummaryCardProps) {
  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-md">
      {/* グラデーション背景 */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-800 px-6 pt-6 pb-5">

        {/* ラベル */}
        <p className="text-indigo-200 text-xs font-medium tracking-wide mb-1">
          今月の固定費合計
        </p>

        {/* 月額合計（メイン数値） */}
        <div className="flex items-end gap-1 mb-4">
          <span className="text-white text-4xl font-bold tracking-tight leading-none">
            {formatCurrency(totalMonthly)}
          </span>
          <span className="text-indigo-300 text-sm font-medium mb-0.5">/月</span>
        </div>

        {/* セパレーター */}
        <div className="border-t border-indigo-500/50 mb-4" />

        {/* 年額合計 + 登録件数 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-[10px] font-medium mb-0.5">
              年間換算
            </p>
            <p className="text-white text-lg font-semibold leading-tight">
              {formatCurrency(totalYearly)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-indigo-300 text-[10px] font-medium mb-0.5">
              登録件数
            </p>
            <p className="text-white text-lg font-semibold leading-tight">
              {subscriptionCount}
              <span className="text-indigo-300 text-sm font-normal ml-0.5">件</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// ローディングスケルトン
// ================================================================

/** SummaryCard のローディング中に表示するスケルトン */
export function SummaryCardSkeleton() {
  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-md">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-800 px-6 pt-6 pb-5 animate-pulse">
        {/* ラベルスケルトン */}
        <div className="h-3 w-24 bg-indigo-500/60 rounded mb-3" />
        {/* メイン金額スケルトン */}
        <div className="h-10 w-40 bg-indigo-500/60 rounded mb-4" />
        <div className="border-t border-indigo-500/50 mb-4" />
        {/* 下部スケルトン */}
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-2.5 w-12 bg-indigo-500/60 rounded" />
            <div className="h-5 w-24 bg-indigo-500/60 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-12 bg-indigo-500/60 rounded" />
            <div className="h-5 w-10 bg-indigo-500/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
