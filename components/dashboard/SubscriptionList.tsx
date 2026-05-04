/**
 * components/dashboard/SubscriptionList.tsx
 * ===========================================
 * 登録済みサブスクの一覧表示コンポーネント。
 *
 * 表示:
 * - サブスクを月額降順で SubscriptionCard として表示
 * - 0件のときは「最初のサブスクを追加」の空状態UIを表示
 *
 * ソート:
 * props で受け取った subscriptions はすでにソート済みの前提（hook が保証する）
 */

import Link from 'next/link';
import { PlusCircle, Receipt } from 'lucide-react';
import { SubscriptionCard, SubscriptionCardSkeleton } from '@/components/subscription/SubscriptionCard';
import type { Subscription } from '@/types';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export function SubscriptionList({
  subscriptions,
  loading = false,
  onDelete,
}: SubscriptionListProps) {

  // ─── ローディング状態 ─────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 space-y-2">
        {[...Array(3)].map((_, i) => (
          <SubscriptionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ─── 空状態 ──────────────────────────────────────────────
  if (subscriptions.length === 0) {
    return <EmptyState />;
  }

  // ─── 一覧表示 ─────────────────────────────────────────────
  return (
    <div className="px-4 space-y-2">
      {subscriptions.map((sub) => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ================================================================
// 空状態コンポーネント
// ================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center">

      {/* イラスト代わりのアイコン */}
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-5">
        <Receipt size={40} className="text-indigo-300" strokeWidth={1.5} />
      </div>

      {/* メッセージ */}
      <h2 className="text-base font-bold text-slate-700 mb-2">
        まだ登録がありません
      </h2>
      <p className="text-sm text-slate-400 leading-relaxed mb-8">
        毎月どのくらい固定費を<br />
        払っているか確認してみましょう
      </p>

      {/* CTAボタン */}
      <Link
        href="/add"
        className="
          flex items-center gap-2 px-6 py-3.5
          bg-indigo-600 text-white rounded-xl
          text-sm font-bold shadow-md
          active:bg-indigo-700 transition-colors
        "
      >
        <PlusCircle size={18} strokeWidth={2.5} />
        最初のサブスクを追加
      </Link>

      {/* サブテキスト */}
      <p className="text-xs text-slate-300 mt-5 leading-relaxed">
        Netflix・Spotify・ジム・保険など<br />
        なんでも登録できます
      </p>
    </div>
  );
}
