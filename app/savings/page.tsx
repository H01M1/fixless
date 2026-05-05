'use client';

/**
 * app/savings/page.tsx
 * =====================
 * 節約候補ページ。
 *
 * v2.3 変更点:
 * - 代替案・見直し提案セクションを追加（generateAlternatives を使用）
 * - 既存の重複候補・未使用候補セクションは変更なし
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Sparkles } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { detectDuplicates, detectUnused } from '@/lib/savings';
import { generateAlternatives } from '@/lib/alternatives';
import { getTodayStr, formatCurrency } from '@/lib/billing';
import { PageHeader } from '@/components/layout/PageHeader';
import { SavingsSummaryCard } from '@/components/savings/SavingsSummaryCard';
import { DuplicateCard } from '@/components/savings/DuplicateCard';
import { UnusedCard } from '@/components/savings/UnusedCard';
import { AlternativeCard } from '@/components/savings/AlternativeCard';
import type { SavingOpportunity } from '@/types';

// 代替案の最大表示件数
const MAX_ALTERNATIVES = 5;

export default function SavingsPage() {
  const { subscriptions, loading, updateSubscription } = useSubscriptions();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // ── 既存ロジック（変更なし）────────────────────────────────────

  const duplicateOpportunities = useMemo(
    () => detectDuplicates(subscriptions),
    [subscriptions],
  );

  const unusedOpportunities = useMemo(
    () => detectUnused(subscriptions),
    [subscriptions],
  );

  const totalSavings = useMemo(() => {
    const countedIds = new Set<string>();
    let monthly = 0;
    let yearly  = 0;

    const allOps: SavingOpportunity[] = [
      ...duplicateOpportunities,
      ...unusedOpportunities,
    ];

    for (const op of allOps) {
      const targetSub =
        op.type === 'duplicate' && op.suggestedCancelId
          ? op.subscriptions.find((s) => s.id === op.suggestedCancelId)
          : op.subscriptions[0];

      if (!targetSub || countedIds.has(targetSub.id)) continue;
      countedIds.add(targetSub.id);
      monthly += targetSub.amountMonthly;
      yearly  += targetSub.amountYearly;
    }

    return { monthly, yearly };
  }, [duplicateOpportunities, unusedOpportunities]);

  const totalOpportunityCount =
    duplicateOpportunities.length + unusedOpportunities.length;

  // ── 代替案ロジック（v2.3 追加）──────────────────────────────────

  const alternativeSuggestions = useMemo(
    () => generateAlternatives(subscriptions, MAX_ALTERNATIVES),
    [subscriptions],
  );

  // ── ハンドラ（変更なし）───────────────────────────────────────

  const handleConfirmActive = async (subscriptionId: string) => {
    setConfirmingId(subscriptionId);
    await updateSubscription(subscriptionId, {
      lastConfirmedActive: getTodayStr(),
    });
    setConfirmingId(null);
  };

  // ================================================================
  // ローディング
  // ================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="節約候補" backHref="/" />
        <div className="px-4 pt-4 space-y-3 animate-pulse">
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="h-36 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // ================================================================
  // サブスクが0件
  // ================================================================

  if (subscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="節約候補" backHref="/" />
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <Sparkles size={40} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-bold text-slate-700 mb-2">
            まずサブスクを登録してみましょう
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            サブスクを登録すると、<br />
            節約できるポイントを見つけてお知らせします
          </p>
          <Link
            href="/add"
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md active:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={18} strokeWidth={2.5} />
            最初のサブスクを追加
          </Link>
        </div>
      </div>
    );
  }

  // ================================================================
  // 節約候補もなく代替案もない
  // ================================================================

  if (totalOpportunityCount === 0 && alternativeSuggestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="節約候補" backHref="/" />
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="text-base font-bold text-slate-700 mb-2">
            現在、節約候補はありません
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {subscriptions.length}件のサブスクをしっかり管理できています！
          </p>
        </div>
      </div>
    );
  }

  // ================================================================
  // メイン表示
  // ================================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="節約候補" backHref="/" />

      <div className="px-4 pt-4 pb-6 space-y-5">

        {/* 節約合計サマリー */}
        {totalOpportunityCount > 0 && (
          <SavingsSummaryCard
            totalMonthlySaving={totalSavings.monthly}
            totalYearlySaving={totalSavings.yearly}
            opportunityCount={totalOpportunityCount}
          />
        )}

        {/* 重複候補 */}
        {duplicateOpportunities.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔄</span>
              <h2 className="text-sm font-bold text-slate-700">重複しているかもしれません</h2>
              <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5">
                {duplicateOpportunities.length}件
              </span>
            </div>
            <div className="space-y-3">
              {duplicateOpportunities.map((op) => (
                <DuplicateCard key={op.id} opportunity={op} />
              ))}
            </div>
          </section>
        )}

        {/* 未使用候補 */}
        {unusedOpportunities.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💤</span>
              <h2 className="text-sm font-bold text-slate-700">最近使っていないかも</h2>
              <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5">
                {unusedOpportunities.length}件
              </span>
            </div>
            <div className="space-y-3">
              {unusedOpportunities.map((op) => (
                <UnusedCard
                  key={op.id}
                  opportunity={op}
                  onConfirmActive={handleConfirmActive}
                  isConfirming={confirmingId === op.subscriptions[0]?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── v2.3 追加：代替案・見直し提案セクション ── */}
        {alternativeSuggestions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔀</span>
              <h2 className="text-sm font-bold text-slate-700">代替案・見直し提案</h2>
              <span className="text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5">
                {alternativeSuggestions.length}件
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              契約中のサービスに対して、継続価値や比較候補を表示します。
              あくまで参考情報です。
            </p>
            <div className="space-y-3">
              {alternativeSuggestions.map((suggestion) => (
                <AlternativeCard
                  key={suggestion.subscription.id}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </section>
        )}

        <p className="text-center text-xs text-slate-400 leading-relaxed pt-2">
          節約金額はすべてのサービスを解約した場合の参考値です。
        </p>
      </div>
    </div>
  );
}
