'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { calcDashboardSummary } from '@/lib/savings';
import { getDismissedOpportunityIds } from '@/lib/storage';
import { formatCurrency, formatDate, formatDaysUntil } from '@/lib/billing';
import { SummaryCard, SummaryCardSkeleton } from '@/components/dashboard/SummaryCard';
import { SavingBanner } from '@/components/dashboard/SavingBanner';
import { SubscriptionList } from '@/components/dashboard/SubscriptionList';

export default function DashboardPage() {
  const { subscriptions, loading, error, deleteSubscription } = useSubscriptions();
  const summary = useMemo(() => {
    const dismissedIds = getDismissedOpportunityIds();
    return calcDashboardSummary(subscriptions, dismissedIds);
  }, [subscriptions]);
  const visibleOpportunities = summary.savingOpportunities.filter((op) => !op.dismissed);
  const urgentBillings = summary.upcomingBillings.filter((b) => b.isUrgent);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <AlertCircle size={48} className="text-rose-400 mb-4" strokeWidth={1.5} />
        <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm text-indigo-600 font-medium">
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <h1 className="text-xl font-black text-indigo-700 tracking-tight">FixLess</h1>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">固定費を減らす節約アシスタント</p>
        </div>
        <Link href="/add" className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm active:bg-indigo-700 transition-colors">
          <PlusCircle size={15} strokeWidth={2.5} />
          追加
        </Link>
      </header>

      {loading ? <SummaryCardSkeleton /> : (
        <SummaryCard
          totalMonthly={summary.totalMonthly}
          totalYearly={summary.totalYearly}
          subscriptionCount={summary.subscriptionCount}
        />
      )}

      {!loading && (
        <SavingBanner
          totalPotentialMonthlySaving={summary.totalPotentialMonthlySaving}
          opportunityCount={visibleOpportunities.length}
        />
      )}

      {!loading && urgentBillings.length > 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5">
            <AlertCircle size={13} strokeWidth={2.5} />
            まもなく請求があります
          </p>
          <div className="space-y-1.5">
            {urgentBillings.map(({ subscription, daysUntil }) => (
              <div key={subscription.id} className="flex items-center justify-between">
                <span className="text-xs text-rose-700 truncate max-w-[60%]">{subscription.name}</span>
                <span className="text-xs text-rose-600 font-semibold whitespace-nowrap ml-2">
                  {formatDate(subscription.nextBillingDate)}（{formatDaysUntil(daysUntil)}）{' '}{formatCurrency(subscription.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="mt-5">
        {!loading && subscriptions.length > 0 && (
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-bold text-slate-600">登録中のサブスク</h2>
            <span className="text-xs text-slate-400">月額が高い順</span>
          </div>
        )}
        <SubscriptionList
          subscriptions={subscriptions}
          loading={loading}
          onDelete={deleteSubscription}
        />
      </section>
      <div className="h-6" />
    </div>
  );
}