'use client';

/**
 * components/cancel/CancelGuideCard.tsx
 * =======================================
 * 解約ガイドページのヘッダーカード。
 *
 * 表示内容:
 * - サービスアイコン（エラー時は絵文字にフォールバック）
 * - サービス名（大きく表示）
 * - カテゴリ・月額目安
 * - 解約難易度バッジ
 * - 「公式の解約ページを開く」ボタン（外部リンク）
 *   ↳ URL なしの場合はフォールバックテキスト
 *
 * 外部リンクの安全対応:
 * - target="_blank" には必ず rel="noopener noreferrer" を付ける
 * - フィッシングリスク対策として「公式サイトへのリンクです」を明示する
 *
 * UIトーン:
 * - 「今すぐ解約」ではなく「公式ページで確認する」というスタンス
 * - 解約難易度が 'hard' の場合は事前に注意を促す
 */

import { useState } from 'react';
import { ExternalLink, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getCategoryEmoji, getCategoryLabel, getCancellationDifficultyInfo } from '@/lib/serviceDb';
import { formatCurrency } from '@/lib/billing';
import { CATEGORY_EMOJIS } from '@/types';
import type { ServiceTemplate } from '@/types';

interface CancelGuideCardProps {
  service: ServiceTemplate;
}

export function CancelGuideCard({ service }: CancelGuideCardProps) {
  const [iconError, setIconError] = useState(false);

  const difficultyInfo = service.cancellationDifficulty
    ? getCancellationDifficultyInfo(service.cancellationDifficulty)
    : null;

  const hasUrl = !!service.cancellationUrl;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── サービス情報ヘッダー ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-4">

          {/* アイコン */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm border border-slate-200">
            {service.iconUrl && !iconError ? (
              <img
                src={service.iconUrl}
                alt={service.name}
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                onError={() => setIconError(true)}
              />
            ) : (
              <span className="text-3xl" aria-hidden="true">
                {service.category ? CATEGORY_EMOJIS[service.category] : '📦'}
              </span>
            )}
          </div>

          {/* テキスト情報 */}
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-lg font-black text-slate-800 leading-tight">
              {service.name}
            </h2>

            {/* カテゴリ + 月額 */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {service.category && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <span aria-hidden="true">{getCategoryEmoji(service.category)}</span>
                  {getCategoryLabel(service.category)}
                </span>
              )}
              {service.defaultAmountMonthly && (
                <>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="text-xs text-slate-500 font-medium">
                    目安 {formatCurrency(service.defaultAmountMonthly)}/月
                  </span>
                </>
              )}
            </div>

            {/* 解約難易度バッジ */}
            {difficultyInfo && (
              <span
                className={`
                  inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full
                  ${difficultyInfo.colorClass}
                `}
              >
                {difficultyInfo.label}
              </span>
            )}
          </div>
        </div>

        {/* hard のとき注意メッセージ */}
        {service.cancellationDifficulty === 'hard' && (
          <div className="mt-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle
              size={16}
              className="text-rose-500 flex-shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <p className="text-xs text-rose-700 leading-relaxed">
              このサービスは解約の手続きがやや複雑です。
              違約金や手続きの条件を、事前に公式サイトで必ずご確認ください。
            </p>
          </div>
        )}
      </div>

      {/* ── 解約ページへのリンクボタン ── */}
      <div className="px-5 pb-5">
        {hasUrl ? (
          <>
            <a
              href={service.cancellationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center justify-center gap-2.5 w-full
                py-4 rounded-xl
                bg-indigo-600 text-white
                text-sm font-bold shadow-md
                hover:bg-indigo-700 active:bg-indigo-700
                transition-colors
              "
            >
              <ExternalLink size={17} strokeWidth={2.5} />
              公式の解約ページを開く
            </a>
            {/* 安全であることを示す注記 */}
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              <ShieldCheck size={12} className="text-slate-400" strokeWidth={2} />
              <p className="text-[10px] text-slate-400">
                各サービス公式サイトへのリンクです。新しいタブで開きます。
              </p>
            </div>
          </>
        ) : (
          /* URLが登録されていない場合のフォールバック */
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <Info
              size={16}
              className="text-slate-400 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div>
              <p className="text-xs font-semibold text-slate-600">
                解約URLはまだ登録されていません
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                公式サイトやアプリ内の「アカウント設定」「プラン管理」からご確認ください
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
