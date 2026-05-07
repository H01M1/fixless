/**
 * components/dashboard/SamplePreview.tsx
 * ========================================
 * サブスクが 0 件のとき、ホーム画面の下部に表示する「使い方の例」セクション。
 *
 * デザイン方針:
 * - 「自分のデータ（空）」の下に置くことで、混同を完全に防ぐ
 * - 内部で sampleData を使って通常コンポーネント（SummaryCard 等）を再利用
 * - セクション全体を視覚的にやや暗めに（区別する）
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { calcDashboardSummary } from '@/lib/savings';
import { getSampleSubscriptions } from '@/lib/sampleData';
import { SummaryCard } from './SummaryCard';
import { DuplicateAlerts } from './DuplicateAlerts';
import { SavingBanner } from './SavingBanner';
import { SubscriptionList } from './SubscriptionList';

export function SamplePreview() {
  const sampleSubs = useMemo(() => getSampleSubscriptions(), []);
  const summary = useMemo(
    () => calcDashboardSummary(sampleSubs, []),
    [sampleSubs],
  );
  const visibleOpportunities = summary.savingOpportunities.filter(
    (op) => !op.dismissed,
  );
  const noopDelete = async () => {};

  return (
    <section className="mt-10 pt-6 border-t-2 border-dashed border-slate-200">
      {/* セクションヘッダー：このセクションが「サンプル」だと明示 */}
      <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl" aria-hidden="true">👀</span>
          <p className="text-amber-900 text-sm font-bold">
            こんな感じで使えます
          </p>
        </div>
        <p className="text-amber-800 text-xs leading-relaxed">
          フリーランスデザイナーが ChatGPT・Adobe・Canva などを契約している
          <strong>サンプル表示</strong>です
        </p>
      </div>

      {/* サンプルコンテンツ */}
      <SummaryCard
        totalMonthly={summary.totalMonthly}
        totalYearly={summary.totalYearly}
        subscriptionCount={summary.subscriptionCount}
      />

      <DuplicateAlerts opportunities={summary.savingOpportunities} />

      <SavingBanner
        totalPotentialMonthlySaving={summary.totalPotentialMonthlySaving}
        opportunityCount={visibleOpportunities.length}
      />

      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-sm font-bold text-slate-600">登録例</h2>
          <span className="text-xs text-slate-400">月額が高い順</span>
        </div>
        <SubscriptionList
          subscriptions={sampleSubs}
          loading={false}
          onDelete={noopDelete}
        />
      </div>

      {/* 締めの CTA */}
      <div className="mx-4 mt-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-center shadow-md">
        <Sparkles size={28} className="text-yellow-300 mx-auto mb-2" strokeWidth={2.5} />
        <h3 className="text-white text-base font-bold mb-1">
          自分の年間コストはいくら？
        </h3>
        <p className="text-indigo-200 text-xs leading-relaxed mb-4 px-2">
          実際に使っているサブスクを入れると、<br />
          本当の年間コスト・重複・節約候補が見えます
        </p>
        <Link
          href="/add"
          className="inline-flex items-center justify-center gap-2 w-full bg-white text-indigo-700 py-3 rounded-xl text-sm font-bold shadow-sm active:bg-slate-50"
        >
          最初のサブスクを追加する
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}