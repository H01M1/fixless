/**
 * components/dashboard/SavingBanner.tsx
 * =======================================
 * 節約できる可能性がある場合にダッシュボードに表示するバナー。
 *
 * 表示条件:
 * - totalPotentialMonthlySaving > 0 の場合のみ表示
 * - 0 の場合は何も表示しない（null を返す）
 *
 * タップ時: /savings（節約候補一覧）に遷移する
 */

'use client';

import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/billing';

interface SavingBannerProps {
  /** 節約できそうな月額合計（円）。0 のとき非表示。 */
  totalPotentialMonthlySaving: number;
  /** 節約候補の件数（重複 + 未使用の合計） */
  opportunityCount: number;
}

export function SavingBanner({
  totalPotentialMonthlySaving,
  opportunityCount,
}: SavingBannerProps) {
  // 節約候補がない場合は何も表示しない
  if (totalPotentialMonthlySaving <= 0 || opportunityCount === 0) {
    return null;
  }

  return (
    <Link href="/savings" className="block mx-4 mt-3">
      <div
        className="
          flex items-center gap-3 px-4 py-3 rounded-xl
          bg-emerald-50 border border-emerald-200
          active:bg-emerald-100 transition-colors
        "
      >
        {/* アイコン */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <Sparkles size={16} className="text-white" strokeWidth={2} />
        </div>

        {/* テキスト */}
        <div className="flex-1 min-w-0">
          <p className="text-emerald-800 text-sm font-bold leading-tight">
            月{formatCurrency(totalPotentialMonthlySaving)}節約できるかも
          </p>
          <p className="text-emerald-600 text-xs mt-0.5">
            {opportunityCount}件の節約候補があります →
          </p>
        </div>

        {/* 矢印 */}
        <ChevronRight
          size={18}
          className="text-emerald-500 flex-shrink-0"
          strokeWidth={2.5}
        />
      </div>
    </Link>
  );
}
