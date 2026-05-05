'use client';

/**
 * components/subscription/ScreenshotImport.tsx
 * ==============================================
 * スクショから一括追加機能（OCR対応版）。
 *
 * v2.2 変更点:
 * - imageDataUrl state を親で管理するように変更
 * - OCR ボタン・進捗バー・検出結果サマリーを追加
 * - extractTextLines + matchServicesFromText で自動選択
 * - OCR 失敗時は既存の手動選択に切り替えられる
 * - OCRマッチしたカードに ✨ バッジを表示
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, CheckCircle2,
  Sparkles, AlertCircle, Loader2,
} from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import {
  getAppStoreLikelyServices,
  searchAppStoreLikelyServices,
} from '@/lib/serviceDb';
import { getTodayStr, formatCurrency } from '@/lib/billing';
import { extractTextLines, getOcrStatusLabel } from '@/lib/ocr';
import { matchServicesFromText } from '@/lib/serviceMatching';
import type { MatchResult } from '@/lib/serviceMatching';
import { ScreenshotPreview } from '@/components/subscription/ScreenshotPreview';
import { BulkAddList } from '@/components/subscription/BulkAddList';
import { PlanPicker } from '@/components/subscription/PlanPicker';
import { CATEGORY_EMOJIS } from '@/types';
import type { PendingSubscription, ServiceTemplate, ServicePlan } from '@/types';

// ================================================================
// OCR の状態
// ================================================================

type OcrState = 'idle' | 'running' | 'done' | 'error';

// ================================================================
// pendingItem を生成するヘルパー（useCallback 不要）
// ================================================================

function createPendingItem(
  service: ServiceTemplate,
  plan?: ServicePlan,
): PendingSubscription {
  const p           = plan ?? service.plans?.[0];
  const serviceName = p ? `${service.name} ${p.planName}` : service.name;
  const amount      = p
    ? String(p.defaultAmountMonthly)
    : String(service.defaultAmountMonthly ?? '');
  const billingCycle = p ? p.defaultBillingCycle : service.defaultBillingCycle;

  return {
    tempId:            crypto.randomUUID(),
    service:           { ...service, name: serviceName },
    selectedPlan:      p,
    amount,
    billingCycle,
    billingStartDate:  getTodayStr(),
    isAmountConfirmed: !!amount && parseInt(amount, 10) > 0,
  };
}

// ================================================================
// ScreenshotImport
// ================================================================

export function ScreenshotImport() {
  const router = useRouter();
  const { addSubscription } = useSubscriptions();

  // ── 候補選択・追加予定 ────────────────────────────────────────
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [pendingItems, setPendingItems]               = useState<PendingSubscription[]>([]);
  const [searchQuery, setSearchQuery]                 = useState('');
  const [isAdding, setIsAdding]                       = useState(false);
  const [serviceForPlanSelect, setServiceForPlanSelect] =
    useState<ServiceTemplate | null>(null);

  // ── 画像 ────────────────────────────────────────────────────
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // ── OCR ────────────────────────────────────────────────────
  const [ocrState, setOcrState]     = useState<OcrState>('idle');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrMessage, setOcrMessage]   = useState('');
  const [ocrMatches, setOcrMatches]   = useState<MatchResult[]>([]);

  // ── 候補リスト ───────────────────────────────────────────────

  const candidates = useMemo(() => {
    if (searchQuery.trim()) return searchAppStoreLikelyServices(searchQuery);
    return getAppStoreLikelyServices();
  }, [searchQuery]);

  // ── 画像ハンドラ ─────────────────────────────────────────────

  const handleImageLoad = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    // 画像が変わったら OCR 状態をリセット
    setOcrState('idle');
    setOcrProgress(0);
    setOcrMatches([]);
  };

  const handleImageRemove = () => {
    setImageDataUrl(null);
    setOcrState('idle');
    setOcrProgress(0);
    setOcrMatches([]);
  };

  // ── OCR ハンドラ ─────────────────────────────────────────────

  const handleOcr = async () => {
    if (!imageDataUrl) return;

    setOcrState('running');
    setOcrProgress(0);
    setOcrMessage('');

    try {
      const lines = await extractTextLines(imageDataUrl, (pct, status) => {
        setOcrProgress(pct);
        setOcrMessage(getOcrStatusLabel(status));
      });

      const matches = matchServicesFromText(lines);
      setOcrMatches(matches);
      setOcrState('done');

      // マッチしたサービスを自動選択（すでに選択済みのものはスキップ）
      if (matches.length > 0) {
        setPendingItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.service.id));
          const newItems = matches
            .filter((m) => !existingIds.has(m.service.id))
            .map((m) => createPendingItem(m.service));
          return [...prev, ...newItems];
        });
        setSelectedServiceIds((prev) => {
          const next = new Set(prev);
          matches.forEach((m) => next.add(m.service.id));
          return next;
        });
      }
    } catch (err) {
      console.error('[OCR] error:', err);
      setOcrState('error');
    }
  };

  // ── 候補タップ ───────────────────────────────────────────────

  const handleCandidateTap = (service: ServiceTemplate) => {
    if (selectedServiceIds.has(service.id)) {
      // 選択解除
      setSelectedServiceIds((prev) => {
        const next = new Set(prev);
        next.delete(service.id);
        return next;
      });
      setPendingItems((prev) =>
        prev.filter((item) => item.service.id !== service.id),
      );
      return;
    }

    // プランが2件以上 → PlanPicker を表示
    if ((service.plans?.length ?? 0) >= 2) {
      setServiceForPlanSelect(service);
      return;
    }

    // プランなし or 1件 → 直接追加
    const item = createPendingItem(service);
    setSelectedServiceIds((prev) => new Set([...prev, service.id]));
    setPendingItems((prev) => [...prev, item]);
  };

  const handlePlanSelect = (service: ServiceTemplate, plan: ServicePlan) => {
    const item = createPendingItem(service, plan);
    setSelectedServiceIds((prev) => new Set([...prev, service.id]));
    setPendingItems((prev) => [...prev, item]);
    setServiceForPlanSelect(null);
  };

  // ── まとめて追加 ─────────────────────────────────────────────

  const handleBulkAdd = async () => {
    setIsAdding(true);
    try {
      for (const item of pendingItems) {
        const amount = parseInt(item.amount, 10);
        if (!amount || amount < 1) continue;
        await addSubscription({
          serviceId:        item.service.id,
          name:             item.service.name,
          category:         item.service.category,
          iconUrl:          item.service.iconUrl,
          amount,
          billingCycle:     item.billingCycle,
          billingStartDate: item.billingStartDate,
          isFreeTrial:      false,
        });
      }
      setPendingItems([]);
      setSelectedServiceIds(new Set());
      router.push('/');
    } finally {
      setIsAdding(false);
    }
  };

  // ================================================================
  // レンダリング
  // ================================================================

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">

      {/* ── 手順ガイド ── */}
      <StepGuide hasImage={!!imageDataUrl} />

      {/* ── スクショプレビュー + OCR ── */}
      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">
          STEP 3: スクショをアップロード
        </p>

        <ScreenshotPreview
          onImageLoad={handleImageLoad}
          onImageRemove={handleImageRemove}
        />

        {/* OCR ボタン（画像あり・idle 時） */}
        {imageDataUrl && ocrState === 'idle' && (
          <button
            type="button"
            onClick={handleOcr}
            className="
              mt-3 w-full flex items-center justify-center gap-2
              py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold
              active:bg-indigo-700 transition-colors shadow-sm
            "
          >
            <Sparkles size={16} strokeWidth={2} />
            OCRで自動検出する
          </button>
        )}

        {/* 再検出ボタン（done 時） */}
        {imageDataUrl && ocrState === 'done' && (
          <button
            type="button"
            onClick={handleOcr}
            className="
              mt-3 w-full flex items-center justify-center gap-2
              py-2.5 rounded-xl border border-indigo-300
              text-indigo-600 text-xs font-medium
              active:bg-indigo-50 transition-colors
            "
          >
            <Sparkles size={13} strokeWidth={2} />
            もう一度検出する
          </button>
        )}

        {/* 進捗バー（running 時） */}
        {ocrState === 'running' && (
          <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 size={14} className="text-indigo-600 animate-spin" strokeWidth={2} />
              <p className="text-xs font-medium text-slate-600">
                {ocrMessage || 'テキストを読み取り中...'}
              </p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, ocrProgress)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">
              {ocrProgress}%
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              ※ 初回は言語データの読み込みに時間がかかります（約10MB）
            </p>
          </div>
        )}

        {/* 検出結果サマリー（done 時） */}
        {ocrState === 'done' && (
          <OcrResultSummary matches={ocrMatches} />
        )}

        {/* OCR エラー */}
        {ocrState === 'error' && (
          <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertCircle size={14} className="text-rose-500 flex-shrink-0" strokeWidth={2} />
            <p className="text-xs text-rose-700">
              読み取りに失敗しました。下の候補から手動で選んでください。
            </p>
          </div>
        )}
      </div>

      {/* ── 候補グリッド ── */}
      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">
          STEP 4: スクショを見ながらサービスを選ぶ
        </p>

        {/* 検索バー */}
        <div className="relative mb-3">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="サービス名で絞り込む..."
            className="
              w-full pl-8 pr-8 py-2.5 rounded-xl border border-slate-200
              text-sm text-slate-800 placeholder:text-slate-400
              bg-slate-50 focus:bg-white focus:outline-none
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              transition-all
            "
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* グリッド */}
        <div className="grid grid-cols-3 gap-2">
          {candidates.map((service) => (
            <CandidateCard
              key={service.id}
              service={service}
              isSelected={selectedServiceIds.has(service.id)}
              isOcrMatch={ocrMatches.some((m) => m.service.id === service.id)}
              onTap={() => handleCandidateTap(service)}
            />
          ))}
          {candidates.length === 0 && (
            <div className="col-span-3 text-center py-6 text-sm text-slate-400">
              「{searchQuery}」に一致するサービスが見つかりません
            </div>
          )}
        </div>

        {/* 注意書き */}
        <div className="mt-3 space-y-1">
          <p className="text-[10px] text-slate-400">
            ※ Apple IDのサブスクリプション一覧は自動取得しません
          </p>
          <p className="text-[10px] text-slate-400">
            ※ アップロードした画像はサーバーに送信されません
          </p>
          <p className="text-[10px] text-slate-400">
            ※ 料金・解約方法は変更される場合があります。最終確認は公式サイトで
          </p>
        </div>
      </div>

      {/* ── 追加予定リスト ── */}
      {pendingItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">
            STEP 5: 金額・請求日を確認してまとめて追加
          </p>
          <BulkAddList
            items={pendingItems}
            onChange={setPendingItems}
            onBulkAdd={handleBulkAdd}
            isAdding={isAdding}
          />
        </div>
      )}

      {/* ── PlanPicker モーダル ── */}
      {serviceForPlanSelect && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setServiceForPlanSelect(null)}
          />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl pb-8 overflow-hidden">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            <PlanPicker
              service={serviceForPlanSelect}
              onSelectPlan={handlePlanSelect}
              onBack={() => setServiceForPlanSelect(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// StepGuide
// ================================================================

function StepGuide({ hasImage }: { hasImage: boolean }) {
  const steps = [
    { num: 1, text: 'iPhoneで「設定」アプリを開く' },
    { num: 2, text: 'Apple ID → サブスクリプション を開く' },
    { num: 3, text: 'サブスクリプション一覧のスクショを撮る' },
    { num: 4, text: 'そのスクショをここにアップロードする' },
    {
      num: 5,
      text: '「OCRで自動検出する」を押す（任意）\nまたはスクショを見ながら手動で選ぶ',
    },
  ];

  return (
    <div className="bg-indigo-50 rounded-xl border border-indigo-100 px-4 py-4">
      <p className="text-xs font-bold text-indigo-700 mb-3">
        📱 iPhoneのサブスクをまとめて追加する方法
      </p>
      <div className="space-y-2">
        {steps.map(({ num, text }) => {
          const isDone =
            (num <= 4 && hasImage) || (num <= 3 && !hasImage);
          return (
            <div key={num} className="flex items-start gap-2.5">
              <div
                className={`
                  flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
                  ${isDone ? 'bg-indigo-500' : 'bg-indigo-200'}
                `}
              >
                <span className="text-[10px] font-bold text-white">{num}</span>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed whitespace-pre-line">
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// OcrResultSummary
// ================================================================

function OcrResultSummary({ matches }: { matches: MatchResult[] }) {
  if (matches.length === 0) {
    return (
      <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
        <AlertCircle
          size={14}
          className="text-amber-500 flex-shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <div>
          <p className="text-xs font-semibold text-amber-800">
            サービスを検出できませんでした
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            下の候補から手動で選んでください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={14} className="text-emerald-600" strokeWidth={2.5} />
        <p className="text-xs font-bold text-emerald-800">
          {matches.length}件のサービスを検出しました
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {matches.map((m) => (
          <span
            key={m.service.id}
            className="
              text-[10px] bg-emerald-100 text-emerald-700
              px-2 py-0.5 rounded-full font-medium
            "
          >
            {m.service.name}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-emerald-600 mt-2">
        追加・削除して調整できます
      </p>
    </div>
  );
}

// ================================================================
// CandidateCard
// ================================================================

interface CandidateCardProps {
  service: ServiceTemplate;
  isSelected: boolean;
  isOcrMatch: boolean;
  onTap: () => void;
}

function CandidateCard({ service, isSelected, isOcrMatch, onTap }: CandidateCardProps) {
  const [iconError, setIconError] = useState(false);

  return (
    <button
      type="button"
      onClick={onTap}
      className={`
        relative flex flex-col items-center gap-1.5
        px-2 py-3 rounded-xl border-2 transition-colors
        ${isSelected
          ? 'bg-indigo-600 border-indigo-600'
          : isOcrMatch
          ? 'bg-emerald-50 border-emerald-400'
          : 'bg-white border-slate-200 hover:border-indigo-300 active:border-indigo-300'
        }
      `}
    >
      {/* 選択済みチェック */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
        </div>
      )}

      {/* OCR マッチバッジ（未選択時のみ） */}
      {isOcrMatch && !isSelected && (
        <div className="absolute top-1.5 right-1.5">
          <Sparkles size={12} className="text-emerald-500" strokeWidth={2} />
        </div>
      )}

      {/* アイコン */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center overflow-hidden
        ${isSelected ? 'bg-indigo-500' : 'bg-slate-100'}
      `}>
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

      {/* サービス名 */}
      <p className={`
        text-[10px] font-semibold text-center leading-tight line-clamp-2
        ${isSelected ? 'text-white' : 'text-slate-700'}
      `}>
        {service.name}
      </p>

      {/* プランバッジ or 月額 */}
      {(service.plans?.length ?? 0) >= 2 ? (
        <span className={`
          text-[9px] px-1.5 py-0.5 rounded-full font-medium
          ${isSelected ? 'bg-indigo-500 text-indigo-100' : 'bg-indigo-50 text-indigo-600'}
        `}>
          {service.plans!.length}プラン
        </span>
      ) : service.defaultAmountMonthly ? (
        <span className={`text-[9px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
          {formatCurrency(service.defaultAmountMonthly)}/月
        </span>
      ) : null}
    </button>
  );
}
