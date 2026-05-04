'use client';

/**
 * components/subscription/SubscriptionCard.tsx
 * ==============================================
 * 登録済みサブスクを1件表示するカード。
 *
 * 表示内容:
 * - カテゴリ絵文字 or サービスアイコン（エラー時は絵文字にフォールバック）
 * - サービス名
 * - 月額
 * - 次回請求日 + 「あと〇日」バッジ
 *
 * 削除機能:
 * - ゴミ箱アイコンをタップするとインラインで確認表示
 * - 「削除する」で onDelete 呼び出し。「やめる」でキャンセル
 */

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Subscription } from '@/types';
import { CATEGORY_EMOJIS } from '@/types';
import {
  formatCurrency,
  formatDate,
  calcDaysUntil,
  formatDaysUntil,
  getBillingUrgency,
  getFreeTrialUrgency,
} from '@/lib/billing';

interface SubscriptionCardProps {
  subscription: Subscription;
  /** 削除時のコールバック。省略時は削除ボタン非表示。 */
  onDelete?: (id: string) => void;
}

export function SubscriptionCard({ subscription, onDelete }: SubscriptionCardProps) {
  const [iconError, setIconError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    id, name, category, iconUrl,
    amountMonthly, billingCycle,
    nextBillingDate, isFreeTrial, freeTrialEndDate,
  } = subscription;

  // ─── 日付・緊急度の計算 ────────────────────────────────────

  // 無料期間が終わりそうな場合は freeTrialEndDate を優先表示
  const showFreeTrialWarning =
    isFreeTrial &&
    freeTrialEndDate &&
    getFreeTrialUrgency(isFreeTrial, freeTrialEndDate) !== null;

  const displayDate   = showFreeTrialWarning ? freeTrialEndDate! : nextBillingDate;
  const daysUntil     = calcDaysUntil(displayDate);
  const urgency       = showFreeTrialWarning
    ? (getFreeTrialUrgency(isFreeTrial, freeTrialEndDate) ?? 'normal')
    : getBillingUrgency(nextBillingDate);

  // ─── バッジのスタイル ─────────────────────────────────────

  const badgeClass = {
    urgent:  'bg-rose-100 text-rose-600 font-bold',   // 7日以内（赤）
    warning: 'bg-amber-100 text-amber-600 font-medium', // 14日以内（オレンジ）
    normal:  'bg-slate-100 text-slate-500',              // それ以外
  }[urgency];

  // ─── 削除ハンドラ ─────────────────────────────────────────

  const handleDeleteClick = () => setConfirmDelete(true);
  const handleCancelDelete = () => setConfirmDelete(false);
  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete?.(id);
  };

  // ─── 請求日ラベル ─────────────────────────────────────────

  const dateLabel = showFreeTrialWarning
    ? `無料期間終了 ${formatDate(freeTrialEndDate!)}`
    : `次回 ${formatDate(nextBillingDate)}`;

  // ─── レンダリング ─────────────────────────────────────────

  return (
    <div
      className={`
        bg-white rounded-xl border transition-shadow
        ${urgency === 'urgent' ? 'border-rose-200' : 'border-slate-100'}
        ${confirmDelete ? 'shadow-md' : 'shadow-sm'}
      `}
    >
      {/* メイン行 */}
      <div className="flex items-center gap-3 px-4 py-3.5">

        {/* アイコン */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
          {iconUrl && !iconError ? (
            <img
              src={iconUrl}
              alt={name}
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
              onError={() => setIconError(true)}
            />
          ) : (
            <span className="text-xl" role="img" aria-label={name}>
              {CATEGORY_EMOJIS[category]}
            </span>
          )}
        </div>

        {/* サービス情報 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-400">{dateLabel}</span>
            {/* 「あと〇日」バッジ */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badgeClass}`}>
              {formatDaysUntil(daysUntil)}
            </span>
            {/* 無料期間バッジ */}
            {isFreeTrial && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-600 font-medium">
                無料期間中
              </span>
            )}
          </div>
        </div>

        {/* 月額 */}
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-bold text-slate-800">
            {formatCurrency(amountMonthly)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {billingCycle === 'monthly' ? '/月' :
             billingCycle === 'yearly'  ? '/月換算' :
             billingCycle === 'weekly'  ? '/月換算' : '/月換算'}
          </p>
        </div>

        {/* 削除ボタン */}
        {onDelete && !confirmDelete && (
          <button
            onClick={handleDeleteClick}
            className="flex-shrink-0 ml-1 p-1.5 rounded-full text-slate-300 hover:text-rose-400 hover:bg-rose-50 active:bg-rose-50 transition-colors"
            aria-label={`${name}を削除`}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* 削除確認行（confirmDelete=true のときのみ表示） */}
      {confirmDelete && (
        <div className="flex items-center justify-between px-4 py-3 bg-rose-50 border-t border-rose-100 rounded-b-xl">
          <p className="text-xs text-rose-700 font-medium">
            「{name}」を削除しますか？
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancelDelete}
              className="text-xs px-3 py-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 active:bg-slate-50 transition-colors"
            >
              やめる
            </button>
            <button
              onClick={handleConfirmDelete}
              className="text-xs px-3 py-1.5 rounded-lg text-white bg-rose-500 active:bg-rose-600 transition-colors font-medium"
            >
              削除する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// ローディングスケルトン
// ================================================================

export function SubscriptionCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3.5 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 bg-slate-200 rounded" />
        <div className="h-3 w-24 bg-slate-200 rounded" />
      </div>
      <div className="space-y-1.5 text-right">
        <div className="h-3.5 w-16 bg-slate-200 rounded" />
        <div className="h-2.5 w-8 bg-slate-200 rounded ml-auto" />
      </div>
    </div>
  );
}
