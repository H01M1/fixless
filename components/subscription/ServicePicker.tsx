'use client';

/**
 * components/subscription/ServicePicker.tsx
 * ===========================================
 * 日本サービスDBからサブスクを選んで追加するコンポーネント。
 *
 * v2.1 変更点:
 * - selectedServiceForPlan state を追加
 * - サービス選択時のロジックを3パターンに分岐
 *   ① plans が2件以上 → PlanPicker を表示
 *   ② plans が1件のみ → そのプランをマージしてモーダルへ
 *   ③ plans がない   → 従来どおりモーダルへ（変更なし）
 * - PlanPicker でプランが選ばれたら name と金額をマージして
 *   ServiceConfirmModal にそのまま渡す（モーダル側の変更なし）
 * - 既存の検索・カテゴリ絞り込み・確認モーダルは変更なし
 */

import { useState, useMemo } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import {
  getPopulatedCategories,
  getCategoryLabel,
  getCategoryEmoji,
  getServicesByCategory,
  getAllServices,
  searchServices,
  getServiceCountByCategory,
} from '@/lib/serviceDb';
import { formatCurrency } from '@/lib/billing';
import { ServiceConfirmModal } from '@/components/subscription/ServiceConfirmModal';
import { PlanPicker } from '@/components/subscription/PlanPicker';
import type { Category, ServiceTemplate, ServicePlan, SubscriptionInput } from '@/types';
import { CATEGORY_EMOJIS } from '@/types';

// ================================================================
// Props
// ================================================================

interface ServicePickerProps {
  onAdd: (input: SubscriptionInput) => Promise<boolean>;
}

// ================================================================
// ServicePicker
// ================================================================

export function ServicePicker({ onAdd }: ServicePickerProps) {
  // ── 既存の state ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  /** 確認モーダルを開くサービス（プラン情報をマージ済みの ServiceTemplate） */
  const [selectedService, setSelectedService]   = useState<ServiceTemplate | null>(null);

  // ── v2.1 追加 state ──────────────────────────────────────────
  /**
   * PlanPicker を表示するサービス。
   * サービスをタップして plans が2件以上あるときにセットされる。
   * PlanPicker で戻るを押すと null に戻る。
   */
  const [selectedServiceForPlan, setSelectedServiceForPlan] =
    useState<ServiceTemplate | null>(null);

  // ── サービス一覧のフィルタリング（既存のまま）──────────────

  const displayedServices = useMemo(() => {
    if (searchQuery.trim()) return searchServices(searchQuery);
    if (selectedCategory)   return getServicesByCategory(selectedCategory);
    return getAllServices();
  }, [searchQuery, selectedCategory]);

  const categories    = getPopulatedCategories();
  const serviceCounts = getServiceCountByCategory();

  // ── ハンドラ ──────────────────────────────────────────────────

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value) setSelectedCategory(null);
  };

  const handleClearSearch = () => setSearchQuery('');

  const handleCategorySelect = (cat: Category | null) => {
    setSelectedCategory(cat);
    setSearchQuery('');
  };

  /**
   * サービスがタップされたときの処理。
   * plans の件数によって3パターンに分岐する。
   */
  const handleServiceSelect = (service: ServiceTemplate) => {
    const plans = service.plans ?? [];

    if (plans.length >= 2) {
      // ① 2件以上のプランがある → PlanPicker を表示
      setSelectedServiceForPlan(service);
    } else if (plans.length === 1) {
      // ② プランが1件のみ → そのプランをマージしてモーダルへ
      const merged = mergePlanIntoService(service, plans[0]);
      setSelectedService(merged);
    } else {
      // ③ プランなし → 従来どおりモーダルへ
      setSelectedService(service);
    }
  };

  /**
   * PlanPicker でプランが選ばれたときの処理。
   * プラン情報をサービスにマージして ServiceConfirmModal に渡す。
   * ServiceConfirmModal 自体は変更なし。
   */
  const handlePlanSelect = (service: ServiceTemplate, plan: ServicePlan) => {
    const merged = mergePlanIntoService(service, plan);
    setSelectedService(merged);
    setSelectedServiceForPlan(null); // PlanPicker を閉じる
  };

  /** PlanPicker の戻るボタンが押されたとき */
  const handlePlanBack = () => {
    setSelectedServiceForPlan(null);
  };

  /** モーダルを閉じる */
  const handleModalClose = () => {
    setSelectedService(null);
  };

  /** モーダルから登録ボタンが押されたとき */
  const handleModalAdd = async (input: SubscriptionInput): Promise<boolean> => {
    const success = await onAdd(input);
    if (success) setSelectedService(null);
    return success;
  };

  // ================================================================
  // PlanPicker が表示中の場合
  // ================================================================

  if (selectedServiceForPlan) {
    return (
      <>
        <PlanPicker
          service={selectedServiceForPlan}
          onSelectPlan={handlePlanSelect}
          onBack={handlePlanBack}
        />
        {/* モーダルは PlanPicker の上に重なる */}
        {selectedService && (
          <ServiceConfirmModal
            service={selectedService}
            onClose={handleModalClose}
            onAdd={handleModalAdd}
          />
        )}
      </>
    );
  }

  // ================================================================
  // 通常のサービス一覧表示
  // ================================================================

  return (
    <>
      {/* ── 検索バー ── */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-100">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <input
            type="search"
            inputMode="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Netflix・Spotify・ジムなど..."
            className="
              w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200
              text-sm text-slate-800 placeholder:text-slate-400
              bg-slate-50 focus:bg-white focus:outline-none focus:ring-2
              focus:ring-indigo-500 focus:border-transparent
              transition-all
            "
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="検索をクリア"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── カテゴリチップ（検索中は非表示） ── */}
      {!searchQuery && (
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-slate-100"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            onClick={() => handleCategorySelect(null)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
              whitespace-nowrap transition-colors border
              ${selectedCategory === null
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }
            `}
          >
            すべて（{getAllServices().length}）
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count    = serviceCounts.get(cat) ?? 0;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`
                  flex-shrink-0 flex items-center gap-1 px-3 py-1.5
                  rounded-full text-xs font-medium whitespace-nowrap
                  transition-colors border
                  ${isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }
                `}
              >
                <span>{getCategoryEmoji(cat)}</span>
                {getCategoryLabel(cat)}
                <span className={`ml-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── サービス一覧 ── */}
      <div className="divide-y divide-slate-100 bg-white mt-2 mx-4 rounded-xl overflow-hidden shadow-sm border border-slate-100">
        {displayedServices.length === 0 && (
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <p className="text-slate-400 text-sm">
              「{searchQuery}」に一致するサービスが見つかりません
            </p>
            <p className="text-slate-400 text-xs mt-1">
              「手動で入力」タブから登録できます
            </p>
          </div>
        )}

        {displayedServices.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            onSelect={handleServiceSelect}
          />
        ))}
      </div>

      {/* ── サービス件数テキスト ── */}
      {displayedServices.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-3">
          {searchQuery
            ? `「${searchQuery}」の検索結果 ${displayedServices.length}件`
            : selectedCategory
            ? `${getCategoryLabel(selectedCategory)} ${displayedServices.length}件`
            : `全 ${displayedServices.length}件`
          }
        </p>
      )}

      {/* ── 確認モーダル ── */}
      {selectedService && (
        <ServiceConfirmModal
          service={selectedService}
          onClose={handleModalClose}
          onAdd={handleModalAdd}
        />
      )}
    </>
  );
}

