'use client';

/**
 * components/subscription/PlanPicker.tsx
 * ========================================
 * 複数プランを持つサービスのプラン選択UI。
 *
 * 使用場面:
 * ServicePicker でサービスを選んだとき、
 * そのサービスが plans[] を持つ場合にこのコンポーネントが表示される。
 *
 * UXフロー:
 * サービス一覧 → サービスをタップ（plansあり）
 *   → PlanPicker（このコンポーネント）が表示される
 *   → プランをタップ → ServiceConfirmModal が開く
 *   → 戻るボタン → サービス一覧に戻る
 *
 * ServiceConfirmModal との連携:
 * onSelectPlan(service, plan) を呼ぶと、
 * ServicePicker 側で以下のようにマージして渡す：
 *   name: `${service.name} ${plan.planName}`   例: "Netflix スタンダード"
 *   defaultAmountMonthly: plan.defaultAmountMonthly
 * ServiceConfirmModal 自体の変更は不要。
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORY_EMOJIS } from '@/types';
import { formatCurrency } from '@/lib/billing';
import { getCategoryEmoji } from '@/lib/serviceDb';
import type { ServiceTemplate, ServicePlan } from '@/types';
import { useState } from 'react';

// ================================================================
// Props
// ================================================================

interface PlanPickerProps {
  /** プラン選択対象のサービス（service.plans が存在する前提） */
  service: ServiceTemplate;
  /**
   * プランが選ばれたときのコールバック。
   * ServicePicker 側でマージ処理を行う。
   */
  onSelectPlan: (service: ServiceTemplate, plan: ServicePlan) => void;
  /** 「戻る」ボタンが押されたときのコールバック */
  onBack: () => void;
}

// ================================================================
// PlanPicker
// ================================================================

export function PlanPicker({ service, onSelectPlan, onBack }: PlanPickerProps) {
  const [iconError, setIconError] = useState(false);

  // plans がない場合のフォールバック（型安全のため）
  const plans = service.plans ?? [];

  return (
    <div className="flex flex-col min-h-0">

      {/* ── ヘッダー ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-10">

        {/* 戻るボタン */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:text-indigo-800 active:text-indigo-800 transition-colors flex-shrink-0"
          aria-label="サービス一覧に戻る"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          戻る
        </button>

        {/* サービスアイコン + 名前 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            {service.iconUrl && !iconError ? (
              <img
                src={service.iconUrl}
                alt={service.name}
                width={18}
                height={18}
                className="w-4.5 h-4.5 object-contain"
                onError={() => setIconError(true)}
              />
            ) : (
              <span className="text-sm" aria-hidden="true">
                {CATEGORY_EMOJIS[service.category]}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-slate-800 truncate">
            {service.name}
          </span>
        </div>

        {/* プラン数 */}
        <span className="text-xs text-slate-400 flex-shrink-0">
          {plans.length}プラン
        </span>
      </div>

      {/* ── プロンプトテキスト ── */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-slate-500">
          プランを選んでください
        </p>
      </div>

      {/* ── プランリスト ── */}
      <div className="px-4 pb-4 space-y-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.planId}
            plan={plan}
            onSelect={() => onSelectPlan(service, plan)}
          />
        ))}
      </div>
    </div>
  );
}

// ================================================================
// PlanCard — プラン1件分のカード
// ================================================================

interface PlanCardProps {
  plan: ServicePlan;
  onSelect: () => void;
}

function PlanCard({ plan, onSelect }: PlanCardProps) {
  return (
    <button
      onClick={onSelect}
      className="
        w-full flex items-center gap-3
        bg-white rounded-xl border border-slate-200
        px-4 py-3.5
        hover:border-indigo-300 hover:bg-indigo-50
        active:border-indigo-400 active:bg-indigo-50
        transition-colors text-left
      "
    >
      {/* プラン情報 */}
      <div className="flex-1 min-w-0">

        {/* プラン名 + 目安バッジ */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-800">
            {plan.planName}
          </span>
          {plan.isAmountEstimate && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
              目安
            </span>
          )}
        </div>

        {/* 説明文 */}
        {plan.description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {plan.description}
          </p>
        )}
      </div>

      {/* 金額 + 矢印 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-700">
            {formatCurrency(plan.defaultAmountMonthly)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {plan.defaultBillingCycle === 'monthly'   ? '/月' :
             plan.defaultBillingCycle === 'yearly'    ? '/年' :
             plan.defaultBillingCycle === 'weekly'    ? '/週' :
             plan.defaultBillingCycle === 'quarterly' ? '/3ヶ月' : '/月'}
          </p>
        </div>
        <ChevronRight size={16} className="text-slate-300" strokeWidth={2} />
      </div>
    </button>
  );
}
