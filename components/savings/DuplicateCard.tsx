'use client';

/**
 * components/savings/DuplicateCard.tsx
 * ======================================
 * 重複サブスク候補を表示するカード。
 *
 * 表示内容:
 * - 重複しているサービス一覧（名前・月額）
 * - 解約を「提案」するサービスに「見直し候補」バッジ
 * - 節約できそうな月額・年額
 * - 「解約ガイドを見る」ボタン（serviceId がある場合）
 *
 * トーン:
 * - 断定しない（「無駄」「解約すべき」などは使わない）
 * - 「見直すと節約できるかも」という柔らかい提案にとどめる
 * - ユーザーが最終判断をする、というスタンスを崩さない
 *
 * serviceId がない場合（手動登録サービス）:
 * - 「解約ガイドを見る」ボタンを非表示にする
 * - 代わりに「公式サイトをご確認ください」テキストを表示
 */

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/billing';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/serviceDb';
import type { SavingOpportunity, Subscription } from '@/types';
import { CATEGORY_EMOJIS } from '@/types';

interface DuplicateCardProps {
  opportunity: SavingOpportunity;
}

export function DuplicateCard({ opportunity }: DuplicateCardProps) {
  const { subscriptions, suggestedCancelId, estimatedMonthlySaving, estimatedYearlySaving } = opportunity;

  // 解約候補のサブスク（月額が最も高いもの）
  const suggestedSub = subscriptions.find((s) => s.id === suggestedCancelId)
    ?? subscriptions[0]; // フォールバック

  // 解約ガイドのリンク先（serviceId がある場合のみ）
  const cancelHref = suggestedSub?.serviceId
    ? `/cancel/${suggestedSub.serviceId}`
    : null;

  // カテゴリ（全サブスクが同じカテゴリのはずだが、念のため最初のものを使う）
  const category = subscriptions[0]?.category;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── ヘッダー ── */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100">
        <span className="text-lg" aria-hidden="true">
          {category ? getCategoryEmoji(category) : '📦'}
        </span>
        <div>
          <p className="text-xs font-bold text-amber-700">
            {category ? `${getCategoryLabel(category)}が重複しています` : '重複候補があります'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            見直すと節約できるかもしれません
          </p>
        </div>
      </div>

      {/* ── サービス一覧 ── */}
      <div className="px-4 py-3 space-y-2">
        {subscriptions.map((sub) => (
          <SubscriptionRow
            key={sub.id}
            subscription={sub}
            isSuggested={sub.id === suggestedCancelId}
          />
        ))}
      </div>

      {/* ── 節約額 ── */}
      <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
        <p className="text-[10px] text-amber-600 font-medium mb-1">
          見直し候補を解約すると...
        </p>
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] text-amber-500 mb-0.5">月額</p>
            <p className="text-base font-bold text-amber-700">
              {formatCurrency(estimatedMonthlySaving)}
              <span className="text-xs font-normal text-amber-500 ml-0.5">節約できるかも</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-amber-500 mb-0.5">年間</p>
            <p className="text-base font-bold text-amber-700">
              {formatCurrency(estimatedYearlySaving)}
            </p>
          </div>
        </div>
      </div>

      {/* ── アクション ── */}
      <div className="px-4 pb-4">
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="
              flex items-center justify-center gap-2 w-full
              py-3 rounded-xl border-2 border-amber-400
              text-amber-700 text-sm font-bold
              hover:bg-amber-50 active:bg-amber-100 transition-colors
            "
          >
            解約ガイドを見る
            <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        ) : (
          <div className="flex items-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200">
            <Info size={14} className="text-slate-400 flex-shrink-0" strokeWidth={2} />
            <p className="text-xs text-slate-500">
              解約は各サービスの公式サイトからご確認ください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// サブスクの1行表示
// ================================================================

interface SubscriptionRowProps {
  subscription: Subscription;
  isSuggested: boolean;
}

function SubscriptionRow({ subscription, isSuggested }: SubscriptionRowProps) {
  const [iconError, setIconError] = useState(false);

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl
        ${isSuggested ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'}
      `}
    >
      {/* アイコン */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border border-slate-100">
        {subscription.iconUrl && !iconError ? (
          <img
            src={subscription.iconUrl}
            alt={subscription.name}
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            onError={() => setIconError(true)}
          />
        ) : (
          <span className="text-base" aria-hidden="true">
            {subscription.category ? CATEGORY_EMOJIS[subscription.category] : '📦'}
          </span>
        )}
      </div>

      {/* サービス名 */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${isSuggested ? 'text-amber-800' : 'text-slate-700'}`}>
          {subscription.name}
        </p>
        {isSuggested && (
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold mt-0.5">
            見直し候補
          </span>
        )}
      </div>

      {/* 月額 */}
      <p className={`text-xs font-bold flex-shrink-0 ${isSuggested ? 'text-amber-700' : 'text-slate-600'}`}>
        {formatCurrency(subscription.amountMonthly)}
        <span className={`text-[10px] font-normal ml-0.5 ${isSuggested ? 'text-amber-500' : 'text-slate-400'}`}>/月</span>
      </p>
    </div>
  );
}
