'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, AlertCircle, Download } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { subscriptionsToCSV, downloadCSV, getDefaultCsvFilename } from '@/lib/csvExport';
import { calcDashboardSummary } from '@/lib/savings';
import { getDismissedOpportunityIds } from '@/lib/storage';
import { formatCurrency, formatDate, formatDaysUntil } from '@/lib/billing';
import { SummaryCard, SummaryCardSkeleton } from '@/components/dashboard/SummaryCard';
import { SavingBanner } from '@/components/dashboard/SavingBanner';
import { SubscriptionList } from '@/components/dashboard/SubscriptionList';
import { DuplicateAlerts } from '@/components/dashboard/DuplicateAlerts';
import { SamplePreview } from '@/components/dashboard/SamplePreview';
import { UserMenu } from '@/components/auth/UserMenu';
import { SyncPrompt } from '@/components/auth/SyncPrompt';
import { LoginButton } from '@/components/auth/LoginButton';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { subscriptions, loading, error, deleteSubscription } = useSubscriptions();
  const { user } = useAuth();

  const summary = useMemo(() => {
    const dismissedIds = getDismissedOpportunityIds();
    return calcDashboardSummary(subscriptions, dismissedIds);
  }, [subscriptions]);

  const handleExportCSV = () => {
    const csv = subscriptionsToCSV(subscriptions);
    downloadCSV(csv, getDefaultCsvFilename());
  };

  const visibleOpportunities = summary.savingOpportunities.filter((op) => !op.dismissed);
  const urgentBillings = summary.upcomingBillings.filter((b) => b.isUrgent);

  // 空のときだけ画面下部にサンプルプレビューを表示
  const showSamplePreview = !loading && subscriptions.length === 0;

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
          <h1 className="text-xl font-black text-indigo-700 tracking-tight">ミナオス</h1>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Minaos · SaaS・サブスク経費を見える化</p>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          {!user && !loading && (
            <LoginButton compact />
          )}
          <Link href="/add" className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm active:bg-indigo-700 transition-colors">
            <PlusCircle size={15} strokeWidth={2.5} />
            追加
          </Link>
        </div>
      </header>

      {loading ? <SummaryCardSkeleton /> : (
        <SummaryCard
          totalMonthly={summary.totalMonthly}
          totalYearly={summary.totalYearly}
          subscriptionCount={summary.subscriptionCount}
        />
      )}

      {!loading && (
        <SyncPrompt subscriptionCount={subscriptions.length} />
      )}

      {!loading && (
        <DuplicateAlerts opportunities={summary.savingOpportunities} />
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">月額が高い順</span>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 active:text-indigo-800"
                title="CSVダウンロード"
              >
                <Download size={12} strokeWidth={2.5} />
                CSV
              </button>
            </div>
          </div>
        )}
        <SubscriptionList
          subscriptions={subscriptions}
          loading={loading}
          onDelete={deleteSubscription}
        />
      </section>

      {/* 自分のサブスクが 0 件のときだけ、画面下部にサンプル例を表示 */}
      {showSamplePreview && <SamplePreview />}

      <div className="h-6" />
    </div>
  );
}