// ================================================================
// プラン情報をサービスにマージするユーティリティ
// ================================================================

/**
 * サービスとプランをマージして、ServiceConfirmModal に渡せる
 * ServiceTemplate を生成する。
 *
 * - name:                 "Netflix スタンダード"（サービス名 + プラン名）
 * - defaultAmountMonthly: プランの月額
 * - defaultBillingCycle:  プランの請求サイクル
 * - その他のフィールド:   親サービスから引き継ぐ（iconUrl・cancellationUrl など）
 *
 * ServiceConfirmModal は受け取った service.name と
 * service.defaultAmountMonthly を初期値に使うだけなので、
 * モーダル側の変更は不要。
 */
function mergePlanIntoService(
  service: ServiceTemplate,
  plan: ServicePlan,
): ServiceTemplate {
  return {
    ...service,
    // サービス名 + プラン名を結合
    // 例: "Netflix" + "スタンダード" → "Netflix スタンダード"
    name: `${service.name} ${plan.planName}`,
    defaultAmountMonthly: plan.defaultAmountMonthly,
    defaultBillingCycle:  plan.defaultBillingCycle,
  };
}

// ================================================================
// ServiceItem（サービスリスト1行分）
// ================================================================

interface ServiceItemProps {
  service: ServiceTemplate;
  onSelect: (service: ServiceTemplate) => void;
}

function ServiceItem({ service, onSelect }: ServiceItemProps) {
  const [iconError, setIconError] = useState(false);

  // プランがある場合は金額の代わりに「〇プラン」と表示する
  const hasPlans   = (service.plans?.length ?? 0) >= 2;
  const planCount  = service.plans?.length ?? 0;

  return (
    <button
      onClick={() => onSelect(service)}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-indigo-50 active:bg-indigo-50 transition-colors text-left"
    >
      {/* アイコン */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
        {service.iconUrl && !iconError ? (
          <img
            src={service.iconUrl}
            alt={service.name}
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
            onError={() => setIconError(true)}
          />
        ) : (
          <span className="text-xl" aria-hidden="true">
            {CATEGORY_EMOJIS[service.category]}
          </span>
        )}
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {service.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {getCategoryLabel(service.category)}
        </p>
      </div>

      {/* 金額 or プラン数 + 矢印 */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {hasPlans ? (
          /* プランありのサービスは「〇プラン」と表示 */
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            {planCount}プラン
          </span>
        ) : service.defaultAmountMonthly ? (
          /* プランなしのサービスは月額を表示 */
          <span className="text-sm font-medium text-slate-600">
            {formatCurrency(service.defaultAmountMonthly)}
            <span className="text-xs text-slate-400 font-normal">/月</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">金額は後で設定</span>
        )}
        <ChevronRight size={16} className="text-slate-300" strokeWidth={2} />
      </div>
    </button>
  );
}
