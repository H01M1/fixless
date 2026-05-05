'use client';

/**
 * components/savings/AlternativeCard.tsx
 * ========================================
 * 代替サブスク提案カード。
 *
 * 表示内容:
 * - 継続する理由（strengths）
 * - 見直しポイント（weaknesses）
 * - 代替候補サービス（alternativeIds から生成）
 * - ダウングレード候補（downgradeOptions）
 * - バンドル重複の注意（bundleWarnings）
 * - 注意書き（料金・配信内容は変更される可能性がある旨）
 *
 * 文言方針:
 * - 「解約すべき」「不要」「無駄」とは言わない
 * - すべて「比較候補」「可能性」として表示する
 * - ユーザーの判断を尊重する
 */

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/billing';
import type { AlternativeSuggestion, AlternativeOption, DowngradeOption } from '@/types';

// ================================================================
// Props
// ================================================================

interface AlternativeCardProps {
  suggestion: AlternativeSuggestion;
}

// ================================================================
// AlternativeCard
// ================================================================

export function AlternativeCard({ suggestion }: AlternativeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    subscription,
    reasonsToKeep,
    reasonsToReconsider,
    alternatives,
    downgradeOptions,
    bundleWarnings,
  } = suggestion;

  // 表示するコンテンツが何もなければ描画しない
  const hasContent =
    reasonsToKeep.length > 0 ||
    reasonsToReconsider.length > 0 ||
    alternatives.length > 0 ||
    downgradeOptions.length > 0 ||
    bundleWarnings.length > 0;

  if (!hasContent) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── ヘッダー ── */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-slate-50 active:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <RefreshCw size={14} className="text-indigo-600" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {subscription.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {formatCurrency(subscription.amountMonthly)}/月 ・ 見直し候補
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2 text-slate-400">
          {isExpanded
            ? <ChevronUp size={16} strokeWidth={2} />
            : <ChevronDown size={16} strokeWidth={2} />
          }
        </div>
      </button>

      {/* ── 展開コンテンツ ── */}
      {isExpanded && (
        <div className="px-4 pb-5 space-y-4 border-t border-slate-100">

          {/* 継続する理由 */}
          {reasonsToKeep.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                <p className="text-xs font-bold text-slate-700">継続する理由</p>
              </div>
              <ul className="space-y-1.5 pl-5">
                {reasonsToKeep.map((reason, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed list-disc">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 見直しポイント */}
          {reasonsToReconsider.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={13} className="text-amber-500 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs font-bold text-slate-700">見直すと節約できるかも</p>
              </div>
              <ul className="space-y-1.5 pl-5">
                {reasonsToReconsider.map((reason, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed list-disc">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 代替候補 */}
          {alternatives.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">
                💡 比較候補
              </p>
              <div className="space-y-2">
                {alternatives.map((alt) => (
                  <AlternativeItem
                    key={alt.service.id}
                    option={alt}
                    currentMonthly={subscription.amountMonthly}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ダウングレード候補 */}
          {downgradeOptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownCircle size={13} className="text-indigo-500 flex-shrink-0" strokeWidth={2} />
                <p className="text-xs font-bold text-slate-700">プランの見直し候補</p>
              </div>
              <div className="space-y-2">
                {downgradeOptions.map((opt) => (
                  <DowngradeItem key={opt.service.id} option={opt} />
                ))}
              </div>
            </div>
          )}

          {/* バンドル重複の注意 */}
          {bundleWarnings.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-xs font-bold text-amber-800 mb-1">バンドル特典を確認</p>
                  {bundleWarnings.map((warning, i) => (
                    <p key={i} className="text-xs text-amber-700 leading-relaxed">
                      {warning}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 注意書き */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              ⚠ 料金・配信内容・プラン内容は変更される場合があります。最終確認は必ず公式サイトで行ってください。このアプリはあくまで比較の参考情報を提供するものです。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// AlternativeItem — 代替候補1件
// ================================================================

interface AlternativeItemProps {
  option: AlternativeOption;
  currentMonthly: number;
}

function AlternativeItem({ option, currentMonthly }: AlternativeItemProps) {
  const { service, estimatedMonthlySaving } = option;
  const [iconError, setIconError] = useState(false);

  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-3 py-3">

      {/* アイコン */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
        {service.iconUrl && !iconError ? (
          <img
            src={service.iconUrl}
            alt={service.name}
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            onError={() => setIconError(true)}
          />
        ) : (
          <span className="text-base">📦</span>
        )}
      </div>

      {/* サービス情報 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">{service.name}</p>
        {service.defaultAmountMonthly != null && (
          <p className="text-[10px] text-slate-500 mt-0.5">
            {formatCurrency(service.defaultAmountMonthly)}/月（目安）
          </p>
        )}
      </div>

      {/* 節約額 */}
      <div className="flex-shrink-0 text-right">
        {estimatedMonthlySaving > 0 ? (
          <>
            <p className="text-xs font-bold text-emerald-600">
              最大{formatCurrency(estimatedMonthlySaving)}
            </p>
            <p className="text-[10px] text-slate-400">節約の可能性</p>
          </>
        ) : (
          <p className="text-[10px] text-slate-400 leading-relaxed">
            料金は<br />公式で確認を
          </p>
        )}
      </div>
    </div>
  );
}

// ================================================================
// DowngradeItem — ダウングレード候補1件
// ================================================================

interface DowngradeItemProps {
  option: DowngradeOption;
}

function DowngradeItem({ option }: DowngradeItemProps) {
  const { service, planName, estimatedMonthlySaving } = option;
  const [iconError, setIconError] = useState(false);

  return (
    <div className="flex items-center gap-3 bg-indigo-50 rounded-xl border border-indigo-100 px-3 py-3">

      {/* アイコン */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-indigo-100 flex items-center justify-center overflow-hidden">
        {service.iconUrl && !iconError ? (
          <img
            src={service.iconUrl}
            alt={service.name}
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            onError={() => setIconError(true)}
          />
        ) : (
          <span className="text-base">📦</span>
        )}
      </div>

      {/* プラン情報 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">{planName}</p>
        {service.defaultAmountMonthly != null && (
          <p className="text-[10px] text-slate-500 mt-0.5">
            {formatCurrency(service.defaultAmountMonthly)}/月（目安）
          </p>
        )}
      </div>

      {/* 節約額 */}
      <div className="flex-shrink-0 text-right">
        {estimatedMonthlySaving > 0 ? (
          <>
            <p className="text-xs font-bold text-indigo-600">
              最大{formatCurrency(estimatedMonthlySaving)}
            </p>
            <p className="text-[10px] text-slate-400">節約の可能性</p>
          </>
        ) : (
          <p className="text-[10px] text-slate-400">公式で確認を</p>
        )}
      </div>
    </div>
  );
}
