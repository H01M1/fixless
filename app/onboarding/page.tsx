/**
 * app/onboarding/page.tsx
 * ========================
 * 初回利用者向けの「職種選択 → サービス一括登録」ウィザード。
 *
 * Step 1: 職種選択（4択）
 * Step 2: おすすめサービスからチェックボックスで選択（デフォルト全選択）
 * Step 3: 完了画面（登録件数・年額表示・ホームへ）
 *
 * いつでも「スキップ」可能。
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Sparkles, CheckCircle2, X, Loader2, Check,
} from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { SERVICES } from '@/data/services';
import { PROFESSION_PRESETS, getPresetById, type ProfessionPreset } from '@/lib/onboardingPresets';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/billing';
import type { ServiceTemplate, SubscriptionInput, Category } from '@/types';

type Step = 'profession' | 'services' | 'done';

// ================================================================
// メインコンポーネント
// ================================================================

export default function OnboardingPage() {
  const router = useRouter();
  const { addSubscription } = useSubscriptions();

  const [step, setStep]                       = useState<Step>('profession');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [isRegistering, setIsRegistering]     = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [registeredMonthly, setRegisteredMonthly] = useState(0);

  const recommendedServices = useMemo<ServiceTemplate[]>(() => {
    if (!selectedPresetId) return [];
    const preset = getPresetById(selectedPresetId);
    if (!preset) return [];
    return preset.recommendedServiceIds
      .map((id) => SERVICES.find((s) => s.id === id))
      .filter((s): s is ServiceTemplate => s !== undefined);
  }, [selectedPresetId]);

  const groupedServices = useMemo(() => {
    const groups = new Map<Category, ServiceTemplate[]>();
    for (const s of recommendedServices) {
      const arr = groups.get(s.category) ?? [];
      arr.push(s);
      groups.set(s.category, arr);
    }
    return Array.from(groups.entries());
  }, [recommendedServices]);

  const selectedTotal = useMemo(() => {
    let total = 0;
    for (const id of selectedServiceIds) {
      const s = SERVICES.find((x) => x.id === id);
      if (!s || !s.defaultAmountMonthly) continue;
      total += s.defaultBillingCycle === 'yearly'
        ? Math.round(s.defaultAmountMonthly / 12)
        : s.defaultAmountMonthly;
    }
    return total;
  }, [selectedServiceIds]);

  const handleSelectProfession = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setSelectedServiceIds(new Set(preset.recommendedServiceIds));
    setStep('services');
  };

  const handleToggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedServiceIds(new Set(recommendedServices.map((s) => s.id)));
  };

  const handleDeselectAll = () => {
    setSelectedServiceIds(new Set());
  };

  const handleBulkRegister = async () => {
    if (selectedServiceIds.size === 0) return;
    setIsRegistering(true);

    const today = new Date().toISOString().substring(0, 10);
    let count = 0;
    let monthlyTotal = 0;

    for (const id of Array.from(selectedServiceIds)) {
      const service = SERVICES.find((s) => s.id === id);
      if (!service) continue;
      const amount = service.defaultAmountMonthly ?? 1000;

      const input: SubscriptionInput = {
        serviceId:        service.id,
        name:             service.name,
        category:         service.category,
        iconUrl:          service.iconUrl,
        amount,
        billingCycle:     service.defaultBillingCycle,
        billingStartDate: today,
        isFreeTrial:      false,
      };

      try {
        await addSubscription(input);
        count++;
        monthlyTotal += service.defaultBillingCycle === 'yearly'
          ? Math.round(amount / 12)
          : amount;
      } catch (err) {
        console.error('[Onboarding] add failed:', id, err);
      }
    }

    setRegisteredCount(count);
    setRegisteredMonthly(monthlyTotal);
    setIsRegistering(false);
    setStep('done');
  };

  if (step === 'profession') {
    return (
      <ProfessionStep
        onSelect={handleSelectProfession}
        onSkip={() => router.push('/')}
      />
    );
  }

  if (step === 'services' && selectedPresetId) {
    const preset = getPresetById(selectedPresetId)!;
    return (
      <ServiceStep
        preset={preset}
        groupedServices={groupedServices}
        selectedIds={selectedServiceIds}
        selectedTotal={selectedTotal}
        onToggle={handleToggleService}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBack={() => setStep('profession')}
        onConfirm={handleBulkRegister}
        onSkip={() => router.push('/')}
        isLoading={isRegistering}
      />
    );
  }

  return (
    <DoneStep
      count={registeredCount}
      monthlyTotal={registeredMonthly}
      onFinish={() => router.push('/')}
    />
  );
}

// ================================================================
// Step 1: 職種選択
// ================================================================

interface ProfessionStepProps {
  onSelect: (id: string) => void;
  onSkip: () => void;
}

function ProfessionStep({ onSelect, onSkip }: ProfessionStepProps) {
  return (
    <div className="min-h-screen px-5 py-6 pb-24">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
        >
          スキップ
        </button>
      </div>

      <div className="mb-8 text-center">
        <Sparkles size={32} className="text-indigo-500 mx-auto mb-3" strokeWidth={2} />
        <h1 className="text-2xl font-black text-slate-800 mb-2">
          まとめて登録
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed px-2">
          あなたの職種を選ぶと、よく使うサブスクの候補を表示します
        </p>
      </div>

      <div className="space-y-3">
        {PROFESSION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.id)}
            className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-400 active:border-indigo-500 active:bg-indigo-50 transition-all text-left group"
          >
            <span className="text-3xl flex-shrink-0">{preset.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-800 mb-0.5">
                {preset.label}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {preset.description}
              </p>
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" strokeWidth={2.5} />
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed">
        登録した内容はあとから自由に編集・削除できます
      </p>
    </div>
  );
}

// ================================================================
// Step 2: サービス選択
// ================================================================

interface ServiceStepProps {
  preset: ProfessionPreset;
  groupedServices: [Category, ServiceTemplate[]][];
  selectedIds: Set<string>;
  selectedTotal: number;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBack: () => void;
  onConfirm: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

function ServiceStep({
  preset,
  groupedServices,
  selectedIds,
  selectedTotal,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onBack,
  onConfirm,
  onSkip,
  isLoading,
}: ServiceStepProps) {
  return (
    <div className="min-h-screen pb-32">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-slate-600 text-sm hover:text-slate-900"
        >
          <ArrowLeft size={16} className="mr-1" />
          職種を変更
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
        >
          スキップ
        </button>
      </div>

      <div className="px-5 mb-5">
        <h1 className="text-xl font-black text-slate-800 mb-1">
          <span className="mr-2">{preset.emoji}</span>
          {preset.label}におすすめ
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          使っているものだけチェック残してください。あとから自由に編集できます。
        </p>
      </div>

      <div className="px-5 mb-3 flex gap-2">
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs text-indigo-600 font-medium hover:text-indigo-700 px-2 py-1"
        >
          全選択
        </button>
        <span className="text-xs text-slate-300">|</span>
        <button
          type="button"
          onClick={onDeselectAll}
          className="text-xs text-slate-500 font-medium hover:text-slate-700 px-2 py-1"
        >
          全解除
        </button>
      </div>

      <div className="px-3 space-y-5">
        {groupedServices.map(([category, services]) => (
          <section key={category}>
            <h2 className="px-2 text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <span>{CATEGORY_EMOJIS[category]}</span>
              <span>{CATEGORY_LABELS[category]}</span>
            </h2>
            <div className="space-y-2">
              {services.map((service) => {
                const isChecked = selectedIds.has(service.id);
                const monthly = service.defaultAmountMonthly ?? 0;
                const cycleLabel = service.defaultBillingCycle === 'yearly' ? '/年' : '/月';

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => onToggle(service.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left ${
                      isChecked
                        ? 'bg-indigo-50 border-indigo-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-indigo-600 border-2 border-indigo-600'
                        : 'border-2 border-slate-300'
                    }`}>
                      {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>

                    {service.iconUrl && (
                      <img
                        src={service.iconUrl}
                        alt={service.name}
                        width={24}
                        height={24}
                        className="rounded flex-shrink-0"
                      />
                    )}

                    <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                      {service.name}
                    </span>

                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                      {formatCurrency(monthly)}
                      <span className="text-[10px] text-slate-400 ml-0.5">{cycleLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-md mx-auto px-3 pb-4 pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs text-slate-500">選択中</span>
              <div className="text-xs">
                <span className="font-bold text-indigo-700">{selectedIds.size}</span>
                <span className="text-slate-400">件</span>
                <span className="text-slate-300 mx-1.5">/</span>
                <span className="font-bold text-slate-800">月額 {formatCurrency(selectedTotal)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading || selectedIds.size === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  登録中...
                </>
              ) : (
                <>
                  選んだ {selectedIds.size} 件を追加
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Step 3: 完了画面
// ================================================================

interface DoneStepProps {
  count: number;
  monthlyTotal: number;
  onFinish: () => void;
}

function DoneStep({ count, monthlyTotal, onFinish }: DoneStepProps) {
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="min-h-screen px-5 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={48} className="text-emerald-600" strokeWidth={2} />
        </div>

        <h1 className="text-2xl font-black text-slate-800 mb-3">
          登録完了！
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-8">
          <span className="font-bold text-indigo-700">{count} 件</span>
          のサブスクを登録しました
        </p>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 mb-8 shadow-md">
          <p className="text-xs text-indigo-200 mb-1">あなたの年間コスト</p>
          <p className="text-4xl font-black text-white mb-2">
            {formatCurrency(yearlyTotal)}
            <span className="text-sm font-medium text-indigo-200 ml-1">/年</span>
          </p>
          <p className="text-xs text-indigo-200">
            月額換算 {formatCurrency(monthlyTotal)}
          </p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mb-8">
          請求日や金額は <strong>目安です</strong>。<br />
          各サブスクの編集ボタンから実際の値に修正できます。
        </p>

        <button
          type="button"
          onClick={onFinish}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md active:bg-indigo-700"
        >
          ホーム画面を見る
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}