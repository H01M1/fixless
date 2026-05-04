/**
 * components/savings/SavingsSummaryCard.tsx
 * ===========================================
 * 節約候補ページのヘッダーカード。
 * 全候補を解約した場合の月額・年額節約額の合計を表示する。
 *
 * デザイン方針:
 * - emerald（緑系）で「節約・プラス」のイメージを表現
 * - 「節約できるかも」という柔らかい表現に統一
 * - ダッシュボードの SummaryCard と対になるデザイン
 */

import { formatCurrency } from '@/lib/billing';

interface SavingsSummaryCardProps {
  /** 節約できそうな月額合計（円）。二重計算除外済み。 */
  totalMonthlySaving: number;
  /** 節約できそうな年額合計（円）。二重計算除外済み。 */
  totalYearlySaving: number;
  /** 節約候補の件数（重複 + 未使用の合計） */
  opportunityCount: number;
}

export function SavingsSummaryCard({
  totalMonthlySaving,
  totalYearlySaving,
  opportunityCount,
}: SavingsSummaryCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-500 to-emerald-700 px-6 pt-5 pb-5">

        {/* ラベル */}
        <p className="text-emerald-100 text-xs font-medium tracking-wide mb-1">
          節約できるかもしれない金額
        </p>

        {/* 月額節約合計（メイン数値） */}
        <div className="flex items-end gap-1 mb-4">
          <span className="text-white text-4xl font-bold tracking-tight leading-none">
            {formatCurrency(totalMonthlySaving)}
          </span>
          <span className="text-emerald-200 text-sm font-medium mb-0.5">/月</span>
        </div>

        {/* セパレーター */}
        <div className="border-t border-emerald-400/50 mb-4" />

        {/* 年額合計 + 件数 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-[10px] font-medium mb-0.5">
              年間換算
            </p>
            <p className="text-white text-lg font-semibold leading-tight">
              {formatCurrency(totalYearlySaving)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-emerald-200 text-[10px] font-medium mb-0.5">
              見直し候補
            </p>
            <p className="text-white text-lg font-semibold leading-tight">
              {opportunityCount}
              <span className="text-emerald-200 text-sm font-normal ml-0.5">件</span>
            </p>
          </div>
        </div>
      </div>

      {/* 注意書き帯 */}
      <div className="bg-emerald-600 px-5 py-2">
        <p className="text-emerald-100 text-[10px] text-center">
          ※ すべて解約した場合の参考値です。ご判断はご自身でお願いします。
        </p>
      </div>
    </div>
  );
}
