/**
 * components/dashboard/SamplePreview.tsx
 * ========================================
 * サブスクが 0 件のとき、ホーム画面の下部に表示する「使い方の例」セクション。
 *
 * v3 変更点:
 * - 複数ペルソナ（デザイナー / エンジニア / ライター）対応
 * - 上部にタブを追加して切り替え可能
 * - 各ペルソナで重複検出・節約候補・請求アラートが動作
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { calcDashboardSummary } from '@/lib/savings';
import { SAMPLE_PERSONAS } from '@/lib/sampleData';
import { SummaryCard } from './SummaryCard';
import { DuplicateAlerts } from './DuplicateAlerts';
import { SavingBanner } from './SavingBanner';
import { SubscriptionList } from './SubscriptionList';

export function SamplePreview() {
  // タブで選択中のペルソナID
  const [activePersonaId, setActivePersonaId] = useState<string>(SAMPLE_PERSONAS[0].id);

  // 選択中のペルソナオブジェクト
  const activePersona = useMemo(
    () => SAMPLE_PERSONAS.find((p) => p.id === activePersonaId) ?? SAMPLE_PERSONAS[0],
    [activePersonaId],
  );

  // 選択中ペルソナのサブスク一覧
  const sampleSubs = useMemo(
    () => activePersona.getSubscriptions(),
    [activePersona],
  );

  // ダッシュボード集計（重複検出・節約候補も含む）
  const summary = useMemo(
    () => calcDashboardSummary(sampleSubs, []),
    [sampleSubs],
  );

  const visibleOpportunities = summary.savingOpportunities.filter(
    (op) => !op.dismissed,
  );

  // SubscriptionList が onDelete を要求するが、サンプルなので no-op
  const noopDelete = async () => {};

  return (
    <section className="mx-2 mt-10 mb-2 rounded-2xl bg-white border-2 border-amber-200 shadow-sm overflow-hidden">
      {/* ─── セクションヘッダー：USE CASE 風の大きい見出し ─── */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-5 border-b border-amber-200">
        {/* USE CASE バッジ */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/70 mb-2.5">
          <span className="text-amber-900 text-[10px] font-black tracking-widest">
            USE CASE / 実用例
          </span>
        </div>

        {/* 大きい見出し */}
        <h2 className="text-xl font-black text-slate-800 leading-tight mb-1.5">
          こんな感じで使えます
        </h2>

        {/* サブテキスト */}
        <p className="text-slate-700 text-xs leading-relaxed">
          職種別のサンプルで、年間コスト・重複・節約候補の見え方を体験できます。
        </p>
      </div>

      {/* ─── ペルソナ切替タブ ─── */}
      <div className="bg-slate-50 border-b border-slate-200 px-2 pt-2 pb-3">
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {SAMPLE_PERSONAS.map((persona) => {
            const isActive = persona.id === activePersonaId;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setActivePersonaId(persona.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="mr-1.5">{persona.emoji}</span>
                {persona.label}
              </button>
            );
          })}
        </div>
        {/* アクティブペルソナの一行説明 */}
        <p className="px-3 mt-2 text-[11px] text-slate-500 leading-relaxed">
          {activePersona.description}
        </p>
      </div>

      {/* ─── サンプルコンテンツ（枠の内側）─── */}
      <div className="py-4">
        <SummaryCard
          totalMonthly={summary.totalMonthly}
          totalYearly={summary.totalYearly}
          subscriptionCount={summary.subscriptionCount}
        />

        <DuplicateAlerts opportunities={summary.savingOpportunities} />

        <SavingBanner
          totalPotentialMonthlySaving={summary.totalPotentialMonthlySaving}
          opportunityCount={visibleOpportunities.length}
        />

        <div className="mt-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-sm font-bold text-slate-600">登録例</h3>
            <span className="text-xs text-slate-400">月額が高い順</span>
          </div>
          <SubscriptionList
            subscriptions={sampleSubs}
            loading={false}
            onDelete={noopDelete}
          />
        </div>

        {/* 締めの CTA（枠の内側） */}
        <div className="mx-4 mt-6 mb-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-center shadow-md">
          <Sparkles size={28} className="text-yellow-300 mx-auto mb-2" strokeWidth={2.5} />
          <h3 className="text-white text-base font-bold mb-1">
            自分の年間コストはいくら？
          </h3>
          <p className="text-indigo-200 text-xs leading-relaxed mb-4 px-2">
            実際に使っているサブスクを入れると、<br />
            本当の年間コスト・重複・節約候補が見えます
          </p>
          <Link
            href="/add"
            className="inline-flex items-center justify-center gap-2 w-full bg-white text-indigo-700 py-3 rounded-xl text-sm font-bold shadow-sm active:bg-slate-50"
          >
            最初のサブスクを追加する
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
