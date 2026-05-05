'use client';

/**
 * components/subscription/BulkAddList.tsx
 * =========================================
 * スクショ追加機能の「追加予定リスト」コンポーネント。
 *
 * 表示・編集できる項目:
 * - サービス名（テキスト編集可）
 * - 金額（数値入力）
 * - 請求サイクル（月額/年額/週額/四半期）
 * - 初回請求日
 * - メモ（任意）
 *
 * バリデーション:
 * - 金額が 1 円以上であること
 * - 初回請求日が入力されていること
 *
 * 「まとめて追加する」ボタン:
 * - 全件バリデーション通過後に onBulkAdd() を呼ぶ
 * - 呼び出し元（ScreenshotImport）が addSubscription を複数回実行する
 */

import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { PendingSubscription } from '@/types';
import {
  BILLING_CYCLES,
  BILLING_CYCLE_LABELS,
  CATEGORY_EMOJIS,
} from '@/types';
import { formatCurrency, getBillingCycleLabel } from '@/lib/billing';

// ================================================================
// Props
// ================================================================

interface BulkAddListProps {
  /** 追加予定のサブスクリスト */
  items: PendingSubscription[];
  /** アイテムが変更されたときのコールバック（親が state を持つ） */
  onChange: (items: PendingSubscription[]) => void;
  /** まとめて追加ボタンが押されたときのコールバック */
  onBulkAdd: () => Promise<void>;
  /** 追加処理中かどうか（ボタンをローディング状態にする） */
  isAdding: boolean;
}

// ================================================================
// BulkAddList
// ================================================================

export function BulkAddList({ items, onChange, onBulkAdd, isAdding }: BulkAddListProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  // アイテムが0件のときは何も表示しない
  if (items.length === 0) return null;

  // ── アイテム更新ヘルパー ─────────────────────────────────────

  const updateItem = (tempId: string, updates: Partial<PendingSubscription>) => {
    onChange(
      items.map((item) =>
        item.tempId === tempId ? { ...item, ...updates } : item,
      ),
    );
  };

  const removeItem = (tempId: string) => {
    onChange(items.filter((item) => item.tempId !== tempId));
  };

  // ── バリデーション + 追加ハンドラ ────────────────────────────

  const handleBulkAdd = async () => {
    for (const item of items) {
      const amount = parseInt(item.amount, 10);
      if (!item.amount || isNaN(amount) || amount < 1) {
        setValidationError(
          `「${item.service.name}」の金額を入力してください（1円以上）`,
        );
        return;
      }
      if (!item.billingStartDate) {
        setValidationError(
          `「${item.service.name}」の初回請求日を入力してください`,
        );
        return;
      }
    }
    setValidationError(null);
    await onBulkAdd();
  };

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    <div className="space-y-3">
      {/* セクションヘッダー */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-700">追加予定リスト</h3>
        <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full font-medium">
          {items.length}件
        </span>
      </div>

      {/* アイテム一覧 */}
      <div className="space-y-2">
        {items.map((item) => (
          <PendingItemCard
            key={item.tempId}
            item={item}
            onChange={(updates) => updateItem(item.tempId, updates)}
            onRemove={() => removeItem(item.tempId)}
          />
        ))}
      </div>

      {/* バリデーションエラー */}
      {validationError && (
        <p className="text-xs text-rose-500 text-center py-1">
          {validationError}
        </p>
      )}

      {/* まとめて追加ボタン */}
      <button
        type="button"
        onClick={handleBulkAdd}
        disabled={isAdding || items.length === 0}
        className="
          w-full py-4 rounded-xl
          bg-indigo-600 text-white text-sm font-bold
          active:bg-indigo-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors shadow-md
        "
      >
        {isAdding
          ? '追加中...'
          : `まとめて追加する（${items.length}件）→`
        }
      </button>
    </div>
  );
}

// ================================================================
// PendingItemCard — 1件分の編集カード
// ================================================================

interface PendingItemCardProps {
  item: PendingSubscription;
  onChange: (updates: Partial<PendingSubscription>) => void;
  onRemove: () => void;
}

