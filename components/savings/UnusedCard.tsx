'use client';

/**
 * components/savings/UnusedCard.tsx
 * ===================================
 * 未使用候補のサブスクを表示するカード。
 *
 * 表示内容:
 * - サービス名・カテゴリ・月額
 * - 「最近使っていますか？」という柔らかい問いかけ
 * - 未使用判定の理由（人間が読める文章で）
 * - 月額・年額の節約額
 * - 「今も使っている」ボタン（押すと候補から外れる）
 * - 「解約ガイドを見る」ボタン（serviceId がある場合）
 *
 * トーン:
 * - 「使っていない」と断定しない → 「使っていないかも」という問いかけ形式
 * - 「今も使っている」を押したユーザーを責めない
 * - 解約は「選択肢の一つ」として提示する
 *
 * 「今も使っている」ボタンの動作:
 * 1. onConfirmActive(subscriptionId) を呼ぶ
 * 2. 親（page.tsx）が updateSubscription で lastConfirmedActive を今日に更新
 * 3. subscriptions state が更新 → detectUnused の useMemo 再実行
 * 4. スコアがリセット → このカードが消える（自動）
 */

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/billing';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/serviceDb';
import { UNUSED_REASON_LABELS, CATEGORY_EMOJIS } from '@/types';
import type { SavingOpportunity, UnusedReason } from '@/types';

interface UnusedCardProps {
  opportunity: SavingOpportunity;
  /** 「今も使っている」ボタン押下時のコールバック */
  onConfirmActive: (subscriptionId: string) => void;
  /** 確認処理中かどうか（ボタンをローディング状態にする） */
  isConfirming?: boolean;
}

export function UnusedCard({
  opportunity,
  onConfirmActive,
  isConfirming = false,
}: UnusedCardProps) {
  const { subscriptions, reasons, estimatedMonthlySaving, estimatedYearlySaving } = opportunity;

  // 未使用候補は subscriptions[0] が対象サブスク
  const sub = subscriptions[0];
  if (!sub) return null;

  // 解約ガイドのリンク先（serviceId がある場合のみ）
  const cancelHref = sub.serviceId ? `/cancel/${sub.serviceId}` : null;

  const [iconError, setIconError] = useState(false);

  // 「今も使っている」確認済みの一時的なフラグ
  // （updateSubscription の処理中に UI が変化しないよう、楽観的に完了表示する）
  const [confirmedLocally, setConfirmedLocally] = useState(false);

  const handleConfirmActive = () => {
    setConfirmedLocally(true);
    onConfirmActive(sub.id);
  };

  // 確認済み状態のカード（フェードアウト前の中間状態）
  if (confirmedLocally) {
    return (
      <div className="bg-white rounded-xl border border-emerald-200 shadow-sm px-4 py-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />
          <div>
            <p className="text-sm font-bold text-emerald-700">{sub.name}</p>
            <p className="text-xs text-emerald-500 mt-0.5">
              「今も使っている」を記録しました。しばらく通知しません。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── サービス情報ヘッダー ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        {/* アイコン */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
          {sub.iconUrl && !iconError ? (
            <img
              src={sub.iconUrl}
              alt={sub.name}
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
              onError={() => setIconError(true)}
            />
          ) : (
            <span className="text-xl" aria-hidden="true">
              {sub.category ? CATEGORY_EMOJIS[sub.category] : '📦'}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{sub.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {sub.category ? getCategoryLabel(sub.category) : ''}
            {' '}・{' '}
            <span className="font-medium text-slate-500">{formatCurrency(sub.amountMonthly)}/月</span>
          </p>
        </div>
      </div>

      {/* ── 問いかけメッセージ ── */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm font-medium text-slate-700 leading-relaxed">
          最近使っていますか？
        </p>

        {/* 未使用と判断した理由 */}
        {reasons && reasons.length > 0 && (
          <div className="mt-2 space-y-1">
            {reasons.map((reason) => (
              <ReasonBadge key={reason} reason={reason} />
            ))}
          </div>
        )}
      </div>

      {/* ── 節約額 ── */}
      <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-sky-50 border border-sky-100">
        <p className="text-[10px] text-sky-600 font-medium mb-1">
          解約すると節約できるかも
        </p>
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] text-sky-500 mb-0.5">月額</p>
            <p className="text-base font-bold text-sky-700">
              {formatCurrency(estimatedMonthlySaving)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-sky-500 mb-0.5">年間</p>
            <p className="text-base font-bold text-sky-700">
              {formatCurrency(estimatedYearlySaving)}
            </p>
          </div>
        </div>
      </div>

      {/* ── アクションボタン ── */}
      <div className="px-4 pb-4 space-y-2">
        {/* 「今も使っている」ボタン */}
        <button
          type="button"
          onClick={handleConfirmActive}
          disabled={isConfirming}
          className="
            flex items-center justify-center gap-2 w-full
            py-3 rounded-xl
            bg-slate-100 border border-slate-200
            text-slate-700 text-sm font-medium
            hover:bg-slate-200 active:bg-slate-200
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <CheckCircle2 size={16} strokeWidth={2} className="text-emerald-500" />
          {isConfirming ? '記録中...' : '今も使っている'}
        </button>

        {/* 「解約ガイドを見る」ボタン */}
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="
              flex items-center justify-center gap-2 w-full
              py-3 rounded-xl border-2 border-sky-300
              text-sky-700 text-sm font-bold
              hover:bg-sky-50 active:bg-sky-100 transition-colors
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
// 理由バッジ
// ================================================================

/**
 * 未使用判定の理由を、ユーザーフレンドリーなテキストで表示するバッジ。
 * 責めるのではなく「こういう状況のサービスです」という情報提供のトーンにする。
 */
function ReasonBadge({ reason }: { reason: UnusedReason }) {
  // UNUSED_REASON_LABELS はやや硬いので、このコンポーネントでより柔らかく言い換える
  const FRIENDLY_LABELS: Record<UnusedReason, string> = {
    not_confirmed_90days:   '90日以上、使用確認されていません',
    not_confirmed_60days:   '60日以上、使用確認されていません',
    high_risk_category:     'このカテゴリは使われなくなりやすい傾向があります',
    long_term_unconfirmed:  '登録以来、一度も確認されていません',
  };

  const label = FRIENDLY_LABELS[reason];

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
