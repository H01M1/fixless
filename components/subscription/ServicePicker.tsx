'use client';

/**
 * components/subscription/ServicePicker.tsx
 * ===========================================
 * 日本サービスDBからサブスクを選んで追加するコンポーネント。
 *
 * UX フロー:
 * 1. 検索バー + カテゴリチップでサービスを絞り込む
 * 2. サービスをタップ → ServiceConfirmModal が開く
 * 3. モーダルで金額・請求日等を確認・編集して「登録する」
 * 4. 登録成功 → 親コンポーネント（page.tsx）がホームに遷移する
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
import type { Category, ServiceTemplate, SubscriptionInput } from '@/types';

interface ServicePickerProps {
  /** 登録ボタンが押されたときに呼ぶ。成功: true, 失敗: false */
  onAdd: (input: SubscriptionInput) => Promise<boolean>;
}

export function ServicePicker({ onAdd }: ServicePickerProps) {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService]   = useState<ServiceTemplate | null>(null);

  // ─── サービス一覧のフィルタリング ────────────────────────

  const displayedServices = useMemo(() => {
    // 検索クエリがあれば検索結果を優先（カテゴリ選択を無視）
    if (searchQuery.trim()) {
      return searchServices(searchQuery);
    }
    // カテゴリが選ばれていればそのカテゴリのみ
    if (selectedCategory) {
      return getServicesByCategory(selectedCategory);
    }
    // デフォルト: 全サービス
    return getAllServices();
  }, [searchQuery, selectedCategory]);

  // カテゴリ一覧（サービスが存在するものだけ）
  const categories       = getPopulatedCategories();
  const serviceCounts    = getServiceCountByCategory();

  // ─── ハンドラ ────────────────────────────────────────────

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // 検索開始時はカテゴリ選択をリセット
    if (e.target.value) setSelectedCategory(null);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCategorySelect = (cat: Category | null) => {
    setSelectedCategory(cat);
    setSearchQuery(''); // カテゴリ変更時は検索クエリをクリア
  };

  const handleServiceSelect = (service: ServiceTemplate) => {
    setSelectedService(service);
  };

  const handleModalClose = () => {
    setSelectedService(null);
  };

  const handleModalAdd = async (input: SubscriptionInput): Promise<boolean> => {
    const success = await onAdd(input);
    if (success) setSelectedService(null);
    return success;
  };

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    <>
      {/* ─── 検索バー ─────────────────────────────────────── */}
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

      {/* ─── カテゴリチップ（検索中は非表示） ──────────────── */}
      {!searchQuery && (
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-slate-100"
          style={{ scrollbarWidth: 'none' }} // Firefox
        >
          {/* 「すべて」チップ */}
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

          {/* カテゴリチップ */}
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

      {/* ─── サービス一覧 ─────────────────────────────────── */}
      <div className="divide-y divide-slate-100 bg-white mt-2 mx-4 rounded-xl overflow-hidden shadow-sm border border-slate-100">

        {/* 0件のとき */}
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

        {/* サービスリスト */}
        {displayedServices.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            onSelect={handleServiceSelect}
          />
        ))}
      </div>

      {/* ─── サービス件数テキスト ────────────────────────── */}
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

      {/* ─── 確認モーダル ────────────────────────────────── */}
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
// サービスアイテム（リスト1行分）
// ================================================================

interface ServiceItemProps {
  service: ServiceTemplate;
  onSelect: (service: ServiceTemplate) => void;
}

function ServiceItem({ service, onSelect }: ServiceItemProps) {
  const [iconError, setIconError] = useState(false);

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
            {getCategoryEmoji(service.category)}
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

      {/* 金額 + 矢印 */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {service.defaultAmountMonthly ? (
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