function PendingItemCard({ item, onChange, onRemove }: PendingItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const amountNum = parseInt(item.amount, 10);
  const hasAmountError =
    item.amount !== '' && (isNaN(amountNum) || amountNum < 1);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── メイン行（常に表示） ── */}
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-start gap-3">

          {/* カテゴリ絵文字 */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
            <span className="text-lg" aria-hidden="true">
              {CATEGORY_EMOJIS[item.service.category]}
            </span>
          </div>

          {/* サービス名（編集可） */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={item.service.name}
              onChange={(e) =>
                onChange({
                  service: { ...item.service, name: e.target.value },
                })
              }
              className="
                w-full text-sm font-bold text-slate-800
                bg-transparent border-b border-transparent
                focus:border-indigo-400 focus:outline-none
                pb-0.5 truncate
              "
              placeholder="サービス名"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              {item.selectedPlan ? `プラン: ${item.selectedPlan.planName}` : ''}
            </p>
          </div>

          {/* 削除ボタン */}
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 p-1.5 rounded-full text-slate-300 hover:text-rose-400 hover:bg-rose-50 active:bg-rose-50 transition-colors"
            aria-label={`${item.service.name}を削除`}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>

        {/* ── 金額入力 ── */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1">
            <input
              type="number"
              inputMode="numeric"
              value={item.amount}
              onChange={(e) =>
                onChange({
                  amount: e.target.value,
                  isAmountConfirmed: e.target.value !== '' && parseInt(e.target.value, 10) > 0,
                })
              }
              min="1"
              placeholder="金額を入力"
              className={`
                w-full px-3 py-2 rounded-lg border text-sm text-slate-800
                bg-slate-50 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white
                transition-all
                ${hasAmountError ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}
                ${!item.isAmountConfirmed && item.amount === '' ? 'border-amber-300 bg-amber-50' : ''}
              `}
            />
            {hasAmountError && (
              <p className="text-[10px] text-rose-500 mt-1">1円以上で入力してください</p>
            )}
            {!item.isAmountConfirmed && item.amount === '' && (
              <p className="text-[10px] text-amber-600 mt-1">⚠ 金額を入力してください</p>
            )}
          </div>
          <span className="text-sm text-slate-500 flex-shrink-0">円</span>
        </div>

        {/* ── 請求サイクル ── */}
        <div className="mt-2.5 grid grid-cols-4 gap-1">
          {BILLING_CYCLES.map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => onChange({ billingCycle: cycle })}
              className={`
                py-1.5 rounded-lg text-[11px] font-medium border transition-colors
                ${item.billingCycle === cycle
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                }
              `}
            >
              {getBillingCycleLabel(cycle)}
            </button>
          ))}
        </div>

        {/* ── 展開/折りたたみボタン ── */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2.5 w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={13} strokeWidth={2} />
              詳細を閉じる
            </>
          ) : (
            <>
              <ChevronDown size={13} strokeWidth={2} />
              初回請求日・メモを編集する
            </>
          )}
        </button>
      </div>

      {/* ── 展開エリア（初回請求日・メモ） ── */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-3 bg-slate-50">

          {/* 初回請求日 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              初回請求日 <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={item.billingStartDate}
              onChange={(e) => onChange({ billingStartDate: e.target.value })}
              className="
                w-full px-3 py-2 rounded-lg border border-slate-200
                text-sm text-slate-800 bg-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                transition-all
              "
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              メモ <span className="text-slate-400 font-normal">（任意）</span>
            </label>
            <textarea
              value={item.service.cancellationNotes ?? ''}
              onChange={(e) =>
                onChange({
                  service: { ...item.service, cancellationNotes: e.target.value },
                })
              }
              placeholder="プラン名・解約のポイントなど..."
              rows={2}
              className="
                w-full px-3 py-2 rounded-lg border border-slate-200
                text-sm text-slate-800 bg-white resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                placeholder:text-slate-400 transition-all
              "
            />
          </div>
        </div>
      )}
    </div>
  );
}
